# Neon-Arena – Schaumpfeil-Schießbahn (Planung und Designvorgaben)

| | |
|---|---|
| **Szenario-ID** | `neonarena` |
| **Art** | 3D-Szenario (three.js), Schnittstelle nach [`spec.md`](../../spec.md) 7.3 |
| **Status** | **Geplant, nichts umgesetzt.** Dieses Dokument beschreibt Ziel, Entscheidungen und Vorgaben. |
| **Stand** | 2026-11-16 |
| **Issues** | Szenario [#18](https://github.com/LEdez-man/1x1-fun2learn/issues/18) · Sprachausgabe [#19](https://github.com/LEdez-man/1x1-fun2learn/issues/19), [#20](https://github.com/LEdez-man/1x1-fun2learn/issues/20) · gemeinsame Basis [#4](https://github.com/LEdez-man/1x1-fun2learn/issues/4) |
| **Zuständig** | `sepe81` (Autor des Quellspiels, Issue #18 zugewiesen) |
| **Anforderungen** | [`anforderungskatalog.md`](anforderungskatalog.md) (maßgeblich, nummeriert A1 … I3) |

**Lesehinweis.** Das Dokument hat zwei Zielgruppen. Abschnitte 1–6 und 9–10 erklären das Vorhaben für Menschen. Abschnitt 7
(Parameter, Zustände, Schnittstellen) und Abschnitt 8 (Arbeitsregeln für Werkzeuge) sind so geschrieben, dass sie ein
KI-Assistent oder ein Skript ohne Rückfrage auswerten kann. Verbindlichkeit nach RFC 2119: **MUSS / SOLL / KANN**
(im Katalog M / S / K).

---

## 1 Worum es geht

Ein Lernszenario für das 1×1 in Form einer **Schießbahn**: Der Spieler steht in einer Schießbude hinter einer Theke. Auf **5 oder 6
parallelen Bahnen** rollt je eine würfelförmige „Magic Box“ wie ein Scheibenzug auf Schienen auf ihn zu. Jede Box trägt ein Ergebnis.
Mit einem **Schaumpfeil-Blaster** (Nerf-Stil) muss er die Box mit dem richtigen Ergebnis treffen, bevor sie die Theke erreicht.

- **Rechtzeitig getroffen:** Darts gewinnen (5 in der fernen, 3 in der nahen Zone).
- **Ballon oder Blase** entsteht aus der getroffenen Box; ein zweiter Schuss darauf lädt weitere Darts nach.
- **Richtige Box erreicht die Theke:** Explosion, Darts gehen verloren.
- Der **Dart-Vorrat ist das Leben.** Ist er und das Magazin leer, endet die Runde.
- Die Darts fliegen auf einer **Parabel** (Ballistik), die Belohnung hängt von der **Reaktionszeit** ab.
- Optik: grelle Sport-Show-Arena der 1990er (Neon, Traversen, Scheinwerfer). Nur Stimmung, keine Marken oder Originalgrafiken.

Das Szenario ersetzt kein anderes; es ergänzt Truthahn-Skeet (3D) und Schneeballschlacht (2D). Aufgabenlogik, Runden, Etappen (5.6),
Auswertung und Statistik bleiben unverändert (`js/play.js`, `js/session.js`).

## 2 Herkunft und Vorgehen

Die Planung entstand im Dialog mit dem Auftraggeber (Repository-Eigner) in drei Schritten.

1. **Ausgangsidee.** Das vorhandene Spiel *Nerf Gun Shooting Gallery* von sepe81 sollte für eine neue Aufgabe genutzt werden: die
   bestehenden Blaster in einem 3D-Schießstand, Ziele, die wie „Magic Boxes“ auf den Spieler zurasen, Gewinn von 3 oder 5 Darts nach
   Reaktionszeit, Ballistik, Ballon oder Blase als Zusatzbonus, Geräusche (Pfeifen, Nachladen), Arena im Stil von *American Gladiators*.
2. **Sichtung.** Geprüft wurden das Quellspiel (`sepe81/genai-simulations`, `src/nerf-gun/index.html`, 1599 Zeilen, Matter.js, SVG,
   WebAudio) und die eigene Engine (`js/engine.js`, `js/audio.js`, `js/play.js`). Ergebnis: Das Quellspiel ist 2D mit SVG-Blastern und
   synthetischem Ton; die Engine kennt nur geradlinige Geschosse und Kugeltreffer. Daraus folgen die Anforderungen an Ballistik und
   Kollision (Katalog C, D). Eine Lizenzdatei fehlt im Quellrepository (Katalog I1).
3. **Entscheidungen.** Der Auftraggeber beantwortete sechs offene Fragen und ergänzte den Aufbau (Bahnen) und die Sprachausgabe.
   Sie stehen im Entscheidungsprotokoll (Abschnitt 3).

Vorgehensregeln, die dabei galten und weitergelten:

- **Planen vor Bauen:** erst Issue und Katalog, dann Umsetzung.
- **Eigene Vorgaben des Spiels haben Vorrang** (Leitlinien in `spec.md` 1, 5.3, 10), z. B. „Fehler sind Information, keine Strafe“.
- **Stand der Technik und Fachquellen** werden benannt; Annahmen, die nicht geprüft sind, stehen als solche da (Abschnitt 10).
- **Keine geschützten Namen oder fremden Grafiken** in veröffentlichten Teilen.

## 3 Entscheidungsprotokoll

| Nr. | Frage | Entscheidung | Wirkung im Katalog |
|---|---|---|---|
| E-1 | Schaden durch falsche Boxen? | **Gestrichen.** Nur die richtige Box schadet bei Ankunft; falsche lösen sich folgenlos auf. | A7, A9, A16 |
| E-2 | Leben als Herzen oder als Darts? | **Nur Dart-Vorrat**, keine Herzen. | A10 |
| E-3 | Belohnung 3 oder 5 Darts? | **Zwei Zonen** (fern 5, nah 3). Für Kinder leichter erfassbar als eine stufenlose Kurve. | A4, B4 |
| E-4 | Ballon oder Blase? | **Beide.** Ballon +2, Blase +3 (kleiner, wackelnd, schwerer zu treffen). Im Wechsel, nicht gleichzeitig; „gleichzeitig“ bleibt KANN. | A8 |
| E-5 | Zusammenhang mit #4? | **Gemeinsame Basis** `js/scenarios/shared/shooting-range.js`. | B6, B7 |
| E-6 | Blaster-Umfang? | **Zwei Ballistikprofile:** Highspeed und schwächer. Das dritte SVG-Modell (Trommel) bleibt zunächst unbenutzt. | C1, C2 |
| E-7 | Wie bewegen sich die Ziele? | **5 oder 6 parallele Bahnen**, Boxen **rollen** auf Schienen wie ein Scheibenzug geradeaus auf den Spieler zu. | A3, B1, B2 |
| E-8 | Sprachausgabe? | Aufgabe („6 mal 8 ist?“) und richtiges Ergebnis („48“ mit positivem Signal) werden gesprochen; abhakbare Option im Hauptmenü; für alle Spielarten. In **zwei Issues** geteilt. | F1–F4, #19, #20 |

**Annahmen der Dokumentation (bitte bestätigen oder korrigieren):**

- Zuordnung der Profile: *Schwach* = Feder-Blaster (Modell 1), *Highspeed* = Elite-Blaster (Modell 2).
- Ballon und Blase wechseln sich ab (Ballon, Blase, Ballon, …) statt zufällig aufzutreten.
- Bei 6 Bahnen gibt es 6 Antworten (ein weiterer Distraktor), nicht eine leere Bahn.
- Sprachausgabe ist standardmäßig **aus**.

## 4 Spielbeschreibung

### 4.1 Szene

```
              Hintergrund (Arena: Traversen, Neonröhren, Scheinwerfer)
   ┌─────────┬─────────┬─────────┬─────────┬─────────┐
   │ Bahn 1  │ Bahn 2  │ Bahn 3  │ Bahn 4  │ Bahn 5  │   Trennwände, Bahnnummern
   │   ▣     │         │   ▣     │    ▣    │         │   Box auf Wagen, rollt nach unten
   │  fern (grün)  Restweg ≥ 50 %  →  5 Darts           │
   │         │   ▣     │         │         │    ▣    │
   │  nah (gelb)   Restweg < 50 %  →  3 Darts           │
   │  Gefahrenzone (rot)                                │
   ├─────────┴─────────┴─────────┴─────────┴─────────┤
   │ THEKE (z = 0)         Blaster-Overlay, Dart-Leiste │
   └──────────────────────────────────────────────────┘
```

Feste Kamera, Blick geradeaus. Der Spieler zielt mit der Maus (Fadenkreuz und Neigung des Blasters), Linksklick schießt, `R` lädt nach,
Esc pausiert.

### 4.2 Ablauf einer Batterie

1. Aufgabe wird eingeblendet (und optional gesprochen, #19). Pause vor dem Start der Boxen: `max(1,25 s, Sprechdauer + 0,3 s)`.
2. Boxen starten gleichzeitig am fernen Ende der Bahnen. Mit dem Start beginnt die Zeitmessung (`round.t0`).
3. Der Spieler schießt. Jeder Schuss verbraucht 1 Dart.
4. Auflösung nach den Regeln in 4.3. Danach Pause (`OUTRO`), nächste Batterie, Etappenlogik nach 5.6.

### 4.3 Regeltabelle

| Ereignis | Wirkung auf Vorrat | Weitere Folgen |
|---|---|---|
| Schuss (immer) | −1 | Magazin −1 |
| richtige Box getroffen, Restweg ≥ 50 % | +5 | Box platzt, Ballon oder Blase steigt auf, Cue, Ergebnis wird gesprochen |
| richtige Box getroffen, Restweg < 50 % | +3 | wie oben |
| falsche Box getroffen | 0 | Box zerplatzt, richtige Gleichung neutral einblenden, zählt als Fehler |
| richtige Box erreicht die Theke | −3 | Explosion, Gleichung neutral einblenden, Aufgabe kehrt bald wieder |
| falsche Box erreicht die Theke | 0 | löst sich ohne Knall auf |
| Ballon getroffen | +2 | platzt |
| Blase getroffen | +3 | platzt |
| Ballon oder Blase läuft ab | 0 | keine Strafe |
| Vorrat 0 und Magazin leer | | Game Over, Auswertung |

Die **Restweg-Zone** wird im Moment des **Abschusses** bestimmt (Position der Box beim Auslösen), nicht beim Aufprall. Das Gleiche gilt für
die Reaktionszeit. Damit wird die Flugzeit des Darts weder bestraft noch belohnt.

Der Vorrat ist durch den Höchstwert 30 gedeckelt. Ein richtiger Treffer bringt netto +4 (fern) bzw. +2 (nah), weil der Schuss selbst
einen Dart kostet.

### 4.4 Blaster

| Profil | Modell (SVG aus sepe81) | Mündungsgeschwindigkeit | Bahn | Magazin | Nachladen | Rückstoß |
|---|---|---|---|---|---|---|
| **Schwach** | Feder-Blaster | niedrig | deutlicher Bogen | 6 | 0,8 s | gering |
| **Highspeed** | Elite-Blaster | hoch | flach | 4 | 1,4 s | stark |

Der Highspeed-Blaster verzeiht Zielfehler beim Abfall, verlangt dafür aber häufigeres und längeres Nachladen. Der schwache Blaster
verlangt Höhenvorhalt, lädt dafür schneller nach. Die konkreten Zahlen stehen in Abschnitt 7.

### 4.5 Ballistik

Die Boxen rollen geradlinig auf den Spieler zu; ein seitliches Vorhalten entfällt. Schwierigkeit entsteht aus **Abfall** des Darts und
**Flugzeit** im Verhältnis zur Anflugzeit der Box. Der Spieler zielt auf die Box; die Engine rechnet den Abschusswinkel in geschlossener
Form (flache Lösung der Wurfgleichung) aus Fadenkreuz und Entfernung, sodass „zielen, wo das Fadenkreuz ist“ gilt. Ob der Dart die Box
trifft, entscheidet die Parabel gegen die weiterrollende Box. Die Einstellung „Vorhalten nötig: nein“ schaltet Abfall und Flugzeit praktisch ab.

Die Simulation läuft mit **festem Zeitschritt** (120 Hz, Teilschritte), damit das Ergebnis nicht von der Bildrate abhängt und die von
Hand getakteten Tests (spec.md 8.2) reproduzierbar sind. Siehe Fiedler (2004).

### 4.6 Ballon und Blase

| | Ballon | Blase |
|---|---|---|
| Aussehen | bunter Luftballon mit Gleichung | schillernde Seifenblase mit Gleichung |
| Größe | groß | klein |
| Bewegung | steigt gleichmäßig auf | schwebt langsam, driftet seitlich, wackelt |
| Lebensdauer | ca. 4 s | ca. 6 s |
| Gewinn | +2 Darts | +3 Darts |
| Ton | Quietscher, Knall | feines Plopp |

Didaktischer Zweck: Die vollständige Gleichung steht auf Ballon und Blase. Wer sie abschießt, liest sie noch einmal (Abruf und
Elaboration), die Belohnung wirkt dabei verstärkend.

### 4.7 Sprachausgabe (Kurzfassung, Einzelheiten in #19 und #20)

- Aufgabe beim Einblenden sprechen: „6 mal 8 ist?“ (Spielart 3: „40 geteilt durch 8 ist?“).
- Richtiger Treffer: positiver Cue-Ton (vorhandener `correct`-Klang), unmittelbar danach das Ergebnis: „48“.
- Falsch oder Zeit abgelaufen: richtige Gleichung **neutral** sprechen.
- Technik: Web Speech API (`speechSynthesis`), lokale deutsche Stimme bevorzugt; vorab erzeugte Clips als möglicher Ersatz.
- Option **Sprachausgabe** als Häkchen im Hauptmenü (Einstellungen, Schritt 5) und als Kurzschalter in der Kopfzeile; je Spieler gespeichert,
  Standard aus; wirkt in allen vier Spielarten und allen Szenarien (`js/play.js`, szenariounabhängig).
- Die Reaktionszeit beginnt erst **nach** der Ansage.

## 5 Technischer Entwurf

### 5.1 Neue und geänderte Dateien

| Datei | Änderung |
|---|---|
| `js/scenarios/neonarena.js` | **neu:** Klasse `NeonArenaScenario` (Schnittstelle 7.3) |
| `js/scenarios/shared/shooting-range.js` | **neu:** Kabine, Theke, Bahn- und Schienenmodell, Blaster-Overlay, Munition/Magazin, Dart-HUD; gemeinsam mit #4 (`fair.js`) |
| `js/engine.js` | optional: `shot.gravity`, `shot.drag`, `shot.step`; Zielhook `target.hitTest(a, b, r)`; bestehende Szenarien unverändert |
| `js/audio.js` | neue Klänge: Schuss je Profil, Pfeifen, Nachladen, Rollen, Explosion, Ballon, Blase, Zählton |
| `js/tasks.js` | Distraktoren für n = 5 oder 6 Antworten |
| `js/main.js` | Eintrag in `SCENARIOS`; Einstellung Bahnanzahl und Blaster-Profil |
| `js/speech.js` | **neu** (#19): Sprachausgabe-Modul |
| `js/play.js` | Sprachanbindung (#19, #20); Pause vor Zielstart verlängern |
| `js/store.js`, `data/profile.schema.json` | `settings.speech`, Blaster-Profil, Bahnanzahl (#20) |
| `assets/neonarena/` | Blaster-SVGs (aus sepe81, Lizenz klären), Pixeltextur der Box |
| `tests/` | Playwright-Tests und Einheitentests (Katalog D6, G6) |
| `spec.md`, `README.md`, `CHANGELOG.md` | Dokumentation nachziehen (Katalog I3) |

### 5.2 Anbindung an die Engine

`NeonArenaScenario` erfüllt die 3D-Schnittstelle aus spec.md 7.3 (`build`, `spawnWave`, `resolve`, `dismiss`, `waveDone`, `update`,
`onEscape`, optional `intermission`). Abweichungen und Ergänzungen:

- `shot` erhält `gravity`, `drag`, `step`; die Engine integriert Geschosse mit festem Schritt, wenn sie gesetzt sind.
- Ziele (Boxen) liefern `hitTest(a, b, r)` für den Segmenttest (Strecke gegen Box); fehlt der Hook, gilt der Kugeltest.
- `onEscape(target)` wird **nur** für die richtige Box aufgerufen, die die Theke erreicht (E-1). Falsche Boxen lösen sich im Szenario selbst auf.
- Vorrat und Magazin leben im Modul `shooting-range.js`; das Szenario meldet Game Over über den vorhandenen Weg (`play.js`).

### 5.3 Bibliotheken (Ergebnis der Abwägung)

| Bereich | Entscheidung | Verworfen |
|---|---|---|
| 3D | three.js r170 (vorhanden) | Babylon.js, PlayCanvas (zweite Engine) |
| Kollision | eigene Tests: Strecke gegen AABB/OBB (Slab-Verfahren), Kugel gegen Strecke | Rapier, cannon-es, ammo.js, Matter.js, three-mesh-bvh |
| Ballistik | eigene Festschritt-Integration, geschlossene Zielauflösung | Physikbibliothek |
| Ton | eigenes WebAudio-Gerüst (`audio.js` plus sepe81-Bausteine); ZzFX optional | Tone.js; Howler.js nur bei Samples |
| Sprache | Web Speech API; vorab erzeugte Clips später möglich | Cloud-TTS (Datenschutz, Kosten), Zahlwörter aus Segmenten |

Begründungen und Größenangaben stehen im Katalog, Abschnitt 3.

## 6 Gestaltung

- **Palette:** Magenta `#ff2bd6`, Cyan `#19e3ff`, Gelb `#ffe600`, Orange `#ff7a00` auf dunklem Blauviolett; Boxen heben sich durch
  hellen Körper und dunklen, groß gesetzten Aufdruck ab. Genaue Werte sind Vorschläge.
- **Arena:** Traversen mit Scheinwerfern, Neonröhren als Bahnbegrenzung, Glanzboden, angedeutete Tribüne.
- **Lesbarkeit vor Wirkung:** Aufdruck mindestens etwa 35 px Schrifthöhe bei 1080p (spec.md 7.4.4); die Box wächst perspektivisch.
- **Reizbegrenzung:** höchstens 3 Blitze pro Sekunde, kleines und langsames Flackern, `prefers-reduced-motion` und ruhiger Modus (#12).
- **Etappenübergang:** Lichtshow (Verdunkeln, Scheinwerferwechsel), danach dauerhaft veränderte Lichtstimmung und gefüllte Tribüne.
- **Ton:** kein Dauerlärm; Rollgeräusch der Wagen steigt mit der Nähe, Explosion ist kurz und nicht erschreckend laut.

## 7 Maschinenlesbare Vorgaben

Dieser Abschnitt ist maßgeblich für Zahlenwerte. Er ist YAML und kann unverändert in eine Konfigurationsdatei übernommen werden.
Alle Werte sind **Startwerte**; Änderungen hier ändern den Katalog (Abschnitt 2 dort) nicht, sondern konkretisieren ihn.

```yaml
scenario:
  id: neonarena
  engine: 3d
  interface: spec.md#7.3
  spielarten: [1, 3]          # Ergebnis treffen, Geteilt-Aufgaben; Spielart 4 mischt nur diese
  spielart_2: kann            # Treffen & tippen, Katalog A15

lanes:
  count_allowed: [5, 6]
  count_default: 5
  answers_equal_lanes: true   # Katalog A3, braucht n-1 Distraktoren
  length_units: 30
  motion: rolling_on_rail     # konstante Geschwindigkeit, kein Schlingern, keine Seitenbewegung
  zones:
    far:  { remaining_path_min: 0.5, reward_darts: 5, floor_color: green }
    near: { remaining_path_min: 0.0, reward_darts: 3, floor_color: yellow }
    danger: { floor_color: red }
  zone_evaluated_at: shot_release   # nicht beim Aufprall

box:
  size_units: 1.2
  travel_time_s: { gemuetlich: 11.0, normal: 8.0, flott: 5.5 }
  adaptive:
    enabled: soll                   # Katalog A12
    min_factor_of_median_answer_time: 1.5
  label: front_face_result          # Spielart 3: Faktor statt Ergebnis
  texture: own_pixel_art            # keine Fremdtexturen

economy:
  ammo_start: 12
  ammo_cap: 30
  cost_per_shot: 1
  correct_box_arrival_penalty: 3    # nur die richtige Box schadet
  wrong_box_arrival_penalty: 0
  wrong_box_hit_penalty_extra: 0    # nur der verschossene Dart
  game_over_when: { ammo: 0, magazine: 0 }
  hearts: false

bonus_objects:
  alternate: [balloon, bubble]
  balloon: { reward_darts: 2, lifetime_s: 4, size: large, motion: rise }
  bubble:  { reward_darts: 3, lifetime_s: 6, size: small, motion: drift_wobble }
  carries_equation: true
  simultaneous: kann

blasters:
  schwach:
    model_svg: feder-blaster
    muzzle_velocity: low          # Spielskala, an realen 10–25 m/s orientiert (prüfen)
    magazine: 6
    reload_s: 0.8
    cooldown_s: 0.35
    recoil: low
  highspeed:
    model_svg: elite-blaster
    muzzle_velocity: high
    magazine: 4
    reload_s: 1.4
    cooldown_s: 0.5
    recoil: high
  drag: optional                  # quadratischer Luftwiderstand, Katalog C4
  third_model_drum: unused

simulation:
  fixed_step_hz: 120
  aim_solution: closed_form_flat_arc
  collision: segment_vs_box_slab  # Strecke gegen AABB/OBB
  projectile_pool: true
  lead_off_behaviour: no_drop_no_delay   # Einstellung "Vorhalten nötig: nein"

measurement:
  reaction_time_from: round.t0            # Start der Boxen, nach der Ansage
  reaction_time_to: shot_release
  store_as: existing_answer_time          # kein neues Schema

speech:                                    # Einzelheiten #19, #20
  setting_key: settings.speech
  default: false
  scope: all_spielarten_all_scenarios
  announce_task: "{a} mal {b} ist?"        # Spielart 3: "{p} geteilt durch {q} ist?"
  announce_result_on_correct: "{result}"   # nach positivem Cue
  announce_on_wrong: neutral_full_equation
  intro_s: "max(1.25, speech_duration + 0.3)"
  voice: { lang: de-DE, prefer_local: true, rate: 0.9, pitch: 1.0 }

safety:
  max_flashes_per_s: 3
  reduced_motion: respect
  camera_motion: none
  content: foam_darts_comic_explosions_no_blood

legal:
  source_game: sepe81/genai-simulations#src/nerf-gun/index.html
  source_license_claimed: MIT         # README; keine LICENSE-Datei vorhanden
  source_license_confirmed: false     # MUSS vor Übernahme geklärt werden (Katalog I1)
  ui_names_neutral: [Neon-Arena, Schaumpfeil-Blaster, Magic Box]
  avoid_names: [Nerf, American Gladiators, Minecraft]
```

### 7.1 Zustandsautomat einer Batterie

```
idle ──_begin()──▶ intro ──(Ansage zu Ende ∧ ≥ 1,25 s)──▶ running ──waveDone()──▶ outro ──▶ idle
                    │                                         │
                    │ Etappe gewechselt                       ├─ Schuss: Magazin−1, Vorrat−1
                    └──────▶ inter ──(Dauer)──▶ intro         ├─ richtige Box getroffen → +5/+3, Bonusobjekt
                                                              ├─ falsche Box getroffen → Fehler
                                                              ├─ richtige Box an Theke → −3, Explosion
                                                              └─ Vorrat 0 ∧ Magazin 0 → gameover
```

`intro`, `running`, `outro`, `inter` entsprechen den Zuständen in `js/play.js` (`_begin`, `_launch`, `_endRound`).

### 7.2 Ereignisse und Rückmeldung

| Ereignis | Bild | Ton |
|---|---|---|
| Schuss | Mündungsfeuer, Rückstoß, Leuchtspur | Schuss je Profil |
| Dart im Flug | Leuchtspur | leises Pfeifen, nach Distanz gedämpft |
| Treffer richtig | Box platzt, Ballon/Blase steigt, Gleichung am Ziel | `correct`-Cue, Zählton (+3/+5), gesprochenes Ergebnis |
| Treffer falsch | Box zerplatzt, neutrale Gleichung | kurzer tiefer Ton (`wrong`) |
| Box an Theke | Explosion, Schockwelle (bei ruhigem Modus: Verblassen) | Explosion |
| Ballon/Blase getroffen | Platzen, Zählton (+2/+3) | Quietscher bzw. Plopp |
| Nachladen | Magazinbewegung am Overlay | Klick, Schieber, Spannen |
| Magazin leer | Overlay zeigt leer | Leer-Klick |
| Box rollt | Räder drehen sich | Rumpeln, Klackern, mit Nähe lauter |

## 8 Arbeitsregeln für Werkzeuge (KI-Assistenten, Skripte)

1. **Quelle der Wahrheit:** Zahlen aus Abschnitt 7, Anforderungen aus [`anforderungskatalog.md`](anforderungskatalog.md), Spielregeln des
   Gesamtspiels aus [`spec.md`](../../spec.md). Bei Widerspruch gilt: Katalog > dieses Dokument > Issue-Text.
2. **Nicht ändern ohne Rückfrage:** Entscheidungen E-1 bis E-8, Leitlinien in spec.md 1 und 5.3, Etappenlogik 5.6, Format von
   `data/profile.schema.json` (nur rückwärtskompatibel erweitern).
3. **Ziele nie verdecken:** Regeln aus spec.md 7.4.3 gelten sinngemäß; jede Box ist bei jeder Position vollständig lesbar.
4. **Kein Build-Schritt:** ES-Module, Bibliotheken in `vendor/`. Neue Abhängigkeit nur mit Begründung im Katalog.
5. **Determinismus:** Simulation mit festem Schritt; keine Abhängigkeit von `requestAnimationFrame`-Takt. Tests takten die Engine von Hand.
6. **Keine Fremdinhalte:** SVGs und Klangbausteine aus sepe81 erst nach geklärter Lizenz (Katalog I1) übernehmen; keine Marken in der
   Oberfläche (I2); keine Texturen oder Modelle aus anderen Spielen (B10).
7. **Sicherheit:** Katalog H1–H5 sind Abnahmekriterium, kein Wunsch.
8. **Sprache:** Oberflächentexte und Dokumentation Deutsch; Code, Kommentare und Commit-Nachrichten wie im Repository üblich (Kommentare
   deutsch, wie in den vorhandenen Dateien).
9. **Reihenfolge der Umsetzung (Vorschlag):**
   1. Lizenz klären (I1), Modul `shooting-range.js` mit Bahnmodell und Blaster-Overlay (B6, G2) – zusammen mit #4.
   2. Engine-Erweiterung (C9, D2) mit Einheitentests (D6).
   3. `neonarena.js` mit Spielart 1, Zonen, Vorrat, Explosion (A1–A11).
   4. Ballon und Blase (A8), Töne (E), Etappenübergang (B11).
   5. Sprachausgabe (#19), Menüoption (#20).
   6. Tests (G6), Dokumentation (I3), Screenshot.
10. **Abnahme:** Kriterienliste am Ende des Katalogs (Abschnitt 4 dort) vollständig erfüllt.

## 9 Fachliche Einordnung

- **Kognitive Last:** Fünf oder sechs Wahlmöglichkeiten unter Zeitdruck: Die Wahlzeit wächst mit der Zahl der Alternativen (Hick 1952), die
  Trefferzeit mit kleinerer Zielgröße und größerer Entfernung (Fitts 1954). Deshalb wachsen die Boxen perspektivisch mit der Nähe, und die
  Anflugzeit ist einstellbar und an den Lernstand anpassbar (adaptive Schwierigkeit, vgl. Levitt 1971; Flow, Csikszentmihalyi 1990).
- **Belohnung und Zielnähe:** Sichtbare Zonen und Gewinnstufen folgen dem Prinzip der Zielnähe-Rückmeldung (Hull 1932; Kivetz et al. 2006)
  und geben den Regeln Transparenz. Zwei Stufen sind für Kinder leichter erfassbar als eine stufenlose Kurve.
- **Fehlerkultur:** Strafe trifft Untätigkeit (die richtige Box erreicht die Theke), nicht die falsche Antwort. Das ist mit der Leitlinie
  „Fehler sind Information, keine Strafe“ vereinbar (spec.md 1).
- **Sprache:** Multiplikationsfakten werden überwiegend als verbal-sprachliche Assoziationen abgerufen (Dehaene & Cohen 1995, 1997); das
  Hören der Aufgabe stützt diesen Weg. Doppelte Kodierung und Modalitätsprinzip (Paivio 1986; Mayer 2009) sprechen für gleichzeitig
  visuelle und akustische Darbietung, können unter Zeitdruck aber auch belasten. Deshalb ist die Sprache abschaltbar und die Reaktionszeit
  beginnt nach der Ansage.
- **ADHS:** Grelle Farben, schnelle Bewegung und zusätzliche Tonspuren erhöhen die Reizdichte. Pflicht sind Reizbegrenzung (H1–H3), ein
  ruhiger Modus (#12) und einstellbarer Zeitdruck. Wirkung am Kind beobachten, nicht von vornherein die schärfste Einstellung wählen.
- **Stand der Technik Web:** Prozedurale Klänge über WebAudio statt Audiodateien (kleine Last, volle Kontrolle; Farnell 2010);
  Festschritt-Simulation statt bildratenabhängiger Physik (Fiedler 2004); Segmenttest statt Punkttest gegen Tunneling (Ericson 2005).

### Quellen

- Csikszentmihalyi, M. (1990): *Flow: The Psychology of Optimal Experience.*
- Dehaene, S. & Cohen, L. (1995): Towards an anatomical and functional model of number processing. *Mathematical Cognition* 1.
- Dehaene, S. & Cohen, L. (1997): Cerebral pathways for calculation. *Cortex* 33.
- Ericson, C. (2005): *Real-Time Collision Detection.*
- Farnell, A. (2010): *Designing Sound.*
- Fiedler, G. (2004): *Fix Your Timestep!* (gafferongames.com)
- Fitts, P. M. (1954): The information capacity of the human motor system. *J. Exp. Psychol.* 47.
- Hick, W. E. (1952): On the rate of gain of information. *Q. J. Exp. Psychol.* 4.
- Hull, C. L. (1932): The goal-gradient hypothesis. *Psychol. Rev.* 39.
- Kivetz, R., Urminsky, O. & Zheng, Y. (2006): The goal-gradient hypothesis resurrected. *J. Mark. Res.* 43.
- Levitt, H. (1971): Transformed up-down methods in psychoacoustics. *J. Acoust. Soc. Am.* 49.
- Mayer, R. E. (2009): *Multimedia Learning.*
- Millington, I. (2010): *Game Physics Engine Development.*
- Paivio, A. (1986): *Mental Representations: A Dual Coding Approach.*
- W3C: *Web Content Accessibility Guidelines* 2.x, Erfolgskriterium 2.3.1.

## 10 Offene Punkte und nicht Geprüftes

- **Lizenz** des Quellspiels (sepe81): README nennt MIT, LICENSE-Datei fehlt; Bestätigung ausstehend (Katalog I1).
- **Zahlenwerte** (Geschwindigkeiten, Zeiten, Beträge): Startwerte, nicht erprobt. Die Mündungsgeschwindigkeit realer Schaumpfeile
  (grob 10–25 m/s) ist eine Näherung und vor Verwendung zu messen oder nachzuschlagen. Bibliotheksgrößen sind Näherungswerte.
- **Spielgefühl** der Zonen und des Dart-Haushalts (Start 12, Obergrenze 30, Explosion −3) ist ungeprüft; Gefahr einer Abwärtsspirale bei
  schwachen Spielern (Entspannt-Modus, A14, als Gegenmaßnahme).
- **Sprachausgabe:** Verfügbarkeit und Aussprache deutscher Stimmen auf den Zielgeräten sind ungeprüft (#19, S8–S10).
- **Wirkung auf Kinder mit ADHS:** Reizdichte der Arena und Wirkung der Sprache sind am Kind zu beobachten.
- **Marken:** Die Bezeichnungen des Quellspiels und der Vorlagen sind rechtlich nicht geprüft; vor einer Weitergabe an Schulen oder über
  GitHub Pages (#13) klären.
- **Bahnanzahl 6:** Distraktor-Generator muss einen weiteren plausiblen Wert liefern (A3); Verhalten bei kleinen Zahlenräumen prüfen.
- **Gemeinsame Basis mit #4:** Das Modul wird erst konkret, wenn #4 begonnen wird; Schnittstelle zwischen Bahnmodell und Entenband bzw.
  Laufkasten ist offen (B7).

## 11 Begriffe

| Begriff | Bedeutung |
|---|---|
| **Magic Box** | Würfel mit Ergebnis-Aufdruck, rollt auf einer Bahn auf den Spieler zu |
| **Bahn** | einzelne Schießbahn mit Schiene und Trennwänden; Anzahl 5 oder 6 |
| **Wagen** | Fahrgestell unter der Box, rollt auf der Schiene (Scheibenzug-Prinzip) |
| **Theke** | Standgrenze des Spielers bei z = 0; Ankunftsort der Boxen |
| **Zone fern / nah** | Hälften der Bahn nach Restweg (≥ 50 % / < 50 %), maßgeblich für die Belohnung |
| **Vorrat** | Dart-Bestand außerhalb des Magazins; zugleich das „Leben“ |
| **Magazin** | geladene Darts, aus dem Vorrat nachgefüllt |
| **Ballon / Blase** | Bonusobjekte, die Darts nachladen |
| **Profil** | Blaster-Kennwerte: *Schwach* oder *Highspeed* |
| **Reaktionszeit** | Zeit vom Start der Boxen bis zum Abschuss |
| **Cue** | kurzes positives Signal (Klang) unmittelbar beim richtigen Treffer |
