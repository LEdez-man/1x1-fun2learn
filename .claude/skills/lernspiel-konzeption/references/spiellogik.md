# Spiellogik: Bausteine und Begründungen

Bausteine für den Lernkern, mit den Werten aus dem Ausgangsprojekt (1×1-Spiel) als
erprobtem Startpunkt. Zahlen sind Startwerte zum Abstimmen, keine Normen.

Inhalt: 1 Vorprüfung · 2 Bausteine · 3 Rückmeldung · 4 Etappen und Zwischenrunden ·
5 Messung · 6 Anpassung und Empfehlung · 7 Belohnung und Rahmen · 8 Spielmechanik mit
eigenem Ressourcenhaushalt · 9 Vorschlagsschema · 10 Quellen

## 1 Vorprüfung

1. **Lernphase.** Ein Übungsspiel automatisiert, was verstanden ist; es ersetzt die
   Erarbeitung nicht. Das in der Spezifikation ausdrücklich sagen und, wo möglich, eine
   Brücke zum Verstehen einplanen (im 1×1: Ableitungshilfe nach einem Fehler,
   „6 × 7 = 5 × 7 + 7“).
2. **Fachdidaktik des Gegenstands.** Wie wird der Stoff nach heutigem Stand aufgebaut?
   Daraus ergeben sich Aufgabengruppen und Reihenfolge. Beispiel 1×1: Kernaufgaben
   (1·, 2·, 5·, 10·) und Ableiten statt Reihen aufsagen (Gaidoschik; Padberg & Benz).
   Für andere Gegenstände den Stand des Fachs nachschlagen und Hauptvertreter nennen.
3. **Intrinsische Integration.** Die Lernhandlung soll die Spielhandlung sein (Habgood
   & Ainsworth 2011). Gegenbild: Aufgabe als Eintrittskarte zu einem Spiel ohne Bezug
   („chocolate-covered broccoli“, Bruckman 1999).
4. **Einbettung.** Wer legt Ziele fest, wer sieht den Lernstand (Kind, Eltern,
   Lehrkraft, Therapeutin)?

## 2 Bausteine

| Baustein | Vorschlag | Begründung |
|---|---|---|
| Lerneinheit | kleinste abfragbare Einheit mit stabilem Schlüssel (`"7x8"`); Varianten, die verschieden schwer sind, getrennt führen (7×8 und 8×7) | Statistik und Wiedervorlage hängen am Schlüssel |
| Aufgabentopf | wählbare Mengen: alles, fachliche Kerngruppe, Teilmengen, bekannte Stolpersteine, eigene Fehler, eigene Auswahl, Auswahl durch die Spiellogik | gezieltes Üben statt Gießkanne; Autonomie (Deci & Ryan) |
| Runde | höchstens etwa 10 Einheiten; Ende, wenn jede n-mal im ersten Versuch richtig war (n = 2/3/5, Standard 3) | kurze, abgeschlossene Einheit; Ende ist absehbar |
| Batterie | eine Fragestellung mit mehreren Zielen: 1 richtig, 4 falsch; bei freiem Abruf 3 Aufgaben | Erkennen ist leichter als Abruf, deshalb beide Formate anbieten |
| Spielarten | Erkennen; Treffen und Eingeben mit Zeitfenster; Umkehraufgabe; gemischt | Abrufübung in mehreren Richtungen (Roediger & Karpicke 2006) |
| Auswahl der nächsten Einheit | nie zweimal direkt hintereinander; nach Fehler bevorzugt nach ein bis zwei anderen; weniger oft Gelöstes leicht bevorzugt | Kurzform der Lernkartei (Leitner 1972) |
| Wertung | erster Versuch zählt; späterer richtiger Treffer in derselben Batterie hebt den Fehler nicht auf | sonst wird Durchprobieren belohnt |
| Falsche Antworten | typische Fehler des Fachs (1×1: Nachbarn in der Reihe, Zehnerfehler, ±1/±2, Ziffernvertauschung, Summe statt Produkt); nie das richtige Ergebnis, keine Dubletten | operand errors (Campbell & Graham 1985); Fehler werden aussagekräftig |
| Schwierigkeit | feste Liste bekannter Stolpersteine als eigener Topf | Problemgrößeneffekt (Ashcraft 1992) |
| Wechsel der Darbietung | Ziele erscheinen je Batterie aus anderer Richtung, an anderen Plätzen | verhindert Ortslernen statt Faktenlernen |
| Pausen | kurze Pause vor dem Erscheinen der Ziele (1,25 s) und nach der Batterie (1,15 s) | Aufgabe lesen können; Rückmeldung wirken lassen |

## 3 Rückmeldung

| Ereignis | Bild | Ton |
|---|---|---|
| Richtig | szenariospezifischer Effekt; vollständige Lösung erscheint am Ziel, wächst und vergeht | aufsteigender Klang |
| Falsch | Ziel reagiert harmlos; Markierung am Ziel; richtige Lösung wird gezeigt | kurzer tiefer Ton |
| Keine Antwort | richtige Lösung neutral einblenden | absteigender Ton |
| Neue Aufgabe | Aufgabenfeld erscheint mit Bewegung | Signal |

Regeln:
- Start im selben Bild wie die Handlung (Hattie & Timperley 2007 zur Wirkung
  unmittelbarer, aufgabenbezogener Rückmeldung; bei ADHS zusätzlich Verzögerungsaversion,
  Sonuga-Barke).
- Die richtige Lösung wird bei jedem Ausgang gezeigt, als vollständige Gleichung bzw.
  vollständiges Paar.
- Kein beschämendes Bild, kein Spott. Die Falsch-Rückmeldung darf nicht attraktiver sein
  als die Richtig-Rückmeldung, sonst wird sie absichtlich ausgelöst.
- Töne nie ohne sichtbares Gegenstück.

## 4 Etappen und Zwischenrunden

Zweck: überschaubare Abschnitte, sichtbare Zielnähe (goal-gradient: Hull 1932; Kivetz
et al. 2006), kurze Pause ohne Anforderung.

- Rundenziel `total` = Einheiten × n. Gezählt wird nur im ersten Versuch Gelöstes;
  Fehler lassen den Balken stehen und verlängern die Etappe.
- Etappe = 5 gelöste Aufgaben; `stageCount = ceil(total / 5)`. Bei `total ≤ 5` ohne
  Etappenanzeige. Nach der letzten Etappe folgt die Auswertung, keine Zwischenrunde.
- Anzeige: Balken mit Marken an den Etappengrenzen, „Etappe 2/6“; Banner in der
  Zwischenrunde mit einer Zeile zum Wandel der Szene.
- Der Kern zählt und zeigt an; das Szenario gestaltet den Übergang selbst
  (`intermission(stage, stageCount)` → Dauer, Titel, Detail).

Gestaltungsregeln für den Übergang:
1. 2–4 s, keine Eingabe, keine Wertung.
2. Ein verdeckendes Ereignis (Sturm, Nebel, Rauch, Durchfahrt) überblendet den Wechsel.
3. Danach ist die Szene dauerhaft verändert: Stimmung und mindestens ein neues Detail.
   Ein neuer Ort ist das stärkste Signal für Fortschritt.
4. Der Verlauf ist auf die Etappenzahl skaliert; die letzte Etappe zeigt immer den
   Endzustand.
5. Bei reduzierter Bewegung kürzer und ruhiger.
6. Ziele sind im Übergang nicht im Bild und bleiben in jeder Stimmung lesbar.

Zu beobachten: ob der Übergang als Belohnung oder als Ablenkung wirkt. Ein ruhiger
Modus soll ihn abschwächen können.

## 5 Messung

Je Einheit und Aufgabentyp: richtig, falsch, Summe der Antwortzeiten; dazu die letzten
Runden mit Einzelergebnissen. Für verteiltes Wiederholen und Abzeichen wird zusätzlich
das Datum je Antwort gebraucht. Das Feld von Anfang an vorsehen.

Reaktionszeit sauber halten:
- Beginn, wenn die Ziele starten, also nach Einblendung und einer etwaigen Ansage.
- Ende mit der Handlung (Abschuss, Klick), nicht mit dem Aufprall oder dem Ende einer
  Animation.
- Runden mit und ohne Zusatzreize (Sprache) bleiben so vergleichbar.
- Motorische Schwierigkeit (Zielen, Vorhalten) verfälscht die Zeit als Lernmaß. Deshalb
  abschaltbar halten und bei der Auswertung nur grobe Schwellen verwenden.

## 6 Anpassung und Empfehlung

- **Schwächewert** je Einheit: `1 − Trefferquote`, Zuschlag bei langsamer Antwort
  (+0,15 über 4 s) und bei wenigen Versuchen (+0,1 unter 3); ungesehene Einheiten
  mittlerer Wert (0,35).
- **Auswahl durch die Spiellogik:** die Einheiten mit dem höchsten Schwächewert.
- **Empfehlung nach der Runde:** Quote unter 80 % oder deutlich langsamer als der eigene
  Median (über 1,6 × Median und über 3,5 s). Als „Meine Übungsserie“ speichern und im
  Menü als ein Knopf anbieten.
- **Auswertung:** Gesamtquote, Dauer, Sterne (ab 60/80/95 %), je Einheit ein Balken;
  abgebrochene Runden auswerten, wenn mindestens eine Antwort vorliegt.
- **Lernstand als Raster:** alle Einheiten mit Farbstufe (nicht geübt, unter 50 %, unter
  80 %, ab 80 %), zugleich Auswahlwerkzeug.

Stand der Technik darüber hinaus: verteiltes Wiederholen mit Fälligkeit (Leitner-Fächer
als einfache Form; Cepeda et al. 2006 zur Wirkung verteilten Übens), adaptive
Schwierigkeit über Zielquoten um 80–85 % (Wilson et al. 2019), wissensbasierte Modelle
(Bayesian Knowledge Tracing: Corbett & Anderson 1995). Für kleine Faktenmengen genügt
die Lernkartei; aufwendigere Modelle erst erwägen, wenn Daten über Wochen vorliegen.

## 7 Belohnung und Rahmen

- Token für Üben und Fortschritt, nicht nur für die Quote, sonst werden schwierige
  Aufgaben gemieden. Zeitnahe, verlässliche Einlösung; Wochenziele in Tagesschritte
  zerlegen; kein Abzug von Token (kein Response-Cost im Spiel). Verstärkerpläne sind bei
  ADHS etabliert (Barkley).
- Abzeichen und Diplom an Beherrschung über mehrere Tage binden.
- Wettbewerb nur mit Ausgleich unterschiedlichen Könnens (Vorgaben).
- Äußere Belohnung sparsam einsetzen; sie kann vorhandenes Interesse untergraben
  (Deci, Koestner & Ryan 1999).

## 8 Spielmechanik mit eigenem Ressourcenhaushalt

Wenn ein Szenario Munition, Leben oder Punkte als Spielressource führt (Beispiel aus der
Planung: Schießbahn mit Pfeilvorrat):

- Verlust an Untätigkeit koppeln (das richtige Ziel erreicht unbeantwortet den Spieler),
  nicht an die falsche Antwort.
- Belohnungsstufen wenige und sichtbar (zwei markierte Zonen statt einer stufenlosen
  Kurve); die Stufe wird im Moment der Handlung bestimmt.
- Einstellung „entspannt“ ohne Verlust vorsehen.
- Zusatzziele nach dem Treffer können die vollständige Lösung noch einmal zeigen
  (zweites Lesen als Abruf).
- Die Lernstatistik bleibt davon unberührt; es entsteht kein neues Datenschema.

## 9 Vorschlagsschema

Den ersten Vorschlag an den Auftraggeber in dieser Form vorlegen:

```
Lerneinheit:        <was, Schlüssel, Anzahl>
Kernschleife:       <Stimulus> → <Handlung> → <Rückmeldung> → <Wiedervorlage>
Spielarten:         <Liste mit Stimulus / Ziele tragen / Antwort>
Runde:              <Größe, Endkriterium, Standard>
Falsche Antworten:  <Fehlertypen des Fachs>
Etappen:            <Größe, Anzeige>
Auswertung:         <Kennzahlen, Empfehlung>
Speicherung:        <was je Profil>
Offen:              <nummerierte Entscheidungen mit Vorschlag>
Annahmen:           <was unterstellt, aber nicht bestätigt ist>
```

## 10 Quellen

Angaben vor dem Zitieren in einem Dokument für Dritte prüfen; Auflagen und Jahreszahlen
können abweichen.

**Lernspiele und Spieldesign**
- Habgood, M. P. J. & Ainsworth, S. E. (2011): Motivating children to learn effectively: Exploring the value of intrinsic integration in educational games. *Journal of the Learning Sciences*.
- Plass, J. L., Homer, B. D. & Kinzer, C. K. (2015): Foundations of game-based learning. *Educational Psychologist*.
- Wouters, P. et al. (2013): A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology*.
- Malone, T. W. (1981): Toward a theory of intrinsically motivating instruction. *Cognitive Science*.
- Hunicke, R., LeBlanc, M. & Zubek, R. (2004): MDA: A formal approach to game design and game research.
- Csikszentmihalyi, M. (1990): *Flow*.
- Mislevy, R. J., Steinberg, L. S. & Almond, R. G. (2003): On the structure of educational assessments (Evidence-Centered Design).

**Lernen, Gedächtnis, Rückmeldung**
- Roediger, H. L. & Karpicke, J. D. (2006): Test-enhanced learning. *Psychological Science*.
- Cepeda, N. J. et al. (2006): Distributed practice in verbal recall tasks. *Psychological Bulletin*.
- Leitner, S. (1972): *So lernt man lernen*.
- Hattie, J. & Timperley, H. (2007): The power of feedback. *Review of Educational Research*.
- Sweller, J. (1988 ff.): Cognitive Load Theory. Mayer, R. E. (2009): *Multimedia Learning*. Paivio, A. (1986): Dual Coding.
- Deci, E. L. & Ryan, R. M.: Selbstbestimmungstheorie; Deci, Koestner & Ryan (1999) zur Wirkung äußerer Belohnung.
- Hull, C. L. (1932); Kivetz, R., Urminsky, O. & Zheng, Y. (2006): goal-gradient.
- Wilson, R. C. et al. (2019): The eighty five percent rule for optimal learning. *Nature Communications*.
- Corbett, A. T. & Anderson, J. R. (1995): Knowledge tracing.

**Arithmetik (Beispielgegenstand)**
- Gaidoschik, M. (2014): *Einmaleins verstehen, vernetzen, merken*.
- Padberg, F. & Benz, C.: *Didaktik der Arithmetik*. Krauthausen, G.: *Einführung in die Mathematikdidaktik*.
- Ashcraft, M. H. (1992): Cognitive arithmetic. Campbell, J. I. D. & Graham, D. J. (1985): Mental multiplication skill.
- Dehaene, S. & Cohen, L. (1995): Triple-Code-Modell (verbaler Abruf von Multiplikationsfakten).

**ADHS**
- Barkley, R. A.: *Attention-Deficit Hyperactivity Disorder. A Handbook for Diagnosis and Treatment*.
- Sonuga-Barke, E. J. S. (2002 ff.): Verzögerungsaversion, Dual-Pathway-Modell.

**Motorik und Wahrnehmung**
- Fitts, P. M. (1954); Hick, W. E. (1952).
