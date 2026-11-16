#!/usr/bin/env python3
"""Zeichnet die Grafiken des Szenarios Truthahn-Skeet (2D) als SVG:
drei Reviere (Rocky Mountains, Schwarzwald, Uckermark) mit je vier Ebenen,
Schneefassungen fuer die Winterstimmung, drei Vogelarten und die Flinte.
Stil: flaechige Formen mit dunkler Kontur, Schattenflaechen und Schraffur.

Aufruf im Projektordner:  python3 tools/build-skeet-assets.py
Ausgabe: assets/vogel-skeet/  (Dateien nicht von Hand aendern, Skript anpassen)
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'vogel-skeet'
X0, X1, W, H = -240, 1520, 1760, 720
INK = '#2b2118'

DEFS = f'''
<pattern id="h1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="6" stroke="{INK}" stroke-width="1.2"/></pattern>
<pattern id="h2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="9" stroke="{INK}" stroke-width="1.6"/></pattern>
<pattern id="h3" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)"><line x1="0" y1="0" x2="0" y2="5" stroke="{INK}" stroke-width="1"/></pattern>
<pattern id="hw" width="10" height="5" patternUnits="userSpaceOnUse"><line x1="0" y1="2" x2="7" y2="2" stroke="{INK}" stroke-width="1"/></pattern>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.55"/></linearGradient>
<linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>
'''

_uid = 0


def uid():
    global _uid
    _uid += 1
    return f'c{_uid}'


def f1(v):
    return f'{v:.1f}'


def poly(pts, close=True):
    return 'M' + ' L'.join(f'{f1(x)} {f1(y)}' for x, y in pts) + ('Z' if close else '')


def shaded(d, fill, shade_d, hatch='h1', dark=0.2, hop=0.3, stroke=1.8):
    """Form mit Kontur; shade_d = Schattenflaeche (wird auf die Form beschnitten, abgedunkelt und schraffiert)."""
    c = uid()
    st = f' stroke="{INK}" stroke-width="{stroke}" stroke-linejoin="round"' if stroke else ''
    return (f'<clipPath id="{c}"><path d="{d}"/></clipPath><path d="{d}" fill="{fill}"/>'
            f'<g clip-path="url(#{c})"><path d="{shade_d}" fill="#000" opacity="{dark}"/>'
            f'<path d="{shade_d}" fill="url(#{hatch})" opacity="{hop}"/></g>'
            f'<path d="{d}" fill="none"{st}/>')


def ridge(rnd, y, amp, step=40, rough=0.35, waves=3):
    """Hoehenlinie von links nach rechts als Punktliste."""
    ph = [(rnd.uniform(0.0016, 0.006) * (i + 1), rnd.uniform(0, 6.28), 1 / (i + 1)) for i in range(waves)]
    norm = sum(p[2] for p in ph)
    pts, x = [], X0 - 20
    while x <= X1 + 20:
        v = sum(math.sin(x * f + p) * a for f, p, a in ph) / norm
        pts.append((x, y - amp * (0.5 + 0.5 * v) + rnd.uniform(-1, 1) * amp * rough * 0.15))
        x += step
    return pts


def at(pts, x):
    """Hoehe der Linie an der Stelle x (linear interpoliert)."""
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        if ax <= x <= bx:
            return ay + (by - ay) * (x - ax) / (bx - ax)
    return pts[-1][1]


def slope_shade(pts, depth, shift=0.6):
    """Schattenflaechen an den nach rechts abfallenden Flanken einer Hoehenlinie."""
    out, run = [], [pts[0]]
    for a, b in zip(pts, pts[1:]):
        if b[1] > a[1] + 0.5:
            run.append(b)
        else:
            if len(run) > 1:
                out.append(run)
            run = [b]
    if len(run) > 1:
        out.append(run)
    d = ''
    for r in out:
        low = [(x - depth * shift, y + depth) for x, y in reversed(r)]
        d += poly(r + low)
    return d or 'M0 0Z'


def land(pts, bottom, fill, depth=46, hatch='h1', hop=0.26, dark=0.16, haze=False, stroke=1.8):
    d = poly(pts + [(X1 + 20, bottom), (X0 - 20, bottom)])
    s = shaded(d, fill, slope_shade(pts, depth), hatch, dark, hop, stroke)
    c = uid()
    s += f'<clipPath id="{c}"><path d="{d}"/></clipPath><rect clip-path="url(#{c})" x="{X0}" y="{min(p[1] for p in pts):.0f}" width="{W}" height="{bottom - min(p[1] for p in pts):.0f}" fill="url(#{"haze" if haze else "deep"})"/>'
    return s


def conifer(x, base, h, col, snow=False, lean=0):
    out, n = '', 4
    tw = h * 0.035
    out += f'<rect x="{f1(x - tw)}" y="{f1(base - h * 0.2)}" width="{f1(tw * 2)}" height="{f1(h * 0.2)}" fill="#4a3626" stroke="{INK}" stroke-width="1.2"/>'
    for i in range(n - 1, -1, -1):
        top = base - h + i * h * 0.19
        bot = top + h * 0.4
        w = h * (0.1 + i * 0.045)
        cx = x + lean * (n - i)
        tier = [(cx, top), (cx + w, bot), (cx + w * 0.35, bot - h * 0.03), (cx, bot + h * 0.012), (cx - w * 0.35, bot - h * 0.03), (cx - w, bot)]
        sh = [(cx, top), (cx + w, bot), (cx + w * 0.35, bot - h * 0.03), (cx, bot + h * 0.012)]
        out += shaded(poly(tier), col, poly(sh), 'h1', 0.26, 0.42, 1.5)
        if snow:
            cap = [(cx, top - 1), (cx + w * 0.3, top + (bot - top) * 0.42), (cx + w * 0.05, top + (bot - top) * 0.36), (cx - w * 0.22, top + (bot - top) * 0.62),
                   (cx - w * 0.5, top + (bot - top) * 0.6), (cx - w * 0.78, bot - h * 0.035)]
            out += f'<path d="{poly(cap)}" fill="#f4f7f9" stroke="#9fb0bb" stroke-width="1"/>'
    return out


def crown(rnd, x, y, r, col, snow=False, n=6):
    """Laubkrone aus Kreisen mit Schattenseite rechts unten."""
    circ = [(x + rnd.uniform(-0.7, 0.7) * r, y + rnd.uniform(-0.45, 0.45) * r, r * rnd.uniform(0.55, 0.8)) for _ in range(n)]
    circ.append((x, y, r * 0.8))
    c = uid()
    cl = ''.join(f'<circle cx="{f1(a)}" cy="{f1(b)}" r="{f1(q)}"/>' for a, b, q in circ)
    fill = '#e9eef1' if snow else col
    out = f'<g stroke="{INK}" stroke-width="3.2" fill="{INK}">{cl}</g><g fill="{fill}">{cl}</g>'
    out += (f'<clipPath id="{c}">{cl}</clipPath><g clip-path="url(#{c})">'
            f'<ellipse cx="{f1(x + r * 0.55)}" cy="{f1(y + r * 0.5)}" rx="{f1(r * 1.1)}" ry="{f1(r * 0.85)}" fill="#000" opacity="{0.1 if snow else 0.22}"/>'
            f'<ellipse cx="{f1(x + r * 0.6)}" cy="{f1(y + r * 0.55)}" rx="{f1(r * 1.0)}" ry="{f1(r * 0.75)}" fill="url(#h1)" opacity="{0.22 if snow else 0.36}"/>'
            f'<ellipse cx="{f1(x - r * 0.45)}" cy="{f1(y - r * 0.4)}" rx="{f1(r * 0.5)}" ry="{f1(r * 0.3)}" fill="#fff" opacity="0.16"/></g>')
    return out


def leaf_tree(rnd, x, base, h, col, snow=False, trunk='#4a3626', birch=False):
    tw = h * (0.03 if birch else 0.045)
    out = f'<path d="M{f1(x - tw)} {f1(base)} L{f1(x - tw * 0.6)} {f1(base - h * 0.62)} L{f1(x + tw * 0.6)} {f1(base - h * 0.62)} L{f1(x + tw)} {f1(base)}Z" fill="{"#eeeae0" if birch else trunk}" stroke="{INK}" stroke-width="1.3"/>'
    out += f'<path d="M{f1(x + tw * 0.2)} {f1(base)} L{f1(x + tw * 0.15)} {f1(base - h * 0.6)} L{f1(x + tw * 0.6)} {f1(base - h * 0.62)} L{f1(x + tw)} {f1(base)}Z" fill="#000" opacity="0.22"/>'
    if birch:
        for i in range(5):
            yy = base - h * (0.08 + i * 0.1)
            out += f'<path d="M{f1(x - tw * 0.7)} {f1(yy)} h{f1(tw * 0.9)}" stroke="{INK}" stroke-width="1.6"/>'
    out += crown(rnd, x, base - h * 0.74, h * (0.24 if birch else 0.3), col, snow, 5 if birch else 7)
    return out


def bush(rnd, x, base, r, col, snow=False):
    return crown(rnd, x, base - r * 0.55, r, col, snow, 5)


def rock(rnd, x, base, w, h, col='#8d8a80', snow=False):
    p = [(x - w / 2, base), (x - w * 0.38, base - h * 0.7), (x - w * 0.05, base - h), (x + w * 0.3, base - h * 0.75), (x + w / 2, base)]
    sh = [(x - w * 0.05, base - h), (x + w * 0.3, base - h * 0.75), (x + w / 2, base), (x + w * 0.05, base)]
    out = shaded(poly(p), col, poly(sh), 'h3', 0.22, 0.4, 1.6)
    if snow:
        out += f'<path d="{poly([(x - w * 0.36, base - h * 0.68), (x - w * 0.05, base - h - 1), (x + w * 0.28, base - h * 0.76), (x + w * 0.05, base - h * 0.62), (x - w * 0.15, base - h * 0.72)])}" fill="#f4f7f9"/>'
    return out


def tufts(rnd, n, y0, y1, col='#3d4a2a', h=9, xs=None):
    d = ''
    for i in range(n):
        x = xs(i) if xs else rnd.uniform(X0, X1)
        y = rnd.uniform(y0, y1)
        k = h * rnd.uniform(0.7, 1.4)
        d += f'M{f1(x)} {f1(y)} q-2 {f1(-k * 0.6)} -5 {f1(-k)} M{f1(x + 2)} {f1(y)} q1 {f1(-k * 0.7)} 2 {f1(-k * 1.15)} M{f1(x + 4)} {f1(y)} q3 {f1(-k * 0.5)} 7 {f1(-k * 0.8)} '
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>'


def forest_band(rnd, pts, bottom, col, spike=(16, 34), step=(11, 19), snow=False):
    """Geschlossener Nadelwald als gezackte Flaeche entlang einer Hoehenlinie."""
    top, x = [], X0 - 20
    while x < X1 + 20:
        s = rnd.uniform(*step)
        hgt = rnd.uniform(*spike)
        top += [(x, at(pts, x)), (x + s / 2, at(pts, x + s / 2) - hgt)]
        x += s
    top.append((X1 + 20, at(pts, X1)))
    d = poly(top + [(X1 + 20, bottom), (X0 - 20, bottom)])
    sh = ''
    for i in range(1, len(top) - 1, 2):
        sh += poly([top[i], top[i + 1], (top[i][0], top[i + 1][1])])
    out = shaded(d, col, sh, 'h3', 0.3, 0.35, 1.4)
    c = uid()
    out += f'<clipPath id="{c}"><path d="{d}"/></clipPath><g clip-path="url(#{c})"><rect x="{X0}" y="0" width="{W}" height="{H}" fill="url(#h2)" opacity="0.13"/></g>'
    if snow:
        cap = ''
        for i in range(1, len(top) - 1, 2):
            a, t, b = top[i - 1], top[i], top[i + 1]
            cap += poly([t, ((a[0] + t[0]) / 2, (a[1] + t[1]) / 2), (t[0], t[1] + (a[1] - t[1]) * 0.45)])
        out += f'<path d="{cap}" fill="#f4f7f9" opacity="0.95"/>'
    return out


def svg(body, w=W, h=H, vb=None, defs=''):
    vb = vb or f'{X0} 0 {W} {H}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}">\n<defs>{DEFS}{defs}</defs>\n{body}\n</svg>\n'


SNOWG, SNOWS = '#eef2f4', '#dfe7ec'


# --------------------------------------------------------------------------- Rocky Mountains
def rocky(layer, snow):
    rnd = random.Random(101 + hash(layer) % 7 * 0 + {'fern': 1, 'mitte': 2, 'nah': 3, 'vorn': 4}[layer])
    o = ''
    if layer == 'fern':
        for k, (base, lo, hi, col, cap) in enumerate([(430, 150, 250, '#a9b7c6', True), (470, 90, 190, '#8497a8', True)]):
            x = X0 - 60 + k * 50
            while x < X1 + 80:
                wdt = rnd.uniform(190, 300)
                hgt = rnd.uniform(lo, hi)
                ax = x + wdt * rnd.uniform(0.4, 0.6)
                apex = (ax, base - hgt)
                l1 = (x + wdt * 0.22, base - hgt * rnd.uniform(0.4, 0.55))
                r1 = (x + wdt * 0.8, base - hgt * rnd.uniform(0.35, 0.5))
                body = [(x - 30, base + 60), l1, (ax - wdt * 0.1, base - hgt * 0.8), apex, (ax + wdt * 0.12, base - hgt * 0.74), r1, (x + wdt + 30, base + 60)]
                rid = [apex, (ax + wdt * 0.04, base - hgt * 0.6), (ax - wdt * 0.03, base - hgt * 0.32), (ax + wdt * 0.08, base + 60)]
                sh = rid + [(x + wdt + 30, base + 60), r1, (ax + wdt * 0.12, base - hgt * 0.74)]
                o += shaded(poly(body), col, poly(sh), 'h1', 0.2, 0.34, 1.8)
                if cap or snow:
                    f = 0.5 if snow else 0.3
                    zig = [(ax - wdt * 0.1 * f * 3, base - hgt * (1 - f)), (ax - wdt * 0.06, base - hgt * (1 - f * 0.55)), (ax - wdt * 0.02, base - hgt * (1 - f * 0.95)),
                           (ax + wdt * 0.03, base - hgt * (1 - f * 0.5)), (ax + wdt * 0.09, base - hgt * (1 - f * 0.9)), (ax + wdt * 0.12 * f * 3, base - hgt * (1 - f * 0.8))]
                    c = uid()
                    o += (f'<clipPath id="{c}"><path d="{poly(body)}"/></clipPath><g clip-path="url(#{c})"><path d="{poly([apex] + zig[::-1] + [(ax - wdt, base - hgt * (1 - f)), (ax - wdt, base - hgt - 20), (ax + wdt, base - hgt - 20), (ax + wdt, base - hgt * (1 - f * 0.8))])}" fill="#f6f8f9"/>'
                          f'<path d="{poly([apex, zig[3], zig[4], zig[5], (ax + wdt, base - hgt * (1 - f * 0.8)), (ax + wdt, base - hgt - 20)])}" fill="#7f93a6" opacity="0.4"/></g>')
                x += wdt * rnd.uniform(0.55, 0.8)
        o += f'<rect x="{X0}" y="380" width="{W}" height="110" fill="url(#haze)"/>'
        r = ridge(rnd, 440, 46, 30)
        o += forest_band(rnd, r, 500, '#aab6a2' if snow else '#5f7a66', (10, 20), (9, 15), snow)
    elif layer == 'mitte':
        r = ridge(rnd, 440, 60, 36)
        o += forest_band(rnd, r, 470, '#8ea39a' if snow else '#3f5e45', (22, 44), (13, 22), snow)
        g = ridge(rnd, 478, 26, 44)
        o += land(g, 610, SNOWG if snow else '#b7a55a', 30, 'h1', 0.2, 0.12)
        for x in [-160, 120, 180, 420, 760, 800, 1120, 1390, 1450]:
            o += leaf_tree(rnd, x + rnd.uniform(-20, 20), at(g, x) + 6, rnd.uniform(70, 96), '#d9b23a', snow, '#e8e4d6', True)
        for x in [-60, 300, 560, 930, 1010, 1260]:
            o += conifer(x, at(g, x) + 8, rnd.uniform(90, 130), '#2f4d3a', snow)
        for x in [40, 660, 1180]:
            o += rock(rnd, x, at(g, x) + 10, rnd.uniform(60, 90), rnd.uniform(26, 40), '#8f8b82', snow)
        o += f'<path d="M{X0} 560 C 100 540 300 590 620 566 S 1100 540 {X1} 572 L{X1} 590 C 1100 560 900 606 620 584 S 100 560 {X0} 580Z" fill="{"#c9d6de" if snow else "#7fa3b5"}" stroke="{INK}" stroke-width="1.4"/>'
        o += f'<path d="M-100 566 h60 M210 572 h80 M700 574 h70 M1040 562 h90 M1330 566 h60" stroke="#fff" stroke-width="2" opacity="0.6"/>'
    elif layer == 'nah':
        g = ridge(rnd, 548, 34, 50)
        o += land(g, 722, SNOWG if snow else '#a8a04e', 40, 'h2', 0.2, 0.12)
        o += tufts(rnd, 150, 580, 700, '#6f7f88' if snow else '#4a5226', 10)
        for x, hgt in [(-190, 250), (-90, 190), (1350, 270), (1450, 200), (1215, 150)]:
            o += conifer(x, at(g, x) + 14, hgt, '#294636', snow)
        for x in [70, 150, 1090]:
            o += leaf_tree(rnd, x, at(g, x) + 12, rnd.uniform(130, 160), '#e0b93c', snow, '#e8e4d6', True)
        for x, w in [(330, 120), (880, 150), (620, 70)]:
            o += rock(rnd, x, at(g, x) + 18, w, w * 0.5, '#8d8a80', snow)
        for x in [250, 480, 760, 1000]:
            o += bush(rnd, x, at(g, x) + 16, rnd.uniform(20, 30), '#7d8a4a', snow)
    else:
        g = ridge(rnd, 640, 22, 40, 0.2)
        g = [(x, min(max(y, 606), 640)) for x, y in g]
        o += land(g, 722, SNOWS if snow else '#8e8a3e', 26, 'h2', 0.22, 0.14)
        rr = random.Random(7)
        for x in range(X0 + 30, X1, 150):
            xx = x + rr.uniform(-30, 30)
            o += bush(rr, xx, 668 + rr.uniform(0, 14), rr.uniform(22, 30), '#6f7a4f', snow)
        o += tufts(rnd, 170, 650, 716, '#6f7f88' if snow else '#3d4420', 14)
    return o


# --------------------------------------------------------------------------- Schwarzwald
def schwarzwald(layer, snow):
    rnd = random.Random(200 + {'fern': 1, 'mitte': 2, 'nah': 3, 'vorn': 4}[layer])
    o = ''
    if layer == 'fern':
        for y, amp, col in [(330, 120, '#8fa3b0'), (380, 110, '#6e8793'), (425, 90, '#4f6b6c')]:
            r = ridge(rnd, y, amp, 34, 0.2, 2)
            o += forest_band(rnd, r, 500, '#a9b9bd' if snow else col, (6, 13), (8, 13), snow)
            o += f'<ellipse cx="{rnd.uniform(100, 1100):.0f}" cy="{y + 20}" rx="{rnd.uniform(300, 480):.0f}" ry="16" fill="#fff" opacity="0.4"/>'
        o += f'<rect x="{X0}" y="400" width="{W}" height="100" fill="url(#haze)"/>'
    elif layer == 'mitte':
        r = ridge(rnd, 436, 70, 36, 0.2, 2)
        o += forest_band(rnd, r, 480, '#8fa39c' if snow else '#2f4a3a', (26, 50), (14, 22), snow)
        g = ridge(rnd, 486, 30, 44)
        o += land(g, 610, SNOWG if snow else '#7fa24c', 30, 'h1', 0.2, 0.12)
        # Schwarzwaldhof mit tief gezogenem Walmdach
        hx, hy = 860, at(g, 900) + 16
        o += f'<rect x="{hx}" y="{hy - 46:.0f}" width="150" height="46" fill="#efe6cf" stroke="{INK}" stroke-width="1.6"/>'
        o += f'<rect x="{hx}" y="{hy - 46:.0f}" width="150" height="18" fill="#6a4a30" stroke="{INK}" stroke-width="1.2"/>'
        o += ''.join(f'<rect x="{hx + 14 + i * 26}" y="{hy - 22:.0f}" width="12" height="12" fill="#3a2a1c"/>' for i in range(5))
        roof = [(hx - 16, hy - 44), (hx + 22, hy - 104), (hx + 132, hy - 104), (hx + 168, hy - 44)]
        o += shaded(poly(roof), '#f1f4f6' if snow else '#5a3f2c', poly([(hx + 90, hy - 104), (hx + 132, hy - 104), (hx + 168, hy - 44), (hx + 110, hy - 44)]), 'h1', 0.25, 0.5, 1.8)
        o += f'<rect x="{hx + 150}" y="{hy - 34:.0f}" width="60" height="34" fill="#7a5a3c" stroke="{INK}" stroke-width="1.4"/><path d="{poly([(hx + 144, hy - 32), (hx + 180, hy - 58), (hx + 216, hy - 32)])}" fill="{"#f1f4f6" if snow else "#4d3626"}" stroke="{INK}" stroke-width="1.4"/>'
        for x in [-180, -40, 90, 250, 330, 520, 610, 1140, 1230, 1400]:
            o += conifer(x, at(g, x) + 8, rnd.uniform(100, 150), '#24402f', snow)
        for x in [700, 1080, 420]:
            o += leaf_tree(rnd, x, at(g, x) + 8, rnd.uniform(60, 80), '#6f9a3e', snow)
        o += f'<path d="M{hx - 200} {hy + 26:.0f} q160 -22 330 -4" fill="none" stroke="{INK}" stroke-width="1.6"/>'
        o += ''.join(f'<path d="M{hx - 190 + i * 30} {hy + 28 - i * 2:.0f} v-14" stroke="{INK}" stroke-width="2"/>' for i in range(11))
    elif layer == 'nah':
        g = ridge(rnd, 552, 36, 50)
        o += land(g, 722, SNOWG if snow else '#6f9a45', 40, 'h2', 0.2, 0.12)
        o += tufts(rnd, 160, 580, 700, '#6f7f88' if snow else '#2f4a22', 10)
        for x, hgt in [(-200, 300), (-120, 230), (-30, 170), (1300, 290), (1400, 220), (1480, 320), (1190, 160)]:
            o += conifer(x, at(g, x) + 16, hgt, '#1f3a2a', snow)
        for x in [300, 700]:
            o += bush(rnd, x, at(g, x) + 16, rnd.uniform(22, 30), '#4f7a3a', snow)
        o += rock(rnd, 520, at(g, 520) + 16, 90, 40, '#7d7f7a', snow)
        # Weidezaun
        fx = [120 + i * 110 for i in range(10)]
        o += ''.join(f'<path d="M{x} {at(g, x) + 22:.0f} v-34" stroke="#4a3626" stroke-width="6" stroke-linecap="round"/>' for x in fx)
        o += '<path d="' + ' '.join(f'M{a} {at(g, a) - 4:.0f} L{b} {at(g, b) - 4:.0f} M{a} {at(g, a) + 8:.0f} L{b} {at(g, b) + 8:.0f}' for a, b in zip(fx, fx[1:])) + f'" stroke="#5c4530" stroke-width="3.5" fill="none"/>'
    else:
        g = ridge(rnd, 640, 22, 40, 0.2)
        g = [(x, min(max(y, 606), 640)) for x, y in g]
        o += land(g, 722, SNOWS if snow else '#527a36', 26, 'h2', 0.22, 0.14)
        rr = random.Random(8)
        for x in range(X0 + 30, X1, 170):
            o += bush(rr, x + rr.uniform(-30, 30), 670 + rr.uniform(0, 12), rr.uniform(22, 30), '#3f6a34', snow)
        o += tufts(rnd, 190, 650, 716, '#6f7f88' if snow else '#23401c', 15)
    return o


# --------------------------------------------------------------------------- Uckermark
def uckermark(layer, snow):
    rnd = random.Random(300 + {'fern': 1, 'mitte': 2, 'nah': 3, 'vorn': 4}[layer])
    o = ''
    if layer == 'fern':
        r = ridge(rnd, 410, 40, 60, 0.1, 2)
        o += land(r, 500, '#a9bba6', 20, 'h1', 0.16, 0.08, True, 1.4)
        r2 = ridge(rnd, 432, 22, 30, 0.2, 2)
        o += forest_band(rnd, r2, 500, '#6f8f78', (5, 11), (10, 18))
        o += f'<path d="M930 {at(r2, 930) - 4:.0f} v-46 l8 -22 l8 22 v46Z" fill="#8a7f72" stroke="{INK}" stroke-width="1.4"/><rect x="946" y="{at(r2, 950) - 22:.0f}" width="44" height="22" fill="#9a8f80" stroke="{INK}" stroke-width="1.2"/>'
        o += f'<rect x="{X0}" y="420" width="{W}" height="80" fill="url(#haze)"/>'
    elif layer == 'mitte':
        g = ridge(rnd, 470, 22, 60, 0.1, 2)
        o += land(g, 612, '#c9b85e', 24, 'h1', 0.18, 0.1)
        # Felder in Streifen
        for (a, b, col) in [(-240, 180, '#8fae58'), (180, 640, '#d7c56a'), (640, 1010, '#9a8454'), (1010, 1520, '#a9c063')]:
            c = uid()
            fld = poly([(a, at(g, a) + 6), (b, at(g, b) + 6), (b + 60, 510), (a - 60, 510)])
            lines = ''.join(f'M{a + (b - a) * t / 9:.0f} {at(g, a + (b - a) * t / 9) + 6:.0f} L{a - 60 + (b - a + 120) * t / 9:.0f} 510 ' for t in range(10))
            o += f'<clipPath id="{c}"><path d="{fld}"/></clipPath><path d="{fld}" fill="{col}" stroke="{INK}" stroke-width="1.2"/><path clip-path="url(#{c})" d="{lines}" stroke="{INK}" stroke-width="1" opacity="0.35" fill="none"/>'
        # See mit Schilf
        o += f'<path d="M{X0} 512 C 60 502 420 506 700 514 S 1300 504 {X1} 512 L{X1} 600 L{X0} 600Z" fill="#8fb4c4" stroke="{INK}" stroke-width="1.4"/>'
        o += f'<rect x="{X0}" y="516" width="{W}" height="84" fill="url(#hw)" opacity="0.22"/>'
        o += '<path d="M-60 526 h110 M300 536 h90 M720 530 h120 M1180 534 h100 M500 546 h70 M960 548 h90" stroke="#fff" stroke-width="2" opacity="0.6"/>'
        # Allee
        for i in range(9):
            x = 60 + i * 74
            o += leaf_tree(rnd, x, at(g, x) + 10, 58 + (i % 3) * 5, '#5f8f46', snow)
        for x in [-170, 1150, 1260, 1420]:
            o += leaf_tree(rnd, x, at(g, x) + 10, rnd.uniform(74, 96), '#4f7f40', snow)
        # Bockwindmuehle
        mx, my = 860, at(g, 860) + 8
        o += shaded(poly([(mx - 18, my), (mx - 13, my - 52), (mx + 13, my - 52), (mx + 18, my)]), '#7a5a3c', poly([(mx, my - 52), (mx + 13, my - 52), (mx + 18, my), (mx + 2, my)]), 'h3', 0.25, 0.5, 1.4)
        o += f'<path d="{poly([(mx - 17, my - 50), (mx, my - 68), (mx + 17, my - 50)])}" fill="#4d3626" stroke="{INK}" stroke-width="1.4"/>'
        o += f'<g stroke="{INK}" stroke-width="3" stroke-linecap="round"><path d="M{mx - 34} {my - 86:.0f} L{mx + 34} {my - 22:.0f} M{mx + 34} {my - 86:.0f} L{mx - 34} {my - 22:.0f}"/></g>'
        for x in range(X0, X1, 26):
            hgt = rnd.uniform(14, 24)
            o += f'<path d="M{x} 560 q2 -{hgt / 2:.0f} {rnd.uniform(-3, 3):.0f} -{hgt:.0f}" stroke="#6a6a34" stroke-width="2.2" fill="none"/><ellipse cx="{x}" cy="{560 - hgt:.0f}" rx="2.2" ry="5" fill="#5a4026"/>'
    elif layer == 'nah':
        g = ridge(rnd, 556, 26, 60, 0.1, 2)
        o += land(g, 722, '#88a84c', 36, 'h2', 0.2, 0.12)
        o += tufts(rnd, 170, 584, 700, '#3a5222', 11)
        for x, hgt in [(-190, 240), (1380, 260), (1470, 210)]:
            o += leaf_tree(rnd, x, at(g, x) + 16, hgt, '#4a7a3a', snow)
        for x in [-80, 20, 1180, 1250]:
            o += leaf_tree(rnd, x, at(g, x) + 14, rnd.uniform(140, 180), '#9fbf5a', snow, '#eeeae0', True)
        # Hochsitz
        hx, hb = 1040, at(g, 1040) + 18
        o += f'<g stroke="#4a3626" stroke-width="5" stroke-linecap="round"><path d="M{hx - 26} {hb:.0f} L{hx - 14} {hb - 96:.0f} M{hx + 26} {hb:.0f} L{hx + 14} {hb - 96:.0f} M{hx - 22} {hb - 30:.0f} L{hx + 18} {hb - 66:.0f} M{hx + 22} {hb - 30:.0f} L{hx - 18} {hb - 66:.0f}"/></g>'
        o += shaded(poly([(hx - 24, hb - 96), (hx + 24, hb - 96), (hx + 24, hb - 132), (hx - 24, hb - 132)]), '#7a5a3c', poly([(hx + 4, hb - 96), (hx + 24, hb - 96), (hx + 24, hb - 132), (hx + 4, hb - 132)]), 'h3', 0.25, 0.5, 1.6)
        o += f'<path d="{poly([(hx - 32, hb - 130), (hx, hb - 150), (hx + 32, hb - 130)])}" fill="#4d3626" stroke="{INK}" stroke-width="1.6"/><rect x="{hx - 14}" y="{hb - 122:.0f}" width="28" height="10" fill="#2b2118"/>'
        for x in [260, 520, 800]:
            o += bush(rnd, x, at(g, x) + 16, rnd.uniform(22, 32), '#5f8a3e', snow)
        o += rock(rnd, 660, at(g, 660) + 16, 70, 30, '#8d8a80')
    else:
        g = ridge(rnd, 640, 20, 40, 0.2)
        g = [(x, min(max(y, 608), 640)) for x, y in g]
        o += land(g, 722, '#6a8a3a', 26, 'h2', 0.22, 0.14)
        rr = random.Random(9)
        for x in range(X0 + 10, X1, 34):
            hgt = rr.uniform(26, 44)
            xx = x + rr.uniform(-8, 8)
            o += f'<path d="M{xx:.0f} 700 q{rr.uniform(-4, 4):.0f} -{hgt:.0f} {rr.uniform(-5, 5):.0f} -{hgt + 30:.0f}" stroke="#77783a" stroke-width="2.4" fill="none"/><ellipse cx="{xx + rr.uniform(-3, 3):.0f}" cy="{700 - hgt - 30:.0f}" rx="2.6" ry="7" fill="#5a4026" stroke="{INK}" stroke-width="0.8"/>'
        o += tufts(rnd, 190, 650, 716, '#2c4a1c', 15)
    return o


# --------------------------------------------------------------------------- Voegel
RIM = '<filter id="rim" filterUnits="userSpaceOnUse" x="-20" y="-20" width="340" height="260"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/><feFlood flood-color="#f1e9d2"/><feComposite in2="d" operator="in" result="p"/><feMerge><feMergeNode in="p"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
G = f'filter="url(#rim)" stroke="{INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"'


def bird_body(kind):
    """Koerper in Seitenansicht, Flug nach rechts; Mittelpunkt des Rumpfs bei (150, 110), Flaeche 300 x 200."""
    o = ''
    if kind == 'truthahn':
        # Schwanzfaecher
        fan = ''
        for i in range(9):
            a = math.radians(150 + i * 14)
            x, y = 98 + math.cos(a) * 78, 108 - abs(math.sin(a)) * 30 - (i - 4) * 9
            fan += f'<path d="M98 108 L{x - 7:.0f} {y - 9:.0f} Q{x - 12:.0f} {y:.0f} {x - 5:.0f} {y + 9:.0f}Z" fill="{"#6a4426" if i % 2 else "#7d532c"}"/>'
        o += fan + '<path d="M30 60 Q14 106 34 150" fill="none" stroke="#e9dcc0" stroke-width="5"/>'
        o += '<ellipse cx="150" cy="112" rx="64" ry="38" fill="#4a3324"/>'
        o += '<path d="M96 118 Q150 160 208 122 Q190 152 150 152 Q112 150 96 118Z" fill="#000" opacity="0.28" stroke="none"/>'
        o += '<path d="M112 128 q8 8 16 0 M134 134 q8 8 16 0 M156 132 q8 8 16 0 M124 112 q8 8 16 0 M148 114 q8 8 16 0 M172 116 q8 8 16 0" fill="none" stroke="#c98a3e" stroke-width="2" opacity="0.8"/>'
        o += '<path d="M198 96 Q226 78 232 54 Q244 50 248 62 Q244 92 214 118Z" fill="#5a6f8a"/>'
        o += '<circle cx="243" cy="56" r="13" fill="#6f86a8"/><path d="M254 54 l18 5 l-17 6Z" fill="#d9b25a"/><circle cx="246" cy="52" r="3" fill="#fff" stroke-width="1.5"/><circle cx="247" cy="52" r="1.2" fill="#000" stroke="none"/>'
        o += '<path d="M252 62 q8 14 0 26 q-8 -6 -6 -24Z" fill="#c8382c"/>'
    elif kind == 'taube':
        o += '<path d="M96 104 L30 92 L22 112 L34 128 L98 124Z" fill="#6f7f8f"/><path d="M34 94 L22 112 L34 128 L46 126 L44 96Z" fill="#2b3038"/>'
        o += '<ellipse cx="150" cy="112" rx="60" ry="32" fill="#8d9bab"/>'
        o += '<path d="M100 120 Q150 152 206 118 Q186 146 150 146 Q114 144 100 120Z" fill="#000" opacity="0.2" stroke="none"/>'
        o += '<path d="M170 132 Q196 136 210 112 Q200 96 180 100Z" fill="#c9a0a6" stroke="none" opacity="0.9"/>'
        o += '<path d="M196 98 Q214 84 222 70 Q236 66 242 78 Q238 100 212 118Z" fill="#8d9bab"/>'
        o += '<path d="M206 92 q10 -4 16 6 q-6 8 -16 6Z" fill="#f4f4f0"/><path d="M214 86 q8 -2 12 4" fill="none" stroke="#5f9a7a" stroke-width="4"/>'
        o += '<circle cx="236" cy="76" r="12" fill="#8492a3"/><path d="M246 74 l16 4 l-15 6Z" fill="#d9a03a"/><circle cx="239" cy="73" r="3" fill="#f4e9a0" stroke-width="1.4"/><circle cx="239.5" cy="73" r="1.2" fill="#000" stroke="none"/>'
        o += '<path d="M118 126 q10 6 20 0 M144 132 q10 6 20 0" fill="none" stroke="#2b3038" stroke-width="1.6" opacity="0.5"/>'
    else:  # fasan
        o += '<path d="M100 106 Q40 96 4 70 Q30 108 6 130 Q52 126 100 122Z" fill="#b98846"/>'
        o += '<path d="M84 104 l-6 16 M66 100 l-7 20 M48 94 l-8 24 M30 86 l-8 30" fill="none" stroke="#3a2a1c" stroke-width="2.2"/>'
        o += '<ellipse cx="150" cy="112" rx="58" ry="30" fill="#b5602a"/>'
        o += '<path d="M102 120 Q150 150 204 118 Q184 144 150 144 Q116 142 102 120Z" fill="#000" opacity="0.24" stroke="none"/>'
        o += '<path d="M116 124 q7 7 14 0 M138 130 q7 7 14 0 M160 128 q7 7 14 0 M128 110 q7 7 14 0 M152 112 q7 7 14 0" fill="none" stroke="#3a2416" stroke-width="2" opacity="0.75"/>'
        o += '<path d="M194 98 Q212 86 220 72 Q234 68 240 80 Q236 100 210 118Z" fill="#b5602a"/>'
        o += '<path d="M203 94 q10 -6 18 2 q-4 8 -14 8Z" fill="#f4f4f0"/>'
        o += '<circle cx="234" cy="76" r="12.5" fill="#1f5a4a"/><ellipse cx="237" cy="77" rx="6.5" ry="5.5" fill="#c8382c" stroke-width="1.4"/><path d="M245 74 l16 4 l-15 6Z" fill="#e0c078"/><circle cx="237" cy="76" r="2.4" fill="#f4e9a0" stroke-width="1.2"/><circle cx="237.5" cy="76" r="1" fill="#000" stroke="none"/>'
        o += '<path d="M226 64 l-8 -10 M230 63 l-3 -11" fill="none" stroke="#1f5a4a" stroke-width="3"/>'
    hatch = f'<clipPath id="bb"><ellipse cx="150" cy="112" rx="60" ry="34"/></clipPath><ellipse clip-path="url(#bb)" cx="150" cy="140" rx="62" ry="22" fill="url(#h3)" opacity="0.4"/>'
    return svg(f'<g {G}>{o}</g>{hatch}', 300, 200, '0 0 300 200', RIM)


def bird_wing(kind):
    """Fluegel, angehoben; Schultergelenk (Drehpunkt) bei (130, 150), Flaeche 170 x 170."""
    col, tip, band = {'truthahn': ('#5a3d28', '#2e2018', '#e9dcc0'), 'taube': ('#7b8a9b', '#2b3038', '#f4f4f0'), 'fasan': ('#9a6a3a', '#4a3020', '#e0c9a0')}[kind]
    o = f'<path d="M130 150 Q96 108 70 30 Q58 14 48 22 Q24 62 34 98 Q22 104 26 116 Q60 150 130 150Z" fill="{col}"/>'
    o += f'<path d="M70 30 Q58 14 48 22 Q34 46 34 70 Q52 60 78 52Z" fill="{tip}"/>'
    o += f'<path d="M40 84 Q70 74 96 86" fill="none" stroke="{band}" stroke-width="5"/>'
    o += '<path d="M52 36 L74 96 M40 60 L62 112 M36 92 L80 134 M66 44 L98 120" fill="none" stroke="#000" stroke-width="1.6" opacity="0.4"/>'
    hatch = '<clipPath id="wc"><path d="M130 150 Q96 108 70 30 Q58 14 48 22 Q24 62 34 98 Q22 104 26 116 Q60 150 130 150Z"/></clipPath><path clip-path="url(#wc)" d="M20 100 Q70 110 130 150 L20 160Z" fill="url(#h3)" opacity="0.45"/>'
    return svg(f'<g {G}>{o}</g>{hatch}', 170, 170, '0 0 170 170', RIM.replace('width="340" height="260"', 'width="210" height="210"'))


def gun():
    """Bockflinte, Lauf nach links; Drehpunkt am Schaftende rechts (500, 60), Flaeche 520 x 120."""
    o = f'<g stroke="{INK}" stroke-width="2.4" stroke-linejoin="round">'
    o += '<path d="M330 46 L500 30 L514 96 L420 92 Q372 90 330 74Z" fill="#8a4a26"/>'
    o += '<path d="M360 70 Q430 84 512 88 L514 96 L420 92 Q372 90 330 74Z" fill="#000" opacity="0.25" stroke="none"/>'
    o += '<path d="M270 40 L336 40 L340 78 L286 76 Q270 70 270 40Z" fill="#b9bcc0"/>'
    o += '<rect x="20" y="38" width="254" height="13" rx="3" fill="#2a2c30"/><rect x="20" y="52" width="254" height="13" rx="3" fill="#1c1e22"/>'
    o += '<path d="M300 78 q10 22 30 16" fill="none" stroke-width="3"/><path d="M150 64 L270 66 L262 80 L160 76Z" fill="#8a4a26"/>'
    o += '</g><path d="M26 41 H268" stroke="#fff" stroke-width="2" opacity="0.35"/><clipPath id="gs"><path d="M330 46 L500 30 L514 96 L420 92 Q372 90 330 74Z"/></clipPath><path clip-path="url(#gs)" d="M330 66 Q430 80 514 74 V100 H330Z" fill="url(#h3)" opacity="0.4"/><clipPath id="gr"><path d="M270 40 L336 40 L340 78 L286 76 Q270 70 270 40Z"/></clipPath><rect clip-path="url(#gr)" x="270" y="58" width="72" height="22" fill="url(#h1)" opacity="0.3"/>'
    return svg(o, 520, 120, '0 0 520 120')


README = '''# Grafiken Truthahn-Skeet (2D)

Alle Dateien in diesem Ordner werden von `tools/build-skeet-assets.py` gezeichnet.
Nicht von Hand ändern: Skript anpassen und neu ausführen.

| Ordner | Inhalt |
|---|---|
| `rocky/`, `schwarzwald/`, `uckermark/` | je vier Ebenen `fern`, `mitte`, `nah`, `vorn` (1760 × 720, x = −240 … 1520); Rocky Mountains und Schwarzwald zusätzlich als Schneefassung `*-schnee.svg` |
| `voegel/` | je Art Körper (`*-koerper.svg`, 300 × 200, Rumpfmitte 150/110) und Flügel (`*-fluegel.svg`, 170 × 170, Schultergelenk 130/150); Flug nach rechts |
| `flinte.svg` | Bockflinte, Lauf nach links, Drehpunkt 500/60 |

Stil: flächige Formen mit dunkler Kontur (`#2b2118`), Schattenseite rechts unten
(abgedunkelt und schraffiert), Dunst an fernen Ebenen. Vögel mit hellem Papierrand
wie die Figuren der Schneeballschlacht.

Herkunft: mit KI-Unterstützung per Skript erzeugt, keine fremden Bildvorlagen.
'''

if __name__ == '__main__':
    n = 0
    for name, fn, has_snow in [('rocky', rocky, True), ('schwarzwald', schwarzwald, True), ('uckermark', uckermark, False)]:
        d = OUT / name
        d.mkdir(parents=True, exist_ok=True)
        for layer in ['fern', 'mitte', 'nah', 'vorn']:
            (d / f'{layer}.svg').write_text(svg(fn(layer, False)), encoding='utf-8')
            n += 1
            if has_snow:
                (d / f'{layer}-schnee.svg').write_text(svg(fn(layer, True)), encoding='utf-8')
                n += 1
    v = OUT / 'voegel'
    v.mkdir(exist_ok=True)
    for kind in ['truthahn', 'taube', 'fasan']:
        (v / f'{kind}-koerper.svg').write_text(bird_body(kind), encoding='utf-8')
        (v / f'{kind}-fluegel.svg').write_text(bird_wing(kind), encoding='utf-8')
        n += 2
    (OUT / 'flinte.svg').write_text(gun(), encoding='utf-8')
    (OUT / 'README.md').write_text(README, encoding='utf-8')
    print(n + 1, 'Grafiken geschrieben nach', OUT)
