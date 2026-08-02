ZIT CAMPUS SPIELWIESE – RELEASE 0.4 FINAL
=========================================

Dieses Paket ist ein UPDATE für dein bestehendes Repository.
Es enthält die neuen und geänderten Dateien, aber nicht die bereits vorhandenen
Spiele Anatomie-Memory, Craniosacral-Quiz und Trauma-Kreuzworträtsel.

ENTHALTEN
---------
- Neues 10-Step-Domino mit vollständiger Reihenfolge
- Schritt 7: Schulterblätter lösen
- Traumakreislauf mit den eingesandten Bildkarten
- Abschlussbild in der Mitte nach erfolgreicher Lösung
- Aktualisierte Schmetterlingswiese
- Gemeinsames Punktesystem
- Domino-Kachel für die Haupt-Spielwiese
- Windows-Installationsskript mit Sicherung der Haupt-index.html

EMPFOHLENE INSTALLATION UNTER WINDOWS
-------------------------------------
1. ZIP entpacken.
2. Den entpackten Ordner an einen beliebigen Ort legen.
3. Im Ordner „tools“ die Datei „release-installieren.ps1“ ausführen.
   Alternativ PowerShell öffnen und eingeben:

   powershell -ExecutionPolicy Bypass -File ".\tools\release-installieren.ps1" -RepoPfad "C:\Users\DEINNAME\Documents\GitHub\ZIT-Campus-Spielwiese"

4. Das Skript kopiert die Dateien in dein Repository und legt vorher neben der
   Haupt-index.html eine Sicherung mit der Endung .backup-release-0.4 an.
5. Danach GitHub Desktop öffnen, Änderungen prüfen, committen und pushen.

MANUELLE INSTALLATION
---------------------
- games/10-step-domino komplett in dein Repository kopieren.
- games/traumakreislauf komplett ersetzen.
- games/schmetterlingswiese komplett ersetzen.
- shared/zit-points.js ersetzen.
- Den Inhalt von SPIELWIESE-KACHEL.html in den Kartenbereich deiner Haupt-index.html einfügen.

ORDNERSTRUKTUR IM REPOSITORY
----------------------------
ZIT-Campus-Spielwiese/
├── index.html
├── shared/
│   └── zit-points.js
└── games/
    ├── 10-step-domino/
    │   └── index.html
    ├── traumakreislauf/
    │   ├── index.html
    │   └── assets/
    └── schmetterlingswiese/
        ├── index.html
        ├── script.js
        └── style.css

WICHTIGE LINKS
---------------
games/10-step-domino/index.html
games/traumakreislauf/index.html
games/schmetterlingswiese/index.html

PUNKTE
------
- Traumakreislauf: einmalig 20 Punkte
- 10-Step-Domino: einmalig 20 Punkte
- Wiederholungen vergeben keine weiteren Punkte.
