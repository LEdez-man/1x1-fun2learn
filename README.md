# 1×1 Fun2Learn

Browser-Lernspiel für das kleine und große 1×1 mit 2D-Mehrebenen-Szenen (PixiJS) und einem 3D-Szenario (three.js).
Ziele tragen Ergebnisse oder Aufgaben – wer das richtige trifft, kommt weiter.

![Truthahn-Skeet, Herbstkulisse](docs/screenshots/truthahn-herbst.png)
![Schneeballschlacht, Mittag](docs/screenshots/schnee-tag.png)
![Schneeballschlacht, Zwischenrunde mit Schneesturm](docs/screenshots/schnee-sturm.png)
![Schneeballschlacht, Nacht in der letzten Etappe](docs/screenshots/schnee-nacht.png)

## Starten

Das Spiel besteht nur aus statischen Dateien, braucht aber einen Webserver
(ES-Module laden nicht über `file://`):

```bash
python3 -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen. Alternativ das Repository über
GitHub Pages veröffentlichen.

Bedienung: Maus zielt, Linksklick schießt, Zifferntasten für Ergebnisse, Esc pausiert.

## Stand (v0.2.0)

- Menü: Zahlenraum, Aufgabentopf (u. a. Königsaufgaben, einzelne Reihen, Lernraster, eigene Fehler, Trainer-Auswahl), 4 Spielarten, Einstellungen
- Szenarien: **Truthahn-Skeet** (3D, 4 wechselnde Rocky-Mountain-Kulissen), **Schneeballschlacht** (2D, Winterdorf nach Bruegel mit eigenen Grafiken, Kameraschwenk, Rauch, Schnee, Vögeln)
- Etappen in der Schneeballschlacht: nach je 5 gelösten Aufgaben ein Schneesturm, danach neue Tageszeit und neue Details; Etappenmarken im Fortschrittsbalken
- Auswertung je Aufgabe mit empfohlener Übungsserie
- Mehrere Spieler, Lernstand im Browser, Sichern/Laden als JSON-Datei

Geplante Szenarien und Erweiterungen stehen in [spec.md](spec.md), Abschnitt 9, und in den GitHub-Issues.

## Dokumentation

| Datei | Inhalt |
|---|---|
| [spec.md](spec.md) | Spezifikation: Spiellogik, Menü, Szenarien, Architektur, Planung |
| [CHANGELOG.md](CHANGELOG.md) | Versionshistorie |
| [assets/schneeball-bruegel/spec.md](assets/schneeball-bruegel/spec.md) | Asset-Spezifikation der Schneeballschlacht |
| [docs/neon-arena/README.md](docs/neon-arena/README.md) | Planung und Designvorgaben Szenario „Neon-Arena“ (Schaumpfeil-Schießbahn), Anforderungskatalog dort |
| [data/profile.schema.json](data/profile.schema.json) | Datenformat für Spieler, Fortschritt und Statistik |
| [data/beispiel-profil.json](data/beispiel-profil.json) | Beispiel einer Profildatei |

## Lizenzen

three.js und PixiJS liegen unter MIT-Lizenz in `vendor/` (siehe `vendor/THREE-LICENSE`, `vendor/PIXI-LICENSE`).
Die Grafiken in `assets/schneeball-bruegel/` sind eigene Zeichnungen (siehe dortige `spec.md`).
