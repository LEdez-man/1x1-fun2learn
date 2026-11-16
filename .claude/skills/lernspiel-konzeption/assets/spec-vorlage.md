# <Name des Spiels> – Spezifikation

| | |
|---|---|
| **Version** | <0.0.0 (Konzept)> |
| **Datum** | <JJJJ-MM-TT> |
| **Status** | <was ist umgesetzt, was nur spezifiziert> |
| **Technik** | <Betriebsform, Dimension (2D / 2,5D / 3D), Bibliotheken mit Version, Ablageort> |
| **Bibliotheksstand geprüft am** | <JJJJ-MM-TT> (Abschnitt 8.3) |

Dieses Dokument ist die verbindliche Beschreibung des Spiels für Menschen und für
Werkzeuge, die daran weiterarbeiten. Abschnitte 1–8 beschreiben den **umgesetzten**
Stand, Abschnitt 9 den **geplanten**, Abschnitt 10 die fachliche Einordnung.

> **Für KI-gestützte Weiterarbeit:** zuerst Abschnitt 12 und 11 lesen; für ein neues
> Szenario außerdem 5.x (Etappen) und 7.x (Bauanleitung).

---

## 1 Ziel und Zielgruppe

<Lerngegenstand, Lernphase, Zielgruppe, Nutzungssituation. Ein Absatz.>

Leitlinien:
- <z. B. Sofortige Rückmeldung in Bild und Ton>
- <Kurze, abgeschlossene Einheiten mit sichtbarem Fortschritt>
- <Fehler sind Information, keine Strafe>
- <Gezieltes Üben>

## 2 Vorgehen und Entscheidungen des Auftraggebers

| Frage | Entscheidung |
|---|---|
| Einstieg (Spiellogik oder Design zuerst) | |
| Umfang des ersten Stands | |
| Gerät | |
| <weitere> | |

Nachträgliche Vorgaben je Version als eigene Tabelle (Vorgabe, Umsetzung).
Einschränkungen und Annahmen ausdrücklich nennen.

## 3 Begriffe

| Begriff | Bedeutung |
|---|---|
| Lerneinheit | <Definition, Schlüssel> |
| Aufgabentopf | |
| Batterie | |
| Runde | |
| Etappe / Zwischenrunde | |
| Szenario | |
| Spielart | |

## 4 Hauptmenü

<Schritte in Reihenfolge; je Schritt die Auswahlmöglichkeiten; was je Spieler gespeichert wird.>

## 5 Spiellogik

### 5.1 Ablauf einer Runde
### 5.2 Spielarten

| Nr. | Name | Stimulus | Ziele tragen | Antwort |
|---|---|---|---|---|

### 5.3 Rückmeldung

| Ereignis | Bild | Ton |
|---|---|---|

### 5.4 Falsche Antworten
### 5.5 Auswahl durch die Spiellogik und Empfehlung
### 5.6 Etappen und Zwischenrunden

<Regeln, Anzeige, Aufgabe des Szenarios, Gestaltungsregeln für den Übergang.>

## 6 Auswertung

## 7 Szenarien (umgesetzt)

### 7.1 <Szenario> (`<Datei>`)

**Dimension.** <2D / 2,5D / 3D>
**Grafiken.** <Ordner, Herkunft, Stil, Freistellweg>
**Ebenen bzw. Szenenaufbau.** <2D: Liste hinten → vorn mit Parallaxfaktor; 3D: Bühne, Kamera, Sichtfeld, Modelle>
**Ziele.** <Art, Träger der Antwort, Trefferflächen, Platzierung>
**Rückmeldung.** <richtig, falsch, freier Abruf>
**Erzeugte Bewegung.**
**Etappen.** <verdeckendes Ereignis, Verlauf, Details>

### 7.x Bauanleitung für Szenarien

<Koordinaten und Ebenen · Schnittstelle · Regeln für Ziele (immer im Bild, nie verdeckt) ·
Checkliste für die Übertragung · Schalter für Geschick>

## 8 Architektur und Daten

```
<Dateibaum mit einer Zeile Zweck je Datei>
```

### 8.1 Speicherung
<Ort, Schlüssel, Export/Import, Schema, Migration>

### 8.2 Prüfung

| Skript | Prüft | Laufzeit |
|---|---|---|

Nicht geprüft: <echte Hardware, Ton, …>

### 8.3 Bibliotheksstand

| Paket | eingesetzt | neueste | geprüft am | Lizenz | Entscheidung und Begründung |
|---|---|---|---|---|---|

Nächste Prüfung: <vor dem nächsten Szenario, spätestens JJJJ-MM>.

### 8.4 Darstellungsvertrag und Dimension

<Funktionen zwischen Spielablauf und Engine; Dimension je Szenario; Einheiten und
Koordinaten; gewählte Bauform (eine Engine / zwei Engines / eine 3D-Bibliothek für
alles); was für die jeweils andere Dimension vorgehalten ist.>

## 9 Geplant (noch nicht umgesetzt)

Jeder Punkt ist als Issue angelegt.

### 9.1 Szenarien

| Szenario | Kurzbeschreibung |
|---|---|

### 9.2 Spiellogik und Rahmen

| Erweiterung | Vorkehrung im heutigen Stand |
|---|---|

## 10 Fachliche Einordnung und Hinweise

- **Stand der Fachdidaktik:** <Aufbau des Stoffs, Hauptvertreter, was das Spiel abdeckt und was nicht>
- **Schwierigkeit und typische Fehler:** <Quellen>
- **Wiederholung:** <Verfahren, Quellen>
- **Zielgruppe:** <z. B. ADHS: Rückmeldung, Zeitdruck, Reizdichte; Quellen>
- **Inhalte:** <Altersangemessenheit, Einsatzort>
- **Bildvorlagen und Rechte:**
- **Technik:** <Stand der Technik, nächster sinnvoller Schritt>

## 11 Entscheidungen, Abwägungen und Erkenntnisse

Bei Änderungen nachtragen statt überschreiben (Datum, Begründung).

### 11.1 Architekturentscheidungen

| Nr. | Entscheidung | Verworfene Alternative | Begründung |
|---|---|---|---|
| E1 | | | |

### 11.2 Abwägungen zur Gestaltung

### 11.3 Stolpersteine und Fehler aus der Entwicklung

| Problem | Ursache | Lösung / Regel |
|---|---|---|

### 11.4 Hinweise zu Grafiken neuer Szenarien

## 12 Leitfaden für KI-gestützte Weiterarbeit

### 12.1 Arbeitsablauf
1. Lesen · 2. Klären · 3. Bauen · 4. Prüfen · 5. Dokumentieren

### 12.2 Konventionen
<Sprache, Abhängigkeiten, Ablage der Grafiken, Koordinaten, Rückmeldung, Einstellungen>

### 12.3 Definition of Done für ein neues Szenario
- [ ] …

### 12.4 Vorlage für einen Auftrag

```
Lies spec.md (Abschnitte 3, 5, 7.x, 11, 12) und <Vorbild-Szenario>.
Baue das Szenario „<Name>“ aus Abschnitt 9.1 nach der Bauanleitung 7.x.
Grafiken: assets/<ordner>/ (Asset-Spezifikation: assets/<ordner>/spec.md).
Zwischenrunde: <verdeckendes Ereignis>, Verlauf über die Etappen: <Stimmung>,
neue Details je Etappe: <Liste>.
Halte die Regeln für Ziele ein und weise sie mit einem Test nach.
Ergänze spec.md (7.x und 11), CHANGELOG.md und README.md. Commit auf einem eigenen Branch.
```

---

## Begleitdatei `AGENTS.md`

```
# Hinweise für KI-Agenten

<Ein Satz zum Spiel und zur Betriebsform.> Verbindliche Beschreibung: spec.md.
Vor jeder Änderung lesen:
1. spec.md Abschnitt 12 – Arbeitsablauf, Konventionen, Definition of Done
2. spec.md Abschnitt 11 – Entscheidungen, Abwägungen, Stolpersteine
3. für Szenarien: Etappen und Bauanleitung

Kurzregeln:
- <Sprache>
- <Darstellung, Vorbilder>
- <Bibliotheken und Abhängigkeiten>
- <Umgang mit Grafiken>
- <Sichtbarkeitsregel>
- <Starten>
- <Prüfen>
- <Nachführen der Dokumentation>
```
