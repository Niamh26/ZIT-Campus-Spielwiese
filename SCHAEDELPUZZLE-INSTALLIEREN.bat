@echo off
setlocal
cd /d "%~dp0"
echo.
echo ZIT 3D-Schaedelpuzzle - Installation wird gestartet...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0SCHAEDELPUZZLE-INSTALLIEREN.ps1"
if errorlevel 1 (
  echo.
  echo Die Installation wurde nicht vollstaendig abgeschlossen.
  pause
  exit /b 1
)
endlocal
