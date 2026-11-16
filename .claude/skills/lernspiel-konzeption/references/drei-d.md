# 3D und 2,5D: Vorkehrungen

Lesen, sobald 3D oder eine Mischform in Frage kommt, und immer dann, wenn der
Auftraggeber sich beide Wege offenhalten will.

Inhalt: 1 Drei Stufen · 2 Beide Wege offenhalten · 3 Modelle und Texturen ·
4 Kamera und Lesbarkeit · 5 Ziele: immer im Bild, nie verdeckt · 6 Treffer und Geschosse ·
7 Leistung · 8 Einbindung ohne Build · 9 Prüfung · 10 Erfahrungen aus dem Ausgangsprojekt

## 1 Drei Stufen

| Stufe | Bedeutung | Passt, wenn |
|---|---|---|
| **2D** | Ebenen mit Parallaxe, Figuren als Ausschneidebilder | Stil ist flächig; Grafiken entstehen als Ebenen; Tiefe ist Kulisse |
| **2,5D** | räumliche Szene mit Kamera, aber Figuren und Kulissenteile als flache, freigestellte Bilder im Raum (Billboards, Kulissenwände); oder 2D-Szene mit einzelnen 3D-Elementen | Bewegung in die Tiefe gehört zur Mechanik (Ziele rollen auf den Spieler zu), Modelle fehlen, Grafiken entstehen als Bilder |
| **3D** | Modelle mit Material und Licht | Modelle liegen vor oder ihre Herstellung ist geklärt; Drehung, Perspektive oder Physik im Raum tragen das Spiel |

2,5D ist für Lernspiele oft der passende Weg, wenn eine Idee räumlich gedacht ist: Die
Mechanik gewinnt echte Tiefe, die Grafiken bleiben Bilder, und die Herstellung bleibt
beim Arbeitsweg „zeichnen, freistellen, einsetzen“ (`texturen-und-sprites.md`).

## 2 Beide Wege offenhalten

Vorkehrungen, die wenig kosten und einen späteren Wechsel oder ein Nebeneinander tragen:

1. **Lernkern ohne Bezug zur Darstellung.** Inhalte, Runde und Spielablauf kennen weder
   Ebenen noch Kameras (`erweiterbarkeit.md`, Abschnitt 1).
2. **Darstellungsvertrag.** Der Spielablauf spricht mit jeder Engine über dieselben
   wenigen Funktionen: Szenario laden, Schuss oder Zugriff am Bildschirmpunkt auslösen,
   Weltpunkt in Bildschirmpunkt umrechnen, Treffer melden, Bild-Ereignis, Zeitlupe,
   Pause, Schleife von außen takten. Ob dahinter Ebenen oder ein Szenengraph liegen,
   bleibt Sache der Engine.
3. **Ziele über Bildschirmgrößen beschreiben.** Jedes Ziel liefert `screenRect()` und
   `hitTest(...)`. Damit gelten die Regeln „im Bild, nicht verdeckt, lesbar“ und ihre
   Tests für 2D und 3D gleich.
4. **Szenario nennt seine Dimension** in der Registrierung (`dim: '2d' | '3d'`); das
   Menü und der Start laden die passende Engine.
5. **Eine sichtbare Zeichenfläche.** Laufen zwei Engines im selben Spiel, erhält jede
   ihre Leinwand, und nur die aktive ist eingeblendet; nie zwei WebGL-Kontexte
   gleichzeitig in Betrieb.
6. **Grafiken dimensionsneutral liefern.** Freigestellte Figuren mit Drehpunkt und
   Trefferflächen funktionieren als 2D-Sprite und als Billboard im Raum. Texturen in
   Zweierpotenzen schaden in 2D nicht und sind in 3D für Mipmaps günstig.
7. **Einheiten festlegen.** 2D: Szenenraster in Einheiten, Ursprung oben links. 3D:
   Meter, rechtshändig, Y nach oben, Blick entlang −Z (three.js-Konvention); im
   Dokument festhalten, weil Modelle und Physik davon abhängen.
8. **Fester Zeitschritt** für alles, was fliegt oder rollt, in beiden Welten.

Drei Bauformen, zwischen denen der Auftraggeber wählt (Fragenkatalog D2):

| Bauform | Vorteil | Preis |
|---|---|---|
| **Eine Engine je Spiel**, Wechsel später über den Darstellungsvertrag möglich | geringste Pflege | Szenarien der anderen Dimension erst nach Zusatzarbeit |
| **Zwei Engines hinter einem Vertrag**, Szenario wählt | jede Szene im passenden Werkzeug | zwei Bibliotheken laden und aktuell halten, zwei Sätze Tests, zwei Bauanleitungen |
| **Eine 3D-Bibliothek für alles**: 2D-Szenen als texturierte Flächen vor orthografischer Kamera | eine Bibliothek, fließender Übergang zu 2,5D | 2D-Komfort (Tönung je Ebene, Partikel, Filter) selbst bauen |

Empfehlung ohne weitere Vorgaben: eine Engine je Spiel wählen, die Punkte 1–8
einhalten. Zwei Engines erst, wenn ein konkretes Szenario die zweite braucht, und dann
mit Bauanleitung und Tests für beide. Ob sich 2D- und 3D-Bibliothek eine Zeichenfläche
teilen können, hängt von den Versionen ab; vor einer solchen Planung die Dokumentation
beider Bibliotheken prüfen.

## 3 Modelle und Texturen

- **Format**: glTF 2.0, als eine Datei `.glb`. Es ist das Standardformat für die
  Auslieferung im Web; Blender exportiert es direkt.
- **Herkunft klären, bevor 3D entschieden wird**: selbst modelliert, per Skript aus
  Grundkörpern erzeugt, freie Bibliotheken (CC0 bevorzugt, Lizenz je Modell
  nachweisen), beauftragt. Aus Grundkörpern zur Laufzeit zusammengesetzte Figuren
  wirkten im Ausgangsprojekt „klumpig“; das ist als Dauerlösung nur für bewusst
  kantige Stile geeignet.
- **Stil und Material**: Für Kinder-Lernspiele genügen meist unbeleuchtete oder
  comicartig schattierte Materialien mit gemalten Texturen; sie sind billig und passen
  zu gezeichneten 2D-Elementen. Physikalisch basierte Materialien brauchen
  Umgebungslicht und mehr Texturen je Modell.
- **Texturen**: Kantenlängen in Zweierpotenzen, Mipmaps an; gemeinsame Atlanten für
  kleine Teile; Farbtexturen in sRGB kennzeichnen. Größe am schwächsten Gerät
  ausrichten (häufig 1024, selten 2048).
- **Freigestellte Bilder als Texturen** (Billboards, Laub, Zäune): Farbe in die
  durchsichtigen Pixel ausbluten lassen, sonst entstehen Säume in den Mipmaps
  (`texturen-und-sprites.md`); Alpha-Test statt Blending, wo harte Kanten genügen, das
  vermeidet Sortierfehler.
- **Kompression** für größere Bestände: Geometrie (Draco, Meshopt), Texturen (KTX2/
  Basis). Braucht Decoder-Dateien und ein Werkzeug in der Kette (z. B. glTF-Transform);
  erst einsetzen, wenn Ladegröße zum Problem wird.
- **Animation**: Skelettanimation im glTF; für einfache Ziele genügen Bewegungen im
  Code (drehen, kippen, federn).
- **Asset-Spezifikation** um Modellliste ergänzen: Datei, Dreieckszahl, Texturen,
  Maßstab, Ursprung (Drehpunkt), Vorderseite, Trefferkörper.

## 4 Kamera und Lesbarkeit

- Feste Kamera mit kleinem, gedämpftem Schwenk; mäßiges Sichtfeld (etwa 45–60°
  senkrecht). Freie Kamerafahrt nur, wenn die Mechanik sie braucht
  (Bewegungsübelkeit).
- Bildausschnitt hängt vom Seitenverhältnis ab: Bei festem senkrechtem Sichtfeld sieht
  ein breiter Bildschirm mehr, ein schmaler weniger. Die Zielzone daran bemessen, nicht
  am Entwicklungsbildschirm.
- **Lerninhalt im Raum**: Schrift wird mit der Entfernung klein und durch Perspektive
  verzerrt. Wege, in dieser Reihenfolge prüfen:
  1. Beschriftung als DOM-Element über der Zeichenfläche, an den projizierten Punkt des
     Ziels geheftet: immer scharf, feste Mindestgröße, zugänglich.
  2. Schild als Billboard, das sich zur Kamera dreht, mit Mindestgröße am Bildschirm.
  3. Aufdruck auf dem Objekt (Leinwandtextur oder Distanzfeld-Schrift): nur, wenn das
     Objekt der Kamera zugewandt bleibt.
- Mindestschrifthöhe am Bildschirm wie in 2D (etwa 35 px bei 1080p), gemessen am
  fernsten Punkt, an dem das Ziel treffbar ist.

## 5 Ziele: immer im Bild, nie verdeckt

Dieselben Regeln wie in 2D, anders durchgesetzt:

- **Im Bild**: Je Batterie nur Plätze wählen, deren Zielkörper vollständig im
  Sichtkegel der Kamera liegt, einschließlich Schwenk. Das ändert sich mit der
  Fenstergröße und wird deshalb zur Laufzeit geprüft.
- **Nicht verdeckt**: Beim Aufbau der Szene Strahlen von der Kamera zu Prüfpunkten auf
  dem Zielkörper schicken (Kopf, Träger der Antwort, Körperraster) und Plätze
  verwerfen, bei denen der Träger verdeckt ist oder mehr als ein fester Anteil des
  Körpers. Bei bewegter Kamera für die Randstellungen wiederholen.
- **Nicht gegenseitig verdeckt**: Bildschirmrechtecke der Ziele einer Batterie dürfen
  sich nicht überlappen; bei Bewegung auf den Spieler zu getrennte Bahnen.
- **Rückfall**: Reichen die zulässigen Plätze nicht für alle Antworten, lieber weniger
  Ablenker zeigen als ein Ziel außerhalb des Bildes; die richtige Antwort wird zuerst
  platziert.
- Konstruktive Lösungen bevorzugen: feste Bahnen, Bühne ohne Kulisse zwischen Kamera
  und Zielen, Ziele vor der Kulisse.

## 6 Treffer und Geschosse

- Zielstrahl aus dem Bildschirmpunkt (Raycast) für sofortige Treffer.
- Geschosse mit Flugzeit: je Teilschritt Strecke gegen Trefferkörper prüfen (Kugel,
  Quader im Slab-Verfahren), aufgebläht um den Geschossradius. Punktproben überspringen
  bei großem Zeitschritt dünne Körper (Tunneln).
- Trefferkörper einfach und großzügig; sie sind unabhängig von der sichtbaren Geometrie.
- Zielauflösung: Der Spieler zielt auf den Punkt unter dem Fadenkreuz; den
  Abschusswinkel rechnet die Engine. Schalter „Ballistik aus“ entfernt Flugzeit und
  Abfall.
- Physikbibliothek nur, wenn viele Körper frei zusammenstoßen sollen.

## 7 Leistung

- Zielgerät benennen und dort messen. Richtgrößen zum Start: wenige hundert Zeichen-
  aufrufe, Schatten sparsam oder gemalt, Pixelverhältnis begrenzen (höchstens 2).
- Wiederholtes (Gras, Zuschauer, Trümmer) instanzieren.
- Leuchten über selbstleuchtende Materialien und Sprites statt Nachbearbeitung im
  Vollbild.
- Geometrien, Materialien und Texturen beim Verlassen des Szenarios freigeben; die
  Speicherbereinigung gibt Grafikspeicher nicht von selbst frei.

## 8 Einbindung ohne Build

- Bibliothek als ES-Modul lokal ablegen, Import-Map für den Paketnamen **und** für die
  Zusatzmodule (Lader, Hilfen), die ihn als Paketnamen importieren.
- Decoder für komprimierte Formate sind eigene Dateien und brauchen einen Pfad.
- Bei 3D-Bibliotheken ohne stabile Schnittstellenzusage (Versionsschema 0.x) können
  Nebenversionen Brüche enthalten. Version festschreiben und vor jedem Anheben die
  Migrationshinweise lesen (`grafik-engine.md`, Abschnitt Versionsprüfung).

## 9 Prüfung

- Schleife von Hand takten wie in 2D; im Software-Renderer ist 3D besonders langsam
  (im Ausgangsprojekt etwa 1 Bild/s), Laufzeiten einplanen oder die Auflösung im Test
  senken.
- Sichtbarkeit: Bildschirmrechtecke der Ziele abfragen; Verdeckung über einen zweiten
  Zeichendurchgang messen, in dem nur die Ziele sichtbar sind.
- Einheitentests ohne Browser für Ballistik und Streckentests (Streifschuss, Start im
  Körper, großer Zeitschritt), Ergebnis unabhängig von der Bildrate (30 und 144 Hz).
- Auf echter Hardware: Bildrate, Lesbarkeit der Schrift in der Ferne, Schwindel.

## 10 Erfahrungen aus dem Ausgangsprojekt

- Die erste Fassung war 3D mit zur Laufzeit erzeugter Geometrie; sie wurde wegen des
  Stils und des Arbeitswegs des Auftraggebers auf 2D umgestellt. Verloren ging echte
  Raumtiefe des Flugs, ersetzt durch Entfernungsstufen und eine Vordergrundfigur.
- Ein Fehlerbericht zu verdeckten und abgeschnittenen Zielen wurde für die 3D-Fassung
  mit Sichtkegel- und Strahlprüfung beantwortet (Abschnitt 5), für die 2D-Fassung mit
  Zielzone und Alphakanal-Prüfung. Beide Lösungen sind gültig; die 2D-Lösung ist
  vollständig konstruktiv, die 3D-Lösung braucht den Rückfall.
- Ein später geplantes Szenario (Schießbahn mit rollenden Zielen) ist räumlich gedacht.
  Solche Ideen sind der Anlass, 2,5D oder 3D als zweite Dimension vorzusehen, statt sie
  in ein 2D-Schema zu zwingen.
