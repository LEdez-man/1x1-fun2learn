# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach SemVer.

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
