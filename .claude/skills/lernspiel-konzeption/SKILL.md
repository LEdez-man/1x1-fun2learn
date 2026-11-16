---
name: lernspiel-konzeption
description: Konzipiert Lernspiele (Serious Games, Game-based Learning, Übungs- und Drill-Spiele) von Grund auf über geführte Entscheidungsfragen mit begründeten Vorschlägen. Deckt ab – Einstieg über Spiellogik oder über Design, Lernlogik und Rückmeldung, Grafik-Engine-Entscheidung (DOM/SVG, Canvas, PixiJS, Phaser, three.js u. a.), Architektur und Erweiterbarkeit, Asset-Spezifikation, Prüfung, Barrierefreiheit und Rechte. Ergebnis ist eine Spezifikation mit Entscheidungsprotokoll und Issue-Backlog. Immer verwenden, wenn ein neues Lernspiel, Übungsspiel, ein Rechen-, Vokabel-, Lese- oder Rechtschreibtrainer, eine spielerische Lern-App oder ein neues Szenario bzw. eine neue Spielmechanik für ein bestehendes Lernspiel geplant, entworfen oder „von Grund auf“ aufgesetzt werden soll, auch wenn nur eine Spielidee genannt wird oder nach der passenden Engine, Architektur oder Erweiterbarkeit gefragt wird. Nicht für reine Fehlerbehebung in einem fertigen Spiel.
---

# Lernspiel-Konzeption

Dieser Skill führt von einer Spielidee zu einer umsetzbaren Spezifikation. Er ist aus der
Entwicklung eines Browser-Lernspiels für das 1×1 entstanden (zwei Szenarien, drei
Versionen, ein Engine-Wechsel). Die dort gewonnenen Regeln stehen in `references/`,
hier steht der Ablauf.

## Haltung

Arbeite aus drei Rollen zugleich: Fachdidaktik des Lerngegenstands, Lernspiel-Design und
Web-Spielearchitektur. Daraus folgt für jede Phase:

- **Vorschlagen statt abfragen.** Jede Frage enthält eine begründete Empfehlung. Der
  Auftraggeber entscheidet, muss aber nichts selbst herleiten.
- **Planen vor Bauen.** Erst Entscheidungen und Spezifikation, dann Code. Der teuerste
  Fehler im Ausgangsprojekt war eine Technikentscheidung ohne geklärten Grafikstil
  (siehe `references/grafik-engine.md`).
- **Stand der Technik und des Fachs nennen**, mit Hauptvertretern und Quellen
  (`references/spiellogik.md`, Abschnitt Quellen). Was nicht geprüft ist, als Annahme
  kennzeichnen.
- **Auf Lücken hinweisen.** Am Ende jeder Phase kurz benennen, was der Auftraggeber
  vermutlich nicht bedacht hat (typische Kandidaten stehen je Phase unten).
- **Sachlicher Ton**, keine Werbesprache, keine Füllsätze.

## Ablauf

| Phase | Inhalt | Referenz |
|---|---|---|
| 0 | Bestand sichten | – |
| 1 | Startfragen: Rahmen und Einstieg (Spiellogik zuerst oder Design zuerst) | `references/entscheidungsfragen.md` |
| 2 | Hauptteil in der gewählten Reihenfolge: Spiellogik ↔ Design | `references/spiellogik.md`, `references/design-und-assets.md` |
| 3 | Grafik-Engine und Technikrahmen | `references/grafik-engine.md` |
| 4 | Architektur und Erweiterbarkeit | `references/erweiterbarkeit.md` |
| 5 | Prüfung, Barrierefreiheit, Rechte | `references/qualitaet-und-tests.md` |
| 6 | Ergebnisdokumente | `assets/` |
| 7 | Übergabe an die Umsetzung | – |

Die Phasen 2 bis 4 hängen voneinander ab: Der Grafikstil bestimmt die Engine, die
Spiellogik bestimmt die Schnittstelle zwischen Kern und Szenario. Deshalb wird die Engine
erst entschieden, wenn Spiellogik **und** Stil mindestens grob feststehen, unabhängig
davon, womit begonnen wurde.

## Wie gefragt wird

- Fragen in Runden von höchstens vier, mit zwei bis vier Antwortmöglichkeiten. Steht ein
  Auswahlwerkzeug zur Verfügung (z. B. `AskUserQuestion`), dieses nutzen; sonst als
  nummerierte Liste im Text.
- Die empfohlene Antwort steht zuerst und trägt den Zusatz „(Empfehlung)“. Die
  Begründung steht in der Beschreibung der Option, in einem Satz.
- Nicht fragen, was aus dem Auftrag, dem Repository oder früheren Antworten hervorgeht.
  Solche Punkte als Annahme in das Entscheidungsprotokoll schreiben und zur Bestätigung
  vorlegen.
- Nach jeder Runde das Entscheidungsprotokoll fortschreiben (Nr., Frage, Entscheidung,
  verworfene Alternative, Begründung). Es wird später Teil der Spezifikation.
- Antwortet der Auftraggeber „weiß nicht“ oder „schlag vor“, die Empfehlung übernehmen
  und als solche im Protokoll markieren.
- Der vollständige Fragenkatalog mit Optionen und Empfehlungen steht in
  `references/entscheidungsfragen.md`. Vor Phase 1 lesen.

## Phase 0: Bestand sichten

Vor der ersten Frage prüfen, was vorliegt: Repository mit `spec.md`, `AGENTS.md`,
Entscheidungsprotokoll, offene Issues; gelieferte Grafiken; frühere Spiele des
Auftraggebers, die als Vorlage dienen sollen. Liegt ein bestehendes Spiel vor und es geht
um ein weiteres Szenario, gelten dessen Spezifikation und Entscheidungen. Dann nur die
Fragen stellen, die das Szenario betreffen (Fragenkatalog, Block S), und Pläne gegen das
Entscheidungsprotokoll prüfen: Ein älterer Plan kann durch eine spätere
Technikentscheidung überholt sein.

## Phase 1: Startfragen

Die erste Runde klärt den Rahmen und den Einstieg. Sie besteht aus genau diesen Fragen
(Wortlaut und Optionen im Fragenkatalog, Block A):

1. **Lerngegenstand und Lernphase**: Was soll gelernt werden, und geht es um Erarbeiten,
   Üben/Automatisieren oder Anwenden? Entfällt, wenn im Auftrag genannt.
2. **Zielgruppe und Nutzungssituation**: Alter, Besonderheiten (z. B. ADHS, LRS,
   motorische Einschränkungen), Ort (zu Hause, Schule, Therapie), Gerät.
3. **Einstieg**:
   - *Spiellogik zuerst* (Empfehlung, wenn Lerngegenstand klar und noch keine Grafiken
     vorliegen): Lernlogik und Kernschleife werden mit Vorschlägen aufgebaut, das
     Design folgt.
   - *Design zuerst* (Empfehlung, wenn eine Bildidee, Stilvorlage oder fertige Grafiken
     vorliegen): Welt, Stil und Asset-Format zuerst, die Spiellogik wird darauf
     abgebildet.
   - *Senkrechter Durchstich*: beides parallel an einem einzigen kleinen Szenario.
   - *Bestehendes Spiel als Vorlage*: Kern übernehmen, nur Abweichungen klären.
4. **Umfang des ersten Stands**: vollständiger Kern mit ein bis zwei ausgearbeiteten
   Szenarien (Empfehlung) oder Prototyp einer einzelnen Mechanik.

Hinweis an den Auftraggeber zu Frage 3: Die Reihenfolge ändert nicht, **was** entschieden
wird, sondern was die übrigen Entscheidungen bindet. „Spiellogik zuerst“ hält den
Lernkern unabhängig von der Kulisse und ist der sicherere Weg zu einem erweiterbaren
Spiel. „Design zuerst“ trifft die Engine-Entscheidung früher und treffsicherer, weil der
Stil feststeht.

## Phase 2: Spiellogik und Design

Beide Teile werden durchlaufen, in der Reihenfolge aus Phase 1.

**Spiellogik** (`references/spiellogik.md` lesen): Zuerst einen vollständigen Vorschlag
vorlegen, dann die Entscheidungen einzeln abholen (Fragenkatalog, Block B). Der Vorschlag
umfasst: Lerneinheit und ihr Schlüssel, Kernschleife, Aufgabenformate, Auswahl und
Wiedervorlage, falsche Antworten, Rückmeldung, Gliederung der Runde, Endkriterium,
Auswertung, Anpassung an den Lernstand, Belohnung. Wichtigste Prüfung: Ist die
Lernhandlung selbst die Spielhandlung (intrinsische Integration), oder wird Lernen nur
mit Spiel belohnt?

**Design** (`references/design-und-assets.md` lesen): Thema und Welt, Stilvorlage,
Perspektive, Art der Ziele, Lesbarkeit der Lerninhalte, Herkunft der Grafiken,
Asset-Format (Fragenkatalog, Block C). Ergebnis ist eine Asset-Spezifikation nach
`assets/asset-spec-vorlage.md`.

Typische Lücken in dieser Phase: Lernphase verwechselt (Automatisieren ohne vorheriges
Verstehen), Zeitdruck als Standard, Bestrafung von Fehlern durch die Spielmechanik,
Reaktionszeit durch Animationen verfälscht, Lerninhalt in der Szene schlecht lesbar,
Altersangemessenheit des Themas, Bildrechte.

## Phase 3: Grafik-Engine

`references/grafik-engine.md` lesen. Die Entscheidung wird aus vier bereits geklärten
Größen abgeleitet: Grafikstil und Perspektive, Herkunft der Grafiken, Zielgeräte,
Betriebsform (statisch ohne Build-Schritt oder mit Werkzeugkette). Dem Auftraggeber eine
Empfehlung mit zwei Alternativen vorlegen, jeweils mit dem Preis der Entscheidung
(Fragenkatalog, Block D). Vor der Festlegung die aktuelle Version und den Pflegestand
der Bibliothek nachschlagen; die Angaben in der Referenz sind ein Stand, kein Dauerwert.

Typische Lücken: 3D gewählt, obwohl keine Modelle vorliegen; zwei Engines nebeneinander
als Dauerzustand; Bundler ohne Bedarf; Leistung nur auf dem Entwicklungsrechner
betrachtet; Prüfbarkeit im Headless-Browser nicht bedacht.

## Phase 4: Architektur und Erweiterbarkeit

`references/erweiterbarkeit.md` lesen. Festlegen (Fragenkatalog, Block E): Trennung von
Lernkern, Spielablauf, Darstellung und Szenario; Szenario-Schnittstelle; Datenformat und
Speicherung des Lernstands samt Migration; Einstellungen; welche Erweiterungen absehbar
sind (weitere Szenarien, Inhalte, Spielarten, Mehrspieler, Sprachausgabe, Touch) und was
sie heute schon an Vorkehrungen brauchen.

Typische Lücken: Zeitstempel je Antwort fehlen, obwohl verteiltes Wiederholen geplant
ist; Einstellungen ohne Platz im Profilformat; szenariospezifische Logik im Spielablauf;
keine Testhaken; kein Ort für Entscheidungen.

## Phase 5: Prüfung, Barrierefreiheit, Rechte

`references/qualitaet-und-tests.md` lesen. Festlegen (Fragenkatalog, Block F): was
automatisiert geprüft wird, Definition of Done, reduzierte Bewegung und ruhiger Modus,
Fotosensibilität, Datenschutz, Lizenzen fremder Bausteine, Marken, Herkunft KI-gestützt
erzeugter Grafiken.

## Phase 6: Ergebnisdokumente

Vor dem Schreiben fragen, in welcher Form die Ergebnisse gewünscht sind: Markdown im
Repository, Word-Dokument, oder beides; zusätzlich, ob der Backlog als GitHub-Issues
angelegt werden soll. Issues erst nach ausdrücklicher Bestätigung anlegen.

| Dokument | Vorlage | Inhalt |
|---|---|---|
| Spezifikation | `assets/spec-vorlage.md` | Ziel, Begriffe, Spiellogik, Szenarien, Architektur, Planung, fachliche Einordnung, Entscheidungsprotokoll, Leitfaden für die Weiterarbeit |
| Asset-Spezifikation | `assets/asset-spec-vorlage.md` | Ebenen, Figuren, Trefferflächen, Palette, Lieferformat |
| Backlog | `assets/issue-vorlage.md` | je Szenario und Erweiterung ein Issue mit Anforderungen (M/S/K) und Abnahmekriterien |
| Einstieg für KI-Werkzeuge | in der Spezifikationsvorlage beschrieben | `AGENTS.md` mit Kurzregeln und Verweis auf die Spezifikation |

Die Spezifikation trennt umgesetzten und geplanten Stand und kennzeichnet Annahmen und
Ungeprüftes ausdrücklich.

## Phase 7: Übergabe an die Umsetzung

Der Skill endet mit der Spezifikation. Wird direkt weitergebaut, gilt: zuerst der
Lernkern ohne Grafik mit Tests, dann ein Szenario als Vorbild, dann die Schnittstelle
anhand eines zweiten Szenarios prüfen. Erst das zweite Szenario zeigt, ob die
Schnittstelle trägt. Reihenfolge und Arbeitsregeln stehen in
`references/erweiterbarkeit.md`, Abschnitt „Arbeitsablauf“.

## Leitplanken

Diese Regeln gelten unabhängig von den Antworten, weil ihre Verletzung im
Ausgangsprojekt jeweils Nacharbeit gekostet hat:

1. Der Lerninhalt muss in jeder Lage vollständig sichtbar und lesbar sein. Verdeckte
   oder abgeschnittene Antworten machen eine Aufgabe unlösbar und werden als
   Spielfehler erlebt. Deshalb konstruktiv ausschließen und automatisiert prüfen, nicht
   von Hand platzieren.
2. Rückmeldung im selben Bild wie die Handlung, in Bild und Ton.
3. Fehler sind Information: richtige Lösung zeigen, Aufgabe bald wieder vorlegen, keine
   Strafe durch die Spielmechanik. Kosten dürfen an Untätigkeit hängen, nicht an der
   falschen Antwort.
4. Geschicklichkeit und Lernleistung trennbar halten (Schalter für Ballistik, Tempo,
   Zeitlimit). Gemessene Reaktionszeit beginnt nach Ansage und Einblendung und endet
   mit der Handlung, nicht mit dem Ende einer Animation.
5. Die Engine folgt dem Grafikstil und dem Weg, auf dem Grafiken entstehen.
6. Lernlogik liegt außerhalb der Szenarien. Ein Szenario stellt dar und meldet Treffer,
   es wertet nicht.
7. Jede Entscheidung mit verworfener Alternative und Begründung festhalten; überholte
   Entscheidungen nicht löschen, sondern als überholt markieren.
8. Ungeprüftes benennen (echte Hardware, Ton, Dateidialoge), statt es stillschweigend
   als erledigt zu führen.
