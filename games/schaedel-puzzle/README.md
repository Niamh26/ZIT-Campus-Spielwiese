# 3D-Schädelpuzzle

Interaktives Puzzle mit 22 anatomisch getrennten Schädelknochen.

- Verschieben, Drehen, Zielposition prüfen und Tipp-Geisterform
- 20 Punkte für die Schmetterlingswiese beim ersten vollständigen Lösen
- Farben in Anlehnung an ein didaktisch farbcodiertes Schädelmodell
- BodyParts3D/FMA-Zuordnung siehe `ATTRIBUTION.md`

## Modelle
Die Seite lädt zuerst lokale STL-Dateien aus `models/`. Falls sie dort fehlen, wird als Fallback die offene BodyParts3D-Konvertierung auf GitHub verwendet. Die mitgelieferte GitHub-Action kann die 22 STL-Dateien beim Pages-Deployment automatisch bereitstellen.
