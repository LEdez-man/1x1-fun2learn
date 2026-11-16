# Architektur und Erweiterbarkeit

Inhalt: 1 Schichten · 2 Szenario-Schnittstelle · 3 Erweiterungsachsen und Vorkehrungen ·
4 Daten und Speicherung · 5 Einstellungen · 6 Dokumentation als Teil der Architektur ·
7 Arbeitsablauf · 8 Arbeit mit Issues

## 1 Schichten

```
Inhalte        Lerneinheiten, Töpfe, Fehlerregeln, Schwächewert          (tasks)
Runde          Auswahl, Wiedervorlage, Endkriterium, Etappen, Empfehlung (session)
Spielablauf    Batterien, Trefferauswertung, Rückmeldung, Zustände       (play)
Darstellung    Ebenen, Kamera, Geschosse, Partikel, Laden                (engine)
Szenario       Kulisse, Ziele, Effekte, Zwischenrunde                    (scenarios/*)
Rahmen         Menü, Lernstand, Auswertung                               (main, DOM)
Dienste        Ton, Sprache, Speicherung                                 (audio, speech, store)
```

Regeln:
- Abhängigkeiten zeigen nach oben in dieser Liste: Das Szenario kennt die Darstellung,
  aber weder Runde noch Inhalte. Es erhält Beschriftungen und meldet Treffer.
- Inhalte und Runde laufen ohne Grafik und sind mit Einheitentests prüfbar.
- Spielablauf und Darstellung sind über wenige Funktionen verbunden (Schuss, Umrechnung
  der Koordinaten, Treffer, Bild-Ereignis, Zeitlupe, Pause). Daran hing im
  Ausgangsprojekt, dass die Engine getauscht werden konnte.
- Was alle Szenarien betrifft (Sprachausgabe, Etappenzählung, Statistik), gehört in den
  Spielablauf. Was nur eines betrifft, bleibt im Szenario.
- Bauteile, die zwei Szenarien teilen, in ein gemeinsames Modul (`scenarios/shared/`).

## 2 Darstellungsvertrag und Szenario-Schnittstelle

Der Vertrag zwischen Spielablauf und Darstellung ist für 2D und 3D derselbe. Er ist die
Vorkehrung, die beide Dimensionen nebeneinander oder nacheinander möglich macht
(`drei-d.md`, Abschnitt 2).

```js
// Engine, gleich für 2D und 3D
engine.load(scenario)            // Szenario vollständig laden
engine.shoot(screenPoint)        // Schuss oder Zugriff am Bildschirmpunkt
engine.toScreen(worldPoint)      // für Einblendungen am Ziel
engine.onHit(target, point)      // Treffer melden
engine.onFrame(dt)               // Bild-Ereignis
engine.timeScale, engine.paused  // Zeitlupe, Pause
engine.stop(), engine.step(dt)   // Schleife von außen takten (Tests)
engine.dispose()

// Ziel, gleich für 2D und 3D
target.screenRect()              // Rechteck am Bildschirm: Sichtbarkeit, Lesbarkeit, Tests
target.hitTest(...)              // 2D: Punkt und Radius; 3D: Strecke und Radius
target.hittable, target.data, target.state
```

Die Registrierung eines Szenarios nennt seine Dimension (`dim: '2d' | '3d'`); danach
wird die Engine gewählt. Der gemeinsame Teil der Szenario-Schnittstelle (`build`,
`spawnWave`, `resolve`, `dismiss`, `waveDone`, `update`, `intermission`, `dispose`) ist
in beiden Dimensionen gleich. Verschieden sind nur die Angaben zu Kamera und Schuss:

| | 2D | 3D / 2,5D |
|---|---|---|
| Raum | `design` (Raster), Ebenen mit Parallaxfaktor | Szenengraph, Einheiten in Metern |
| Kamera | `pan` (Schwenk, Zielzone, Ebenenbreite) | `sway` (Gier, Nicken), Sichtfeld |
| Schuss | Flugzeit, Bogen, Ursprung; `ballistics(to)` | Geschwindigkeit, Reichweite, Radius; optional Schwerkraft, Widerstand, Zeitschritt |
| Ziel | `center` in Sichtkoordinaten, `z`, `f` | `center` als Vektor, Trefferkörper |
| Zusätze | `depthAt(y)` | `groundAt(x, z)` |

Erprobte Form für Ziel-und-Treffer-Spiele in 2D:

```js
class Scenario {
  constructor(engine, { tempo, lead, variant, stages })
  design    // Raster der Szene
  pan       // größter Schwenk, halbe Zielzone, Mindestschwenk, halbe Ebenenbreite
  shot      // Abklingzeit, Flugzeit, Radius, Bogen, Ursprung, make(), ballistics(to)?
  targets   // [{ center, hittable, hitTest(p, r), z, f, data, state }]
  async build()                    // Grafiken laden, Ebenen anlegen
  spawnWave(labels)                // je Beschriftung ein Ziel
  resolve(target, outcome)         // 'correct' | 'wrong' | 'lock'
  dismiss(), waveDone()
  update(dt, rawDt)                // Animation; meldet durchgelassene Ziele
  intermission(stage, stageCount)  // optional → { duration, label, detail }
  onShoot(), onMiss(p), dispose()  // optional
}
```

Grundsätze:
- **Optionale Methoden und Felder** statt Pflichtänderungen. Ein Szenario ohne
  `intermission` läuft ohne Etappen; ohne `ballistics` gilt eine feste Flugzeit.
  Bestehende Szenarien bleiben bei jeder Erweiterung unverändert.
- **Registrierung an einer Stelle** (Liste der Szenarien mit Kennung, Titel, Klasse,
  Status). Geplante Szenarien stehen dort als „in Planung“ und erscheinen ausgegraut.
- **Laden vor dem Start**: Das Szenario wird vollständig geladen, bevor der Spielablauf
  beginnt.
- **Aufräumen**: `dispose()` gibt Texturen und Ereignisse frei.
- **Debug-Zugang** hinter einem Parameter (`?debug`): Szenario und Spielablauf als
  globale Objekte, Abfrage der Bildschirmrechtecke sichtbarer Ziele, Ein- und Ausblenden
  von Ebenen. Ohne diese Haken sind die Sichtbarkeitsregeln nicht automatisiert prüfbar.
- **Zwei Vorbilder** pflegen: eines für stehende, eines für bewegte Ziele.

Die Schnittstelle erst nach dem zweiten Szenario als stabil betrachten.

## 3 Erweiterungsachsen und Vorkehrungen

| Erweiterung | Vorkehrung im ersten Stand |
|---|---|
| Weitere Szenarien | Schnittstelle, Registrierung, Bauanleitung mit Checkliste, Auftragsvorlage |
| Weitere Inhalte oder Fächer | Inhalte als eigenes Modul mit schmaler Schnittstelle (Liste der Einheiten, Töpfe, Fehlerregeln, Textform der Aufgabe); keine Fachbegriffe im Spielablauf |
| Weitere Spielarten | Spielart als Datensatz: Stimulus, Beschriftung der Ziele, Antwortweg; Mischform wählt je Batterie |
| Mehr Antworten je Aufgabe | Anzahl als Parameter des Fehlergenerators, nicht als Konstante |
| Verteiltes Wiederholen, Abzeichen | Datum je Antwort im Profil |
| Belohnungssystem, Wochenziele | Rundenprotokoll mit Datum; Elternbereich als eigene Ansicht |
| Mehrspieler am Gerät | Profile von Beginn an; Aufgabenliste einer Runde reproduzierbar (Startwert) |
| Online-Mehrspieler | nicht mit statischer Seite; eigene Entscheidung über Server |
| Touch | Eingabe über eine Schicht (Zeigen, Auslösen, Ziffern), nicht direkt an Mausereignissen; Layout für Querformat |
| Sprachausgabe | Dienst mit `speak`, `cancel`, `available`; Textbausteine je Spielart; Pause vor Zielstart verlängerbar; Standard aus |
| Weitere Sprachen | Texte der Oberfläche gesammelt, nicht im Code verstreut |
| Ballistik, Physik | Schalter im Menü; fester Zeitschritt; optionale Felder je Schuss |
| Ruhiger Modus | Reizstufe als Einstellung, die jedes Szenario abfragt |
| Andere Engine, zweite Dimension (2D ↔ 3D) | Darstellungsvertrag (Abschnitt 2), Ziele über `screenRect()` beschrieben, Dimension in der Registrierung, dimensionsneutrale Grafiken (`drei-d.md`) |
| Neue Bibliotheksversionen | Version festgeschrieben, Tabelle „Bibliotheksstand“ mit Prüfdatum, vollständiger Testlauf als Voraussetzung für das Anheben |
| Neue oder ersetzte Grafiken | Quelle unverändert, Ableitung und Freistellung per Skript, Dateinamen und Maße als Schnittstelle |

Maß halten: Vorkehrung heißt Platz im Datenformat und eine saubere Schnittstelle, nicht
die vorgezogene Umsetzung.

## 4 Daten und Speicherung

- Statische Seite: Lernstand im Speicher des Browsers unter einem versionierten
  Schlüssel; Sichern und Laden als JSON-Datei. Das im Menü sichtbar anbieten, weil der
  Browser-Speicher gelöscht werden kann und nicht geräteübergreifend ist.
- Datenformat als JSON-Schema im Repository, dazu eine Beispieldatei.
- Je Profil: Name, Einstellungen, Statistik je Einheit und Aufgabentyp, eigene Auswahl,
  aktuelle Übungsserie, die letzten Runden mit Einzelergebnissen.
- **Migration**: Fehlende Schlüssel erhalten Standardwerte; Import bleibt
  rückwärtskompatibel; defekte Dateien werden abgewiesen, ohne Vorhandenes zu
  überschreiben.
- Umbenannte Einstellungen behalten ihren Schlüssel im Profil, wenn die Bedeutung
  gleich bleibt (im Ausgangsprojekt: Menüpunkt „Ballistik“, Profilfeld weiterhin `lead`).
- Keine personenbezogenen Daten über den Namen hinaus; nichts verlässt das Gerät.

## 5 Einstellungen

- Jede Einstellung hat drei Orte: Menü, Profilformat, Spezifikation.
- Wenige, verständliche Schalter. Ein Schalter „Ballistik an/aus“ statt mehrerer
  Regler; die Feinwerte bestimmt das Szenario.
- Schalter, die Lernen von Geschicklichkeit trennen (Ballistik, Tempo, Zeitlimit,
  entspannt), sind Pflicht, sobald die Mechanik Geschick verlangt.
- Klären, was das Kind ändern darf und was nur Erwachsene.

## 6 Dokumentation als Teil der Architektur

Ein Projekt, an dem KI-Werkzeuge und Menschen abwechselnd arbeiten, ist nur
erweiterbar, wenn Entscheidungen und Gründe auffindbar sind.

| Dokument | Zweck |
|---|---|
| Spezifikation (`spec.md`) | verbindliche Beschreibung; trennt umgesetzt und geplant; enthält Begriffe, Spiellogik, Szenarien, Bauanleitung, Architektur, fachliche Einordnung |
| Entscheidungsprotokoll (Abschnitt der Spezifikation) | Nr., Entscheidung, verworfene Alternative, Begründung; Überholtes wird markiert, nicht gelöscht |
| Stolpersteine | Problem, Ursache, Regel; verhindert die Wiederholung gefundener Fehler |
| Leitfaden für die Weiterarbeit | Arbeitsablauf, Konventionen, Definition of Done, Auftragsvorlage |
| `AGENTS.md` (und Verweis in `CLAUDE.md`) | Kurzregeln und Leseliste für KI-Werkzeuge |
| Asset-Spezifikation je Szenario | Maße, Trefferflächen, Palette, Herkunft |
| `CHANGELOG.md` | Stände nach Keep a Changelog und SemVer, mit bekannten Einschränkungen |
| Issues | je geplantem Szenario und je Erweiterung eines |

Vorlagen: `assets/spec-vorlage.md`, `assets/asset-spec-vorlage.md`,
`assets/issue-vorlage.md`.

## 7 Arbeitsablauf

**Aufbau eines neuen Spiels**
1. Inhalte und Runde ohne Grafik, mit Einheitentests.
2. Rahmen: Menü, Profil, Auswertung.
3. Darstellung und erstes Szenario als Vorbild; Sichtbarkeitsregeln und Tests.
4. Zweites Szenario mit anderer Zielart; Schnittstelle daran berichtigen.
5. Spezifikation, Entscheidungsprotokoll und Issues nachführen.

**Neues Szenario**
1. Lesen: Spezifikation (Begriffe, Spiellogik, Bauanleitung, Entscheidungen), Vorbild,
   offene Issues. Bibliotheksstand prüfen (`grafik-engine.md`, Abschnitt 9) und
   Dimension des Szenarios bestimmen.
2. Klären: fehlende Vorgaben beim Auftraggeber erfragen, bevor gebaut wird.
3. Bauen: eigene Datei, Registrierung; Kernmodule nur ändern, wenn es alle betrifft.
4. Prüfen: Sichtbarkeit automatisiert, komplette Runde, Bildschirmfotos sichten;
   Ungeprüftes benennen.
5. Dokumentieren: Szenario-Abschnitt, Entscheidungen, Stolpersteine, Changelog, README,
   Bildschirmfotos; Issues kommentieren und abhaken.

**Konventionen**, die vor dem ersten Commit festgelegt werden: Sprache von Oberfläche,
Kommentaren, Dokumentation und Commits; Fachbegriffe laut Begriffstabelle; keine
Abhängigkeiten über den festgelegten Rahmen hinaus; Branch je Vorhaben.

## 8 Arbeit mit Issues

- Je Szenario und je Erweiterung ein Issue mit Ziel, Beschreibung, Hinweisen zur
  Architektur, offenen Entscheidungen und Abnahmekriterien als Checkliste.
- Größere Vorhaben: nummerierter Anforderungskatalog mit Priorität M/S/K (muss, soll,
  kann), Abwägung der Bibliotheken, Entscheidungen des Auftraggebers als Tabelle,
  Literatur. Zahlen als Startwerte kennzeichnen.
- Große Vorhaben teilen (Szenario, Querschnittsfunktion, Menüanbindung) und
  Abhängigkeiten nennen.
- Fortschritt als Kommentar: umgesetzt, Abweichung vom Auftrag mit Grund, offen,
  geprüft und nicht geprüft. Checkliste im Issue nachführen.
- Fehlerberichte des Auftraggebers führen zu einer Regel in der Spezifikation, nicht nur
  zu einer Korrektur.
- Nach einer Technikentscheidung alle offenen Issues, Pläne und Pull Requests
  durchsehen, die auf dem alten Stand beruhen, und anpassen oder schließen.
