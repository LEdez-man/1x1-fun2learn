# Asset-Spezifikation: <Szenario>

Stand: <Datum> · Format: <SVG> · Raster der Szene: **<1280 × 720>**

Stilvorlage: <Werk, Epoche, Gattung; Rechtsstatus der Vorlage>. Die Grafiken sind
<eigene Zeichnungen / per Skript gezeichnet / geliefert von …>.

> Status: <formal geprüft / im Spiel abgenommen / offen>

## 1 Ordnerstruktur

```
<szenario>/
├── spec.md
├── layers/     Ebenen im Raster der Szene, deckungsgleich
├── figuren/    Ziele, einheitliche Größe
└── sprites/    Requisiten, Geschoss, Effekte
```

## 2 Ebenen (hinten → vorn)

Nur die hinterste Ebene ist deckend. Randreserve je Seite: <240> Einheiten.

| Z | Datei | Inhalt | Parallaxfaktor | Deckung für Zielreihe |
|---|---|---|---|---|
| 1 | | | 0,0–0,1 | – |
| 2 | | | | |

Nicht in die Ebenen malen, weil vom Spiel animiert: <Rauch, Tiere, Wasser, Fahrzeuge>.
Lichtquellen: Farbe `<#hex>` oder eigene Ebene `<Datei>`.

## 3 Ziele

| Datei | Figur | Merkmale | Haltung |
|---|---|---|---|

Maße im Koordinatensystem der Figur (<Breite × Höhe>):
- Drehpunkt: <Mitte Unterkante (x, y)>
- Trefferflächen: Kopf <Kreis: Mittelpunkt, Radius>; Körper <Rechteck>; Träger der Antwort <Rechteck>
- Nicht treffbar: <Beine, Standleiste>
- Träger der Antwort: <Lage, Größe, Schriftfarbe, Grund>

Bewegte Teile: <Datei, Gelenkpunkt>

Platzierung:

| Reihe | Maßstab | Fußlinie | zwischen Ebenen | Deckung |
|---|---|---|---|---|

Auftauchen: <Bewegung, Dauer>. Richtig: <Bewegung, Dauer, Effekt>. Falsch: <Bewegung>.

## 4 Sprites

| Datei | Größe | Verwendung | Drehpunkt |
|---|---|---|---|

## 4a Modelle und Texturen (nur 2,5D und 3D)

Einheiten: <Meter, Y nach oben>. Format: <glTF 2.0 als .glb>.

| Datei | Inhalt | Dreiecke | Texturen (Größe) | Maßstab | Ursprung / Drehpunkt | Trefferkörper |
|---|---|---|---|---|---|---|

| Textur | Größe | Art (Farbe, Alpha, kachelbar) | Farbraum | Verwendung |
|---|---|---|---|---|

Billboards: <welche Figuren stehen als freigestellte Flächen im Raum; Größe in Metern>.
Beschriftung der Ziele: <DOM über der Zeichenfläche / Billboard / Aufdruck>, Mindesthöhe am Bildschirm <px>.

## 5 Farbpalette

| Verwendung | Hex |
|---|---|

Lichtrichtung: <von links>. Schattenseite: <rechts unten, abgedunkelt, schraffiert>.

## 6 Technische Hinweise

- Rastern: <beim Laden im Browser, Faktor 1–2 / vorab als WebP>
- Filter: <welche, wo; Kosten>
- Varianten: <Schnee, Jahreszeit> aus derselben Geometrie
- Ableitungen: <Skript in tools/, was es tut>; gelieferte Dateien bleiben unverändert

## 7 Entscheidungen

| Entscheidung | Alternative | Begründung |
|---|---|---|

## 8 Stückliste, Herkunft und offene Punkte

| Stück | Quelle | Urheber / Lizenz | Weg (Vektor, Freistellen nach Farbe, Segmentierung, in Ebenen zerlegt) | Werkzeug und Parameter | Kontrollbild abgenommen | Zustand |
|---|---|---|---|---|---|---|


- Herkunft: <wer, womit, KI-Unterstützung ja/nein, Bearbeitung>
- Rechte: <Vorlage gemeinfrei? Lizenz fremder Teile? Urheberschaft dokumentiert?>
- Offen: <Abnahme im Spiel, Feinabstimmung>
