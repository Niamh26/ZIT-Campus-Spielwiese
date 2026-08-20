# ZIT Campus – Trauma-Kreuzworträtsel

Interaktives Kreuzworträtsel mit 20 Begriffen aus dem hochgeladenen Ausbildungsskript.

## Einbau ins Repository

Kopiere den vollständigen Ordner `trauma-kreuzwortraetsel` nach:

```text
games/trauma-kreuzwortraetsel/
```

Danach lautet der direkte Link:

```text
games/trauma-kreuzwortraetsel/index.html
```

## Eintrag für die Startseite

Füge im Bereich `"games"` der Haupt-`index.html` diesen Eintrag ein:

```json
{
  "id": "trauma-kreuzwortraetsel",
  "icon": "🧩",
  "title": "Trauma-Kreuzworträtsel",
  "description": "Zentrale Begriffe aus Trauma und Nervensystem spielerisch wiederholen.",
  "status": "available",
  "statusText": "Spielbereit",
  "buttonText": "Rätsel starten",
  "url": "games/trauma-kreuzwortraetsel/index.html",
  "visible": true
}
```

Achte auf ein Komma zwischen den Spieleinträgen.

## GitHub Desktop

Summary:

```text
Trauma-Kreuzworträtsel hinzugefügt
```

Dann `Commit to main` und `Push origin`.
