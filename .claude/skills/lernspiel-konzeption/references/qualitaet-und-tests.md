# Prüfung, Barrierefreiheit, Stolpersteine

Inhalt: 1 Prüfebenen · 2 Browsertests in Umgebungen ohne Grafikhardware · 3 Definition
of Done für ein Szenario · 4 Barrierefreiheit und Reizsteuerung · 5 Datenschutz ·
6 Stolpersteine

## 1 Prüfebenen

| Ebene | Gegenstand | Mittel |
|---|---|---|
| Einheitentests | Inhalte: Töpfe, falsche Antworten enthalten nie die richtige und keine Dubletten; Runde: Endkriterium, Wiedervorlage, Etappenzählung, Empfehlung; Speicherung: Export, Import, defekte Dateien, Migration | Testläufer der Laufzeit, ohne Browser |
| Physik und Geometrie | Ballistik, Treffertests (Streifschuss, Start im Körper, großer Zeitschritt) | Einheitentests mit festem Zeitschritt |
| Durchlauf | Menü → komplette Runde → Auswertung, je Szenario und Spielart; Zwischenrunden an den richtigen Stellen; ein absichtlicher Fehler | Browserautomatisierung (Playwright) |
| Sichtbarkeit | Ziele vollständig im Bild, Trefferflächen überlappungsfrei, nichts verdeckt; bei Schwenk links, Mitte, rechts; in mehreren Seitenverhältnissen (16:9, 4:3, 21:9, kleine Laptops) | Abfrage der Rechtecke und Pixelvergleich |
| Grafiken | freigestellte Sprites und Texturen: kein Saum auf hellem und dunklem Grund, nichts abgeschnitten, einheitliche Standlinie | Kontrollbilder aus `scripts/freistellen.py`, vom Auftraggeber abgenommen |
| Bibliotheksstand | eingesetzte gegen neueste Versionen, Abkündigungen, Lizenzen | `scripts/bibliotheken-pruefen.py`, vor jedem neuen Szenario und halbjährlich |
| Sichtprüfung | alle Stimmungen und der Übergang als Bildschirmfotos | Galerie-Skript, von einem Menschen gesichtet |
| Echte Geräte | Bildrate, Spielgefühl, Ton, Dateidialoge, Lesbarkeit auf verschiedenen Bildschirmen | von Hand; in der Spezifikation als ungeprüft führen, bis erledigt |

Die Tests gehören ins Repository. Skripte, die nur in einer Sitzung existierten, sind
beim nächsten Mal verloren.

## 2 Browsertests in Umgebungen ohne Grafikhardware

- **Software-Renderer** erreicht nur wenige Bilder je Sekunde. Die Echtzeitschleife im
  Test anhalten und die Engine von Hand takten (fester Schritt, z. B. 0,02 s); erst vor
  dem Bildschirmfoto zeichnen.
- **Kein lokaler Server nötig**: Projektdateien per Request-Interception unter einer
  Testadresse ausliefern.
- **Bildschirmfotos** mit abgeschalteten Animationen, sonst wartet das Werkzeug auf ein
  stabiles Bild.
- **Verdeckung direkt messen**: Bild der Ziele allein gegen Bild der ganzen Szene, mit
  und ohne die vorderen Ebenen. Halbtransparente Kanten erzeugen sonst Scheinbefunde;
  die Schwelle anzuheben wäre die falsche Antwort.
- **Viele Durchgänge**: Seltene Überdeckungen zeigen sich erst nach Dutzenden Batterien
  und manchmal nur in einer Bildschirmgröße.
- Konsolenfehler und Seitenfehler im Test sammeln und als Fehlschlag werten.
- Laufzeiten nennen (Minuten je Skript), damit sie niemand für hängend hält.

## 3 Definition of Done für ein Szenario

- [ ] Spielbar in allen Spielarten, einschließlich Zeitlupe und Eingabe bei freiem Abruf.
- [ ] Ziele immer im Bild und nie verdeckt, automatisiert geprüft in mindestens 16:9, 4:3 und 21:9 (2D und 3D über die Bildschirmrechtecke der Ziele).
- [ ] Lerninhalt am fernsten treffbaren Punkt in Mindestgröße lesbar.
- [ ] Grafiken mit Kontrollbild abgenommen, Herkunft dokumentiert.
- [ ] Bibliotheksstand geprüft und in der Spezifikation datiert.
- [ ] Rückmeldung für richtig und falsch szenariospezifisch, im selben Bild wie der Treffer, mit Ton.
- [ ] Etappen mit Zwischenrunde nach den Gestaltungsregeln.
- [ ] Schalter, die Geschick abschalten, werden beachtet.
- [ ] Erzeugte Bewegung im Hintergrund, nicht vor den Trefferflächen.
- [ ] Reduzierte Bewegung berücksichtigt.
- [ ] Keine Fehler in der Konsole; Ressourcen werden freigegeben.
- [ ] Spezifikation, Entscheidungsprotokoll, Changelog, README, Bildschirmfotos aktualisiert.
- [ ] Ungeprüftes ausdrücklich benannt.

## 4 Barrierefreiheit und Reizsteuerung

- `prefers-reduced-motion` beachten: weniger Teilchen, kürzere Übergänge, kein Wackeln.
- Ruhiger Modus als Einstellung: weniger gleichzeitige Ziele, keine Ablenker in der
  Kulisse, gedämpfte Effekte.
- Fotosensibilität: höchstens drei Blitze je Sekunde (WCAG 2.3.1).
- Zeitdruck dosierbar: Zeitlimit abschaltbar, Spielende ohne Game Over wählbar.
- Pausenhinweis nach einstellbarer Spielzeit.
- Töne getrennt regelbar; Hinweistöne nie ohne sichtbares Gegenstück.
- Menüs mit Tastatur bedienbar, Schalter beschriftet (`aria-label`).
- Die Wirkung von Reizen und Zeitdruck ist individuell. Erprobung mit dem Kind
  einplanen und beobachten, statt eine Wirkung vorauszusetzen. Das gilt auch für
  Zusatzreize wie Sprachausgabe: bei manchen Kindern stützend (doppelte Kodierung,
  Modalitätsprinzip), bei anderen ablenkend; deshalb abschaltbar und Standard aus.

## 5 Datenschutz

- Lernstand bleibt lokal; Export nur durch den Nutzer.
- Sprachausgabe des Browsers: lokale Stimmen bevorzugen; manche Stimmen senden Text an
  einen Server, dann Hinweis im Menü.
- Keine externen Netzaufrufe zur Laufzeit (Schriften, Bibliotheken, Analyse).
- Bei Server und Konten: eigene Prüfung nach DSGVO, bei Kindern mit Einwilligung der
  Sorgeberechtigten.

## 6 Stolpersteine

| Problem | Ursache | Regel |
|---|---|---|
| Antworten außerhalb des Bildes oder hinter Kulisse | handplatzierte Standorte, Bildausschnitt hängt vom Seitenverhältnis ab | Zielzone und automatische Verdeckungsprüfung; Test in mehreren Formaten |
| Ziele fanden keinen Platz | Abfrage der Verdeckungskarte außerhalb ihrer Grenzen lieferte „durchsichtig“ | Koordinaten am Kartenrand begrenzen |
| Hinteres Ziel teilweise vom vorderen überdeckt, nur in einer Bildschirmgröße | Mindestabstand zu knapp | Abstand plus Parallaxversatz; Pixeltest mit vielen Batterien |
| Wurf verfehlt nach schneller Mausbewegung | Kamera schwenkt nach, Zielpunkt stand in Sichtkoordinaten | Zielpunkt an der Ebene des Ziels verankern |
| Sichtbare Naht am oberen Bildrand auf 4:3 | Verlängerung mit einer Flächenfarbe, Grafik hat einen Verlauf | oberste Pixelzeile strecken |
| Niedrige Bildrate | Vollbildflächen mit Deckkraft 0 wurden gezeichnet | unsichtbar schalten; Füllrate ist der Engpass |
| Lichter leuchten nach Grafikwechsel nicht mehr | Lichtebene wird über eine feste Farbe aus der Grafik gewonnen | Farbe als Schnittstelle dokumentieren oder Licht als eigene Ebene liefern |
| Zeichenreihenfolge wirkt nicht | Array von Hand sortiert | Sortierfunktion der Bibliothek verwenden |
| Lichtschein überstrahlt das Bild | additiver Effekt zu groß | klein halten, am Bildschirmfoto prüfen |
| Tests hängen, Fotos laufen in Zeitüberschreitung | Software-Renderer, Warten auf stabiles Bild | von Hand takten, Animationen im Foto abschalten |
| Pixelvergleich meldet Verdeckung, wo keine ist | halbtransparente Kanten | Differenz mit und ohne Vordergrund messen |
| Runde zu lang | Endkriterium zu streng als Standard | Standard niedrig, Wert einstellbar |
| Doppelte Bewegung | Rauch, Vögel, Läufer in die Ebene gemalt und zusätzlich animiert | Bewegtes aus den Ebenen entfernen |
| Plan passt nicht mehr zur Technik | Engine wurde gewechselt, Planung und offene Pull Requests blieben auf altem Stand | nach jeder Technikentscheidung Pläne, Issues und Pull Requests durchsehen |
| Heller oder dunkler Saum an Figuren, besonders verkleinert oder in 3D | durchsichtige Pixel tragen die alte Hintergrundfarbe | Kante einziehen, Farbe ausbluten; Kontrollbild auf beiden Gründen |
| Schrift am Ziel in 3D unleserlich | Aufdruck schrumpft und verzerrt mit der Entfernung | Beschriftung als DOM-Element oder Billboard mit Mindestgröße |
| Beispiel aus dem Netz läuft nicht | gilt für eine ältere Hauptversion der Bibliothek | Version prüfen, Dokumentation der eingesetzten Hauptversion verwenden |
| Nach Anheben einer 0.x-Version brechen Zusatzmodule | Nebenversionen ohne Schnittstellenzusage | Version festschreiben, Migrationshinweise lesen, vollständiger Testlauf |
| Freistellwerkzeug angekündigt, in der Sitzung nicht vorhanden | Connector verbunden, aber Werkzeug nicht geladen | zu Beginn feststellen und Rückfallweg nennen |
| Stilvorlage nicht auffindbar | Produktname ohne Bild oder Link | Stil als Annahme kennzeichnen, Bild erbitten |
| Fremder Baustein ohne Lizenzdatei | Lizenz nur im README genannt | vor Übernahme bestätigen lassen |
