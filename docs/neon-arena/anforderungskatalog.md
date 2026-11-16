# Neon-Arena – Anforderungskatalog

| | |
|---|---|
| **Stand** | 2026-11-16, Entwurf 2 (Entscheidungen des Auftraggebers eingearbeitet) |
| **Szenario-ID** | `neonarena` (3D, three.js, Schnittstelle nach `spec.md` 7.3) |
| **Gehört zu** | Issue #18; Sprachausgabe in #19 und #20; gemeinsame Basis mit #4 |
| **Schlüsselwörter** | MUSS / SOLL / KANN im Sinne von RFC 2119, Kurzform **M** / **S** / **K** |

Alle Zahlenwerte sind **Startwerte zum Abstimmen**. Sie stehen zusätzlich gesammelt in
[`README.md`](README.md), Abschnitt „Parameter“, und sind dort die maßgebliche Quelle.

## 0 Entscheidungen des Auftraggebers

| Nr. | Frage | Entscheidung |
|---|---|---|
| E-1 | Schaden durch falsche Boxen | **Gestrichen.** Falsche Boxen, die die Theke erreichen, lösen sich folgenlos auf. Nur die **richtige** Box verursacht bei Ankunft Schaden. |
| E-2 | Leben | **Nur der Dart-Vorrat** ist das Leben. Keine zusätzlichen Herzen. |
| E-3 | Belohnung | **Zwei Belohnungszonen** (fern: 5 Darts, nah: 3 Darts). |
| E-4 | Wiederaufladung | **Ballon und Blase** gibt es beide; beide laden Darts nach. Ballon: +2, Blase: +3 (schwerer zu treffen). Sie wechseln sich ab (siehe A8). |
| E-5 | Basis | **Gemeinsame Basis mit Issue #4** (Luftgewehr-Schießstand): Kabine, Theke, Bahnen, Blaster-Overlay, Munition. |
| E-6 | Blaster | **Zwei Ballistikprofile:** *Highspeed* und eine *schwächere* Variante. |
| E-7 | Aufbau | **Schießbahn mit 5 oder 6 parallelen Bahnen**; die Boxen **rollen** wie bei einem Scheibenzug geradlinig auf den Spieler zu. |
| E-8 | Sprachausgabe | Aufgabe („6 mal 8 ist?“) und Ergebnis („48“ mit positivem Signal) werden gesprochen; Option im Hauptmenü; für alle Spielarten. Eigene Issues #19 und #20. |

## 1 Spielablauf in Kürze

1. Aufgabe wird eingeblendet (und optional gesprochen, #19), danach starten die Boxen.
2. Auf **5 oder 6 parallelen Bahnen** rollt je eine Box mit einem Ergebnis auf der Vorderseite auf die Theke zu.
3. Der Spieler schießt mit Schaumpfeil-Blaster auf die Box mit dem richtigen Ergebnis. Der Dart fliegt auf einer Parabel.
4. Treffer in der **fernen Zone**: +5 Darts, in der **nahen Zone**: +3 Darts. Aus der Box steigt ein **Ballon** (+2) oder eine **Blase** (+3), die sich mit einem weiteren Schuss abschießen lässt.
5. Erreicht die **richtige** Box die Theke, explodiert sie: −3 Darts. Falsche Boxen lösen sich folgenlos auf.
6. Jeder Schuss verbraucht einen Dart. Ist Vorrat **und** Magazin leer: Game Over.

## 2 Anforderungen

### A  Spielregeln und Lernlogik

| Nr. | Anforderung | Prio |
|---|---|---|
| A1 | Szenario `neonarena` in `SCENARIOS` (`js/main.js`), Datei `js/scenarios/neonarena.js`, Schnittstelle 7.3. Spielarten 1 und 3 (Aufdruck = Ergebnis bzw. Faktor); Spielart 4 mischt nur diese beiden | M |
| A2 | Erster Versuch zählt (5.1); Runde, Auswertung, Etappen (5.6), Empfehlung und Statistik unverändert nutzen | M |
| A3 | Anzahl Bahnen = Anzahl Antworten je Batterie, einstellbar **5 oder 6** (Standard 5). Der Distraktor-Generator in `js/tasks.js` liefert dafür n−1 plausible falsche Ergebnisse | M |
| A4 | Zwei Belohnungszonen nach **Abschussposition** der richtigen Box: Restweg ≥ 50 % = fern = **+5**, sonst nah = **+3**. Grenze und Beträge als Konstanten | M |
| A5 | **Reaktionszeit** = Zeit von Boxstart (`round.t0` in `Play._launch`) bis zum Abschuss. Sie wird als Antwortzeit in die vorhandene Statistik geschrieben (kein neues Schema) | M |
| A6 | Jeder Schuss verbraucht 1 Dart (Treffer, Fehlschuss, Falschtreffer gleich). Ein richtiger Treffer bringt netto +4 bzw. +2 | M |
| A7 | **Schaden nur durch die richtige Box:** erreicht sie die Theke → Explosion, −3 Darts, Gleichung neutral einblenden, Aufgabe kehrt bald wieder (5.1). Falsche Boxen erreichen die Theke folgenlos (Auflösung ohne Knall) | M |
| A8 | Bei jedem richtigen Treffer entsteht abwechselnd **Ballon** (+2) und **Blase** (+3) (Reihenfolge Ballon, Blase, Ballon, …). Beide tragen die vollständige Gleichung, Lebensdauer ca. 4 s (Blase ca. 6 s), Ablauf ohne Strafe. Einstellung „beide gleichzeitig“ als KANN | M |
| A9 | Falsche Box getroffen: Box zerplatzt wirkungslos, richtige Gleichung neutral einblenden, zählt als Fehler; nur der verschossene Dart geht verloren | M |
| A10 | **Dart-Vorrat als Leben:** Start 12, Obergrenze 30; Vorrat 0 und Magazin leer → Game Over (Anzeige als Dart-Leiste statt Herzen). Keine Herzen | M |
| A11 | Anflugdauer aus Tempo-Einstellung (gemütlich 11 s / normal 8 s / flott 5,5 s) | M |
| A12 | Adaptive Anflugdauer: mindestens 1,5 × persönliche Median-Antwortzeit der Aufgabe (Unter- und Obergrenze) | S |
| A13 | „Vorhalten nötig: nein“ → Geschoss praktisch verzögerungsfrei und ohne Abfall (wie in den anderen Szenarien) | M |
| A14 | Einstellung „Entspannt“: unbegrenzte Munition, Explosion ohne Verlust, nur Rückmeldung | S |
| A15 | Spielart 2 (Treffen & tippen): Box hält an, übrige Szene in Zeitlupe | K |
| A16 | Strafe trifft Untätigkeit, nicht die falsche Antwort (vereinbar mit „Fehler sind Information, keine Strafe“, spec.md 1) | M |

### B  Schießbahn und Szene (gemeinsame Basis mit #4)

| Nr. | Anforderung | Prio |
|---|---|---|
| B1 | **Bahnmodell:** 5 oder 6 parallele Bahnen, durch niedrige Trennwände abgeteilt, Bahnnummern über jeder Bahn. Länge ca. 30 Einheiten, Bahnbreite so, dass jede Box bei Ankunft vollständig lesbar bleibt | M |
| B2 | **Scheibenzug-Prinzip:** Jede Box steht auf einem kleinen Wagen auf einer Schiene in der Bahnmitte und rollt mit konstanter Geschwindigkeit auf die Theke zu (Räder drehen sich). Kein Schlingern, keine Seitenbewegung | M |
| B3 | Beschleunigungsprofile (z. B. Anfahren, kurzes Verhalten) als Zusatz für „Vorhalten“ | K |
| B4 | Bodenmarkierung der Belohnungszonen: fern = grün, nah = gelb, direkt vor der Theke rot (Gefahrenzone) | M |
| B5 | Schießstand-Kabine mit Theke (z = 0), Blick geradeaus über alle Bahnen; feste Kamera, kein Schwenken (nur Zielneigung über das Overlay) | M |
| B6 | **Gemeinsame Basis mit #4** als Modul `js/scenarios/shared/shooting-range.js`: Kabine, Theke, Blaster-Overlay (SVG), Munition/Magazin/Nachladen, Dart-HUD, Bahnen- und Schienenmodell. `neonarena.js` und das spätere `fair.js` nutzen es gemeinsam | M |
| B7 | Entenband und Laufkasten aus #4 nutzen dasselbe Bahnmodell (Schiene bzw. Band) | S |
| B8 | Arena im Stil einer grellen 90er-Sportshow: Traversen, Neonröhren, Scheinwerferkegel, Glanzboden; Palette Magenta/Cyan/Gelb/Orange, hoher Kontrast zu den Boxen | M |
| B9 | Aufdruck mind. etwa 35 px Schrifthöhe bei 1080p (7.4.4); Box wächst perspektivisch mit der Nähe; auch bei 6 Bahnen am Rand und in der Ferne lesbar | M |
| B10 | Eigene Pixeltextur für die Boxen, keine Texturen oder Modelle aus Fremdspielen | M |
| B11 | `intermission()` (5.6): Lichtshow (Verdunkeln, Scheinwerferwechsel), danach dauerhafte Veränderung (Lichtstimmung, Tribüne füllt sich) | S |

### C  Blaster und Ballistik

| Nr. | Anforderung | Prio |
|---|---|---|
| C1 | **Zwei Profile:** *Schwach* (Feder-Blaster): niedrige Mündungsgeschwindigkeit, deutlicher Bogen, großes Magazin, kurzes Nachladen. *Highspeed* (Elite-Blaster): hohe Mündungsgeschwindigkeit, flache Bahn, kleines Magazin, längeres Nachladen, stärkerer Rückstoß. Auswahl im Spielstart, Taste zum Wechseln | M |
| C2 | Das dritte SVG-Modell (Trommel) wird zunächst nicht angeboten | K |
| C3 | Wurfparabel mit Schwerkraft, spielerisch skaliert (reale Schaumpfeile: grob 10–25 m/s; vor Verwendung messen bzw. nachschlagen) | M |
| C4 | Optional quadratischer Luftwiderstand je Profil | S |
| C5 | Festschritt-Simulation (z. B. 120 Hz, Teilschritte); Ergebnis unabhängig von der Bildrate; Voraussetzung für die von Hand getakteten Tests (8.2) | M |
| C6 | **Zielauflösung:** Aus Fadenkreuz und Entfernung wird der Abschusswinkel in geschlossener Form (flache Lösung der Wurfgleichung) berechnet, damit „dorthin zielen, wo das Fadenkreuz ist“ gilt; die Bewegung der Box (Anflug) bleibt dem Spieler überlassen | M |
| C7 | Sichtbare Leuchtspur; auf Wunsch gestrichelter Bogen als Lernhilfe | S |
| C8 | Geschosse im Objekt-Pool, begrenzte Lebensdauer | S |
| C9 | `engine.js`: optionale Felder `shot.gravity`, `shot.drag`, `shot.step`; bestehende Szenarien bleiben unverändert | M |
| C10 | Magazin und Nachladen: automatisch bei leerem Magazin, Taste R; Nachladezeit je Profil. Nachladen verbraucht keinen Vorrat zusätzlich, es füllt das Magazin aus dem Vorrat | M |

### D  Kollisionserkennung

| Nr. | Anforderung | Prio |
|---|---|---|
| D1 | Pro Teilschritt **Strecke gegen Box (AABB/OBB, Slab-Verfahren)** mit Aufblähung um den Pfeilradius; kein Tunneling bei großem `dt` | M |
| D2 | Optionaler Zielhook `target.hitTest(a, b, r)` in `engine.js` neben dem Kugeltest | M |
| D3 | Trefferpunkt und -fläche liefern (Effekte, Aufprallton) | M |
| D4 | Pfeil ↔ Ballon/Blase (Kugel), Pfeil ↔ Arena (Boden, Wand, Trennwand, Theke) | S |
| D5 | Trümmer als reine Partikel (`fx.burst`), keine Rigid-Body-Physik | M |
| D6 | Einheitentests: Ballistik, Segmenttest (Streifschuss, Start im Körper, Tunneling bei dt = 0,1 s) | M |

### E  Ton

| Nr. | Anforderung | Prio |
|---|---|---|
| E1 | Schuss je Profil; Klangbausteine aus `sepe81/genai-simulations` übernehmen, an `audio.js` anpassen | M |
| E2 | Pfeifen im Flug: gefiltertes Rauschen plus kurzer Sinusgleiter, nach Distanz gedämpft, Panning nach Bahn (`PannerNode`); Doppler manuell über Frequenz | S |
| E3 | Aufprall: Saugnapf-Plopp auf Box, Wand, Boden; richtig/falsch unterscheidbar | M |
| E4 | Nachladen (Magazin-Klick, Schieber, Spannen) je Profil; Leer-Klick | M |
| E5 | **Rollgeräusch** der Wagen auf den Schienen (tiefes Rumpeln, leises Klackern an Schienenstößen), mit Nähe lauter und höher; Zeitdruck hörbar | S |
| E6 | Explosion (Rauschen mit abfallendem Tiefpass plus Tiefbass), Ballon-Quietscher, Blasen-Plopp, Münz-/Zählton für +2, +3, +5 | M |
| E7 | Stimmen begrenzen (z. B. 8), Limiter am Master, Kurzhall aus synthetischer Impulsantwort | S |
| E8 | Alle Töne synthetisch, ohne Audiodateien; Samples nur mit klarer Lizenz (CC0), nachladend | M |
| E9 | Lautstärke und Ton an/aus über die bestehende Einstellung; Nutzergeste für `AudioContext` | M |

### F  Sprachausgabe (siehe #19 und #20)

| Nr. | Anforderung | Prio |
|---|---|---|
| F1 | Aufgabe wird beim Einblenden gesprochen („6 mal 8 ist?“), siehe #19 | M |
| F2 | Bei richtigem Treffer wird das Ergebnis gesprochen („48“) mit positivem Signal, siehe #19 | M |
| F3 | Abhakbare Option **Sprachausgabe** im Hauptmenü, für alle Spielarten und Szenarien, siehe #20 | M |
| F4 | Boxen starten erst nach Ende der Ansage; die Reaktionszeit (A5) beginnt zu diesem Zeitpunkt | M |

### G  Grafik und Technik

| Nr. | Anforderung | Prio |
|---|---|---|
| G1 | three.js (vorhanden), keine zweite 3D-Bibliothek | M |
| G2 | Blaster als **SVG-Overlay** aus sepe81 (Neigung folgt der Maus, Rückstoß, Mündungsfeuer); Pfeil startet an der projizierten Mündungsposition. Später K: 3D-Nachbau | M |
| G3 | Leuchten über emissive Materialien und Sprites; Bloom nur optional | S |
| G4 | Instanzierung für Trümmer, Neonröhren, Lichtkegel; Ziel 60 Bilder/s auf einem Büro-Laptop mit integrierter Grafik | S |
| G5 | Keine Build-Schritte, ES-Module, Bibliotheken lokal in `vendor/` | M |
| G6 | Playwright-Test (8.2): komplette Runde, Zonen 5/3, Ballon/Blase, Explosion (nur richtige Box), Game Over; Engine von Hand getaktet | M |

### H  Barrierefreiheit, ADHS, Sicherheit

| Nr. | Anforderung | Prio |
|---|---|---|
| H1 | **Fotosensibilität:** höchstens 3 Blitze pro Sekunde, keine großflächigen schnellen Helligkeitswechsel (WCAG 2.3.1); Neonflackern klein und langsam | M |
| H2 | `prefers-reduced-motion` und ruhiger Modus (#12): kein Wackeln, weniger Partikel, gedämpfte Farben, Explosion als Verblassen | M |
| H3 | Feste Blickrichtung, mäßiges Sichtfeld (Bewegungsübelkeit) | M |
| H4 | Zeitdruck einstellbar (Tempo, „Entspannt“); Zonen sichtbar markiert | M |
| H5 | Altersangemessen: Schaumpfeile, comicartige Explosionen, kein Blut | M |

### I  Rechtliches

| Nr. | Anforderung | Prio |
|---|---|---|
| I1 | **Lizenz klären:** README von `sepe81/genai-simulations` nennt MIT, eine LICENSE-Datei fehlt. Vor Übernahme von SVGs und Klangbausteinen Urheberhinweis bestätigen, danach Copyright- und Lizenzhinweis in README und `NOTICE` aufnehmen | M |
| I2 | **Marken:** „Nerf“ (Hasbro), „American Gladiators“, „Minecraft“ nicht in Oberfläche, veröffentlichten Dateinamen oder Grafiken; neutral „Schaumpfeil-Blaster“, „Neon-Arena“, „Magic Box“ | M |
| I3 | `spec.md` ergänzen (neuer Abschnitt 7.5, Anpassung 5.2/5.3/9.1), README-Stand, CHANGELOG | M |

## 3 Abwägung der Bibliotheken

### Kollision und Physik

| Option | Umfang | Bewertung | Entscheidung |
|---|---|---|---|
| **Eigene Tests** (Segment/AABB/OBB, Slab-Verfahren; Kugel/Segment) | ca. 100 Zeilen | deterministisch, testbar, genau passend (Ericson 2005) | **empfohlen** |
| three.js `Raycaster` | vorhanden | für den Zielstrahl im Einsatz; weniger Kontrolle über Trefferfläche | ergänzend |
| Rapier (WASM) | ≈ 1,5–2 MB | überdimensioniert für wenige Würfel und Pfeile | verwerfen |
| cannon-es | ≈ 150 kB | schwächer gepflegt, keine kontinuierliche Kollision | verwerfen |
| ammo.js | mehrere MB | zu schwer | verwerfen |
| Matter.js | 2D | bei sepe81 nur im Turmmodus | nicht übernehmen |
| three-mesh-bvh | ≈ 50 kB | nur bei komplexer Geometrie | nicht nötig |

Größenangaben sind Näherungswerte.

### Ballistik

Eigene Integration (Festschritt, optional quadratischer Luftwiderstand) und eigene geschlossene Zielauflösung; eine Bibliothek bringt hier nichts.

### Ton

| Option | Bewertung | Entscheidung |
|---|---|---|
| **Eigenes WebAudio-Synthese-Gerüst** (`audio.js` plus sepe81-Bausteine) | keine Dateien, kleine Last, volle Kontrolle | **empfohlen** |
| ZzFX / jsfxr | sehr klein, schnell für Bonusklänge | optional |
| Howler.js | sinnvoll erst bei Samples | nur bei Samples |
| Tone.js | > 150 kB, auf Musik ausgelegt | verwerfen |
| Samples (CC0) | realistischer, aber Ladezeit und Lizenznachweis | nachrangig |

### Sprachausgabe

Siehe #19: Web Speech API (`speechSynthesis`) als Standard, vorab erzeugte Clips als möglicher Ersatz.

### Grafik

three.js allein. Babylon.js und PlayCanvas würden eine zweite Engine neben `engine.js` und `engine2d.js` bedeuten.

## 4 Abnahmekriterien

- [ ] Komplette Runde (10 Aufgaben × 3) lässt sich spielen; jede Etappe löst eine Zwischenrunde aus.
- [ ] 5 und 6 Bahnen funktionieren; Boxen rollen geradlinig auf den Schienen.
- [ ] Abschuss in der fernen Zone liefert genau +5, in der nahen genau +3; jeder Schuss kostet 1 Dart.
- [ ] Nur die **richtige** Box kostet bei Ankunft 3 Darts; falsche Boxen erreichen die Theke folgenlos.
- [ ] Ballon (+2) und Blase (+3) erscheinen im Wechsel und laden Darts nach.
- [ ] Highspeed und Schwach unterscheiden sich messbar in Flugzeit und Abfall; beide treffen bei korrektem Zielen.
- [ ] Ergebnis unabhängig von der Bildrate (Test bei 30 und 144 Hz); kein Durchfliegen bei großem `dt`.
- [ ] Vorrat 0 und Magazin leer beendet die Runde; keine Herzen.
- [ ] Keine Blitzfolge über 3 Hz; `prefers-reduced-motion` wird beachtet.
- [ ] Lizenzhinweis zur sepe81-Übernahme eingetragen; keine geschützten Namen in der Oberfläche.

## 5 Literatur

- Ericson, C. (2005): *Real-Time Collision Detection*.
- Millington, I. (2010): *Game Physics Engine Development*.
- Fiedler, G. (2004): *Fix Your Timestep!*
- Farnell, A. (2010): *Designing Sound*.
- Levitt, H. (1971): Transformed up-down methods in psychoacoustics.
- Csikszentmihalyi, M. (1990): *Flow*.
- Fitts, P. M. (1954); Hick, W. E. (1952).
- Hull (1932); Kivetz et al. (2006) zur Zielnähe-Rückmeldung (spec.md 10).
- W3C WCAG 2.3.1 „Three Flashes or Below Threshold“.
