# Grafik-Engine und Technikrahmen

Inhalt: 1 Lehre aus dem Ausgangsprojekt · 2 Entscheidungsgrößen · 3 Optionen ·
4 Entscheidungsweg (2D, 2,5D, 3D) · 5 Betriebsform · 6 Begleitentscheidungen ·
7 Zusatzbibliotheken · 8 Was die Darstellungsschicht können muss · 9 Versions- und
Bibliotheksprüfung

Für 3D und Mischformen zusätzlich `drei-d.md` lesen.

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
entstehen.** Beides vor der Wahl klären. Das ist kein Urteil gegen 3D: Die 3D-Fassung
scheiterte an fehlenden Modellen und am Stilwunsch, nicht an der Technik. Der Skill
hält deshalb beide Wege offen (Abschnitt 4 und `drei-d.md`).

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

Versionen, Größen und Pflegestand vor der Festlegung prüfen (Abschnitt 9).

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

## 4 Entscheidungsweg (2D, 2,5D, 3D)

1. Gibt es eine Szene, oder genügt eine Oberfläche? Oberfläche → DOM/CSS/SVG.
2. Dimension je Szenario bestimmen:
   - Tiefe ist nur Kulisse → **2D** (Ebenen, Maßstabsstufen, Vordergrundfigur).
   - Bewegung in die Tiefe gehört zur Mechanik, Grafiken entstehen als Bilder →
     **2,5D** (Raum und Kamera, Figuren als freigestellte Flächen).
   - Drehung, Perspektive oder Physik im Raum tragen das Spiel, **und** Modelle liegen
     vor oder ihre Herstellung ist geklärt → **3D**.
3. Über alle absehbaren Szenarien zusammenzählen: nur eine Dimension → eine Engine.
   Beide → Bauform nach `drei-d.md`, Abschnitt 2, wählen. In jedem Fall die dort
   genannten acht Vorkehrungen einhalten, damit der andere Weg offen bleibt.
4. 2D: Reicht ein Treffertest, oder braucht es Physik, Kacheln, Kollision vieler
   Objekte? Treffertest → Renderbibliothek mit eigenem schmalem Spielgerüst. Sonst
   Framework.
5. Kandidaten mit Abschnitt 9 prüfen (Version, Pflege, Lizenz, Einbindung).
6. Gegenprobe mit dem schwächsten Zielgerät und mit der Testumgebung.
7. Ergebnis mit verworfener Alternative und Begründung ins Entscheidungsprotokoll.

Empfehlung für den häufigsten Fall (Übungsspiel, flächige Szenen, Grafiken als Ebenen,
statischer Betrieb): PixiJS für die Szene, DOM für Menü, Aufgabenanzeige und
Auswertung, eigenes Engine-Modul für Ebenen, Kamera, Geschosse, Partikel.

Empfehlung für räumlich gedachte Mechanik ohne Modelle: 3D-Bibliothek mit
freigestellten Bildern als Billboards (2,5D), Beschriftung als DOM-Element über der
Zeichenfläche.

Zwei Engines nebeneinander sind zulässig, wenn Szenarien beider Dimensionen gewollt
sind; dann als bewusste Entscheidung mit gemeinsamem Darstellungsvertrag, getrennten
Zeichenflächen (nie zwei WebGL-Kontexte gleichzeitig in Betrieb) und Bauanleitung und
Tests für beide. Ungeplant nebeneinander gewachsene Engines sind dagegen ein
Übergangszustand, der aufgelöst werden sollte.

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
| Kollision einfacher Körper | eigene Tests (Strecke gegen Quader, Kugel; Ericson 2005) | Physik-Engines sind für wenige Körper überdimensioniert und machen den Ausgang einer Aufgabe vom Abprallen abhängig |
| Ballistik | eigene Integration, geschlossene Zielauflösung | – |
| Hinweistöne | WebAudio, synthetisch, ohne Dateien (Farnell 2010) | Tone.js ist auf Musik ausgelegt; Howler.js lohnt erst bei Samples |
| Sprachausgabe | Web Speech API, lokale Stimmen bevorzugt, Zeitgeber-Ersatz für `onend`; vorab erzeugte Clips als möglicher Ersatz hinter derselben Funktion | Cloud-Dienste: Netz, Kosten, Datenschutz bei Kindern |

### Physikbibliothek: wann überhaupt

Voreinstellung: **eigene Tests und eigene Integration.** Bei Ziel-und-Treffer-Spielen
steht der Ausgang einer Aufgabe fest und darf nicht davon abhängen, wie ein Körper
abprallt; Trümmer und Konfetti sind Partikel, keine Körper; Tests und die Messung der
Reaktionszeit bleiben mit festem Zeitschritt reproduzierbar.

Eine Physikbibliothek kommt in Frage, wenn viele Körper frei zusammenstoßen, sich
stapeln oder über Gelenke verbunden sind, oder wenn die Physik selbst Lerngegenstand
ist (Waage, Hebel, schiefe Ebene, Wurfbahn). Dann gilt:

- **Kriterien zusätzlich zu Abschnitt 9:** kontinuierliche Kollisionserkennung für
  schnelle Körper (sonst fliegen Geschosse durch dünne Ziele), fester Zeitschritt und
  Determinismus, Pflegestand, Einbindung ohne Build (reines JavaScript oder
  WebAssembly mit Ladeaufwand), Größe.
- **Kandidaten** (Einordnung aus Kenntnis der Projekte, Eigenschaften vor dem Einsatz
  in der Dokumentation prüfen): 2D: Planck (Portierung von Box2D) als erste Wahl,
  Rapier 2D als Alternative. 3D: Rapier. Matter.js und cannon-es nur als Altbestand
  behandeln, solange das Prüfskript sie als nicht mehr gepflegt kennzeichnet; bei
  Matter.js zusätzlich fehlende kontinuierliche Kollisionserkennung beachten.
- Physik als eigene Schicht hinter dem Darstellungsvertrag halten; Szenarien melden
  weiterhin nur Treffer. Der Lernkern erfährt nichts von der Physik.
- Entscheidung mit Begründung ins Protokoll; Version festschreiben (Rapier hat
  Versionsschema 0.x).

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

## 9 Versions- und Bibliotheksprüfung

Bibliotheken für Spiele im Browser ändern sich schnell; Angaben aus dem Gedächtnis
und aus dieser Referenz sind beim Lesen womöglich überholt. Die Prüfung ist deshalb
ein fester Schritt, kein Hinweis.

**Wann**
- vor jeder Engine-Entscheidung (Phase 3)
- vor dem Bau eines neuen Szenarios in einem bestehenden Spiel
- vor jedem Anheben einer eingesetzten Version
- wenn eine Spezifikation älter als etwa sechs Monate ist

**Schritt 1: Stand abrufen.** `scripts/bibliotheken-pruefen.py` fragt die npm-Registry
ab und liefert je Paket neueste Version, Datum, Lizenz, Größe, Abkündigung und den
Abstand zur eingesetzten Version:

```
python3 scripts/bibliotheken-pruefen.py --gruppe 2d 3d
python3 scripts/bibliotheken-pruefen.py --nur-bestand --bestand pixi.js=8.23.0
python3 scripts/bibliotheken-pruefen.py --paket <neuer-kandidat>
```

Ist die Registry nicht erreichbar, den Stand per Websuche oder aus der Dokumentation
ermitteln und das so vermerken.

**Schritt 2: Neue Kandidaten suchen.** Die Standardliste des Skripts ist ein
Ausgangspunkt. Per Websuche prüfen, ob es für den Bedarf inzwischen geeignetere oder
neue Bibliotheken gibt (Suchbegriffe: Bedarf plus „library“, „WebGL“, „WebGPU“,
aktuelles Jahr; Vergleichsübersichten; Veröffentlichungshinweise der Kandidaten).
Gefundene Namen mit `--paket` gegenprüfen.

**Schritt 3: Eignung bewerten.** Je Kandidat, der in die engere Wahl kommt:

| Kriterium | Frage |
|---|---|
| Pflege | letzte Version, Takt der Veröffentlichungen, offene schwere Fehler, Zahl der Betreuenden |
| Schnittstellenzusage | Versionsschema; bei 0.x können Nebenversionen brechen |
| Brüche | Migrationshinweise der letzten Hauptversion gelesen; was ändert sich am eigenen Code |
| Lizenz | MIT, Apache-2.0, BSD u. ä. unkritisch; anderes prüfen; Lizenzdatei beilegen |
| Einbindung | als ES-Modul ohne Build verwendbar? Zusatzmodule und Decoder? ausgelieferte Dateigröße (nicht die Paketgröße) |
| Darstellung | WebGL als stabiler Weg vorhanden; Stand von WebGPU in der Bibliothek und in den Zielbrowsern nachschlagen, nicht voraussetzen |
| Prüfbarkeit | läuft im Headless-Browser mit Software-Renderer; Schleife von außen taktbar |
| Zielgeräte | Touch, Tablets, ältere Browser laut Dokumentation |
| Dokumentation | aktuelle Anleitung für die gewählte Hauptversion; viele Beispiele im Netz gelten für ältere Versionen |
| Verbreitung | genug Beispiele und Antworten, auch für KI-gestützte Weiterarbeit |

**Schritt 4: Festhalten.** In der Spezifikation eine Tabelle „Bibliotheksstand“ führen:
Paket, eingesetzte Version, neueste Version, geprüft am, Entscheidung (bleiben,
anheben, ersetzen) mit Begründung. Das Datum gehört in die Kopfzeile der Spezifikation.

**Regeln für das Anheben**
- Version festschreiben (Dateiname oder Kommentar in der Import-Map), nie „latest“.
- Korrekturversionen nach Lektüre des Änderungsprotokolls; Haupt- und 0.x-Neben-
  versionen als eigenes Vorhaben mit vollständigem Testlauf und Sichtprüfung.
- Sehr neue Hauptversionen einige Wochen beobachten, wenn kein Grund zur Eile besteht.
- Kein Anheben ohne Anlass: Sicherheitskorrektur, benötigte Funktion, Ende der Pflege.
- Nach dem Anheben: Lizenzdatei, Spezifikation, Changelog und `AGENTS.md` nachführen.

**Auch für Werkzeuge**: Testwerkzeug (Playwright), Freistell- und Bildwerkzeuge,
Modellwerkzeuge. Für Werkzeuge der Sitzung (Connectoren, Skills) gilt die Prüfung
sinngemäß: nachsehen, was heute verfügbar ist (`texturen-und-sprites.md`, Abschnitt 1).
