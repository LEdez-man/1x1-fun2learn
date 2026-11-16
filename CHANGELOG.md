# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach SemVer.

## [Unreleased]

### Hinzugefügt
- `spec.md` Abschnitt 11 (Entscheidungen, Abwägungen, Stolpersteine) und 12 (Leitfaden für KI-gestützte Weiterarbeit mit Definition of Done und Auftragsvorlage)
- `AGENTS.md` und `CLAUDE.md` als Einstieg für KI-Werkzeuge
- Browsertests der Schneeballschlacht in `tests/` (komplette Runde, Sichtbarkeit/Verdeckung, Bildergalerie)

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
