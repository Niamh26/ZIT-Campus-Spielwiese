# ZIT 3D-Schädelpuzzle

Das Spiel lädt 22 getrennte BodyParts3D-STL-Dateien. Es versucht zuerst `./models/*.stl`; falls diese Dateien noch nicht lokal vorhanden sind, nutzt es als Fallback die frei zugänglichen STL-Dateien des BodyParts3D-GitHub-Klons.

Die mitgelieferte GitHub-Action `.github/workflows/pages-with-skull-models.yml` lädt beim Pages-Build alle 22 STL-Dateien lokal in das veröffentlichte Website-Artefakt. Dadurch laufen die Modelle auf GitHub Pages ohne Abhängigkeit von den Remote-Dateien zur Laufzeit.
