# 1×1 Fun2Learn – Spezifikation

| | |
|---|---|
| **Version** | 0.3.0 (Truthahn-Skeet als 2D-Jagdreise mit Etappen und Ballistik; three.js entfällt) |
| **Datum** | 2026-11-16 |
| **Status** | Kern + 2 Szenarien umgesetzt, beide als 2D-Mehrebenen-Szene mit Etappen und Zwischenrunden (5.6). 5 Szenarien und Erweiterungen spezifiziert (Abschnitt 9 und GitHub-Issues), Bau nach Abschnitt 7.4. |
| **Technik** | Statische Web-App, ES-Module, kein Build-Schritt. Alle Szenarien: PixiJS 8.23 (WebGL), lokal in `vendor/`. |

Dieses Dokument ist die verbindliche Beschreibung des Spiels für Menschen und für
Werkzeuge (z. B. KI-Assistenten), die daran weiterarbeiten. Abschnitte 1–8 beschreiben
den **umgesetzten** Stand, Abschnitt 9 den **geplanten**, Abschnitt 10 die fachliche
Einordnung.

> **Für KI-gestützte Weiterarbeit:** Zuerst Abschnitt 12 (Leitfaden mit Arbeitsablauf,
> Konventionen und Vorlage für einen Auftrag) und Abschnitt 11 (Entscheidungen, Abwägungen
> und Stolpersteine) lesen. Für ein neues Szenario sind außerdem 5.6 und 7.4 verbindlich.
> Die Kurzfassung für Agenten steht in `AGENTS.md`.

---

## 1 Ziel und Zielgruppe

Browser-Lernspiel zur **Automatisierung des kleinen und großen 1×1** für Grundschulkinder,
ausdrücklich auch für Kinder mit ADHS. Das Rechnen ist in kurze Geschicklichkeitsszenen
(2D-Mehrebenen-Szenen) eingebettet: Ziele tragen Ergebnisse oder Aufgaben, das richtige Ziel wird getroffen.

Leitlinien:

- **Sofortige Rückmeldung** auf jede Handlung: Ton und Bild gleichzeitig, ohne Verzögerung.
- **Kurze, abgeschlossene Einheiten** mit sichtbarem Fortschritt (Balken mit Etappenmarken, Sterne).
- **Fehler sind Information, keine Strafe**: Nach jedem Fehlversuch wird die richtige Gleichung gezeigt; die Aufgabe kehrt bald wieder.
- **Gezieltes Üben** statt Gießkanne: Das Spiel merkt sich, was unsicher ist, und schlägt eine Übungsserie vor.

## 2 Vorgehen und Entscheidungen

Die Anforderungen wurden im Dialog erhoben. Offene Punkte wurden per Rückfrage geklärt:

| Frage | Entscheidung |
|---|---|
| Umfang des ersten Releases | Vollständiger Kern (Menü, Aufgabenlogik, Lernraster, Auswertung, alle 4 Spielarten) + 2 ausgearbeitete Szenarien (Truthahn-Skeet, Schneeballschlacht). Übrige Szenarien als eigene Releases. |
| Gerät | Desktop/Laptop mit Maus und Tastatur. Touch ist nicht Teil von v0.1. |
| Großes 1×1 | Reihen 11–20 mal 1–10 (schulübliche Definition). |
| Rundenlänge | Einstellbar 2×/3×/5× richtig je Aufgabe, Standard 3×. (Ursprünglich 5× – das ergäbe mindestens 50 Treffer pro Runde und ist für die Zielgruppe als Standard zu lang.) |

Nachträgliche Vorgaben während der Umsetzung:

- Schneelandschaft in Stil und Farbstimmung der Winterlandschaften von **Pieter Brueghel d. J.** („Winterlandschaft mit Vogelfalle“): fahl-gelblicher Himmel, zugefrorener Flusslauf mit Schlittschuhläufern, Backsteinhäuser, kahle Bäume mit Krähen, Vogelfalle, erhöhter Betrachterstandpunkt.
- Truthahn-Szenario nach Fotovorlagen aus dem Rocky-Mountain-Nationalpark; **die Kulisse wechselt mit jeder Runde** (Herbst, Sommer, Winter, Vorfrühling).
- Flinte im Stil klassischer Jagdsimulatoren aus der Ich-Perspektive (schwarze Läufe, rotbrauner Holzschaft, silberner Systemkasten).
- Alle noch ausstehenden Szenarien und Logik-Erweiterungen werden zusätzlich als GitHub-Issues geführt.

Vorgaben zu Version 0.2 (Schneeballschlacht):

| Vorgabe | Umsetzung |
|---|---|
| 2D-Mehrebenen-Spiel mit PixiJS statt 3D-Modell | Das Szenario wurde neu aufgebaut (`js/engine2d.js`, `js/scenarios/snow.js`). Begründung: Die Szene braucht keine räumliche Geometrie, sondern gestaffelte Bildebenen mit Parallaxe; dafür ist eine 2D-Rendering-Bibliothek einfacher und schneller. Das frühere three.js-Szenario ist entfallen (Git-Historie). |
| Eigene Grafiken (`Schneeball-Bruegel.zip`) | Liegen unverändert in `assets/schneeball-bruegel/` (Ebenen, Kinderfiguren, Sprites, Asset-Spezifikation). Das Spiel lädt daraus abgeleitete, verbreiterte Ebenen (7.2). |
| Mehr Leben: Rauch, Schnee, Vögel | Kaminrauch, Schneefall in drei Tiefen und vorbeiziehende Vogelschwärme werden zur Laufzeit erzeugt; zusätzlich laufen die Eisläufer. |
| Ränder erweitern, leichter Kameraschwenk mit der Maus | Ebenen von 1280 auf 1760 Einheiten verbreitert; Schwenk bis ±100 Einheiten. |
| Figuren immer im Bild, nie verdeckt | Zielzone und Verdeckungsprüfung, siehe 7.4.3. Behebt Issue 14. |
| Zwischenrunde nach je 5 Aufgaben, Etappen im Fortschrittsbalken | Abschnitt 5.6. |

Vorgaben zu Version 0.3 (Truthahn-Skeet):

| Vorgabe | Umsetzung |
|---|---|
| Etappen auf das Truthahn-Szenario übertragen | Jagdreise: Jede Etappe wechselt Jahreszeit oder Revier (7.1). |
| Ballistik als an- und abschaltbare Option | Menüpunkt „Ballistik (Flugzeit, Vorhalten)“ an/aus, ersetzt „Vorhalten nötig“ (7.1, 7.4.5). |
| Grafik weg vom „klumpigen“ 3D, hin zum Stil von Projektor-Jagdspielen; Schattierung und Schraffur für Raumtiefe | Umstieg auf 2D-Mehrebenen-Grafik (Entscheidung E17). Grafiken per Skript gezeichnet: flächige Formen mit Kontur, Schattenseiten abgedunkelt und schraffiert, Dunst in der Ferne. Das genannte Produkt „Hunter Raid Projector Game Set“ war nicht auffindbar; der Stil ist eine Annahme. |
| Mögliche Reviere: Rocky Mountains durch die Jahreszeiten, Schwarzwald mit Auerhahn, Uckermark mit Goldfasan | Alle drei Reviere umgesetzt. Abweichend fliegen im Schwarzwald Ringeltauben und in der Uckermark Jagdfasane: Das Auerhuhn ist in Deutschland vom Aussterben bedroht und ganzjährig geschont, der Goldfasan ist ein Ziervogel (vom Auftraggeber bestätigter Vorschlag). |

Einschränkung: Das im Auftrag erwähnte frühere Drohnenabwehrspiel lag in dieser
Arbeitsumgebung nicht vor. Die Grafik wurde deshalb eigenständig aufgebaut;
eine Angleichung an jenes Projekt ist möglich, sobald dessen Code zugänglich ist.

## 3 Begriffe

| Begriff | Bedeutung |
|---|---|
| **Aufgabe / Fakt** | Faktorenpaar `a × b`, Schlüssel `"axb"` (z. B. `"7x8"`). `7x8` und `8x7` sind getrennte Fakten. |
| **Zahlenraum** | `small` = 1–10 × 1–10 (100 Fakten), `big` = 11–20 × 1–10 (100 Fakten). |
| **Königsaufgaben** | Reihen mit 1, 2, 5 und 10. Schnell lernbar und Stützpunkte für Ableitungen (z. B. 6×7 = 5×7 + 7). |
| **Batterie** | Eine Gruppe von Zielen zu einer Fragestellung. |
| **Runde** | Bis zu 10 Aufgaben; endet, wenn jede Aufgabe `need`-mal im ersten Versuch richtig war. |
| **Szenario** | Kulisse samt Zielobjekten (Vögel, Kinder, …) als 2D-Mehrebenen-Szene. |
| **Revier / Station** | Truthahn-Skeet: Landschaft (Rocky Mountains, Schwarzwald, Uckermark) bzw. Revier samt Jahreszeit; je Etappe eine Station (7.1). |
| **Ballistik** | Einstellung: Geschosse haben Flugzeit und Abfall, auf bewegte Ziele muss vorgehalten werden (7.4.5). |
| **Etappe** | Abschnitt einer Runde: 5 richtig gelöste Aufgaben (die letzte Etappe kann kürzer sein). |
| **Zwischenrunde** | Kurzer Übergang nach einer Etappe ohne Aufgabe: Das Szenario verändert sich sichtbar (5.6). |
| **Ebene** | Bildschicht einer 2D-Szene mit eigenem Parallaxfaktor (7.4). |
| **Zielzone** | Bereich, in dem Ziele stehen dürfen, damit sie bei jedem Kameraschwenk im Bild bleiben (7.4.3). |
| **Spielart** | Art der Fragestellung (siehe 5.2). |

## 4 Hauptmenü

Fünf nummerierte Schritte, alle Auswahlen werden pro Spieler gespeichert:

1. **Zahlenraum**: Kleines 1×1 / Großes 1×1.
2. **Welche Aufgaben?** (Aufgabentopf)

   | Auswahl | Inhalt |
   |---|---|
   | Durcheinander | alle Aufgaben des Zahlenraums |
   | Königsaufgaben | 1er-, 2er-, 5er-, 10er-Reihe |
   | Übrige Reihen | alles außer Königsaufgaben |
   | Einzelne Reihen | frei wählbare Reihen (Chips) |
   | Schwierige Aufgaben | feste Liste bekannter Stolpersteine (6×6 … 9×9, 3×7 … 4×9; groß: 13/14/16–19 × 6–9) |
   | Meine Fehler | bis zu 10 Aufgaben mit den schlechtesten Quoten des Spielers |
   | Lernraster | eigene Auswahl im Raster (siehe 4.1) |
   | Trainer-Auswahl | Zusammenstellung durch die Spiellogik (siehe 5.5) |

3. **Spielart**: Ergebnis treffen / Treffen & tippen / Geteilt-Aufgaben / Alles gemischt.
4. **Szenario**: spielbare und geplante Szenarien (geplante sind ausgegraut).
5. **Einstellungen**: Wiederholungen (2×/3×/5×), Tempo (gemütlich/normal/flott), Ballistik (an/aus; im Profil weiterhin als `lead` gespeichert), Zeit zum Tippen (3/5/8 s).

Zusätzlich: Spielerauswahl, neuer Spieler, Lernstand, Profil sichern/laden (JSON), Ton an/aus.
Liegt eine Empfehlung aus der letzten Runde vor, erscheint oben der Button
**„⭐ Meine Übungsserie spielen“**.

### 4.1 Lernraster

Tabelle aller 100 Fakten des gewählten Zahlenraums. Jede Zelle zeigt Ergebnis und Aufgabe,
die Farbe den Lernstand (grau = nicht geübt, rot < 50 %, orange < 80 %, grün ≥ 80 % richtig).
Klick auf eine Zelle wählt die Aufgabe, Klick auf eine Randzahl die ganze Reihe/Spalte.
Schaltflächen: „Schwierige markieren“, „Meine Fehler markieren“, „Auswahl leeren“.
Die Auswahl ist der Aufgabentopf „Lernraster“.

## 5 Spiellogik

### 5.1 Ablauf einer Runde

1. Aus dem Aufgabentopf werden höchstens **10 Aufgaben** gezogen; bei größerem Topf bevorzugt unsichere (Schwächewert + Zufall).
2. Je Batterie: Tonsignal und Einblendung der Aufgabe unten mittig → 1,25 s Pause → Ziele erscheinen, **jedes Mal aus anderer Richtung**.
3. Treffer wird sofort ausgewertet (5.3). Nach der Batterie 1,15 s Pause, dann die nächste.
4. Nach jeder vollendeten Etappe (5 richtig gelöste Aufgaben) folgt eine Zwischenrunde (5.6), sofern das Szenario sie anbietet.
5. Ende, wenn jede Aufgabe `need`-mal richtig war → Auswertung (Abschnitt 6).

Auswahl der nächsten Aufgabe (`Session.next`): nie dieselbe Aufgabe zweimal direkt
hintereinander; falsch beantwortete Aufgaben kommen nach ein bis zwei anderen bevorzugt
wieder (Kurzform des Leitner-Prinzips); Aufgaben mit weniger Treffern leicht bevorzugt.

Gewertet wird der **erste Versuch**: Wird zuerst ein falsches Ziel getroffen, zählt die
Batterie als Fehler, auch wenn danach das richtige getroffen wird.

### 5.2 Spielarten

| Nr. | Name | Stimulus | Ziele tragen | Antwort |
|---|---|---|---|---|
| 1 | Ergebnis treffen | `8 × 5 = ?` unten mittig | 5 Ergebnisse (1 richtig, 4 plausible falsche) | richtiges Ziel treffen |
| 2 | Treffen & tippen | – | 3 verschiedene Aufgaben (`7×8`) | Ziel treffen, Ergebnis per Tastatur; Zeitlimit 3 s (einstellbar) |
| 3 | Geteilt-Aufgaben | `40 : 8 = ?` | 5 mögliche Faktoren | richtigen Faktor treffen |
| 4 | Alles gemischt | zufällig 1–3 je Batterie | | |

Spielart 2 im Detail: Nach dem Treffer bleibt das Ziel stehen, die übrige Szene läuft in
Zeitlupe (12 %), ein Eingabefeld mit ablaufendem Zeitbalken erscheint. Ausgewertet wird,
sobald so viele Ziffern getippt sind, wie das Ergebnis hat (oder mit Enter). Werden
**5 Ziele hintereinander durchgelassen**, ohne dass geschossen wurde, ist **Game Over**
(Anzeige als fünf Herzen). Jeder Treffer setzt den Zähler zurück.

### 5.3 Rückmeldung (ADHS-Leitlinie)

| Ereignis | Bild | Ton |
|---|---|---|
| Richtig | szenariospezifischer Effekt (Federwolke/Leuchtring bzw. lachendes Umkippen mit Schneewolke); die vollständige Gleichung erscheint am Ziel, wächst und vergeht in einem Leuchtschein | aufsteigender Vierklang |
| Falsch | Ziel sackt schlaff ab bzw. Kind guckt ulkig; rotes ✗ am Ziel | kurzer tiefer Ton |
| Zeit abgelaufen / kein Treffer | richtige Gleichung wird neutral eingeblendet | absteigender Ton |
| Neue Aufgabe | Aufgabenfeld federt ins Bild | Zweiton-Signal |

Alle Rückmeldungen starten im selben Frame wie der Treffer.

### 5.4 Falsche Antworten (Distraktoren)

Keine Zufallszahlen, sondern typische Fehler: Nachbarn in der Reihe (`a×(b±1)`, `(a±1)×b`),
Zehnerfehler (±10), ±1/±2, Ziffernvertauschung, Summe statt Produkt. Bei Division:
Nachbarzahlen und der Divisor selbst.

### 5.5 Trainer-Auswahl und Empfehlung

- **Schwächewert** je Aufgabe: `1 − Trefferquote`, +0,15 bei durchschnittlicher Antwortzeit über 4 s, +0,1 bei weniger als 3 Versuchen; ungesehene Aufgaben 0,35.
- **Trainer-Auswahl** (Menü): die 10 Aufgaben mit dem höchsten Schwächewert, schwierige Aufgaben leicht bevorzugt.
- **Empfehlung nach der Runde**: alle Aufgaben mit Quote unter 80 % oder deutlich langsamer Antwort (über 1,6 × Median und über 3,5 s). Sie wird als „Meine Übungsserie“ gespeichert.

### 5.6 Etappen und Zwischenrunden

Ziel: Die Runde wird in überschaubare Abschnitte gegliedert; das Kind sieht jederzeit, wie
weit es ist und wann die Runde endet. Die Zwischenrunde ist zugleich eine kurze Pause ohne
Anforderung.

**Regeln (szenariounabhängig, `js/session.js` und `js/play.js`)**

- Rundenziel `total` = Anzahl Aufgaben × `need`. Gezählt werden nur im ersten Versuch richtig gelöste Aufgaben (`done`); Fehler lassen den Balken stehen.
- Eine Etappe umfasst `STAGE_SIZE = 5` gelöste Aufgaben. `stageCount = ceil(total / 5)`, laufende Etappe `stage = floor(done / 5)` (0-basiert). Beispiel: 10 Aufgaben × 3 = 30 → 6 Etappen; 10 × 2 = 20 → 4; 3 × 3 = 9 → 2 (5 + 4).
- Vor jeder neuen Batterie prüft `Play._begin()`, ob `stage` gestiegen ist. Wenn ja, folgt statt der Batterie die Zwischenrunde (Zustand `inter`). Springt `done` in Spielart 2 innerhalb einer Batterie über mehrere Grenzen, gibt es nur eine Zwischenrunde.
- Nach der letzten Etappe gibt es keine Zwischenrunde, sondern die Auswertung.
- Runden mit nur einer Etappe (`total ≤ 5`) laufen ohne Etappenanzeige.

**Anzeige**

- Fortschrittsbalken: senkrechte Marken an den Etappengrenzen (`i · 5 / total`), daneben „Etappe 2/6“. Der Balken füllt sich stufenlos mit `done / total`.
- Zwischenrunde: Banner „Etappe n von m geschafft!“ mit einer Zeile zum Wandel im Szenario (z. B. „Abendrot über dem See · Frische Fußspuren im Schnee“), Dreiklang-Signal.

**Aufgabe des Szenarios**

Ein Szenario nimmt teil, indem es `intermission(stage, stageCount)` anbietet (7.3/7.4). Es
spielt seinen Übergang selbst ab und gibt `{ duration, label, detail }` zurück; `play.js`
wartet `duration` Sekunden und stellt dann die nächste Batterie. Szenarien ohne diese
Methode laufen ohne Etappen.

Gestaltungsregeln für den Übergang (gelten für alle Szenarien):

1. Dauer 2–4 s, keine Eingabe nötig, keine Wertung.
2. Ein verdeckendes Ereignis (Schneesturm, Nebel, Rauch, Zugdurchfahrt …) überblendet den Wechsel, damit die Szene nicht „springt“.
3. Danach ist die Szene dauerhaft verändert: Stimmung (Tageszeit, Wetter) und mindestens ein neues Detail. Die Veränderung trägt die Information „ich bin weiter“.
4. Der Verlauf ist auf die Etappenzahl skaliert, sodass die letzte Etappe immer den Endzustand zeigt (hier: Nacht).
5. Bei `prefers-reduced-motion` kürzer und ruhiger (kein Partikelsturm).
6. Ziele sind während des Übergangs nicht im Bild; Lesbarkeit der Ziele muss in jeder Stimmung erhalten bleiben (hier: Figuren werden weniger abgedunkelt als die Kulisse).

## 6 Auswertung

Nach jeder Runde: Gesamtquote als Ring, richtig/falsch, Dauer, 0–3 Sterne (ab 60/80/95 %);
je Aufgabe ein farbiger Balken mit „x von y“ und Gesicht; darunter die empfohlenen Aufgaben
mit Schaltfläche **„Übungsserie spielen“**. Abgebrochene Runden werden ausgewertet, sofern
mindestens eine Antwort gegeben wurde.

## 7 Szenarien (umgesetzt)

Gemeinsame Bedienung: Fadenkreuz folgt der Maus, Linksklick schießt/wirft, Esc pausiert.
Mit der Einstellung „Ballistik: an“ haben Geschosse eine Flugzeit, auf bewegte Ziele muss
vorgehalten werden; bei „aus“ sitzt der Schuss sofort am Fadenkreuz (7.4.5).

### 7.1 Truthahn-Skeet (`js/scenarios/turkey.js`, 2D mit PixiJS)

**Grafiken.** Per Skript gezeichnete Vektorgrafiken in `assets/vogel-skeet/`
(`tools/build-skeet-assets.py`, siehe dortige `README.md`): drei Reviere mit je vier
Ebenen `fern`, `mitte`, `nah`, `vorn` (1760 × 720), für Rocky Mountains und Schwarzwald
zusätzlich als Schneefassung; drei Vogelarten (Körper und Flügel getrennt); Bockflinte.
Stil: flächige Formen mit dunkler Kontur, Schattenseite rechts unten abgedunkelt und
schraffiert, Schlagschatten am Boden, Dunst an den fernen Ebenen, Papierrand an den Vögeln.

**Ebenen** (hinten → vorn): `himmel` 0,03 (Verlauf, Sonne, Sterne, Wolken) · `schwarm` 0,08
(ferner Vogelzug) · `fern` 0,12 · `mitte` 0,30 · `nah` 0,55 · `voegel` 1,0 · `vorn` 1,0
(Gebüsch als Deckung) · `wetter` und `flinte` in Sichtkoordinaten. Alle drei Reviere sind
geladen; sichtbar ist das Revier der laufenden Station.

**Ziele.** Vögel steigen hinter dem Gebüsch im Vordergrund auf, fliegen im Bogen durchs
Bild und landen wieder dahinter. Das Ergebnis hängt als Papierschild unter dem Vogel.
Flugrichtung wechselt je Batterie: von links, von rechts, aus der Mitte nach außen. Drei
Entfernungen (Maßstab 0,52 / 0,64 / 0,78), fünf Flughöhen. Trefferfläche: Rumpf (Ellipse),
Kopf, Schild. Regeln 7.4.3 für bewegte Ziele:

- Flugbahnen liegen ganz in der Zielzone (Bildmitte ± 540 abzüglich halber Figurbreite), also bei jedem Schwenk im Bild.
- Die Vogel-Ebene liegt vor der gesamten Landschaft; verdecken kann nur das Gebüsch der Ebene `vorn`. Treffbar ist ein Vogel erst, wenn er mit Schild vollständig darüber ist (Unterkante über y = 596), und nicht mehr, sobald er beim Landen wieder eintaucht.
- Alle Vögel einer Batterie fliegen gleich schnell und starten mit einem Abstand von einer vollen Figurbreite; sie können sich daher nicht überholen oder überdecken.
- Die Flinte bleibt unterhalb der Flugbahnen (Mündung nie über y ≈ 618).

- **Richtig**: Federwolke in den Farben der Art, Leuchtring, Funken. **Falsch**: Vogel trudelt mit verblasstem Schild ab. **Spielart 2**: getroffener Vogel bleibt flatternd stehen.
- **Flinte**: Bockflinte unten rechts, folgt dem Fadenkreuz, Rückstoß, Mündungsfeuer; die Schrotgarbe startet an der Mündung.
- **Ballistik** (7.4.5): aus = Treffer sofort am Fadenkreuz. An = Flugzeit 0,14–0,38 s und Geschossabfall 2–10 Einheiten, wachsend mit der Entfernung des nächstgelegenen Vogels; die Garbe wird mit der Entfernung breiter (Radius 13–18). Vögel fliegen mit 165 Einheiten/s (× Tempo), der nötige Vorhalt beträgt also etwa 25–60 Einheiten. Ein Fehlschuss zeigt als kleine Schrotwolke mit Ring, wo die Garbe lag.

**Etappen (5.6): Jagdreise.** Zwischenrunde = Nebelbank zieht durchs Bild (3,2 s,
Windgeräusch). Darunter wechselt die Station. Die Route hat zwölf Stationen und wird
gleichmäßig auf die Etappen der Runde verteilt; die letzte Etappe zeigt immer die letzte
Station.

| Revier | Vogel | Stationen (Stimmung) |
|---|---|---|
| Rocky Mountains | Wildtruthahn | Goldener Herbst → Hochsommer → Tiefer Winter → Tauwetter |
| Schwarzwald | Ringeltaube | Frühling → Hochsommer → Goldener Herbst → Tiefer Winter |
| Uckermark | Jagdfasan | Hochsommer → Goldener Herbst → Abendrot → Abenddämmerung |

Bei der Standardrunde (6 Etappen): Rocky Mountains im Herbst und im Winter, Schwarzwald im
Frühling und im Winter, Uckermark im Herbst und in der Abenddämmerung. Umsetzung der
Stimmung: Farbmultiplikator je Ebenengruppe, Schneefassung der Ebenen mit Deckkraft 0–1
(Tauwetter 0,5), Sonnenstand, Sterne, Wetterteilchen (Laub, Schnee, Blütenstaub). Beim
Revierwechsel werden die Ebenen unter dem Nebel überblendet; das Banner nennt Ziel und
Vogelart („Weiter in den Schwarzwald · Frühling · es fliegen Ringeltauben“).

**Erzeugte Bewegung.** Ziehende Wolken, ferner Vogelzug in Keilformation, Wetterteilchen,
Flügelschlag.

### 7.2 Schneeballschlacht (`js/scenarios/snow.js`, 2D mit PixiJS)

**Grafiken.** Eigene Vektorgrafiken des Auftraggebers im Stil von Pieter Bruegel d. Ä.,
„Winterlandschaft mit Eisläufern und Vogelfalle“ (1565), in `assets/schneeball-bruegel/`:

| Ordner | Inhalt |
|---|---|
| `layers/` | 6 Original-Ebenen, je 1280 × 720 (Quelle, vom Spiel nicht geladen) |
| `layers-wide/` | Spiel-Ebenen, 1760 × 720 (x = −240 … 1520), erzeugt mit `tools/build-snow-wide.py` |
| `kids/` | 6 Kinderfiguren als Klappsilhouetten, je 240 × 400 |
| `sprites/` | Schneeball, Schneepuff, Vogelfalle; `eislaeufer.svg` (aus Ebene 01 abgeleitet) |
| `spec.md` | Asset-Spezifikation (Maße, Trefferflächen, Palette) |

`tools/build-snow-wide.py` verbreitert die Ebenen für den Kameraschwenk (Hügel, Häuser, Bäume,
Zaun und Schnee an den Rändern ergänzt), teilt Ebene 02 in Häuser (02a) und Uferbank (02b),
damit Reihe A dazwischen stehen kann, und entfernt gemalten Rauch, Vögel und Eisläufer, die
im Spiel animiert werden. Nach Änderungen an `layers/` das Skript erneut ausführen.

**Ebenen und Parallaxe** (hinten → vorn; Faktor 1 = bewegt sich so weit wie die Kamera):

| Ebene | Inhalt | Faktor |
|---|---|---|
| `backdrop` | 01: Himmel, Hügel, Dorf, Brücke, See; laufende Eisläufer | 0,06 |
| `himmel` | Himmelsleuchten, Sterne, Mond (je nach Tageszeit) | 0,06 |
| `voegel` | Vogelschwärme | 0,12 |
| `haeuser` | 02a: ferne Häuser, Fensterlicht, Kaminrauch | 0,25 |
| `reiheA` → `ufer` → `baeume` | Kinderreihe A, 02b Uferbank, 03 Eichen und Kopfweiden | 0,40 |
| `nah` | 04: großes Haus, Holzstapel, Speicher; Spuren, Schneemann, Rauch | 0,55 |
| `reiheB` → `zaun` | Vogelfalle, Kinderreihe B, 05 Zaun; Krähen | 0,75 |
| `reiheC` → `vorn` | Kinderreihe C, 06 Schneewehen | 1,0 |
| `flocken-fern/-mitte/-nah` | Schneefall in drei Tiefen, Sturmschleier | 0 (Sicht) |

Kinderreihe und verdeckende Ebene haben denselben Faktor, damit Füße und Deckung beim
Schwenk deckungsgleich bleiben.

**Ziele.** Kinder als Klappfiguren in drei Reihen (Maßstab 0,46 / 0,60 / 0,74). Sie schieben
sich von unten hinter Uferbank, Zaun bzw. Schneewehe hoch; das Ergebnis steht auf einem
Papierschild vor der Brust (Schriftgröße je Reihe so gewählt, dass sie am Bildschirm
ähnlich groß erscheint). Trefferfläche nach Asset-Spezifikation: Kopf (Kreis), Körper
(Rechteck) und Schild. Standorte werden nicht fest vergeben, sondern je Batterie aus den
zulässigen Plätzen gewählt (7.4.3).

- **Richtig**: Figur klappt nach hinten weg, Schneepuff, Leuchtring. **Falsch**: Figur wackelt auf ihrer Leiste, Schild verblasst, sie taucht ab.
- **Wurf**: Schneeball fliegt in 0,4 s im Bogen vom unteren Bildrand zum Fadenkreuz (bei „Ballistik: aus“ 0,1 s). Der Zielpunkt ist an der Ebene des anvisierten Kindes verankert: Schwenkt die Kamera während des Flugs noch nach, trifft der Ball trotzdem. Die Kinder stehen still, Vorhalten spielt hier praktisch keine Rolle.

**Erzeugte Bewegung.** Kaminrauch an acht Kaminen (Partikel), Schneefall, drei Vogelschwärme
in Keilformation mit Flügelschlag, 16 Eisläufer auf kleinen Bögen, flackerndes Fensterlicht,
leichtes Wippen der Figuren.

**Etappen (5.6).** Zwischenrunde = Schneesturm (3,4 s, Windgeräusch, wechselnde Windrichtung).
Unter dem Sturm wechseln:

- **Tageszeit**: Morgen → Mittag → Nachmittag → Abendrot → Dämmerung → Nacht, gleichmäßig über die Etappen der Runde verteilt (bei weniger als 4 Etappen Beginn am Mittag; die letzte Etappe ist immer Nacht). Umsetzung: Farbmultiplikator je Ebenengruppe, Leuchten am Horizont, Sterne und Mond. Ab Abendrot leuchten die Fenster (aus der Fensterfarbe der Grafik gewonnene Lichtebene, die nicht abgedunkelt wird).
- **Dorfleben** (ein Detail je Etappe, zyklisch): Fußspuren → Schlittenspur → Schneemann → Krähen auf dem Zaun → Neuschnee deckt die Spuren zu.

### 7.3 Frühere 3D-Fassung

Bis Version 0.2 lief Truthahn-Skeet als 3D-Szene mit three.js (`js/engine.js`). Mit
Version 0.3 sind die 3D-Engine und three.js entfallen (Entscheidung E17); der Stand ist
in der Git-Historie erhalten (Commit `1b6c684` und früher).

### 7.4 Bauanleitung für 2D-Szenarien (PixiJS)

Vorlage für die Übertragung auf die übrigen Szenarien. Vorbild: `js/scenarios/snow.js`,
Grundgerüst: `js/engine2d.js`. Neue Szenarien sollen als 2D-Mehrebenen-Szene entstehen.

#### 7.4.1 Koordinaten und Ebenen

- Alle Ebenen teilen ein Raster (`design`, hier 1280 × 720, Ursprung oben links). Die Szene füllt die Bildhöhe und ist am unteren Rand verankert.
- `engine.addLayer(name, f)` legt eine Ebene an; Reihenfolge der Aufrufe = hinten → vorn. Die Ebene wird um `−cam.x · f` verschoben. Richtwerte: Himmel 0–0,1, Ferne 0,2–0,3, Mittelgrund 0,4–0,6, Spielebenen 0,75–1,0.
- **Sichtkoordinaten** = Raster bei f = 0. Darin laufen Geschosse, Effekte (`engine.fx`), Treffertest und HUD-Einblendungen. Umrechnung: `engine.layerToView(p, f)`, `engine.toScreen(p)`, `engine.toView(sx, sy)`.
- Grafiken einmalig rastern: `rasterSvg(url, { scale, box, replace })` liefert eine Leinwand (SVG-Filter kosten danach nichts), `textureOf(canvas)` die Textur. `box` schneidet leere Bereiche weg, `replace` tauscht Farben für Varianten.
- Ebenen müssen breiter sein als das Bild: mindestens Bildbreite + 2 × Schwenk × f; für breite Bildschirme (21:9) mehr. Hier 1760 statt 1280.

#### 7.4.2 Schnittstelle

```js
class Scenario2D {
  constructor(engine, { tempo, lead, variant, stages })   // stages = Etappenzahl der Runde
  design    // { w, h } Raster der Szene
  pan       // { x: größter Schwenk, safeHalf: halbe Breite der Zielzone, minPan, worldHalf: halbe Ebenenbreite }
  shot      // { cooldown, flight, radius, arc, spin, origin:{x,y}, startScale, endScale, make(), ballistics(to)? }
  targets   // [{ center:{x,y} (Sicht), hittable, hitTest(p, r), z, f (Parallaxfaktor), data, state, … }]
  async build()            // Grafiken laden, Ebenen anlegen
  spawnWave(labels)        // labels: [{ text, correct?, … }] → je Eintrag ein Ziel
  resolve(target, outcome) // 'correct' | 'wrong' | 'lock'
  dismiss(), waveDone()
  update(dt, rawDt)        // Animation; ruft onEscape(target) für durchgelassene Ziele
  intermission(stage, stageCount)  // optional, Etappenübergang → { duration, label, detail }
  depthAt(y), onShoot(), onMiss(p), dispose()   // optional
}
```

Registrierung in `SCENARIOS` (`js/main.js`) mit `cls`.

#### 7.4.3 Regeln für Ziele: immer im Bild, nie verdeckt

Diese Regeln sind verbindlich und werden im Schnee-Szenario beim Aufbau automatisch
durchgesetzt (`_buildRows`, `_clash`, `_place`):

1. **Zielzone.** Ziele stehen nur in Bildmitte ± `safeHalf` (540), abzüglich ihrer halben Breite. Die Engine begrenzt den Schwenk auf `min(pan.x, V/2 − safeHalf, worldHalf − V/2)` (V = sichtbare Breite) und verkleinert die Szene auf schmalen Bildschirmen, bis die Zielzone samt Mindestschwenk (40) ins Bild passt. Folge: Jedes Ziel ist bei jeder Mausposition und jedem Seitenverhältnis vollständig sichtbar.
2. **Deckung.** Ein Ziel taucht hinter genau einer Deckung auf (Ebene direkt davor, gleicher Parallaxfaktor). Die Standhöhe ergibt sich aus der Oberkante der Deckung an dieser Stelle (aus dem Alphakanal der Ebene gelesen), sodass nur Füße bzw. Standleiste verdeckt sind.
3. **Keine Verdeckung durch Kulisse.** Ein Platz ist nur zulässig, wenn die Fläche aus Kopf, Schild und Körper von keiner davorliegenden Ebene überdeckt wird – geprüft im Alphakanal aller vorderen Ebenen, verbreitert um den größten gegenseitigen Versatz `|f₁ − f₂| · Schwenk`. Bei der eigenen Deckung reicht die Prüfung bis zur Schildunterkante (Beine dürfen hinter dem Zaun stehen). Damit kann kein Ziel hinter Bäumen, Häusern oder Pfosten stehen, auch wenn Grafiken geändert werden.
4. **Keine Verdeckung durch andere Ziele.** Zwei Ziele derselben Batterie halten so viel Abstand, dass das vordere das hintere bei keinem Schwenk überdeckt; Ziele derselben Reihe berühren sich nicht.
5. **Requisiten** stehen hinter den Zielen ihrer Reihe (Vogelfalle) oder außerhalb der Trefferflächen (Krähen nur auf Pfosten, Schneemann unterhalb von Reihe A).

Für handplatzierte Ziele in anderen Szenarien gelten dieselben Regeln als Checkliste.

Für **bewegte Ziele** (Vorbild `turkey.js`) gelten die Regeln sinngemäß: Bahnen vollständig
in der Zielzone; Ziele auf einer Ebene vor der gesamten Kulisse, treffbar nur außerhalb
der Deckung; gleiche Geschwindigkeit und gestaffelter Start statt Platzsuche.

#### 7.4.4 Checkliste für die Übertragung auf ein weiteres Szenario

1. Grafiken als deckungsgleiche Ebenen anlegen, an den Rändern Reserve für den Schwenk (7.4.1); je Zielreihe eine Deckungsebene.
2. Ebenenliste mit Parallaxfaktoren festlegen; Zielreihe und Deckung mit gleichem Faktor.
3. Ziele mit Trefferfläche und gut lesbarer Beschriftung (am Bildschirm mindestens etwa 35 px Schrifthöhe bei 1080p) bauen; Regeln 7.4.3 einhalten.
4. Erzeugte Bewegung ergänzen (Partikel, Tiere, Wetter), aber nicht vor den Trefferflächen.
5. `intermission()` nach 5.6 gestalten: verdeckendes Ereignis, Verlauf der Stimmung über die Etappen, ein neues Detail je Etappe, Bannertext.
6. Prüfen wie in 8.2: Sichtbarkeit und Verdeckung bei vollem Schwenk in mehreren Seitenverhältnissen, komplette Runde.

#### 7.4.5 Ballistik

Die Einstellung „Ballistik“ (Profilfeld `lead`) gilt für alle Szenarien und wird dem
Szenario als `opts.lead` übergeben.

- Ohne eigene Regel nutzt die Engine `shot.flight` als feste Flugzeit (Schneeballschlacht: 0,4 s bzw. 0,1 s bei „aus“).
- Mit `shot.ballistics(to)` bestimmt das Szenario je Schuss `{ flight, drop, radius, f }`: Flugzeit in Sekunden, Geschossabfall in Einheiten (verschiebt den Auftreffpunkt nach unten), Trefferradius und Parallaxfaktor der Ebene, in der der Auftreffpunkt verankert wird. Bei „aus“ liefert es `flight: 0` (Treffer im nächsten Bild).
- Der Auftreffpunkt ist in der Ebene verankert, nicht am Ziel: Ein Kameraschwenk verschiebt ihn nicht, ein bewegtes Ziel fliegt aber weiter. Daraus ergibt sich das Vorhalten.
- Gestaltungsregel: Der Vorhalt soll spürbar, aber klein sein (hier unter einer halben Figurbreite), und ein Fehlschuss muss zeigen, wo er lag. Für Kinder, die das überfordert, ist „aus“ die richtige Wahl; die Rechenleistung wird davon nicht berührt.

## 8 Architektur und Daten

```
index.html            Bildschirme: Menü, Lernraster, Auswertung, Spiel (HUD)
css/style.css
js/main.js            Menü, Lernraster, Auswertung, Rundenstart
js/tasks.js           Zahlenräume, Aufgabentöpfe, Distraktoren, Schwächewert
js/session.js         Runde: Auswahl, Wiedervorlage, Endkriterium, Empfehlung
js/play.js            Spielablauf: Batterien, Trefferauswertung, Rückmeldung
js/engine2d.js        PixiJS: Ebenen mit Parallaxe, Kameraschwenk, Geschosse mit Ballistik, Partikel, SVG-Rasterung
js/audio.js           Hinweistöne (WebAudio, synthetisch)
js/store.js           Profile und Lernstand (localStorage, Export/Import)
js/scenarios/*.js     Szenarien
assets/               Grafiken der Szenarien (siehe 7.1, 7.2)
tools/                Hilfsskripte (Ebenen verbreitern, Skeet-Grafiken zeichnen)
tests/                Browsertests mit Playwright (siehe 8.2)
AGENTS.md, CLAUDE.md  Einstieg für KI-Werkzeuge (verweist auf diese Spezifikation)
vendor/               PixiJS 8.23 (MIT-Lizenz)
data/                 Datenformat und Beispielprofil
docs/screenshots/     Bildschirmfotos
```

### 8.1 Speicherung von Benutzer, Fortschritt und Statistik

Eine statische Webseite kann nicht in das Repository schreiben. Der Lernstand liegt daher
im **localStorage des Browsers** (Schlüssel `fun2learn.1x1.v1`) und lässt sich im Menü als
**JSON-Datei sichern und laden**. Das Dateiformat ist in
[`data/profile.schema.json`](data/profile.schema.json) beschrieben; ein Beispiel liegt in
[`data/beispiel-profil.json`](data/beispiel-profil.json).

Je Profil: Name, Einstellungen, Statistik je Aufgabe und Aufgabentyp
(`mul`/`div`/`type`: richtig, falsch, Summe der Antwortzeiten), Lernraster-Auswahl,
aktuelle Übungsserie, die letzten 60 Runden mit Einzelergebnissen.

### 8.2 Prüfung

Geprüft wird mit Playwright (Chromium, Software-Rendering). Die Projektdateien werden per
Request-Interception ausgeliefert; die Engine wird im Test von Hand getaktet, weil die
Echtzeitschleife im Software-Renderer nur wenige Bilder pro Sekunde erreicht.

| Skript | Prüft | Laufzeit (Software-Renderer) |
|---|---|---|
| `node tests/round.test.js [Bildordner]` | komplette Runde mit Etappen, Zwischenrunden, Balken, Auswertung | ca. 2–4 min |
| `node tests/visibility.test.js [Bildordner]` | Regeln 7.4.3 in sechs Bildschirmgrößen | ca. 5–8 min |
| `node tests/skeet.test.js [Bildordner] [runde\|ballistik\|sicht]` | Truthahn-Skeet: komplette Runde mit Reise-Etappen, Ballistik an/aus, Sichtbarkeit der fliegenden Vögel | ca. 6–10 min |
| `node tests/gallery.js <Bildordner>` | Bildschirmfotos aller Tageszeiten und des Sturms (Sichtprüfung) | ca. 2 min |

Voraussetzung: Node.js und Playwright mit Chromium (`npm i -D playwright` und
`npx playwright install chromium`, falls nicht vorhanden). Rückgabewert 0 = bestanden.
Szenario-Hilfen für Tests: Aufruf mit `?debug` setzt `window.__scenario`;
`debugKids()` liefert die Bildschirmrechtecke der sichtbaren Ziele, `debugShow({ solo, calm })`
blendet Ebenen für den Pixelvergleich aus.

Version 0.3, Truthahn-Skeet (`tests/skeet.test.js`):

- **Komplette Runde** (10 Aufgaben × 2 = 20, Ballistik aus) per Mausklick auf den richtigen Vogel: jeder Schuss trifft; Zwischenrunden nach 5, 10 und 15 Lösungen mit Banner, Nebel und neuer Station; letzte Etappe zeigt die letzte Station; Auswertung am Ende.
- **Ballistik an**: Schüsse mit berechnetem Vorhalt treffen alle; direkt auf ferne Vögel gezielte Schüsse gehen überwiegend hinter dem Vogel durch.
- **Sichtbarkeit und Verdeckung** in 16:9, 4:3 und 21:9: alle Viertelsekunde während des gesamten Flugs bei Schwenk ganz links und ganz rechts – Figuren vollständig im Bild, Trefferflächen überlappungsfrei, Pixelvergleich „Vögel allein“ gegen „ganze Szene“ mit und ohne die vorderen Ebenen.

Version 0.2, Schneeballschlacht:

- **Komplette Runde** (10 Aufgaben × 3 = 30, Spielart 1) per Mausklick auf das richtige Kind: jede der 5 Zwischenrunden folgt genau nach 5, 10, 15, 20 und 25 Lösungen; Banner, Sturm, Wechsel der Tageszeit, neues Detail, Etappenanzeige und Marken im Balken; ein absichtlicher Fehlwurf; Auswertung am Ende.
- **Sichtbarkeit und Verdeckung** in sechs Bildschirmgrößen (1280 × 720, 1920 × 1080, 1600 × 900, 1024 × 768, 2560 × 1080, 1366 × 768), je Batterie bei Schwenk ganz links, Mitte, ganz rechts: alle Ziele vollständig im Bild, keine Überlappung der Trefferflächen, Pixelvergleich „Kinder allein“ gegen „ganze Szene“ innerhalb der Trefferflächen.
- **Alle sechs Tageszeiten** als Bildschirmfotos gesichtet.

Version 0.1 (damalige 3D-Fassung): Menü, Spielart 2 mit Tastatureingabe, Game Over nach
fünf durchgelassenen Zielen. Spielart 2 ist mit den 2D-Szenarien nicht erneut automatisiert
geprüft worden.

Nicht geprüft: Bildrate und Spielgefühl auf echter Grafikhardware, Tonausgabe (auch
Windgeräusch), Profil-Export/-Import per Dateidialog. Noch offen (Issue 13): Tests für
Menü und Spielart 2, Ausführung in GitHub Actions.

## 9 Geplant (noch nicht umgesetzt)

Jeder Punkt ist als GitHub-Issue angelegt.

### 9.1 Szenarien

| Szenario | Kurzbeschreibung |
|---|---|
| **Tiefflieger** | Cockpit-Sicht einer P-51 Mustang im Tiefflug über rheinländischer Landschaft (Zweiter Weltkrieg), Grafik in Anlehnung an Flugsimulationen der Zeit. Ein Güterzug mit Dampflok fährt quer durchs Gelände, die Waggons tragen die Ergebnisse. Richtiger Waggon: Explosion. Falscher Waggon: bricht ohne Effekt zusammen. Danach kurzer Weiterflug mit Einblendung der neuen Aufgabe, neuer Zug auf anderem Gleis aus anderer Richtung. Abwechslung: Militärkolonnen mit Unterstützungsfahrzeugen; Dörfer mit getarnten Munitionsdepots (richtig: Explosion, falsch: Dach bricht ein). |
| **UFO-Abwehr** | Nachtszene im Stil alter Atari-/Sega-Spiele. Sicht einer bodengestützten Ionenkanone (Lichtkanone/Railgun) auf UFOs mit unterschiedlichen Umrissen. Wird das richtige Ergebnis nicht innerhalb der Frist (einstellbar, z. B. 5–30 s) getroffen, landet das Raumschiff und ein Alien steigt bedrohlich aus. |
| **Fischteich** | Seitenansicht eines kleinen Teichs in der Anmutung eines hochwertigen Unterwasser-Bildschirmschoners. Verschiedene Fische tragen die Ergebnisse; der richtige wird mit einem kleinen Kescher gefangen. Falsche Fische springen zappelnd wieder heraus. Richtige Fische landen oberirdisch im Räucherofen (Duftschwaden). |
| **Luftgewehr-Schießstand** | Jahrmarktbude: Field Targets (z. B. Plastikröhrchen), Laufkasten mit Wildschwein, Bär, Reh, Hirsch, Dachs, Fuchs; Enten auf einem Transportband. |
| **Ballon-Zwille** | Freizeitpark mit Hüpfburgenland; farbige Luftballons steigen auf und werden mit der Steinschleuder getroffen. |

### 9.2 Spiellogik und Rahmen

- **Mehrspieler / Gegeneinander-Antreten** (abwechselnd am selben Gerät oder Duell).
- **Familien-Challenge zum 1×1-Diplom** (gemeinsames Ziel, Urkunde).
- **Belohnungstoken für die Wochenaufgabe** (Wochenziel, einlösbare Token).
- **Verteiltes Wiederholen über Tage** (Leitner-Fächer mit Fälligkeitsdatum) und Lernverlauf über die Zeit.
- **Touch-/Tablet-Bedienung** mit Bildschirm-Ziffernblock.
- **Grafikausbau** Truthahn-Skeet: Grafiken des Auftraggebers statt der per Skript gezeichneten (gleiche Dateinamen und Maße, siehe `assets/vogel-skeet/README.md`), weitere Reviere, Umgebungsgeräusche, Hände an der Flinte; Schneeballschlacht: weitere Posen je Kind (z. B. verdutztes Gesicht bei falschem Treffer), Wurfhand.
- **ADHS-Feinjustierung** (Reizreduktion, Pausenhinweise, ruhiger Modus).
- **Automatisierte Tests und Veröffentlichung** (GitHub Pages); Tests der Schneeballschlacht liegen in `tests/`.
- **Kleinere offene Punkte der Schneeballschlacht** (ohne eigenes Issue): Das Aufgabenfeld unten mittig kann Beine und den unteren Körperrand von Kindern der vorderen Reihe überdecken (Kopf und Schild bleiben frei); Ebenen optional vorab als WebP ausliefern (11.1); Treppengiebel; animierte Posen (Issue 11).

## 10 Fachliche Einordnung und Hinweise

- **Stand der Mathematikdidaktik**: Das 1×1 wird heute nicht als reine Reihe auswendig gelernt, sondern über **Kernaufgaben** (1·, 2·, 5·, 10·, teils Quadrataufgaben) und daraus **abgeleitete** Aufgaben erarbeitet; die Automatisierung folgt dem Verständnis (Gaidoschik 2014; Padberg & Benz, *Didaktik der Arithmetik*; Krauthausen, *Einführung in die Mathematikdidaktik*). Dieses Spiel deckt die Phase der **Automatisierung** ab und ersetzt die Erarbeitung nicht. Die „Königsaufgaben“ entsprechen den Kernaufgaben; eine Ableitungshilfe (z. B. „6×7 = 5×7 + 7“ nach einem Fehler) wäre die fachlich naheliegende Ergänzung.
- **Aufgabenschwierigkeit**: Die Liste „Schwierige Aufgaben“ folgt dem Problemgrößeneffekt der kognitiven Arithmetik (Ashcraft 1992; Campbell & Graham 1985). Die Distraktoren bilden die dort beschriebenen Reihenfehler (operand errors) nach.
- **Wiederholung**: Die Wiedervorlage innerhalb der Runde ist eine Kurzform der Lernkartei (Leitner 1972). Über Tage verteiltes Wiederholen ist wirksamer und als Erweiterung vorgesehen.
- **ADHS**: Unmittelbare, häufige Rückmeldung und kurze Einheiten entsprechen den gängigen Empfehlungen (Barkley; Sonuga-Barke zur Verzögerungsaversion). Zu beachten: Zeitdruck (Spielart 2, 3 s) kann bei einem Teil der Kinder Fehler und Frust erhöhen; deshalb ist die Zeit einstellbar. Sinnvoll ist, die Wirkung am Kind zu beobachten und nicht von vornherein die schärfste Einstellung zu wählen.
- **Jagdliche Einordnung**: Bejagt werden im Spiel nur Arten, die auch real jagdbar sind (Wildtruthahn in Nordamerika, Ringeltaube und Jagdfasan in Deutschland). Auerhuhn (in Deutschland vom Aussterben bedroht, ganzjährig geschont) und Goldfasan (Ziervogel) wurden deshalb nicht als Ziele übernommen. „Skeet“ bezeichnet eigentlich das Schießen auf Wurfscheiben; der Name ist aus Version 0.1 übernommen.
- **Inhalte**: Jagd- und Kriegsszenarien (Flinte, Tieffliegerangriff) sind für ein Kinder-Lernspiel eine bewusste Entscheidung des Auftraggebers. Für eine Weitergabe an Dritte (Schule, Therapie) sollte die Altersangemessenheit je Szenario geprüft und die Szenarioauswahl ggf. einschränkbar gemacht werden.
- **Bildvorlagen**: Gemälde und Fotos dienten als Stilreferenz, es wurden keine fremden Bilddateien übernommen. Die Grafiken der Schneeballschlacht sind eigene Vektorzeichnungen des Auftraggebers (mit KI-Unterstützung entstanden, siehe `assets/schneeball-bruegel/spec.md`, Abschnitt 9, zur offenen Frage der Urheberschaft); die Grafiken des Truthahn-Skeet sind per Skript gezeichnet (KI-gestützt, ohne Bildvorlagen).
- **2D-Technik**: Gestaffelte Ebenen mit Parallaxe und Figuren als Ausschneidebilder (Cut-out) sind das übliche Verfahren für 2D-Spiele dieser Art; Stand der Technik ist dabei, Vektorgrafiken einmalig zu rastern bzw. als Texturatlas auszuliefern und über WebGL zu zeichnen. Hier wird beim Laden im Browser gerastert (kein Build-Schritt). Für schwächere Geräte wäre der nächste Schritt, die Ebenen vorab als WebP auszuliefern; das spart Ladezeit, kostet aber die Anpassung an die Bildschirmauflösung.
- **Zwischenrunden**: Kurze, nicht bewertete Unterbrechungen mit sichtbarem Etappenziel entsprechen dem Prinzip des „Chunking“ und der Zielnähe-Rückmeldung (goal-gradient, Hull 1932; Kivetz et al. 2006) und kommen Kindern mit ADHS entgegen (kurze Verstärkungsintervalle, Sonuga-Barke). Zu beobachten ist, ob der Schneesturm als Belohnung oder als Ablenkung wirkt; ein ruhiger Modus (Issue 12) sollte ihn abschwächen können. Derzeit geschieht das nur über die Systemeinstellung „Bewegung reduzieren“.

## 11 Entscheidungen, Abwägungen und Erkenntnisse

Protokoll der Entwicklungssitzungen seit dem 15.11.2026 (KI-gestützt). Es hält fest,
**warum** etwas so gebaut ist, welche Alternativen verworfen wurden und welche Fehler
aufgetreten sind. Bei Änderungen an diesen Punkten bitte hier nachtragen statt
überschreiben (Datum, Begründung).

### 11.1 Architekturentscheidungen

| Nr. | Entscheidung | Verworfene Alternative | Begründung |
|---|---|---|---|
| E1 | **2D-Mehrebenen-Szenen mit PixiJS** für alle Szenarien | three.js für alles | Die Szenarien brauchen keine räumliche Geometrie, sondern gestaffelte Ebenen mit Parallaxe. 2D ist einfacher zu gestalten (Grafiken als Ebenen eines Zeichenprogramms), Verdeckung ist über die Ebenenreihenfolge exakt steuerbar, Ziele sind als Ausschneidefiguren klar lesbar. Vorgabe des Auftraggebers. Seit 0.3 auch Truthahn-Skeet (E17). |
| E2 | *(überholt durch E17)* **Zwei Engines nebeneinander** (`engine.js`, `engine2d.js`) mit gleicher Schnittstelle zu `play.js`, je eigene Zeichenfläche (`#gl`, `#gl2d`) | gemeinsame Engine / sofortige Umstellung des Truthahns | Kein Umbau eines funktionierenden Szenarios nötig. `play.js` kennt nur `shoot()`, `toScreen()`, `onHit`, `onFrame`, `timeScale`, `paused`. Zwei WebGL-Kontexte gleichzeitig vermeiden: Jede Engine bekommt ihre eigene Leinwand, die andere wird versteckt. |
| E3 | **Kein Build-Schritt**: PixiJS 8.23 als `vendor/pixi.min.mjs`, eingebunden per Import-Map | npm + Bundler (Vite) | Projekt bleibt statisch (GitHub Pages, Doppelklick-tauglich mit einfachem Server). Nachteil: 0,9 MB ungeteilt; akzeptabel. Die `sourceMappingURL`-Zeile wurde entfernt (keine 404-Meldung). |
| E4 | **WebGL statt WebGPU** (`preference: 'webgl'`) | WebGPU | PixiJS empfiehlt WebGL weiterhin als stabilen Standard; WebGPU bringt für diese Szenen keinen Vorteil. |
| E5 | **SVG beim Laden im Browser rastern** (`rasterSvg`), Auflösung nach Bildschirmmaßstab (Faktor 1–2) | SVG direkt als Textur; Vorab-Rastern zu WebP | SVG-Filter (`feTurbulence` für Maltextur, `feMorphology` für Papierrand) sind teuer und werden so nur einmal berechnet. Vorab-WebP spart Ladezeit (nicht gemessen), bindet aber an feste Auflösungen und braucht einen Exportschritt. Umstieg auf WebP ist möglich, wenn Ladezeit auf schwachen Geräten stört. |
| E6 | **Original-Ebenen unverändert lassen, Spiel-Ebenen per Skript ableiten** (`tools/build-snow-wide.py` → `layers-wide/`) | Originale von Hand erweitern | Die Grafiken stammen vom Auftraggeber und können neu geliefert werden. Das Skript ist reproduzierbar: verbreitern, Ebene 02 teilen, gemalten Rauch, Vögel und Eisläufer entfernen (die werden im Spiel animiert, sonst doppelt). |
| E7 | **Szenenraster 1280 × 720, unten verankert**, Himmel nach oben verlängert | Raster an Bildschirm anpassen / Ränder schwarz | Kinder und Deckungen liegen unten; auf hohen Bildschirmen (4:3) wird oben Himmel ergänzt. Verlängert wird mit der obersten Pixelzeile der Grafik, nicht mit einer Flächenfarbe (sichtbare Naht, siehe 11.3). |
| E8 | **Plätze der Ziele automatisch bestimmen** (Alphakanal der Ebenen) | feste, handplatzierte Verstecke | Feste Verstecke waren die Ursache von Issue 14 (Ziele außerhalb des Bildes, hinter Bäumen). Die automatische Prüfung bleibt gültig, wenn Grafiken geändert werden, und gilt bei jedem Schwenk. Kosten: eine einmalige Berechnung beim Laden (nicht gemessen, im Test nicht spürbar). |
| E9 | **Gleicher Parallaxfaktor für Zielreihe und ihre Deckung** | Ziele auf eigener Ebene | Sonst verrutschen Füße und Deckung beim Schwenk gegeneinander, und die Figur „schwebt“. |
| E10 | **Kameraschwenk klein (±100) und gedämpft** | großer Schwenk / Scrollen | Schwenk soll Tiefe zeigen, nicht Suchen erzwingen. Große Schwenks hätten Ziele aus dem Bild gedrängt (ADHS-Leitlinie: alles Relevante sichtbar). |
| E11 | **Ergebnis auf Papierschild vor der Brust** | Zahl auf der Mütze (v0.1) | Die neuen Figuren haben verschiedene Kopfbedeckungen ohne Platz für Zahlen. Schild ist bei allen Posen gleich lesbar; Schriftgröße je Reihe so gewählt, dass sie am Bildschirm ähnlich groß erscheint. |
| E12 | **Wurfziel an der Ebene des anvisierten Ziels verankern** | Ziel in Sichtkoordinaten fest | Die Kamera schwenkt nach einer Mausbewegung noch nach; ein in Sichtkoordinaten fester Zielpunkt verfehlte dann das Kind (im Test gefunden, 11.3). |
| E13 | **Etappen zählen gelöste Aufgaben (erster Versuch)**, 5 je Etappe | Etappe nach 5 gestellten Aufgaben | Fortschritt soll nur durch Lösen wachsen, wie der Balken. Fehler verlängern die Etappe, statt sie „abzusitzen“. |
| E14 | **Zwischenrunde als Szenario-Methode** (`intermission`), Ablauf in `play.js` | Effekt fest in `play.js` | Jedes Szenario gestaltet seinen Übergang selbst; Zählung, Banner und Balken bleiben einheitlich. Szenarien ohne Methode laufen unverändert. |
| E15 | **Tageszeit über Farbmultiplikator je Ebenengruppe** (`tint`), Fensterlicht als eigene Lichtebene | getrennte Grafiksätze je Tageszeit / Shader-Filter | Ein Grafiksatz reicht; billig auf jeder Hardware. Fenster werden über ihre Farbe (`#e8bd6a`) aus der Grafik gewonnen und nicht abgedunkelt. Kinder werden nur zu 45 % mitgetönt, damit sie nachts lesbar bleiben. |
| E16 | **Tagesverlauf auf die Etappenzahl skaliert** | feste Folge je Etappe | Die letzte Etappe zeigt immer die Nacht, unabhängig von der Rundenlänge (2–10 Etappen). Bei weniger als 4 Etappen beginnt der Tag am Mittag. |
| E17 | **Truthahn-Skeet auf 2D umgestellt, three.js und `engine.js` entfernt** (16.11.2026) | 3D verfeinern (texturierte, animierte Modelle) | Zielstil sind flächige Figuren vor gemalter Kulisse; das ist 2D. Für 3D fehlen Modelle, und der Arbeitsablauf des Auftraggebers liefert Ebenen-Grafiken. Etappen, Stimmungen und die Regeln 7.4.3 sind in 2D bereits gelöst. Im Software-Renderer lief die 3D-Fassung mit 1 Bild/s, die 2D-Fassung mit 5–7. Verlust: echte Raumtiefe des Flugs; ersetzt durch drei Entfernungsstufen und die Flinte als Vordergrundfigur. Eine Engine weniger zu pflegen, 0,7 MB weniger Bibliothek. |
| E18 | **Grafiken per Skript zeichnen** (`tools/build-skeet-assets.py`) | Grafiken zur Laufzeit erzeugen; von Hand gezeichnete SVG | Reproduzierbar und als Ganzes änderbar (Palette, Schraffur, Dichte); Ergebnis sind gewöhnliche SVG-Dateien, die der Auftraggeber später durch eigene ersetzen kann. Schneefassungen entstehen aus derselben Geometrie (gleicher Zufalls-Startwert), damit sie deckungsgleich überblendet werden können. |
| E19 | **Etappen als Reise durch Reviere und Jahreszeiten**, alle Reviere vorab geladen | je Etappe nur Tageszeit; Revier erst bei Bedarf laden | Ein neues Revier ist das stärkste Signal „ich bin weiter“. Vorab laden vermeidet Ruckeln in der Zwischenrunde; die Ebenen sind beschnitten und mit höchstens Faktor 1,5 gerastert, damit der Speicherbedarf im Rahmen bleibt. Jahreszeiten über Farbmultiplikator und Schneefassung statt eigener Grafiksätze. |
| E20 | **Bewegte Ziele: gleiche Geschwindigkeit, gestaffelter Start, eigene Ebene vor der Kulisse** | Platz- und Verdeckungssuche wie bei den Kindern | Bei fliegenden Zielen wäre eine Verdeckungsprüfung entlang der Bahn aufwendig; so ist Überdeckung konstruktiv ausgeschlossen. Preis: Perspektivisch müssten ferne Vögel langsamer wirken – darauf wird verzichtet. |
| E21 | **Ballistik als Szenario-Funktion je Schuss** (`shot.ballistics`), ein Schalter im Menü | feste Flugzeit; mehrere Schieberegler | Entfernung, Abfall und Streuung hängen vom Szenario ab; das Kind bekommt genau einen Schalter. „Aus“ trennt Rechnen von Geschicklichkeit (wichtig bei motorischen Schwierigkeiten oder Frust). |
| E22 | **Jagdbare Arten statt Auerhahn und Goldfasan** | Arten wie im Auftrag genannt | Siehe Abschnitt 10, Jagdliche Einordnung. |

### 11.2 Abwägungen zur Gestaltung

- **Reizdichte vs. Lebendigkeit.** Rauch, Schnee, Vögel und Eisläufer bewegen sich langsam und liegen außerhalb der Trefferflächen oder dahinter. Der Sturm ist der einzige starke Effekt und fällt in die Pause ohne Aufgabe. Bei `prefers-reduced-motion` weniger Flocken, kürzerer Sturm ohne Böenflocken. Ein ruhiger Modus im Menü fehlt noch (Issue 12).
- **Lesbarkeit vs. Stimmung.** Die Nacht ist deutlich dunkel, Kinder und Schilder bleiben heller als die Kulisse. Schilder: dunkle Schrift auf Papier, kräftiger Rand.
- **Verdeckung vs. Tiefe.** Kinder tauchen hinter Deckungen auf (Spannung, „Klappfiguren“), aber nur Füße und Standleiste sind verdeckt; Kopf, Schild und Körper nie.
- **Platzangebot.** Reihe A (hinten) hat wegen Bäumen und Häusern wenig freie Plätze; die Auswahl gewichtet daher die Reihen B und C stärker (2,2 : 1).
- **Etappengröße 5.** Bei Standardrunde (10 Aufgaben × 3) ergibt das 6 Etappen zu je etwa 1–2 Minuten. Kleinere Etappen würden zu oft unterbrechen, größere den Zwischenzielen ihre Wirkung nehmen.

### 11.3 Stolpersteine und Fehler aus der Entwicklung

| Problem | Ursache | Lösung / Regel |
|---|---|---|
| Kinder der vorderen Reihen fanden keinen Platz | Abfrage der Verdeckungskarte außerhalb der Karte (unterste Zeile) lieferte „durchsichtig“ | Koordinaten am Kartenrand begrenzen (`_alpha`) |
| Hinteres Kind teilweise vom vorderen überdeckt (nur bei 1280 × 720 gefunden) | Mindestabstand zwischen Reihen zu knapp (78 Figureinheiten) | 104 Einheiten + Parallaxversatz; Pixeltest mit vielen Batterien fahren |
| Würfe verfehlten nach schneller Mausbewegung | Kamera schwenkt nach, Zielpunkt stand in Sichtkoordinaten | E12 |
| Sichtbare Naht am Himmel auf 4:3 | Verlängerung mit einer Flächenfarbe aus der Bildmitte, Grafik hat dort einen Verlauf | oberste Pixelzeile strecken |
| Niedrige Bildrate | Vollbildflächen mit Deckkraft 0 (Sturmschleier, Lichtebene) wurden trotzdem gezeichnet | unsichtbare Objekte auf `visible = false` setzen; Füllrate ist der Engpass, nicht die Objektzahl |
| Fenster leuchten nicht mehr | Lichtebene sucht die Fensterfarbe `#e8bd6a` | Farbe in neuen Grafiken beibehalten oder Erkennung in `_buildGlow` anpassen |
| Tests hingen, Bildschirmfotos liefen in Zeitüberschreitung | Software-Renderer schafft 1–7 Bilder/s; Playwright wartet auf stabile Bilder | Engine im Test anhalten und von Hand takten (`__step`), Fotos mit `animations: 'disabled'` |
| Reihenfolge der Vögel (fern hinten) wirkte nicht | Sortieren des Kinder-Arrays einer PixiJS-Ebene von Hand wird nicht übernommen | `sortableChildren = true` und `zIndex` setzen |
| Sonne überstrahlte den halben Himmel | additiver Lichtschein zu groß (Faktor 13) | Lichtscheine klein halten und am Bildschirmfoto prüfen |
| Pixelvergleich meldete 1–2 % „Verdeckung“, obwohl nichts davor lag | halbtransparente Kanten (Rumpf/Schild) mischen sich mit dem Hintergrund | Verdeckung direkt messen: Abweichung mit und ohne die vorderen Ebenen vergleichen (`tests/skeet.test.js`), nicht die Schwelle anheben |
| Lokaler Webserver in der Arbeitsumgebung nicht erlaubt | Sandbox-Regel | Dateien im Test per Request-Interception ausliefern (`tests/helpers.js`) |

### 11.4 Hinweise zu Grafiken neuer Szenarien

- Lieferformat wie `assets/schneeball-bruegel/spec.md`: deckungsgleiche Ebenen (SVG, gemeinsames Raster), je Zielreihe eine Deckungsebene, Figuren mit festem Drehpunkt (Mitte Unterkante) und definierten Trefferflächen.
- An den Rändern mindestens 240 Einheiten Reserve für Schwenk und breite Bildschirme, oder ein Verbreiterungsskript wie `tools/build-snow-wide.py`.
- Dinge, die das Spiel animiert (Rauch, Vögel, Wasser, Fahrzeuge), nicht in die Ebenen malen, sondern als einzelne Sprites liefern.
- Lichtquellen für Nachtstimmungen in einer eindeutigen Farbe zeichnen (wie die Fenster) oder als eigene Ebene liefern.
- Rechtliches: Bei KI-gestützt entstandenen Grafiken Herkunft und Bearbeitung dokumentieren (siehe Asset-Spezifikation, Abschnitt 9).

## 12 Leitfaden für KI-gestützte Weiterarbeit

### 12.1 Arbeitsablauf

1. **Lesen:** diese Spezifikation (mindestens 3, 5, 7.4, 11), dann `js/play.js`, `js/engine2d.js` und `js/scenarios/snow.js` als Vorbild. Offene Issues auf GitHub prüfen.
2. **Klären:** Fehlende Vorgaben (Grafiken, Stil, Inhalte) beim Auftraggeber erfragen, bevor gebaut wird. Grafiken des Auftraggebers haben Vorrang vor erzeugten.
3. **Bauen:** neues Szenario als eigene Datei `js/scenarios/<name>.js` mit der Schnittstelle 7.4.2, Registrierung in `SCENARIOS` (`js/main.js`). Vorbild für stehende Ziele `snow.js`, für bewegte Ziele `turkey.js`. `play.js`, `session.js` und `engine2d.js` nur ändern, wenn es alle Szenarien betrifft.
4. **Prüfen:** Regeln 7.4.3 automatisiert nachweisen (Vorlage `tests/visibility.test.js`), komplette Runde durchspielen (Vorlage `tests/round.test.js`), Bildschirmfotos sichten. Nicht prüfbare Punkte (echte Hardware, Ton) ausdrücklich benennen.
5. **Dokumentieren:** Abschnitt 7.x für das Szenario ergänzen, neue Entscheidungen und Stolpersteine in 11 nachtragen, `CHANGELOG.md`, `README.md`, Bildschirmfotos in `docs/screenshots/`. Issues kommentieren und abhaken.

### 12.2 Konventionen

- Sprache: Deutsch in Oberfläche, Kommentaren, Dokumentation und Commit-Nachrichten. Fachbegriffe wie in Abschnitt 3.
- Keine Abhängigkeiten über `vendor/` hinaus, kein Build-Schritt, keine externen Netzaufrufe zur Laufzeit.
- Grafiken des Auftraggebers in `assets/<szenario>/` unverändert ablegen; Ableitungen per Skript in `tools/` erzeugen.
- Koordinaten: Szenenraster (Ebenen) und Sichtkoordinaten (Geschosse, Effekte, Treffer) sauber trennen (7.4.1).
- Rückmeldung im selben Frame wie der Treffer (5.3); keine Strafen, kein Zeitdruck außerhalb von Spielart 2.
- Neue Einstellungen gehören ins Menü (Abschnitt 4) und in das Profilformat (`data/profile.schema.json`).

### 12.3 Definition of Done für ein neues Szenario

- [ ] Spielbar in allen vier Spielarten (5.2), inkl. Zeitlupe und Eingabe in Spielart 2 (`resolve(target, 'lock')`).
- [ ] Ziele immer im Bild und nie verdeckt (7.4.3), automatisiert geprüft in mindestens 16:9, 4:3 und 21:9.
- [ ] Richtig- und Falsch-Rückmeldung szenariospezifisch, Ton über `audio.play()`.
- [ ] Etappen mit `intermission()` nach den Gestaltungsregeln in 5.6.
- [ ] Einstellung „Ballistik“ berücksichtigt (7.4.5): bei „aus“ sofortiger Treffer.
- [ ] Erzeugte Bewegung im Hintergrund, nicht vor den Trefferflächen.
- [ ] `prefers-reduced-motion` berücksichtigt.
- [ ] Keine Fehler in der Konsole; Ressourcen in `dispose()` freigegeben.
- [ ] Spezifikation (7.x, 11), Changelog, README, Bildschirmfotos aktualisiert.

### 12.4 Vorlage für einen Auftrag an eine KI

```
Lies spec.md (Abschnitte 3, 5, 7.4, 11, 12) und js/scenarios/snow.js.
Baue das Szenario „<Name>“ aus Abschnitt 9.1 als 2D-Mehrebenen-Szene nach 7.4.
Grafiken: assets/<ordner>/ (Asset-Spezifikation: assets/<ordner>/spec.md).
Zwischenrunde: <verdeckendes Ereignis>, Verlauf über die Etappen: <Stimmung>,
neue Details je Etappe: <Liste>.
Halte die Regeln 7.4.3 ein und weise sie mit einem Test nach tests/visibility.test.js nach.
Ergänze spec.md (7.x und 11), CHANGELOG.md und README.md. Commit auf einem eigenen Branch.
```
