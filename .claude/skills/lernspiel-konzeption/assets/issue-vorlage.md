# Vorlagen für Issues

## A Szenario oder Erweiterung (Kurzform)

```
Titel: Szenario: <Name> (<Stichworte>)   |   Spiellogik: <Erweiterung>

## Ziel
<Ein bis zwei Sätze; Verweis auf den Abschnitt der Spezifikation.>

## Beschreibung
- Kulisse und Stil:
- Was trägt die Antwort:
- Womit wird gewählt:
- Richtig:
- Falsch:
- Zwischenrunde: <verdeckendes Ereignis, Verlauf, Details>

## Hinweise
<Was am Kern oder an der Engine fehlt; gemeinsame Bausteine; Altersangemessenheit.>

## Offene Entscheidungen
- <Frage mit Vorschlag>

## Akzeptanzkriterien
- [ ] Klasse/Modul <Name> in <Datei> nach der Schnittstelle der Spezifikation
- [ ] Alle Spielarten funktionieren
- [ ] Ziele immer im Bild und nie verdeckt, automatisiert geprüft
- [ ] Rückmeldung im selben Bild wie der Treffer
- [ ] Menüeintrag aktiviert, Bildschirmfoto, Spezifikation ergänzt

## Abhängigkeiten
<Issues>
```

## B Größeres Vorhaben (Anforderungskatalog)

```
## Kurzbeschreibung
<Absatz; verwandte Issues.>

## Entscheidungen des Auftraggebers
| Nr. | Frage | Entscheidung |
|---|---|---|
| E-1 | | |

Annahmen der Dokumentation (bitte bestätigen oder korrigieren):
- …

## Spielablauf
1. …

## Anforderungskatalog
Priorität: M muss, S soll, K kann. Alle Zahlen sind Startwerte zum Abstimmen.

### A Spielregeln und Lernlogik
| Nr. | Anforderung | Prio |
|---|---|---|
| A1 | | M |

### B Szene   ### C Mechanik   ### D Kollision   ### E Ton
### F Querschnitt (z. B. Sprache)   ### G Grafik und Technik
### H Barrierefreiheit und Sicherheit   ### I Rechtliches

## Abwägung der Bibliotheken
| Option | Umfang | Bewertung | Entscheidung |
|---|---|---|---|

## Abnahmekriterien
- [ ] …

## Literatur
<Quellen>

*Dieses Issue plant nur, es wird noch nichts umgesetzt.*
```

## C Fortschrittskommentar

```
Stand mit Commit <sha> auf <Branch> (<Version>):

**Umgesetzt**
- …

**Abweichung vom Auftrag**
- <was, warum>

**Noch offen**
- …

**Geprüft** (<Skript>)
- …
- Nicht geprüft: <echte Hardware, Ton, …>
```
