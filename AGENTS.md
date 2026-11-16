# Hinweise für KI-Agenten

Browser-Lernspiel für das 1×1 (statische Web-App, kein Build-Schritt). Verbindliche
Beschreibung: [`spec.md`](spec.md). Vor jeder Änderung lesen:

1. `spec.md` Abschnitt 12 – Arbeitsablauf, Konventionen, Definition of Done
2. `spec.md` Abschnitt 11 – Entscheidungen, Abwägungen, Stolpersteine
3. für Szenarien: Abschnitt 5.6 (Etappen) und 7.4 (Bauanleitung 2D, Regeln für sichtbare Ziele)

Kurzregeln:

- Deutsch in Oberfläche, Kommentaren, Doku und Commits.
- Szenarien sind 2D-Mehrebenen-Szenen mit PixiJS (`js/engine2d.js`); Vorbild für stehende Ziele `js/scenarios/snow.js`, für bewegte Ziele `js/scenarios/turkey.js`.
- Bibliotheken nur aus `vendor/` (Import-Map in `index.html`), keine neuen Abhängigkeiten, kein Bundler.
- Grafiken des Auftraggebers in `assets/` nicht verändern; Ableitungen per Skript in `tools/`.
- Ziele müssen bei jedem Kameraschwenk vollständig sichtbar und unverdeckt sein (spec 7.4.3).
- Starten: `python3 -m http.server 8000`, dann `http://localhost:8000` (mit `?debug` für Testhilfen).
- Prüfen: `node tests/round.test.js`, `node tests/visibility.test.js`, `node tests/skeet.test.js` (Playwright, siehe spec 8.2).
- Die Einstellung „Ballistik“ (an/aus) muss jedes Szenario berücksichtigen (spec 7.4.5).
- Nach Änderungen `spec.md`, `CHANGELOG.md` und ggf. `README.md` nachführen; offene Punkte stehen in den GitHub-Issues.
