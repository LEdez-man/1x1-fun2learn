# Texturen und Sprites herstellen, Freistellen

Arbeitsweg von der Bildquelle zur einsatzfertigen Grafik. Gilt für 2D-Sprites,
Billboards und Texturen in 3D.

Inhalt: 1 Werkzeuge der Sitzung feststellen · 2 Weg wählen · 3 Freistellen ·
4 Aufbereiten · 5 Abnahme · 6 Texturen für 3D · 7 Atlas · 8 Dokumentation ·
9 Was in die Planung gehört

## 1 Werkzeuge der Sitzung feststellen

Welche Design-Werkzeuge verfügbar sind, unterscheidet sich je Sitzung und Konto. Vor
der Planung der Grafikherstellung prüfen und das Ergebnis dem Auftraggeber nennen:

1. **Design-Connector** (z. B. Canva): Liste der Connectoren und ihrer Werkzeuge
   abfragen. Bietet er Hintergrundentfernung, Bildbearbeitung oder Export mit
   Transparenz, ist das der bevorzugte Weg für Fotos und gemalte Vorlagen. Ist der
   Connector verbunden, aber ohne passendes Werkzeug in der Sitzung, das so sagen;
   der Auftraggeber kann dort von Hand freistellen und das Ergebnis liefern.
2. **Design- und Bild-Skills** der Sitzung (z. B. für gestaltete Grafiken als PNG oder
   PDF, Design-Artefakte): geeignet für Entwurfstafeln, Stilproben, Paletten,
   Vorschauen der Szene.
3. **Bildgenerator**, falls vorhanden: für Einzelmotive und Texturen; Motive auf
   einfarbigem, vom Motiv deutlich verschiedenem Grund anfordern, dann freistellen.
4. **Lokale Werkzeuge**: Python mit Pillow und numpy, ImageMagick, optional `rembg`
   (Segmentierung durch ein neuronales Netz; braucht Installation und lädt beim ersten
   Lauf ein Modell, was in abgeschotteten Umgebungen scheitern kann). Das mitgelieferte
   Skript `scripts/freistellen.py` deckt Freistellen, Aufbereiten und Kontrolle ab.
5. **Nichts davon**: Grafiken per Skript als Vektor zeichnen; dann entfällt das
   Freistellen.

Nie behaupten, ein Werkzeug stehe bereit, ohne es in der Sitzung gesehen zu haben.

## 2 Weg wählen

| Ausgangslage | Weg | Freistellen nötig |
|---|---|---|
| Vektorgrafik (SVG) vom Auftraggeber oder per Skript | transparent von Haus aus; einmal rastern | nein |
| Zeichnung oder Gemälde als Rasterbild auf einfarbigem Grund | Freistellen nach Farbe | ja, einfach |
| Foto, gescannte Zeichnung, erzeugtes Bild mit unruhigem Grund | Freistellen durch Segmentierung (Design-Werkzeug oder `rembg`), danach Nacharbeit | ja, mit Kontrolle |
| Kulisse in einem Stück, aus der Ziele hervortreten sollen | in Ebenen zerlegen: Deckungen freistellen, Lücken dahinter füllen | ja, aufwendig |
| 3D-Modell mit Texturen | Texturen prüfen (Größe, Farbraum); Alpha-Texturen wie Sprites behandeln | teilweise |

Grundsatz: Den Bedarf an Freistellung gering halten, indem Grafiken von Anfang an als
getrennte, transparente Teile entstehen. Eine deckungsgleiche Ebenenfolge lässt sich
aus einem fertigen Gesamtbild nur mit Verlust gewinnen.

## 3 Freistellen

**Nach Farbe** (`scripts/freistellen.py --verfahren farbe`): Flutfüllung von den
Bildrändern mit Toleranz. Flächen im Motiv, die die Hintergrundfarbe haben, bleiben
erhalten, solange sie nicht mit dem Rand verbunden sind. Voraussetzung: gleichmäßiger
Grund, der sich vom Rand des Motivs abhebt. Toleranz bei Verläufen und JPEG-Rauschen
erhöhen, bei hellen Motiven auf hellem Grund senken oder einen anderen Grund anfordern.

**Durch Segmentierung** (`--verfahren ki` oder Werkzeug des Design-Connectors): für
Fotos und unruhige Hintergründe. Bekannte Schwächen: Haare, Fell, Federn, Rauch, Glas,
dünne Teile (Schnüre, Speichen), Schlagschatten am Boden. Ergebnis immer am
Kontrollbild abnehmen.

**Schon transparent** (`--verfahren alpha`): Ergebnis eines anderen Werkzeugs nur
aufbereiten und prüfen.

Schlagschatten gehören nicht ins Sprite; das Spiel zeichnet sie als eigenes Element,
sonst passen sie zu keiner Lichtstimmung.

## 4 Aufbereiten

Das Skript erledigt die Schritte in dieser Reihenfolge:

1. **Kante einziehen** (1 Pixel) und leicht weichzeichnen: entfernt den Saum in
   Hintergrundfarbe.
2. **Farbe ausbluten**: Die durchsichtigen Pixel erhalten die Farbe der benachbarten
   Motivpixel. Ohne das entstehen beim Skalieren und in Mipmaps helle oder dunkle
   Ränder, weil der Filter die Farbe unsichtbarer Pixel einmischt.
3. **Beschneiden** auf das Motiv, **durchsichtigen Rand** zugeben (2 Pixel, im Atlas
   mehr): verhindert, dass Nachbarbilder hereinbluten.
4. **Zweierpotenz** (`--potenz2`) für Texturen mit Mipmaps in 3D; das Motiv bleibt
   unten mittig verankert.
5. **Kennzahlen** als JSON neben der Datei: Größe, Ausschnitt in der Quelle, Lage des
   Motivs, Drehpunkt unten Mitte, Anteil halbtransparenter Pixel, Warnhinweise.
6. **Kontrollbild**: das Sprite auf hellem, dunklem und kariertem Grund nebeneinander.

Von Hand bleiben: Trefferflächen festlegen (Kopf, Körper, Träger der Antwort),
Drehpunkt bestätigen, einheitliche Größe und Standlinie innerhalb eines Figurensatzes,
bewegte Teile trennen und Gelenkpunkte notieren.

Ableitungen immer per Skript aus der unveränderten Quelle erzeugen, damit sie sich
wiederholen lassen, wenn die Quelle neu geliefert wird.

## 5 Abnahme

Am Kontrollbild und in der Szene prüfen:

- kein Saum auf dunklem **und** hellem Grund
- nichts vom Motiv abgeschnitten, keine Löcher, keine Reste des Hintergrunds
- Kante weder ausgefranst noch treppig bei der kleinsten und größten Darstellung
- Motiv berührt nicht den Rand der Quelldatei (Warnung des Skripts)
- Figuren eines Satzes: gleiche Standlinie, gleiche Lichtrichtung, gleicher Papierrand
- in jeder Lichtstimmung der Szene lesbar (Nacht, Nebel)
- Träger der Antwort bleibt frei

Das Kontrollbild dem Auftraggeber zeigen; die Abnahme der Grafik ist seine
Entscheidung.

## 6 Texturen für 3D

- Kantenlängen in Zweierpotenzen, Mipmaps, Farbtexturen als sRGB.
- **Kachelbare Texturen** (Boden, Wand): Naht prüfen, indem die Textur 2 × 2
  nebeneinandergelegt wird; große wiederkehrende Flecken vermeiden.
- **Alpha-Texturen** (Laub, Zaun, Billboard): Farbe ausbluten (Abschnitt 4);
  bei harten Kanten Alpha-Test mit Schwelle statt Blending.
- Größe am Bildschirm bemessen: Mehr Textur, als das Objekt je an Pixeln einnimmt, ist
  verschenkter Speicher.
- Mehrere kleine Texturen in einen Atlas; UV-Abstand zwischen den Inseln lassen.

## 7 Atlas

Viele Einzelbilder kosten in WebGL Zeichenaufrufe und Ladeanfragen. Ein Atlas (ein
Bild, eine Beschreibungsdatei mit Rechtecken) lohnt ab einigen Dutzend Sprites oder bei
schwachen Geräten. Ohne Build-Schritt genügt ein kleines Skript in `tools/`, das den
Atlas erzeugt; Abstand zwischen den Bildern mindestens 2 Pixel, Farbe ausgeblutet.
Vorher prüfen, ob die gewählte Engine ein Atlasformat vorgibt. Für wenige große Ebenen
bringt ein Atlas nichts.

## 8 Dokumentation

In der Asset-Spezifikation je Grafik festhalten (`assets/asset-spec-vorlage.md`,
Abschnitt Herkunft): Quelle, Urheber und Lizenz, eingesetzte Werkzeuge
(Design-Connector, Bildgenerator, Skript mit Parametern), Bearbeitungsschritte,
Abnahme. Bei KI-gestützter Herstellung ist diese Spur die Grundlage für die spätere
Klärung der Urheberschaft.

## 9 Was in die Planung gehört

- Wer liefert welche Grafik in welchem Format, und wer stellt frei?
- Welche Werkzeuge stehen dafür in der Sitzung und beim Auftraggeber bereit?
- Stückliste: Ebenen, Figuren, Requisiten, Effekte, Texturen, mit Größe und Zustand
  (vorhanden, zu zeichnen, freizustellen, abzunehmen).
- Aufwand je Stück grob schätzen; Kulissen in einem Stück als Risiko markieren.
- Abnahmeschritt mit Kontrollbildern vor dem Einbau.
