#!/usr/bin/env python3
"""Erzeugt aus den Original-Ebenen (assets/schneeball-bruegel/layers, 1280 x 720)
die verbreiterten Spiel-Ebenen (layers-wide, x = -240 ... 1520), damit die Kamera
seitlich schwenken kann. Aufruf im Projektordner:  python3 tools/build-snow-wide.py

Aenderungen gegenueber dem Original:
- Zeichenflaeche 1760 x 720 (viewBox -240 0 1760 720), Inhalte an den Raendern ergaenzt
- 02 wird geteilt in 02a (Haeuser) und 02b (Uferbank), damit Reihe A dazwischen passt
- gemalter Kaminrauch, Voegel und Eislaeufer entfallen (werden im Spiel animiert)
- sprites/eislaeufer.svg wird aus dem Symbol der Ebene 01 erzeugt
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'schneeball-bruegel'
SRC, OUT = ROOT / 'layers', ROOT / 'layers-wide'
X0, W = -240, 1760
X1 = X0 + W
HEAD = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} 0 {W} 720" width="{W}" height="720">'


def load(name):
    s = (SRC / name).read_text(encoding='utf-8')
    s = re.sub(r'<svg [^>]*>', HEAD, s, count=1)
    # gemalte Rauchfahnen entfernen (werden als Partikel erzeugt)
    s = re.sub(r'<path d="[^"]*" stroke="#d8d3c0" stroke-width="8" opacity="0.45"[^>]*/>\n', '', s)
    return s


def add(s, extra):
    return s.replace('</svg>', extra.strip() + '\n</svg>')


def drop_group(s, start_marker):
    """Entfernt die <g>-Gruppe, die mit start_marker beginnt."""
    i = s.index(start_marker)
    j = s.index('</g>', i) + len('</g>\n')
    return s[:i] + s[j:]


def backdrop():
    s = load('01-backdrop.svg')
    s = s.replace('<rect width="1280" height="720"', f'<rect x="{X0}" width="{W}" height="720"')
    s = s.replace('x="0" y="0" width="1280" height="720" filterUnits', f'x="{X0}" y="0" width="{W}" height="720" filterUnits')
    s = s.replace('<rect x="0" y="336" width="1280" height="384"', f'<rect x="{X0}" y="336" width="{W}" height="384"')
    # Huegel, Eisrand, Hoefe und Baeume an den Raendern
    wings = f'''
<path d="M{X0} 300 Q-120 286 0 306 L0 380 L{X0} 380Z M1280 294 Q1400 272 {X1} 290 L{X1} 380 L1280 380Z" fill="#9aa391"/>
<path d="M{X0} 318 Q-120 304 0 322 L0 390 L{X0} 390Z M1280 308 Q1400 296 {X1} 312 L{X1} 390 L1280 390Z" fill="#8a9582"/>
<use href="#th" transform="translate(-205 300) scale(0.9)"/>
<use href="#th" transform="translate(-140 304) scale(0.7)"/>
<use href="#th" transform="translate(-62 298) scale(1.0)"/>
<use href="#th" transform="translate(1296 300) scale(0.8)"/>
<use href="#th" transform="translate(1372 296) scale(1.0)"/>
<use href="#th" transform="translate(1448 302) scale(0.75)"/>
'''
    s = s.replace('<g>\n<rect x="962" y="272"', wings.strip() + '\n<g>\n<rect x="962" y="272"', 1)
    ice = f'<path d="M{X0} 336 H0 V348 H{X0}Z M1280 336 H{X1} V352 H1280Z" fill="#a8b7ab"/>\n'
    trees = '''<use href="#bt" transform="translate(-190 356) scale(0.8)"/>
<use href="#bt" transform="translate(-96 352) scale(0.65)"/>
<use href="#bt" transform="translate(1338 358) scale(0.85)"/>
<use href="#bt" transform="translate(1452 354) scale(0.7)"/>
'''
    s = s.replace('<g>\n<path d="M540 318 H830 V338', ice + trees + '<g>\n<path d="M540 318 H830 V338', 1)
    # Eislaeufer: nur der Gestuerzte bleibt gemalt, die uebrigen laufen im Spiel
    i = s.index('<g>\n<use href="#sk"')
    j = s.index('</g>', i)
    fallen = [l for l in s[i:j].splitlines() if 'rotate(82)' in l]
    s = s[:i] + '<g>\n' + '\n'.join(fallen) + '\n' + s[j:]
    # gemalte Voegel entfernen
    s = drop_group(s, '<g fill="none" stroke="#2a231c" stroke-width="1.7"')
    (OUT / '01-backdrop.svg').write_text(s, encoding='utf-8')
    # Eislaeufer-Sprite aus dem Symbol
    m = re.search(r'<g id="sk">\n(.*?)</g>', s, re.S)
    sk = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -40 32 46" width="32" height="46" color="#7b3a30">\n'
          + m.group(1) + '</svg>\n')
    (ROOT / 'sprites' / 'eislaeufer.svg').write_text(sk, encoding='utf-8')


def houses():
    s = load('02-haeuser-fern.svg')
    s = s.replace('<linearGradient id="bank" x1="0" y1="0" x2="0" y2="1">',
                  '<linearGradient id="bank" gradientUnits="userSpaceOnUse" x1="0" y1="490" x2="0" y2="570">')
    i = s.index('<path d="M0 520 Q150 486')
    a = s[:i] + '''<use href="#h2" color="#cdbb92" transform="translate(-232 318) scale(0.6)"/>
<use href="#h3" color="#d8cba8" transform="translate(1392 300) scale(0.55)"/>
</svg>
'''
    (OUT / '02a-haeuser-fern.svg').write_text(a, encoding='utf-8')
    defs = s[:s.index('<g id="fn">')] + '</defs>\n\n'
    b = defs + s[i:]
    b = add(b, f'''
<path d="M{X0} 506 Q-120 496 0 520 L0 570 L{X0} 570Z M1280 492 Q1400 480 {X1} 500 L{X1} 570 L1280 570Z" fill="url(#bank)"/>
<path d="M{X0} 506 Q-120 496 0 520 M1280 492 Q1400 480 {X1} 500" fill="none" stroke="#9fb0b0" stroke-width="3" opacity="0.7"/>
<path d="M{X0} 524 Q-120 518 0 534 M1280 516 Q1400 506 {X1} 520" fill="none" stroke="#c4cdcb" stroke-width="4" opacity="0.6"/>
''')
    (OUT / '02b-ufer.svg').write_text(b, encoding='utf-8')


def trees():
    s = load('03-baeume.svg')
    s = add(s, '''
<use href="#oak" transform="translate(-300 70) scale(1.0)"/>
<use href="#oak" transform="translate(1600 60) scale(-1.05 1.05)"/>
''')
    (OUT / '03-baeume.svg').write_text(s, encoding='utf-8')


def near():
    s = load('04-haus-nah.svg')
    s = add(s, '<use href="#h1" color="#c9b88e" transform="translate(1700 300) scale(-1.5 1.5)"/>')
    (OUT / '04-haus-nah.svg').write_text(s, encoding='utf-8')


def fence():
    s = load('05-zaun.svg')
    s = add(s, f'''
<use href="#post" transform="translate(-232 550) rotate(2)"/>
<use href="#post" transform="translate(-102 554) rotate(-3)"/>
<use href="#post" transform="translate(1336 552) rotate(-2)"/>
<use href="#post" transform="translate(1468 548) rotate(3)"/>
<g stroke="#2d2217" stroke-width="2.5" stroke-linejoin="round">
<path d="M-222 584 L-92 586 L-92 604 L-222 602Z M-92 586 L40 584 L40 602 L-92 604Z" fill="#74593d"/>
<path d="M-100 622 L36 620 L36 636 L-100 640Z" fill="#6a5238"/>
<path d="M1230 586 L1346 582 L1346 600 L1230 604Z M1346 583 L1478 586 L1478 602 L1346 600Z" fill="#74593d"/>
<path d="M1240 626 L1474 620 L1474 636 L1240 640Z" fill="#6a5238"/>
</g>
<g fill="#f2f0e5">
<path d="M-222 584 L-92 586 L40 584 L40 579 L-92 581 L-222 579Z"/>
<path d="M1230 586 L1346 582 L1478 586 L1478 581 L1346 577 L1230 581Z"/>
</g>
<path d="M{X0} 652 Q-130 634 -20 664 L-20 720 L{X0} 720Z M1300 650 Q1410 672 {X1} 648 L{X1} 720 L1300 720Z" fill="#e6e5d8"/>
<path d="M{X0} 652 Q-130 634 -20 664 M1300 650 Q1410 672 {X1} 648" fill="none" stroke="#a9b6b6" stroke-width="3" opacity="0.8"/>
<path d="M{X0} 682 Q-130 670 -20 686 M1300 680 Q1410 694 {X1} 678" fill="none" stroke="#c3cccb" stroke-width="6" opacity="0.6"/>
''')
    (OUT / '05-zaun.svg').write_text(s, encoding='utf-8')


def front():
    s = load('06-schnee-vorn.svg')
    s = s.replace('<linearGradient id="drift" x1="0" y1="0" x2="0" y2="1">',
                  '<linearGradient id="drift" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="720">')
    s = add(s, f'''
<path d="M{X0} 720 L{X0} 676 Q-130 704 -20 696 L-20 720Z M1300 720 L1300 660 Q1410 690 {X1} 668 L{X1} 720Z" fill="url(#drift)"/>
<path d="M{X0} 676 Q-130 704 -20 696 M1300 660 Q1410 690 {X1} 668" fill="none" stroke="#a9b8ba" stroke-width="3" opacity="0.85"/>
<path d="M{X0} 720 L{X0} 714 Q-130 704 -20 712 L-20 720Z M1300 720 L1300 712 Q1410 702 {X1} 712 L{X1} 720Z" fill="#c4ccce"/>
<path d="M-190 704 Q-120 690 -50 702 M1340 690 Q1410 700 1490 684" fill="none" stroke="#cfd7d8" stroke-width="5" stroke-linecap="round"/>
<g stroke="#5a4a35" stroke-width="2" fill="none" stroke-linecap="round">
<path d="M-150 700 q-4 -14 -8 -20 M-146 700 q2 -16 7 -22 M1420 696 q-4 -16 -10 -24 M1424 696 q2 -18 8 -26"/>
</g>
''')
    (OUT / '06-schnee-vorn.svg').write_text(s, encoding='utf-8')


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for f in (backdrop, houses, trees, near, fence, front):
        f()
    print('geschrieben:', ', '.join(sorted(p.name for p in OUT.iterdir())))
