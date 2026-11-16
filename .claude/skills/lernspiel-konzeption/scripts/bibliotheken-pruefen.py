#!/usr/bin/env python3
"""Stand von Bibliotheken für Lernspiele im Browser prüfen (npm-Registry).

Liefert je Bibliothek: neueste Version, Datum der Veröffentlichung, Alter in Tagen,
Lizenz, entpackte Größe, Hinweis auf Abkündigung und, falls angegeben, den Abstand
zur eingesetzten Version.

Aufruf:
  python3 bibliotheken-pruefen.py                      # Standardliste, alle Gruppen
  python3 bibliotheken-pruefen.py --gruppe 2d 3d       # nur diese Gruppen
  python3 bibliotheken-pruefen.py --paket kaplay ogl   # weitere Pakete
  python3 bibliotheken-pruefen.py --bestand pixi.js=8.23.0 three=0.170.0
  python3 bibliotheken-pruefen.py --json               # maschinenlesbar

Die Standardliste ist ein Ausgangspunkt, keine Empfehlung. Neue Kandidaten zusätzlich
per Websuche ermitteln und mit --paket prüfen. Nur Standardbibliothek, kein pip nötig.
"""
import argparse
import datetime as dt
import json
import sys
import urllib.parse
import urllib.request

KANDIDATEN = {
    "2d": ["pixi.js", "phaser", "kaplay", "konva"],
    "3d": ["three", "@babylonjs/core", "playcanvas"],
    "physik": ["planck", "@dimforge/rapier2d-compat", "@dimforge/rapier3d-compat", "matter-js", "cannon-es"],  # erste Wahl zuerst, Altbestand zuletzt
    "ton": ["howler", "tone", "zzfx"],
    "text-3d": ["troika-three-text"],
    "werkzeug": ["playwright", "vite", "@gltf-transform/cli", "sharp", "svgo"],
}
REGISTRY = "https://registry.npmjs.org/"


def hole(url, timeout=25):
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "bibliotheken-pruefen"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def teile(version):
    kern = version.split("-")[0].split("+")[0]
    out = []
    for t in kern.split("."):
        try:
            out.append(int(t))
        except ValueError:
            out.append(0)
    return (out + [0, 0, 0])[:3]


def abstand(alt, neu):
    a, n = teile(alt), teile(neu)
    if a == n:
        return "aktuell"
    if n[0] != a[0]:
        return "Hauptversion (Migrationshinweise lesen)"
    if a[0] == 0 and n[1] != a[1]:
        return "Nebenversion bei 0.x (kann brechen, Changelog lesen)"
    if n[1] != a[1]:
        return "Nebenversion"
    return "Korrekturversion"


def pruefe(name, bestand):
    try:
        d = hole(REGISTRY + urllib.parse.quote(name, safe="@"))
    except Exception as e:  # Netz, 404, Sperre
        return {"paket": name, "fehler": str(e)[:120]}
    neu = d.get("dist-tags", {}).get("latest")
    v = d.get("versions", {}).get(neu, {})
    zeit = d.get("time", {}).get(neu)
    alter = None
    if zeit:
        t = dt.datetime.fromisoformat(zeit.replace("Z", "+00:00"))
        alter = (dt.datetime.now(dt.timezone.utc) - t).days
    liz = v.get("license") or d.get("license")
    if isinstance(liz, dict):
        liz = liz.get("type")
    groesse = v.get("dist", {}).get("unpackedSize")
    erst = d.get("time", {}).get("created", "")[:4]
    res = {
        "paket": name,
        "version": neu,
        "datum": zeit[:10] if zeit else None,
        "alter_tage": alter,
        "lizenz": liz,
        "entpackt_mb": round(groesse / 1e6, 1) if groesse else None,
        "seit": erst,
        "abgekuendigt": v.get("deprecated"),
        "quelle": (d.get("repository") or {}).get("url") if isinstance(d.get("repository"), dict) else d.get("repository"),
    }
    if name in bestand:
        res["eingesetzt"] = bestand[name]
        res["abstand"] = abstand(bestand[name], neu)
    hinweise = []
    if res["abgekuendigt"]:
        hinweise.append("abgekündigt")
    if alter is not None and alter > 540:
        hinweise.append("letzte Version älter als 18 Monate, Pflege prüfen")
    if alter is not None and alter < 14:
        hinweise.append("sehr neu, vor Einsatz Fehlerberichte ansehen")
    if liz and not any(k in str(liz) for k in ("MIT", "Apache", "BSD", "ISC", "Zlib", "0BSD", "CC0", "Unlicense")):
        hinweise.append("Lizenz prüfen")
    res["hinweise"] = hinweise
    return res


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--gruppe", nargs="*", choices=sorted(KANDIDATEN), help="nur diese Gruppen der Standardliste")
    p.add_argument("--paket", nargs="*", default=[], help="zusätzliche npm-Pakete")
    p.add_argument("--bestand", nargs="*", default=[], metavar="NAME=VERSION", help="eingesetzte Versionen")
    p.add_argument("--nur-bestand", action="store_true", help="nur die unter --bestand genannten Pakete prüfen")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    bestand = dict(b.split("=", 1) for b in a.bestand)
    plan = []
    if not a.nur_bestand:
        for g in a.gruppe or sorted(KANDIDATEN):
            plan += [(g, n) for n in KANDIDATEN[g]]
    plan += [("zusatz", n) for n in a.paket]
    plan += [("bestand", n) for n in bestand if n not in {x for _, x in plan}]

    ergebnis = []
    for gruppe, name in plan:
        r = pruefe(name, bestand)
        r["gruppe"] = gruppe
        ergebnis.append(r)

    heute = dt.date.today().isoformat()
    if a.json:
        json.dump({"geprueft_am": heute, "quelle": REGISTRY, "pakete": ergebnis}, sys.stdout, ensure_ascii=False, indent=1)
        print()
        return
    print(f"Stand geprüft am {heute} (Quelle: npm-Registry)\n")
    print("| Gruppe | Paket | Version | vom | Lizenz | entpackt | eingesetzt | Hinweise |")
    print("|---|---|---|---|---|---|---|---|")
    for r in ergebnis:
        if "fehler" in r:
            print(f"| {r['gruppe']} | {r['paket']} | – | – | – | – | – | nicht abrufbar: {r['fehler']} |")
            continue
        ein = f"{r['eingesetzt']} → {r['abstand']}" if "eingesetzt" in r else "–"
        mb = f"{r['entpackt_mb']} MB" if r["entpackt_mb"] is not None else "–"
        print(f"| {r['gruppe']} | {r['paket']} | {r['version']} | {r['datum']} | {r['lizenz']} | {mb} | {ein} | {'; '.join(r['hinweise']) or '–'} |")
    print("\nEntpackte Größe = gesamtes Paket mit allen Varianten, nicht die ausgelieferte Datei.")
    print("Nächste Schritte: Changelog und Migrationshinweise der Hauptversionen lesen, Einbindung ohne Build prüfen.")


if __name__ == "__main__":
    main()
