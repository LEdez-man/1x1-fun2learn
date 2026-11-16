#!/usr/bin/env python3
"""Motiv freistellen und als Sprite oder Textur aufbereiten.

Schritte: Hintergrund entfernen → Rand säubern → beschneiden → Rand zugeben →
optional auf Zweierpotenz bringen → Kontrollbild auf hellem, dunklem und kariertem
Grund → Kennzahlen als JSON (Größe, Ausschnitt, Drehpunkt, Deckungsanteil).

Verfahren (--verfahren):
  farbe   gleichmäßiger Hintergrund: Flutfüllung von den Bildrändern mit Toleranz
          (Standard). Schließt Flächen im Motiv nicht ein, die die Hintergrundfarbe
          haben, solange sie nicht mit dem Rand verbunden sind.
  ki      Segmentierung mit rembg (muss installiert sein: pip install rembg;
          lädt beim ersten Lauf ein Modell). Für Fotos und unruhige Hintergründe.
  alpha   Bild hat schon Transparenz; nur säubern, beschneiden, prüfen.

Aufruf:
  python3 freistellen.py figur.png -o sprites/figur.png
  python3 freistellen.py foto.jpg -o tex/stein.png --verfahren ki --potenz2
  python3 freistellen.py *.png --ordner sprites/ --rand 4 --toleranz 28

Braucht Pillow und numpy.
"""
import argparse
import json
import os
import sys

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


def hintergrund_farbe(img, toleranz):
    """Flutfüllung von allen Randpunkten; liefert Maske (255 = Motiv)."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    marke = (255, 0, 255)
    arbeit = rgb.copy()
    # Markerfarbe darf im Bild nicht vorkommen
    a = np.asarray(rgb)
    if ((a[..., 0] == 255) & (a[..., 1] == 0) & (a[..., 2] == 255)).any():
        marke = (1, 254, 3)
    schritt = max(1, min(w, h) // 64)
    rand = [(x, 0) for x in range(0, w, schritt)] + [(x, h - 1) for x in range(0, w, schritt)]
    rand += [(0, y) for y in range(0, h, schritt)] + [(w - 1, y) for y in range(0, h, schritt)]
    ecke = np.array(rgb.getpixel((0, 0)), dtype=int)
    for p in rand:
        farbe = np.array(arbeit.getpixel(p), dtype=int)
        if tuple(farbe) == marke:
            continue
        if np.abs(farbe - ecke).max() > toleranz * 2:   # Randpunkt gehört zum Motiv
            continue
        ImageDraw.floodfill(arbeit, p, marke, thresh=toleranz)
    b = np.asarray(arbeit)
    bg = (b[..., 0] == marke[0]) & (b[..., 1] == marke[1]) & (b[..., 2] == marke[2])
    return Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), "L")


def hintergrund_ki(img):
    try:
        from rembg import remove
    except ImportError:
        sys.exit("Verfahren 'ki' braucht rembg (pip install rembg). Alternativ ein Freistellwerkzeug "
                 "der Sitzung nutzen und das Ergebnis mit --verfahren alpha aufbereiten.")
    return remove(img.convert("RGBA")).getchannel("A")


def saeubern(img, maske, weich, schrumpfen):
    """Kante leicht einziehen und weichzeichnen, Farbe in die durchsichtigen Pixel ausbluten."""
    if schrumpfen > 0:
        maske = maske.filter(ImageFilter.MinFilter(2 * schrumpfen + 1))
    if weich > 0:
        maske = maske.filter(ImageFilter.GaussianBlur(weich))
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    a = np.asarray(maske).astype(np.float32) / 255.0
    # Farbausblutung: verhindert helle oder dunkle Säume beim Skalieren und in Mipmaps
    fest = a > 0.6
    aus = rgb.copy()
    gew = fest.astype(np.float32)
    summe = rgb * gew[..., None]
    for _ in range(8):
        s = Image.fromarray(np.clip(summe, 0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(2))
        g = Image.fromarray((gew * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(2))
        s, g = np.asarray(s).astype(np.float32), np.asarray(g).astype(np.float32) / 255.0
        neu = (gew == 0) & (g > 0.02)
        aus[neu] = (s[neu] / g[neu][:, None]).clip(0, 255)
        gew = np.where(neu, 1.0, gew)
        summe = aus * gew[..., None]
    out = np.dstack([np.where(fest[..., None], rgb, aus), a * 255.0]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def potenz2(n):
    p = 1
    while p < n:
        p *= 2
    return p


def kontrollbild(sprite, pfad):
    w, h = sprite.size
    k = max(8, min(w, h) // 12)
    karo = Image.new("RGB", (w, h), (200, 200, 200))
    d = ImageDraw.Draw(karo)
    for y in range(0, h, k):
        for x in range(0, w, k):
            if (x // k + y // k) % 2:
                d.rectangle([x, y, x + k, y + k], fill=(150, 150, 150))
    bahn = Image.new("RGB", (w * 3, h))
    for i, grund in enumerate([Image.new("RGB", (w, h), (245, 245, 240)), Image.new("RGB", (w, h), (18, 20, 28)), karo]):
        grund.paste(sprite, (0, 0), sprite)
        bahn.paste(grund, (i * w, 0))
    bahn.save(pfad)


def verarbeite(quelle, ziel, a):
    img = Image.open(quelle)
    if a.verfahren == "alpha":
        if "A" not in img.getbands():
            sys.exit(f"{quelle}: keine Transparenz vorhanden, Verfahren 'farbe' oder 'ki' wählen.")
        maske = img.getchannel("A")
    elif a.verfahren == "ki":
        maske = hintergrund_ki(img)
    else:
        maske = hintergrund_farbe(img, a.toleranz)
    sprite = saeubern(img, maske, a.weich, a.schrumpfen)

    alpha = sprite.getchannel("A")
    box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        sys.exit(f"{quelle}: nach dem Freistellen ist nichts übrig. Toleranz senken oder Verfahren wechseln.")
    sprite = sprite.crop(box)
    w, h = sprite.size
    r = a.rand
    lein = Image.new("RGBA", (w + 2 * r, h + 2 * r), (0, 0, 0, 0))
    lein.paste(sprite, (r, r))
    if a.potenz2:
        W, H = potenz2(lein.width), potenz2(lein.height)
        gross = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gross.paste(lein, ((W - lein.width) // 2, H - lein.height))   # unten mittig verankert
        lein = gross
    os.makedirs(os.path.dirname(os.path.abspath(ziel)), exist_ok=True)
    lein.save(ziel)
    basis = os.path.splitext(ziel)[0]
    kontrollbild(lein, basis + ".kontrolle.png")

    al = np.asarray(lein.getchannel("A")).astype(np.float32) / 255.0
    halb = float(((al > 0.03) & (al < 0.97)).mean())
    bb = lein.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    kenn = {
        "quelle": os.path.basename(quelle),
        "datei": os.path.basename(ziel),
        "groesse": list(lein.size),
        "ausschnitt_in_quelle": list(box),
        "motiv_in_datei": list(bb),
        "drehpunkt_unten_mitte": [round((bb[0] + bb[2]) / 2, 1), bb[3]],
        "deckung_anteil": round(float((al > 0.5).mean()), 3),
        "halbtransparent_anteil": round(halb, 4),
        "verfahren": a.verfahren,
        "hinweise": [],
    }
    if halb > 0.15:
        kenn["hinweise"].append("viel Halbtransparenz: Kante unsauber oder Motiv mit Rauch/Glas; Kontrollbild ansehen")
    if box[0] == 0 or box[1] == 0 or box[2] == img.width or box[3] == img.height:
        kenn["hinweise"].append("Motiv berührt den Bildrand der Quelle: angeschnitten oder Hintergrund nicht erkannt")
    with open(basis + ".json", "w", encoding="utf-8") as f:
        json.dump(kenn, f, ensure_ascii=False, indent=1)
    return kenn


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("quellen", nargs="+")
    p.add_argument("-o", "--ziel", help="Zieldatei (nur bei einer Quelle)")
    p.add_argument("--ordner", help="Zielordner (bei mehreren Quellen)")
    p.add_argument("--verfahren", choices=["farbe", "ki", "alpha"], default="farbe")
    p.add_argument("--toleranz", type=int, default=24, help="Farbabstand für 'farbe' (0–255)")
    p.add_argument("--schrumpfen", type=int, default=None, help="Kante um n Pixel einziehen (gegen Farbsaum); Standard 1, bei 'alpha' 0")
    p.add_argument("--weich", type=float, default=None, help="Weichzeichnung der Kante in Pixeln; Standard 0,6, bei 'alpha' 0")
    p.add_argument("--rand", type=int, default=2, help="durchsichtiger Rand um das Motiv (gegen Ausbluten im Atlas)")
    p.add_argument("--potenz2", action="store_true", help="Leinwand auf Zweierpotenzen bringen (3D-Texturen mit Mipmaps)")
    a = p.parse_args()
    if a.schrumpfen is None:
        a.schrumpfen = 0 if a.verfahren == "alpha" else 1
    if a.weich is None:
        a.weich = 0 if a.verfahren == "alpha" else 0.6
    if len(a.quellen) > 1 and not a.ordner:
        sys.exit("Bei mehreren Quellen --ordner angeben.")
    for q in a.quellen:
        ziel = a.ziel if (a.ziel and len(a.quellen) == 1) else os.path.join(a.ordner or ".", os.path.splitext(os.path.basename(q))[0] + ".png")
        print(json.dumps(verarbeite(q, ziel, a), ensure_ascii=False))


if __name__ == "__main__":
    main()
