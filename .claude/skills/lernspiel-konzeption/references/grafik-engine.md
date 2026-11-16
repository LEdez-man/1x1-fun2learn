# Grafik-Engine und Technikrahmen

Inhalt: 1 Lehre aus dem Ausgangsprojekt · 2 Entscheidungsgrößen · 3 Optionen ·
4 Entscheidungsweg · 5 Betriebsform · 6 Begleitentscheidungen · 7 Zusatzbibliotheken ·
8 Was die Darstellungsschicht können muss

## 1 Lehre aus dem Ausgangsprojekt

Version 0.1 des 1×1-Spiels entstand in 3D (three.js) mit zur Laufzeit erzeugter
Geometrie. Der Auftraggeber empfand das Ergebnis als „klumpig“. Sein gewünschter Stil
waren flächige Figuren vor gemalter Kulisse, und sein Arbeitsweg lieferte Grafiken als
Ebenen eines Zeichenprogramms. Version 0.2 stellte ein Szenario auf 2D-Ebenen (PixiJS)
um, Version 0.3 das zweite; three.js und die 3D-Engine wurden entfernt.

Was das gekostet und gebracht hat:
- Zwei Szenarien wurden doppelt gebaut.
- Übergangsweise liefen zwei Engines mit gleicher Schnittstelle nebeneinander. Das war
  als Zwischenschritt tragfähig, weil der Spielablauf nur wenige Engine-Funktionen
  kannte. Als Dauerzustand hätte es doppelte Pflege bedeutet.
- In 2D waren Sichtbarkeit und Verdeckung der Ziele über die Ebenenreihenfolge exakt
  steuerbar; in 3D brauchte dieselbe Aufgabe Strahltests und blieb vom Blickwinkel
  abhängig.
- Im Software-Renderer der Testumgebung lief die 3D-Fassung mit etwa 1 Bild/s, die
  2D-Fassung mit 5–7. Das betrifft Prüfbarkeit, nicht nur Spielgefühl.
- Eine noch für three.js geschriebene Szenario-Planung wurde durch die Entfernung der
  Bibliothek zu einem offenen Widerspruch. Pläne nach jeder Engine-Entscheidung
  gegenprüfen.

Folgerung: **Die Engine folgt dem Grafikstil und dem Weg, auf dem die Grafiken
entstehen.** Beides vor der Wahl klären.

## 2 Entscheidungsgrößen

| Größe | Frage | Wirkung |
|---|---|---|
| Stil und Perspektive | flächig in Ebenen, Pixelgrafik, räumlich, reine Oberfläche? | stärkster Faktor |
| Herkunft der Grafiken | geliefert als Ebenen/SVG, per Skript gezeichnet, 3D-Modelle vorhanden? | ohne Modelle kein 3D |
| Spielmechanik | Treffertest genügt, oder Physik, Kacheln, viele Objekte? | Renderbibliothek oder Framework |
| Zielgeräte | Desktop, Tablet, schwächstes Gerät | WebGL-Last, Texturgrößen |
| Betriebsform | statisch ohne Build oder mit Werkzeugkette | Einbindung, Typen, Bundle |
| Prüfbarkeit | lässt sich die Schleife von Hand takten, sind Zustände abfragbar? | automatisierte Tests |
| Pflege | Wer arbeitet weiter (Mensch, KI-Werkzeug)? Wie verbreitet ist die Bibliothek? | Einarbeitung, Hilfe |

## 3 Optionen

Versionen und Größen vor der Festlegung nachschlagen.

| Option | Geeignet für | Stärken | Preis |
|---|---|---|---|
| **DOM, CSS, SVG** | Karten-, Zuordnungs-, Quiz- und Rasterspiele; Menüs und Auswertung in jedem Fall | keine Bibliothek, zugänglich (Screenreader, Tastatur), Text scharf, einfach zu testen | viele bewegte Elemente und Partikel werden träge; SVG-Filter sind teuer |
| **Canvas 2D ohne Bibliothek** | kleine 2D-Spiele mit wenigen Objekten | keine Abhängigkeit, volle Kontrolle | Szenengraph, Laden, Skalierung, Effekte selbst bauen; keine Grafikbeschleunigung für Füllflächen wie bei WebGL |
| **2D-Renderbibliothek (PixiJS)** | Szenen aus Ebenen mit Parallaxe, viele Sprites, Partikel, Farbstimmungen | schneller WebGL-Renderer, Szenengraph, Tönung, Filter; als ES-Modul ohne Build einbindbar | kein Spielgerüst: Schleife, Eingabe, Treffertest, Geschosse, Zustände selbst (im Ausgangsprojekt ein Modul von etwa 13 kB) |
| **2D-Spiel-Framework (Phaser)** | Plattform-, Kachel-, Physikspiele; viele Spielobjekte, Szenenverwaltung | Szenen, Eingabe, Physik, Tweens, Ton, Kachelkarten fertig | gibt Struktur vor; eigener Lernkern muss sich einfügen; größer |
| **3D-Bibliothek (three.js)** | echte räumliche Bewegung, Ich-Perspektive, vorhandene Modelle | verbreitet, flexibel | Modelle, Licht, Material und Kamera sind eigener Aufwand; Lesbarkeit von Text im Raum; Last auf schwachen Geräten |
| **3D-Engine im Browser (Babylon.js, PlayCanvas)** | größere 3D-Vorhaben | Physik, Editor bzw. Inspektor, Werkzeuge | schwerer; zweite Welt neben einem vorhandenen 2D-Kern |
| **Engine mit Web-Export (Godot, Unity)** | Teams mit Editor-Arbeitsweise, Veröffentlichung auch als App | Editor, Animation, Werkzeuge | Build-Schritt, große Ladegröße, Einbettung in eine Webseite und Tests im Browser umständlicher |

Einordnung zum Stand der Technik: Für 2D-Spiele dieser Art sind gestaffelte Ebenen mit
Parallaxe und Figuren als Ausschneidebilder (Cut-out) das übliche Verfahren;
Vektorgrafik wird einmal gerastert oder als Texturatlas ausgeliefert und über WebGL
gezeichnet. WebGL ist weiterhin der stabile Standard; WebGPU bringt für solche Szenen
keinen Vorteil.

## 4 Entscheidungsweg

1. Gibt es eine Szene, oder genügt eine Oberfläche? Oberfläche → DOM/CSS/SVG.
2. Braucht das Spiel räumliche Geometrie (Bewegung in die Tiefe, frei drehbare Sicht),
   **und** liegen Modelle vor oder ist ihre Beschaffung geklärt? Nur dann 3D.
   Tiefe allein lässt sich in 2D über Ebenen, Maßstabsstufen und eine Vordergrundfigur
   darstellen.
3. 2D: Reicht ein Treffertest, oder braucht es Physik, Kacheln, Kollision vieler
   Objekte? Treffertest → Renderbibliothek mit eigenem schmalem Spielgerüst. Sonst
   Framework.
4. Gegenprobe mit dem schwächsten Zielgerät und mit der Testumgebung.
5. Ergebnis mit verworfener Alternative und Begründung ins Entscheidungsprotokoll.

Empfehlung für den häufigsten Fall (Übungsspiel, flächige Szenen, Grafiken als Ebenen,
statischer Betrieb): PixiJS für die Szene, DOM für Menü, Aufgabenanzeige und
Auswertung, eigenes Engine-Modul für Ebenen, Kamera, Geschosse, Partikel.

Eine einzige Engine anstreben. Zwei nebeneinander nur als befristeter Übergang, mit
gemeinsamer Schnittstelle zum Spielablauf und getrennten Zeichenflächen (nie zwei
WebGL-Kontexte gleichzeitig sichtbar).

## 5 Betriebsform

| | Statisch ohne Build | Mit Bundler |
|---|---|---|
| Einbindung | Bibliothek als Datei im Projekt, Import-Map, ES-Module | Paketverwaltung, Bundler |
| Vorteile | läuft auf jedem statischen Hoster; nichts zu installieren; für KI-Werkzeuge und Gelegenheitsentwickler ohne Hürde | TypeScript, Tree-Shaking, Asset-Pipeline, kleinere Auslieferung |
| Preis | Bibliothek ungeteilt (im Ausgangsprojekt etwa 0,9 MB); keine Typprüfung | Werkzeugkette pflegen; Build vor jedem Test |

Hinweise zur statischen Form: ES-Module laden nicht über `file://`, ein einfacher
lokaler Server ist nötig. Die `sourceMappingURL`-Zeile einer eingebundenen Bibliothek
entfernen oder die Map mitliefern. Keine Netzaufrufe zur Laufzeit. Lizenzdatei der
Bibliothek beilegen.

## 6 Begleitentscheidungen

- **Rastern von Vektorgrafik.** Beim Laden einmal in eine Leinwand rastern, Auflösung
  nach Bildschirmmaßstab (Faktor 1–2). SVG-Filter für Maltextur oder Papierrand werden
  so nur einmal berechnet. Alternative für schwache Geräte: vorab als WebP ausliefern;
  spart Ladezeit, bindet an feste Auflösungen und braucht einen Exportschritt.
- **Szenenraster.** Festes Raster (1280 × 720), unten verankert; auf hohen Bildschirmen
  wird oben verlängert, und zwar mit der obersten Pixelzeile der Grafik, nicht mit
  einer Flächenfarbe (sonst sichtbare Naht).
- **Kamera.** Kleiner, gedämpfter Schwenk (±100 Einheiten). Ebenen müssen breiter sein
  als das Bild: Bildbreite + 2 × Schwenk × Parallaxfaktor, für 21:9 mehr.
- **Stimmungen** (Tageszeit, Jahreszeit) über Farbmultiplikator je Ebenengruppe statt
  eigener Grafiksätze; Lichtquellen als eigene, nicht abgedunkelte Ebene; Ziele weniger
  abdunkeln als die Kulisse.
- **Füllrate.** Engpass ist die überzeichnete Fläche, nicht die Objektzahl.
  Vollbildflächen mit Deckkraft 0 auf unsichtbar schalten.
- **Zeichenreihenfolge.** In PixiJS `sortableChildren` und `zIndex` verwenden; das
  Umsortieren des Kinder-Arrays von Hand wirkt nicht.
- **Zeitschritt.** Bei Ballistik oder Physik fester Simulationsschritt (Fiedler 2004,
  „Fix Your Timestep!“), damit Ergebnisse nicht von der Bildrate abhängen und Tests
  reproduzierbar sind.

## 7 Zusatzbibliotheken

Grundsatz: nur aufnehmen, was eine eigene Lösung von wenigen hundert Zeilen nicht
leistet.

| Bedarf | Empfehlung | Verworfen, weil |
|---|---|---|
| Kollision einfacher Körper | eigene Tests (Strecke gegen Quader, Kugel; Ericson 2005) | Physik-Engines (Rapier, cannon-es, ammo.js) sind für wenige Körper überdimensioniert |
| Ballistik | eigene Integration, geschlossene Zielauflösung | – |
| Hinweistöne | WebAudio, synthetisch, ohne Dateien (Farnell 2010) | Tone.js ist auf Musik ausgelegt; Howler.js lohnt erst bei Samples |
| Sprachausgabe | Web Speech API, lokale Stimmen bevorzugt, Zeitgeber-Ersatz für `onend`; vorab erzeugte Clips als möglicher Ersatz hinter derselben Funktion | Cloud-Dienste: Netz, Kosten, Datenschutz bei Kindern |

## 8 Was die Darstellungsschicht können muss

Die Schnittstelle zum Spielablauf schmal halten. Im Ausgangsprojekt kannte der
Spielablauf von der Engine nur: Schuss auslösen, Koordinaten umrechnen, Treffer melden,
Bild-Ereignis, Zeitlupe, Pause. Dadurch ließ sich die Engine austauschen, ohne den
Lernkern zu berühren.

Mindestumfang eines 2D-Engine-Moduls für Ziel-und-Treffer-Spiele:
- Ebenen mit Parallaxfaktor, Kamera mit begrenztem Schwenk, Skalierung auf den Bildschirm
- zwei Koordinatensysteme: Szenenraster (Ebenen) und Sichtkoordinaten (Geschosse,
  Effekte, Treffertest); Umrechnung in beide Richtungen
- Geschosse mit Flugzeit; Auftreffpunkt in der Ebene des Ziels verankert, damit ein
  nachschwenkendes Bild den Wurf nicht verfehlen lässt
- optionale Ballistik je Schuss durch das Szenario (Flugzeit, Abfall, Radius)
- Partikel und Einblendungen
- Rastern und Zwischenspeichern von Grafiken
- von außen taktbare Schleife und Debug-Zugang für Tests
