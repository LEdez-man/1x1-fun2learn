# Design und Grafiken

Für die Herstellung (Freistellen, Aufbereiten, Texturen, Atlas) siehe
`texturen-und-sprites.md`, für Modelle, Kamera und Sichtbarkeit im Raum `drei-d.md`.

Inhalt: 1 Vom Thema zur Kernschleife · 2 Stil · 3 Lesbarkeit des Lerninhalts · 4 Ziele:
immer im Bild, nie verdeckt · 5 Bewegung und Reizdichte · 6 Aufbau der Grafiken ·
7 Herkunft und Rechte · 8 Inhalte und Altersangemessenheit

## 1 Vom Thema zur Kernschleife

Jedes Szenario beantwortet dieselben fünf Fragen. Mit ihnen lässt sich eine Bildidee auf
die Spiellogik abbilden, und umgekehrt:

| Frage | Beispiel Winterdorf | Beispiel Vogeljagd |
|---|---|---|
| Was trägt die Antwort? | Kinder mit Papierschild | Vögel mit Schild |
| Womit wird gewählt? | Schneeball | Schuss |
| Richtig? | Figur klappt weg, Schneewolke, Leuchtring | Federwolke, Leuchtring |
| Falsch? | Figur wackelt, Schild verblasst, taucht ab | Vogel trudelt ab |
| Fortschritt in der Szene? | Tageszeit von Morgen bis Nacht, neues Detail im Dorf | Reise durch Reviere und Jahreszeiten |

Bei „Design zuerst“ mit diesen Fragen beginnen. Lässt sich eine nicht beantworten, ist
das Thema für die Kernschleife ungeeignet oder braucht eine andere Eingabe (z. B.
Fangen statt Schießen).

## 2 Stil

- Eine benannte Stilvorlage (Gemälde, Epoche, Spielgattung) gibt Palette, Licht und
  Formensprache vor und hält mehrere Grafiken zusammen. Vorlage ist Stilreferenz, keine
  Kopiervorlage.
- Lichtrichtung festlegen und überall einhalten (Schattenseite, Schlagschatten).
- Raumtiefe in 2D entsteht durch Ebenen mit Parallaxe, Dunst in der Ferne,
  Maßstabsstufen der Ziele, Schraffur und Schattierung, eine Figur im Vordergrund
  (Werkzeug des Spielers).
- Ausschneidefiguren mit hellem Papierrand heben Ziele vom Hintergrund ab.
- Palette als Tabelle mit Hexwerten in die Asset-Spezifikation.
- Ist eine genannte Vorlage nicht auffindbar oder nicht zugänglich, den Stil als Annahme
  kennzeichnen und ein Bild oder einen Link erbitten.

## 3 Lesbarkeit des Lerninhalts

Der Lerninhalt ist das wichtigste Bildelement.

- Schrifthöhe am Bildschirm mindestens etwa 35 px bei 1080p; Schriftgröße je
  Entfernungsstufe so wählen, dass sie am Bildschirm ähnlich groß erscheint.
- Träger mit festem Kontrast (dunkle Schrift auf hellem Schild, kräftiger Rand),
  unabhängig von Figur und Stimmung.
- Der Träger ist bei allen Figuren an derselben Stelle. Im Ausgangsprojekt wanderte die
  Zahl von der Mütze auf ein Schild vor der Brust, weil neue Figuren verschiedene
  Kopfbedeckungen hatten.
- In dunklen Stimmungen Ziele und Schilder weniger abdunkeln als die Kulisse.
- Die Aufgabenanzeige darf Ziele nicht überdecken; Platz dafür im Layout reservieren.

## 4 Ziele: immer im Bild, nie verdeckt

Auslöser war ein gemeldeter Fehler: Antworten standen außerhalb des Bildes oder hinter
Bäumen. Handplatzierte Verstecke waren die Ursache. Die Regeln werden deshalb beim
Aufbau der Szene automatisch durchgesetzt und im Test nachgewiesen.

**Stehende Ziele**
1. **Zielzone.** Ziele stehen nur in Bildmitte ± halbe Zonenbreite, abzüglich ihrer
   halben Breite. Die Engine begrenzt den Schwenk so, dass die Zone bei jedem
   Seitenverhältnis im Bild bleibt, und verkleinert die Szene auf schmalen Bildschirmen.
2. **Deckung.** Ein Ziel taucht hinter genau einer Deckung auf; Zielreihe und Deckung
   haben denselben Parallaxfaktor, sonst verrutschen Füße und Deckung beim Schwenk. Die
   Standhöhe wird aus der Oberkante der Deckung gelesen (Alphakanal).
3. **Keine Verdeckung durch Kulisse.** Ein Platz ist nur zulässig, wenn Kopf, Träger und
   Körper von keiner davorliegenden Ebene überdeckt werden; geprüft im Alphakanal aller
   vorderen Ebenen, verbreitert um den größten gegenseitigen Versatz
   `|f₁ − f₂| · Schwenk`.
4. **Keine Verdeckung durch andere Ziele**, bei keinem Schwenk.
5. **Requisiten** hinter den Zielen oder außerhalb der Trefferflächen.

Folge für die Platzvergabe: Plätze werden je Batterie aus den zulässigen gewählt, nicht
fest vergeben. Reihen mit wenig freien Plätzen werden seltener gewählt.

**Im Raum (2,5D, 3D)** gelten dieselben Regeln; durchgesetzt werden sie über
Sichtkegel- und Strahlprüfung je Batterie und über feste Bahnen (`drei-d.md`,
Abschnitt 5).

**Bewegte Ziele**
- Bahnen liegen vollständig in der Zielzone.
- Ziele liegen auf einer Ebene vor der gesamten Kulisse; treffbar sind sie nur
  außerhalb der Deckung, aus der sie aufsteigen.
- Gleiche Geschwindigkeit und gestaffelter Start schließen gegenseitiges Überdecken
  konstruktiv aus. Preis: Perspektivische Geschwindigkeitsunterschiede entfallen.
- Das Werkzeug des Spielers bleibt unterhalb der Bahnen.

## 5 Bewegung und Reizdichte

- Erzeugte Bewegung (Rauch, Wetter, Tiere, Licht) macht die Szene lebendig. Sie läuft
  langsam und liegt hinter oder außerhalb der Trefferflächen.
- Der stärkste Effekt gehört in die Zwischenrunde, in der keine Aufgabe ansteht.
- Was das Spiel animiert, wird nicht in die Ebenen gemalt, sonst erscheint es doppelt.
- Reduzierte Bewegung (Systemeinstellung) und ein ruhiger Modus im Menü: weniger
  Teilchen, kein Wackeln, gedämpfte Effekte, weniger gleichzeitige Ziele.
- Fotosensibilität: höchstens drei Blitze je Sekunde, keine großflächigen schnellen
  Helligkeitswechsel (WCAG 2.3.1).
- Lichtscheine klein halten und am Bildschirmfoto prüfen.
- Bewegungsübelkeit in 3D: feste Blickrichtung, mäßiges Sichtfeld.

## 6 Aufbau der Grafiken

Lieferformat (Vorlage: `assets/asset-spec-vorlage.md`):

- Deckungsgleiche Ebenen in einem gemeinsamen Raster, nur die hinterste deckend.
- Je Zielreihe eine Deckungsebene direkt davor. So tauchen Ziele zwischen den Ebenen
  auf, ohne Masken im Code.
- An den Rändern Reserve für Schwenk und breite Bildschirme (im Ausgangsprojekt 240
  Einheiten je Seite), oder ein Verbreiterungsskript.
- Figuren mit festem Drehpunkt (Mitte Unterkante), einheitlicher Größe und definierten
  Trefferflächen (Kopf als Kreis, Körper als Rechteck, Träger).
- Bewegte Teile getrennt liefern (Körper und Flügel, Rad und Wagen), jeweils mit
  Gelenkpunkt.
- Lichtquellen in einer eindeutigen Farbe oder als eigene Ebene, damit sie für
  Nachtstimmungen herausgelöst werden können.
- Varianten (Schnee, Jahreszeit) aus derselben Geometrie, damit sie deckungsgleich
  überblendet werden können.
- Vektorformat (SVG): skalierbar, klein, Farben im Code austauschbar, von Haus aus
  transparent.
- Rasterbilder (Zeichnung, Foto, erzeugtes Bild) werden freigestellt und aufbereitet;
  jedes Stück erhält ein Kontrollbild und eine Herkunftsangabe
  (`texturen-und-sprites.md`).
- Grafiken dimensionsneutral halten: freigestellte Figur mit Drehpunkt und
  Trefferflächen taugt als 2D-Sprite und als Billboard im Raum.

Umgang im Projekt:
- Gelieferte Grafiken liegen unverändert in `assets/<szenario>/`. Was das Spiel lädt,
  wird per Skript in `tools/` daraus abgeleitet (verbreitern, teilen, Bewegtes
  entfernen). Das Skript ist wiederholbar, wenn Grafiken neu geliefert werden.
- Per Skript gezeichnete Grafiken sind reproduzierbar und als Ganzes änderbar (Palette,
  Schraffur). Ihre Dateinamen und Maße sind die Schnittstelle, über die der
  Auftraggeber sie später durch eigene ersetzt.
- Vorhandene Grafiken des Auftraggebers haben Vorrang vor erzeugten.

## 7 Herkunft und Rechte

- Gemälde alter Meister sind gemeinfrei, Fotografien davon bei Bildagenturen häufig
  nicht frei nutzbar. Nur gemeinfreie Digitalisate (Museen mit Open-Access-Regelung)
  oder eigenes Material verwenden.
- Fremde Bausteine nur mit geklärter Lizenz; eine Lizenzangabe im README ohne
  Lizenzdatei vor der Übernahme vom Urheber bestätigen lassen. Urheber- und
  Lizenzhinweis in README und `NOTICE`.
- Markennamen von Produkten, Sendungen und Spielen nicht in Oberfläche, Dateinamen oder
  Grafiken; neutrale Bezeichnungen wählen. Stimmung ja, Originalgrafik nein.
- KI-gestützt entstandene Grafiken: Herkunft und Bearbeitung dokumentieren; die Frage
  der Urheberschaft vor einer kommerziellen Veröffentlichung klären.

## 8 Inhalte und Altersangemessenheit

- Jagd-, Kampf- und Kriegsthemen sind eine Entscheidung des Auftraggebers. Für die
  Weitergabe an Schule oder Therapie die Eignung je Szenario prüfen, Szenarien je Profil
  abschaltbar machen und mindestens ein gewaltfreies Szenario als Standard vorsehen.
- Comicartige Wirkung, kein Blut; „falsch“ ohne Leid.
- Sachliche Stimmigkeit prüfen und Abweichungen vom Auftrag begründen. Beispiel: Als
  Ziele eines Jagdszenarios wurden nur real jagdbare Arten übernommen; ganzjährig
  geschonte Arten und Ziervögel wurden nach Rücksprache ersetzt.
