ZIT CAMPUS SPIELWIESE – RELEASE 0.4
===================================

Enthalten:
- Neues 10-Step-Domino mit vollständiger Reihenfolge
- Schritt 7: Schulterblätter lösen
- Traumakreislauf mit Bildkarten und Abschlussbild
- Schmetterlingswiese inklusive Eintrag für beide Spiele
- Gemeinsames Punktesystem
- HTML-Kachel für die Haupt-Spielwiese
- Windows-Installationsskript

SCHNELLSTE INSTALLATION UNTER WINDOWS
-------------------------------------
1. ZIP entpacken.
2. Den Ordner „ZIT-Campus-Spielwiese-Release-0.4“ direkt in den Stamm deines lokalen
   GitHub-Projekts kopieren oder dort ablegen.
3. PowerShell öffnen.
4. Folgenden Befehl ausführen, wobei der Pfad zu deinem Repository angepasst wird:

   powershell -ExecutionPolicy Bypass -File .\tools\release-installieren.ps1 -RepoPfad "C:\Users\DEINNAME\Documents\GitHub\ZIT-Campus-Spielwiese"

5. Anschließend in GitHub Desktop alle Änderungen committen und pushen.

MANUELLE INSTALLATION
---------------------
- games/10-step-domino komplett in das Repository kopieren.
- games/traumakreislauf komplett ersetzen.
- games/schmetterlingswiese komplett ersetzen.
- shared/zit-points.js ersetzen.
- Den Inhalt von SPIELWIESE-KACHEL.html in den Kartenbereich der Haupt-index.html einfügen.

WICHTIGE LINKS
---------------
10-Step-Domino:
  games/10-step-domino/index.html

Traumakreislauf:
  games/traumakreislauf/index.html

PUNKTE
------
- Traumakreislauf: einmalig 20 Punkte
- 10-Step-Domino: einmalig 20 Punkte
- Wiederholungen vergeben keine weiteren Punkte.
