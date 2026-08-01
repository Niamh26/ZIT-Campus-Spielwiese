# ZIT Campus – Trauma-Kreislauf ordnen

Interaktives Schiebespiel mit den hochgeladenen Hasen- und Tigerzeichnungen.

## Ordnerstruktur

```text
games/
└── trauma-kreislauf/
    ├── index.html
    ├── style.css
    ├── script.js
    ├── data.js
    └── images/
```

## Einbau

Kopiere den vollständigen Ordner `trauma-kreislauf` nach:

```text
ZIT-Campus-Spielwiese/games/
```

Direkter Link:

```text
games/trauma-kreislauf/index.html
```

## Eigene Erklärungen schreiben

Öffne `data.js`.

Dort findest du pro Station:

```javascript
{
  id: "station-01",
  bild: "images/station-01.jpg",
  titel: "Station 1",
  erklaerung: "Hier kannst du deine Erklärung eintragen."
}
```

Ändere nur `titel` und `erklaerung`. Die Reihenfolge der Einträge ist zugleich die richtige Reihenfolge im Kreislauf.

## Punkte

Bei vollständiger Lösung versucht das Spiel einmalig 20 Punkte über:

```text
shared/zit-points.js
```

zu vergeben. Falls die gemeinsame Punktedatei noch nicht eingebunden ist, funktioniert das Spiel trotzdem; lediglich die Punktevergabe bleibt dann aus.

## Haupt-Index

Für die Startseite wird später eine neue vollständige `index.html` mit der zusätzlichen Kachel erstellt.
