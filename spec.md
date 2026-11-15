# 1×1 Fun2Learn – Spezifikation

| | |
|---|---|
| **Version** | 0.1.0 (erster spielbarer Stand) |
| **Datum** | 2026-11-15 |
| **Status** | Kern + 2 Szenarien umgesetzt, 5 Szenarien und Erweiterungen spezifiziert (siehe Abschnitt 9 und GitHub-Issues) |
| **Technik** | Statische Web-App, ES-Module, three.js r170 (lokal in `vendor/`), kein Build-Schritt |

Dieses Dokument ist die verbindliche Beschreibung des Spiels für Menschen und für
Werkzeuge (z. B. KI-Assistenten), die daran weiterarbeiten. Abschnitte 1–8 beschreiben
den **umgesetzten** Stand, Abschnitt 9 den **geplanten**.

---

## 1 Ziel und Zielgruppe

Browser-Lernspiel zur **Automatisierung des kleinen und großen 1×1** für Grundschulkinder,
ausdrücklich auch für Kinder mit ADHS. Das Rechnen ist in kurze 3D-Geschicklichkeitsszenen
eingebettet: Ziele tragen Ergebnisse oder Aufgaben, das richtige Ziel wird getroffen.

Leitlinien:

- **Sofortige Rückmeldung** auf jede Handlung: Ton und Bild gleichzeitig, ohne Verzögerung.
- **Kurze, abgeschlossene Einheiten** mit sichtbarem Fortschritt (Balken, Sterne).
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

Einschränkung: Das im Auftrag erwähnte frühere Drohnenabwehrspiel lag in dieser
Arbeitsumgebung nicht vor. Die Grafik wurde deshalb eigenständig mit three.js aufgebaut;
eine Angleichung an jenes Projekt ist möglich, sobald dessen Code zugänglich ist.

## 3 Begriffe

| Begriff | Bedeutung |
|---|---|
| **Aufgabe / Fakt** | Faktorenpaar `a × b`, Schlüssel `"axb"` (z. B. `"7x8"`). `7x8` und `8x7` sind getrennte Fakten. |
| **Zahlenraum** | `small` = 1–10 × 1–10 (100 Fakten), `big` = 11–20 × 1–10 (100 Fakten). |
| **Königsaufgaben** | Reihen mit 1, 2, 5 und 10. Schnell lernbar und Stützpunkte für Ableitungen (z. B. 6×7 = 5×7 + 7). |
| **Batterie** | Eine Gruppe von Zielen zu einer Fragestellung. |
| **Runde** | Bis zu 10 Aufgaben; endet, wenn jede Aufgabe `need`-mal im ersten Versuch richtig war. |
| **Szenario** | 3D-Kulisse samt Zielobjekten (Truthähne, Kinder, …). |
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
5. **Einstellungen**: Wiederholungen (2×/3×/5×), Tempo (gemütlich/normal/flott), Vorhalten nötig (ja/nein), Zeit zum Tippen (3/5/8 s).

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
4. Ende, wenn jede Aufgabe `need`-mal richtig war → Auswertung (Abschnitt 6).

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

## 6 Auswertung

Nach jeder Runde: Gesamtquote als Ring, richtig/falsch, Dauer, 0–3 Sterne (ab 60/80/95 %);
je Aufgabe ein farbiger Balken mit „x von y“ und Gesicht; darunter die empfohlenen Aufgaben
mit Schaltfläche **„Übungsserie spielen“**. Abgebrochene Runden werden ausgewertet, sofern
mindestens eine Antwort gegeben wurde.

## 7 Szenarien (umgesetzt)

Gemeinsame Bedienung: Fadenkreuz folgt der Maus, Linksklick schießt/wirft, Esc pausiert.
Geschosse haben eine Flugzeit; bei „Vorhalten nötig: ja“ muss bei bewegten Zielen leicht
vorgehalten werden, bei „nein“ ist das Geschoss praktisch sofort am Ziel.

### 7.1 Truthahn-Skeet (`js/scenarios/turkey.js`)

- **Kulisse**: Bergwiese in den Rocky Mountains. Hangwiese mit Gras, Gebüsch im Vordergrund, Startbüsche links/rechts/mittig, knorrige flache Büsche und einzelne Kiefern im Mittelgrund, Nadelwald am Hang, drei gestaffelte Bergketten mit Luftperspektive, Wolkenhimmel.
- **Vier Kulissen im Wechsel pro Runde**: Herbst im Hochtal (goldenes Gras, Espen, Bachlauf), Sommer unter den Gipfeln (grün, Wildblumen), Wintertag im Schnee, Schneereste im Vorfrühling.
- **Ziele**: Wildtruthähne mit Schwanzfächer und Flügelschlag, Ergebnis als Schild am Körper. Flugrichtung wechselt je Batterie: von links, von rechts, aus den mittleren Büschen auseinander.
- **Richtig**: Federwolke, Leuchtring, Funken. **Falsch**: Truthahn sinkt schlaff ab.
- **Waffe**: Bockflinte aus der Ich-Perspektive, folgt dem Fadenkreuz, Rückstoß, Mündungsblitz.

### 7.2 Schneeballschlacht (`js/scenarios/snow.js`)

- **Kulisse**: flämisches Winterdorf nach Brueghel d. J. – fahl-gelblicher Himmel (Variante: Abenddämmerung), zugefrorener Flusslauf mit Schlittschuhläufern, Backstein- und Lehmhäuser mit verschneiten Dächern und Kaminrauch, Kirche, Kopfweiden, kahle Bäume mit Krähen, Vogelfalle, Zaun, leichter Schneefall, erhöhter Standpunkt.
- **Ziele**: Kinder tauchen hinter Zaun, Schneehaufen und Hausecken auf; das Ergebnis steht auf der Wollmütze.
- **Richtig**: Kind lacht und kippt nach hinten in den Schnee (Schneewolke). **Falsch**: Kind guckt ulkig (schielt, Zunge) und duckt sich weg.

### 7.3 Schnittstelle für neue Szenarien

Ein Szenario ist eine Klasse mit dieser Schnittstelle (Vorbild: `turkey.js`):

```js
class Scenario {
  constructor(engine, { tempo, lead, variant })
  sway      // { yaw, pitch } Kameraschwenk mit der Maus
  shot      // { speed, cooldown, range, radius, aimDistance, offset, orient, makeMesh() }
  targets   // [{ center: Vector3, radius, hittable, data, state, … }]
  build()                 // Kulisse aufbauen, Kamera setzen
  spawnWave(labels)       // labels: [{ text, correct?, … }] → je Eintrag ein Ziel
  resolve(target, outcome)// 'correct' | 'wrong' | 'lock' (Spielart 2: Ziel anhalten)
  dismiss()               // übrige Ziele verschwinden lassen
  waveDone()              // true, wenn kein Ziel mehr aktiv ist
  update(dt, rawDt)       // Animation; ruft onEscape(target) für durchgelassene Ziele
  groundAt(x, z)          // optional: Bodenhöhe für Geschosseinschläge
  onShoot(), onGroundHit()// optional: Effekte
}
```

Registrierung in `SCENARIOS` in `js/main.js` (Eintrag mit `cls`). Spiellogik, Anzeige und
Statistik bleiben unverändert.

## 8 Architektur und Daten

```
index.html            Bildschirme: Menü, Lernraster, Auswertung, Spiel (HUD)
css/style.css
js/main.js            Menü, Lernraster, Auswertung, Rundenstart
js/tasks.js           Zahlenräume, Aufgabentöpfe, Distraktoren, Schwächewert
js/session.js         Runde: Auswahl, Wiedervorlage, Endkriterium, Empfehlung
js/play.js            Spielablauf: Batterien, Trefferauswertung, Rückmeldung
js/engine.js          Renderer, Zielen, Geschosse, Partikel, Beschriftungen
js/audio.js           Hinweistöne (WebAudio, synthetisch)
js/store.js           Profile und Lernstand (localStorage, Export/Import)
js/scenarios/*.js     Szenarien
vendor/               three.js r170 (MIT-Lizenz)
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

Der Stand wurde mit Playwright (Chromium, Software-Rendering) durchgespielt: Menü, beide
Szenarien in allen Kulissen, Treffer per Mausklick, vollständige Runde bis zur Auswertung,
Speicherung der Empfehlung, Spielart 2 mit Tastatureingabe, Game Over nach fünf
durchgelassenen Zielen. Nicht geprüft: Bildrate und Spielgefühl auf echter Grafikhardware,
Tonausgabe, Profil-Export/-Import per Dateidialog.

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
- **Grafikausbau** der vorhandenen Szenarien (Modelle, Texturen, Kulissenwechsel innerhalb einer Runde).
- **ADHS-Feinjustierung** (Reizreduktion, Pausenhinweise, ruhiger Modus).
- **Automatisierte Tests und Veröffentlichung** (GitHub Pages).

## 10 Fachliche Einordnung und Hinweise

- **Stand der Mathematikdidaktik**: Das 1×1 wird heute nicht als reine Reihe auswendig gelernt, sondern über **Kernaufgaben** (1·, 2·, 5·, 10·, teils Quadrataufgaben) und daraus **abgeleitete** Aufgaben erarbeitet; die Automatisierung folgt dem Verständnis (Gaidoschik 2014; Padberg & Benz, *Didaktik der Arithmetik*; Krauthausen, *Einführung in die Mathematikdidaktik*). Dieses Spiel deckt die Phase der **Automatisierung** ab und ersetzt die Erarbeitung nicht. Die „Königsaufgaben“ entsprechen den Kernaufgaben; eine Ableitungshilfe (z. B. „6×7 = 5×7 + 7“ nach einem Fehler) wäre die fachlich naheliegende Ergänzung.
- **Aufgabenschwierigkeit**: Die Liste „Schwierige Aufgaben“ folgt dem Problemgrößeneffekt der kognitiven Arithmetik (Ashcraft 1992; Campbell & Graham 1985). Die Distraktoren bilden die dort beschriebenen Reihenfehler (operand errors) nach.
- **Wiederholung**: Die Wiedervorlage innerhalb der Runde ist eine Kurzform der Lernkartei (Leitner 1972). Über Tage verteiltes Wiederholen ist wirksamer und als Erweiterung vorgesehen.
- **ADHS**: Unmittelbare, häufige Rückmeldung und kurze Einheiten entsprechen den gängigen Empfehlungen (Barkley; Sonuga-Barke zur Verzögerungsaversion). Zu beachten: Zeitdruck (Spielart 2, 3 s) kann bei einem Teil der Kinder Fehler und Frust erhöhen; deshalb ist die Zeit einstellbar. Sinnvoll ist, die Wirkung am Kind zu beobachten und nicht von vornherein die schärfste Einstellung zu wählen.
- **Inhalte**: Jagd- und Kriegsszenarien (Flinte, Tieffliegerangriff) sind für ein Kinder-Lernspiel eine bewusste Entscheidung des Auftraggebers. Für eine Weitergabe an Dritte (Schule, Therapie) sollte die Altersangemessenheit je Szenario geprüft und die Szenarioauswahl ggf. einschränkbar gemacht werden.
- **Bildvorlagen**: Gemälde und Fotos dienten als Stilreferenz. Es wurden keine fremden Bilddateien übernommen; alle Grafiken werden zur Laufzeit erzeugt.
