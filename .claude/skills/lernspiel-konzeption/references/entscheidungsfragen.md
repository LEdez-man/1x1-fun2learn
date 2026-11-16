# Fragenkatalog

Fragen je Phase mit Antwortmöglichkeiten. Die erste Option ist jeweils die Empfehlung
für den Normalfall; die Bedingung, unter der eine andere Option besser ist, steht dabei.
Fragen überspringen, deren Antwort schon vorliegt. Je Runde höchstens vier Fragen.

Inhalt: A Start · B Spiellogik · C Design · D Grafik-Engine · E Architektur und
Erweiterbarkeit · F Prüfung, Barrierefreiheit, Rechte · G Ergebnisform · S Neues
Szenario für ein bestehendes Spiel

## A Start (erste Runde, immer)

**A1 Lerngegenstand und Lernphase.** „Was soll gelernt werden, und in welcher Phase?“
- Üben und Automatisieren von bereits Verstandenem (Empfehlung für Faktenwissen: 1×1,
  Vokabeln, Rechtschreibmuster). Kurze Aufgaben, viele Wiederholungen, Messung von
  Richtigkeit und Zeit.
- Erarbeiten und Verstehen. Braucht Darstellungen, Hilfen und Erklärungen; ein
  Reaktionsspiel passt dazu schlecht.
- Anwenden und Übertragen. Braucht Situationen und Entscheidungen statt Einzelabfragen.

Nachfrage, falls offen: Wie groß ist die Menge der Lerneinheiten (z. B. 100 Fakten),
und gibt es eine fachlich begründete Reihenfolge?

**A2 Zielgruppe und Nutzung.** „Für wen und wo?“ Alter bzw. Klassenstufe; Besonderheiten
(ADHS, LRS, Dyskalkulie, Motorik, Sehen, Hören); allein, mit Eltern, in Schule oder
Therapie; Gerät: Desktop mit Maus und Tastatur, Tablet, Smartphone, alle.
Empfehlung: ein Gerät für den ersten Stand festlegen und das andere als Erweiterung
führen. Touch nachzurüsten betrifft Eingabe, Layout und Leistung zugleich.

**A3 Einstieg.** „Womit beginnen wir?“
- Spiellogik zuerst. Empfehlung, wenn der Lerngegenstand klar ist und keine Grafiken
  vorliegen. Der Lernkern wird unabhängig von der Kulisse und trägt mehrere Szenarien.
- Design zuerst. Empfehlung, wenn Stilvorlage, Bildidee oder fertige Grafiken vorliegen.
  Die Engine-Entscheidung wird dadurch früher belastbar.
- Senkrechter Durchstich. Ein kleines Szenario wird in Logik und Bild zugleich
  entworfen. Geeignet, wenn die Mechanik neu ist und erst erprobt werden muss.
- Bestehendes Spiel als Vorlage. Kern übernehmen, nur Abweichungen klären.

**A4 Umfang des ersten Stands.**
- Vollständiger Kern (Menü, Aufgabenlogik, Auswertung, Speicherung) und ein bis zwei
  ausgearbeitete Szenarien; weitere Szenarien als eigene Stände (Empfehlung).
- Prototyp einer Mechanik ohne Speicherung.
- Voller Umfang mit allen Szenarien. Risiko: Fehler im Kern vervielfachen sich.

## B Spiellogik

**B1 Verhältnis von Lernen und Spiel.**
- Lernhandlung ist die Spielhandlung: Die richtige Antwort ist das Ziel der Aktion
  (Empfehlung; intrinsische Integration nach Habgood & Ainsworth 2011).
- Lernen schaltet Spiel frei (Aufgabe lösen, dann spielen). Einfacher zu bauen, aber das
  Spiel konkurriert mit dem Lernen um Aufmerksamkeit.

**B2 Aufgabenformate (Mehrfachauswahl).**
- Erkennen: Stimulus fest, richtige Antwort unter plausiblen falschen wählen.
- Freier Abruf: Antwort eingeben (Tastatur, Ziffernblock, Sprache).
- Umkehraufgabe: aus dem Ergebnis auf den Teil schließen (Division zu Multiplikation,
  Übersetzung in Gegenrichtung).
- Gemischt.
Empfehlung: Erkennen und Umkehraufgabe im ersten Stand, freier Abruf als eigene
Spielart, weil er eine zweite Eingabe und meist ein Zeitfenster braucht.

**B3 Länge und Ende einer Runde.**
- Kleine Aufgabenmenge (etwa 10), Ende, wenn jede Einheit n-mal im ersten Versuch
  richtig war; n einstellbar, Standard niedrig (Empfehlung). Im Ausgangsprojekt wurde
  der Standard von 5 auf 3 gesenkt, weil 50 Treffer je Runde zu lang waren.
- Feste Zeit.
- Feste Aufgabenzahl.

**B4 Auswahl der Aufgaben.**
- Aufgabentöpfe zur Wahl (alles, fachlich definierte Kerngruppe, einzelne Reihen bzw.
  Lektionen, bekannte Stolpersteine, eigene Fehler, eigene Auswahl im Raster) plus
  Auswahl durch die Spiellogik nach Schwächewert (Empfehlung).
- Nur adaptive Auswahl.
- Nur feste Lektionen.

**B5 Falsche Antworten.**
- Aus typischen Fehlern des Fachs abgeleitet (Empfehlung). Macht Raten unergiebig und
  Fehler aussagekräftig.
- Zufällig. Nur als Notlösung.

**B6 Zeitdruck.**
- Kein Zeitlimit für die Antwort, Zeit wird nur gemessen (Empfehlung für den Standard).
- Zeitlimit als eigene Spielart oder Einstellung, abschaltbar.
- Zeitlimit immer. Abzuraten bei jüngeren Kindern und bei ADHS, Wirkung ist individuell.

**B7 Folgen von Fehlern.**
- Richtige Lösung zeigen, Einheit kehrt nach ein bis zwei anderen wieder, Fortschritt
  bleibt stehen (Empfehlung).
- Zusätzlich Lebensverlust oder Game Over. Wenn gewünscht, an Untätigkeit koppeln, nicht
  an die falsche Antwort.

**B8 Gliederung und Fortschritt.**
- Etappen fester Größe (etwa 5 gelöste Aufgaben) mit kurzer Zwischenrunde ohne Aufgabe,
  in der sich das Szenario dauerhaft verändert; Balken mit Etappenmarken (Empfehlung).
- Nur Fortschrittsbalken.
- Level mit steigender Schwierigkeit. Passt zu Erarbeiten und Anwenden besser als zu
  reinem Üben.

**B9 Wiederholung über Tage.**
- Im ersten Stand nur Wiedervorlage innerhalb der Runde, Datenformat aber mit Datum je
  Antwort anlegen (Empfehlung). Lernkartei mit Fälligkeit folgt als Erweiterung.
- Verteiltes Wiederholen von Anfang an.

**B10 Belohnung und Motivation.**
- Sofortige Rückmeldung, Sterne je Runde, sichtbarer Lernstand (Empfehlung, erster Stand).
- Token mit Einlösung durch Eltern, Abzeichen, Diplom, Familienziel (Erweiterung).
  Bewertet werden Üben und Fortschritt, nicht nur die Quote; kein Abzug von Token.

**B11 Mehrere Spieler.** Profile am selben Gerät (Empfehlung, erster Stand); Duell
nacheinander (Erweiterung); gleichzeitig oder online (braucht Server, eigene
Architekturentscheidung).

## C Design

**C1 Thema und Welt.** Offen fragen; drei Vorschläge machen, die zur Kernschleife passen
(was trägt die Antwort, womit wird gewählt, was passiert bei richtig und falsch).
Altersangemessenheit und Einsatzort ansprechen: Für Schule und Therapie mindestens ein
gewaltfreies Szenario vorsehen.

**C2 Stil und Vorlage.**
- Flächige 2D-Grafik in Ebenen, Figuren als Ausschneidebilder (Empfehlung, wenn keine
  3D-Modelle vorliegen).
- Pixelgrafik.
- 3D-Modelle. Nur, wenn Modelle vorhanden sind oder beschafft werden können.
- Reine Oberfläche ohne Szene (Karten, Felder, Text).

Stilvorlage erfragen (Gemälde, Foto, Spiel, Produkt). Ist eine genannte Vorlage nicht
auffindbar, das sagen und den Stil als Annahme kennzeichnen.

**C3 Perspektive.** Feste Sicht mit leichtem Schwenk (Empfehlung); Seitenansicht mit
Scrollen; Draufsicht; Ich-Perspektive in 3D. Schwenk klein halten: Er soll Tiefe zeigen
und nicht zum Suchen zwingen.

**C4 Ziele und Träger der Antwort.** Stehend hinter Deckung; bewegt auf Bahnen; auf
einem Raster oder Band. Wo steht die Antwort (Schild, Aufdruck)? Mindestgröße der
Schrift festlegen.

**C5 Herkunft der Grafiken.**
- Vom Auftraggeber geliefert (haben Vorrang, bleiben unverändert, Ableitungen per Skript).
- Per Skript gezeichnete Vektorgrafik (reproduzierbar, später ersetzbar, kein
  Freistellen nötig).
- Rasterbilder aus Design-Werkzeug, Scan, Foto oder Bildgenerator, die freigestellt
  werden. Für Einzelmotive und Texturen geeignet; für deckungsgleiche transparente
  Ebenen und mehrere stimmige Figuren mit gemeinsamem Drehpunkt braucht es klare
  Vorgaben und Nacharbeit.
- Freie Bibliotheken für Sprites, Texturen, Modelle (Lizenz je Stück nachweisen).
- 3D-Modelle: vorhanden, zu beschaffen oder zu modellieren? Ohne Antwort kein 3D.

**C5a Freistellen und Aufbereiten.** Vorher feststellen, welche Werkzeuge die Sitzung
bietet, und nur diese anbieten.
- Freistellwerkzeug des Design-Connectors, danach Aufbereitung und Kontrollbild per
  Skript (Empfehlung für Fotos und unruhige Hintergründe, wenn der Connector es bietet).
- `scripts/freistellen.py` nach Farbe (Empfehlung für Zeichnungen auf einfarbigem Grund).
- Segmentierung lokal (`rembg`), wenn installierbar.
- Der Auftraggeber stellt selbst frei und liefert PNG mit Transparenz; das Skript
  bereitet auf und prüft.
Dazu klären: Wer nimmt die Kontrollbilder ab? Sollen Sprites zu einem Atlas gepackt
werden (Empfehlung: erst ab einigen Dutzend)?

**C6 Bewegung und Reizdichte.** Lebendige Kulisse mit langsamer Bewegung außerhalb der
Trefferflächen (Empfehlung) oder ruhige Kulisse. Ruhiger Modus und reduzierte Bewegung
von Beginn an vorsehen.

**C7 Ton.** Synthetische Hinweistöne ohne Dateien (Empfehlung); Samples mit
Lizenznachweis; Sprachausgabe als abschaltbare Option, Standard aus.

## D Grafik-Engine und Technikrahmen

**D1 Betriebsform.**
- Statische Web-App ohne Build-Schritt, Bibliotheken lokal eingebunden (Empfehlung für
  kleine Teams und KI-gestützte Weiterarbeit; läuft auf jedem statischen Hoster).
- Web-App mit Bundler und Paketverwaltung. Sinnvoll bei TypeScript, vielen Modulen oder
  Asset-Pipeline.
- Installierbare App oder Engine-Export (Godot, Unity).

**D2 Dimension.** „Wie räumlich ist das Spiel?“ Je Szenario beantworten.
- 2D: Ebenen mit Parallaxe, Figuren als Ausschneidebilder (Empfehlung, wenn Tiefe nur
  Kulisse ist und Grafiken als Ebenen entstehen).
- 2,5D: Raum und Kamera, Figuren und Kulissenteile als freigestellte Bilder
  (Empfehlung, wenn Bewegung in die Tiefe zur Mechanik gehört und keine Modelle
  vorliegen).
- 3D: Modelle mit Material und Licht. Nur, wenn Modelle vorhanden sind oder ihre
  Herstellung geklärt ist.
- Noch offen: beide Wege vorsehen. Dann die acht Vorkehrungen aus `drei-d.md` in die
  Spezifikation aufnehmen und mit der Dimension des ersten Szenarios beginnen.

**D2a Bauform bei 2D und 3D im selben Spiel.**
- Eine Engine je Spiel, Wechsel über den Darstellungsvertrag möglich (Empfehlung,
  solange kein Szenario der anderen Dimension ansteht).
- Zwei Engines hinter einem Vertrag, das Szenario wählt. Wenn beide Dimensionen fest
  geplant sind.
- Eine 3D-Bibliothek für alles, 2D-Szenen als Flächen vor orthografischer Kamera.
  Wenn 2,5D der Schwerpunkt ist.

**D2b Bibliothek.** Empfehlung aus `grafik-engine.md` ableiten und mit zwei
Alternativen vorlegen, nach der Versions- und Bibliotheksprüfung (D5). Kurzform der
Zuordnung:
- Oberfläche ohne Szene → DOM, CSS, SVG.
- 2D-Szene in Ebenen, viele Sprites, Partikel → 2D-Renderbibliothek (PixiJS).
- 2D mit Physik, Kacheln, vielen Spielobjekten und Szenenverwaltung → Spiel-Framework
  (Phaser).
- 2,5D und 3D → 3D-Bibliothek (three.js) oder 3D-Engine (Babylon.js, PlayCanvas).

**D2c Physik.** „Soll sich etwas physikalisch verhalten, was nicht vorab feststeht?“
- Nein: eigene Treffertests und Flugbahnen (Empfehlung für Ziel-und-Treffer-Spiele).
- Ja, wenige Körper oder gezielt berechnete Bahnen: eigene Integration.
- Ja, viele frei stoßende Körper oder Physik als Lerngegenstand: Physikbibliothek
  hinter dem Darstellungsvertrag (2D: Planck oder Rapier, 3D: Rapier; Stand prüfen).

**D3 Zielgeräte und Leistung.** Schwächstes Gerät benennen (Büro-Laptop mit integrierter
Grafik, Mittelklasse-Tablet). Daran wird gemessen.

**D5 Versions- und Bibliotheksprüfung.** Keine Frage an den Auftraggeber, sondern ein
Arbeitsschritt vor D2b, dessen Ergebnis vorgelegt wird: Tabelle „Bibliotheksstand“ aus
`scripts/bibliotheken-pruefen.py` und Websuche (neueste Version, Datum, Lizenz,
Pflege, Auffälligkeiten, neue Kandidaten). Nachfragen nur bei echten Weichen:
- Eine neue Hauptversion ist erst wenige Wochen alt: neueste nehmen oder die
  vorherige, bewährte (Empfehlung bei laufendem Spiel: bewährte)?
- Ein eingesetztes Paket wird nicht mehr gepflegt: ersetzen oder festschreiben?
- Wie oft soll der Stand künftig geprüft werden (Empfehlung: vor jedem neuen Szenario
  und mindestens halbjährlich)?

**D4 Speicherung.** Lokal im Browser mit Export und Import als Datei (Empfehlung für
statische Seiten; kein Konto, keine personenbezogenen Daten auf einem Server); Server
mit Konten (eigene Datenschutz- und Betriebsfragen).

## E Architektur und Erweiterbarkeit

**E1 Absehbare Erweiterungen (Mehrfachauswahl).** Weitere Szenarien; weitere Inhalte
oder Fächer; weitere Spielarten; Mehrspieler; verteiltes Wiederholen; Belohnungssystem;
Touch; Sprachausgabe; weitere Sprachen. Jede gewählte Erweiterung erhält eine Zeile
„Vorkehrung heute“ in der Spezifikation.

**E2 Schnitt zwischen Kern und Szenario.**
- Szenario als eigene Datei mit fester Schnittstelle; Aufgabenlogik, Rundenablauf,
  Auswertung und Rückmeldungsregeln im Kern (Empfehlung).
- Jedes Spiel eigenständig. Nur bei einem einzigen Szenario vertretbar.

**E3 Inhalte als Daten.** Lerneinheiten, Töpfe und Fehlerregeln als Datenmodul mit
schmaler Schnittstelle (Empfehlung, wenn weitere Inhalte denkbar sind) oder fest im Code.

**E4 Einstellungen und Rollen.** Was stellt das Kind ein, was nur Erwachsene? Wo liegen
die Einstellungen (Profil), wie werden alte Profile migriert?

**E5 Dokumentation für die Weiterarbeit.** Spezifikation als verbindliche Quelle,
Entscheidungsprotokoll, Stolpersteine, `AGENTS.md`, Auftragsvorlage für ein neues
Szenario (Empfehlung: alles von Beginn an führen).

## F Prüfung, Barrierefreiheit, Rechte

**F1 Automatisierte Prüfung.** Einheitentests für den Lernkern und Browsertests für
komplette Runde und Sichtbarkeit (Empfehlung); nur Einheitentests; nur manuelle Sichtung.

**F2 Barrierefreiheit.** Reduzierte Bewegung, ruhiger Modus, Fotosensibilität (höchstens
drei Blitze je Sekunde, WCAG 2.3.1), Tastaturbedienung der Menüs, Töne nie ohne
sichtbares Gegenstück. Welche Punkte sind Pflicht im ersten Stand?

**F3 Rechte.** Lizenzen fremder Bausteine geklärt? Markennamen in Oberfläche und
Dateinamen vermeiden? Herkunft KI-gestützt erzeugter Grafiken dokumentieren?
Fotos gemeinfreier Werke sind nicht automatisch frei nutzbar.

**F4 Datenschutz.** Bleiben alle Daten lokal? Sprachausgabe: nur lokale Stimmen oder
Hinweis bei Netzstimmen.

## G Ergebnisform

**G1** Markdown im Repository, Word-Dokument oder beides?
**G2** Backlog als GitHub-Issues anlegen (nach Bestätigung) oder nur als Liste?
**G3** Soll im Anschluss ein Prototyp des Lernkerns gebaut werden?

## S Neues Szenario für ein bestehendes Spiel

Vorher Spezifikation, Entscheidungsprotokoll und offene Issues lesen.

**S1 Kernschleife im Szenario.** Was trägt die Antwort, womit wird gewählt, was
geschieht bei richtig, falsch und durchgelassen?
**S2 Abweichungen vom Kern.** Braucht das Szenario etwas, das der Kern nicht kann
(andere Eingabe, eigene Lebensanzeige, mehr Antworten je Aufgabe, Physik)? Jede
Abweichung als optionale Erweiterung der Schnittstelle planen, bestehende Szenarien
bleiben unverändert.
**S3 Grafiken.** Liegen Grafiken vor, in welchem Format? Was muss freigestellt werden
(C5a)? Sonst Asset-Spezifikation mit Stückliste erstellen.
**S3a Dimension und Bibliotheksstand.** Passt das Szenario zur vorhandenen Dimension
(D2)? Wenn nicht: Bauform nach D2a entscheiden, bevor geplant wird. Eingesetzte
Bibliotheken mit `scripts/bibliotheken-pruefen.py --nur-bestand --bestand …` prüfen.
**S4 Zwischenrunde.** Verdeckendes Ereignis, Verlauf der Stimmung über die Etappen,
neues Detail je Etappe.
**S5 Gemeinsame Bausteine.** Teilt das Szenario Bauteile mit einem anderen geplanten
Szenario? Dann gemeinsames Modul vorsehen.
**S6 Offene Entscheidungen des Auftraggebers** als nummerierte Liste (E-1, E-2, …) mit
Vorschlag; Antworten im Entscheidungsprotokoll des Szenarios festhalten.
