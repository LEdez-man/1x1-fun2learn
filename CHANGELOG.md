# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach SemVer.

## [0.3.0] – 2026-11-16

Truthahn-Skeet als 2D-Jagdreise mit Etappen und Ballistik; Spezifikation für die Weiterarbeit.

### Hinzugefügt
- Truthahn-Skeet neu als 2D-Mehrebenen-Szene: drei Reviere (Rocky Mountains, Schwarzwald, Uckermark) mit Truthahn, Ringeltaube und Jagdfasan
- Per Skript gezeichnete Grafiken mit Schattierung und Schraffur (`tools/build-skeet-assets.py` → `assets/vogel-skeet/`), Schneefassungen für den Winter
- Etappen als Jagdreise: Nebel als Zwischenrunde, danach neue Jahreszeit oder neues Revier (zwölf Stationen, auf die Etappen der Runde verteilt)
- Ballistik als Schalter im Menü: Flugzeit, Geschossabfall und Vorhalten, oder Treffer sofort am Fadenkreuz; Fehlschüsse zeigen, wo die Garbe lag
- Engine: `shot.ballistics(to)` je Schuss (Flugzeit, Abfall, Trefferradius)
- `spec.md` Abschnitt 11 (Entscheidungen, Abwägungen, Stolpersteine), 12 (Leitfaden für KI-gestützte Weiterarbeit) und 7.4.5 (Ballistik)
- `AGENTS.md` und `CLAUDE.md` als Einstieg für KI-Werkzeuge
- Browsertests in `tests/` (Schneeballschlacht: Runde, Sichtbarkeit, Galerie; Truthahn-Skeet: Runde, Ballistik, Sichtbarkeit)

### Geändert
- Einstellung „Vorhalten nötig (ja/nein)“ heißt jetzt „Ballistik (an/aus)“; das Profilfeld `lead` bleibt
- Ergebnisse hängen als Papierschild unter dem Vogel

### Entfernt
- 3D-Fassung des Truthahn-Skeet, `js/engine.js` und three.js (Stand in der Git-Historie)

## [0.2.0] – 2026-11-15

Schneeballschlacht als 2D-Mehrebenen-Szene mit eigenen Grafiken, Etappen und Zwischenrunden.

### Hinzugefügt
- 2D-Grundgerüst auf PixiJS 8.23 (`js/engine2d.js`): Ebenen mit Parallaxe, leichter Kameraschwenk mit der Maus, Würfe, Partikel, einmaliges Rastern von SVG-Grafiken
- Grafiken „Winter nach Bruegel“ (`assets/schneeball-bruegel/`): 6 Ebenen, 6 Kinderfiguren, Sprites; verbreiterte Spiel-Ebenen über `tools/build-snow-wide.py`
- Erzeugte Bewegung: Kaminrauch, Schneefall in drei Tiefen, Vogelschwärme, laufende Eisläufer, Fensterlicht
- Etappen: nach je 5 richtig gelösten Aufgaben eine Zwischenrunde (Schneesturm), danach neue Tageszeit (Morgen bis Nacht) und ein neues Detail im Dorf (Fußspuren, Schlittenspur, Schneemann, Krähen, Neuschnee)
- Fortschrittsbalken mit Etappenmarken und Anzeige „Etappe n/m“
- Spezifikation: Abschnitt 5.6 (Etappen) und 7.4 (Bauanleitung für 2D-Szenarien) zur Übertragung auf weitere Szenarien

### Geändert
- Schneeballschlacht läuft nicht mehr in three.js; das 3D-Szenario ist entfallen
- Ergebnisse stehen auf einem Papierschild vor der Brust der Kinder statt auf der Mütze
- Szenarien werden vor dem Start geladen (Ladehinweis); `Play` erhält die fertig geladene Engine

### Behoben
- Ziele außerhalb des Sichtbereichs und hinter Bäumen (Issue 14): Zielzone und automatische Verdeckungsprüfung
- Wurf verfehlt nicht mehr, wenn die Kamera nach einer schnellen Mausbewegung noch nachschwenkt

## [0.1.0] – 2026-11-15

Erster spielbarer Stand.

### Hinzugefügt
- Hauptmenü mit Zahlenraum (kleines/großes 1×1), acht Aufgabentöpfen, vier Spielarten, Szenariowahl und Einstellungen
- Lernraster: Auswahl einzelner Aufgaben, farbige Anzeige des Lernstands
- Spiellogik: Runden mit bis zu 10 Aufgaben, Endkriterium „jede Aufgabe n-mal richtig“ (2/3/5), Wiedervorlage nach Fehlern, plausible falsche Ergebnisse
- Spielarten: Ergebnis treffen, Treffen & tippen (Zeitlimit, Game Over nach 5 durchgelassenen Zielen), Geteilt-Aufgaben, gemischt
- Szenario Truthahn-Skeet mit vier Kulissen (Herbst, Sommer, Winter, Vorfrühling), die mit jeder Runde wechseln
- Szenario Schneeballschlacht im Stil flämischer Winterlandschaften (Tag/Dämmerung)
- Sofortige Rückmeldung in Bild und Ton, wachsende Ergebnis-Einblendung mit Leuchtschein
- Auswertung je Aufgabe, empfohlene Übungsserie als Button im Hauptmenü
- Mehrere Spielerprofile, Speicherung im Browser, Export/Import als JSON
- Spezifikation (`spec.md`), Datenformat (`data/`)

### Bekannte Einschränkungen
- Nur Maus und Tastatur, keine Touch-Bedienung
- Fünf weitere Szenarien sind spezifiziert, aber noch nicht umgesetzt
- Bildrate und Spielgefühl wurden nur im Software-Renderer geprüft, nicht auf echter Grafikhardware
