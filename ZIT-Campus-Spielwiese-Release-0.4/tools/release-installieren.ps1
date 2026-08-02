param(
  [string]$RepoPfad = (Resolve-Path (Join-Path $PSScriptRoot "..\.."))
)

$ErrorActionPreference = "Stop"
$release = Resolve-Path (Join-Path $PSScriptRoot "..")
$repo = Resolve-Path $RepoPfad

Write-Host "Installiere ZIT Campus Release 0.4 nach $repo" -ForegroundColor Green

# Dateien kopieren
$folders = @("games\10-step-domino", "games\traumakreislauf", "games\schmetterlingswiese", "shared")
foreach ($folder in $folders) {
  $source = Join-Path $release $folder
  $target = Join-Path $repo $folder
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Copy-Item -Path (Join-Path $source "*") -Destination $target -Recurse -Force
}

# Haupt-Spielwiese um die Domino-Kachel ergänzen
$indexPath = Join-Path $repo "index.html"
if (-not (Test-Path $indexPath)) {
  throw "Keine index.html im Repository-Stamm gefunden: $indexPath"
}

$html = Get-Content -Raw -Encoding UTF8 $indexPath
if ($html -match 'games/10-step-domino/index\.html') {
  Write-Host "Die Domino-Kachel ist bereits vorhanden." -ForegroundColor Yellow
} else {
  $card = @'

        <article class="game-card">
          <div class="game-icon" aria-hidden="true">🁣</div>
          <div class="status-badge">Spielbereit</div>
          <h2>10-Step-Domino</h2>
          <p>Lege die zehn Behandlungsschritte des 10-Step-Protokolls in die richtige Reihenfolge.</p>
          <a class="game-button" href="games/10-step-domino/index.html">Domino starten →</a>
        </article>
'@

  $needle = 'Trauma-Kreislauf'
  $titlePos = $html.IndexOf($needle)
  if ($titlePos -lt 0) {
    throw "Die Trauma-Kreislauf-Kachel wurde nicht gefunden. Bitte SPIELWIESE-KACHEL.html manuell einfügen."
  }

  $articleEnd = $html.IndexOf('</article>', $titlePos)
  if ($articleEnd -lt 0) {
    throw "Das Ende der Trauma-Kreislauf-Kachel wurde nicht gefunden. Bitte manuell einfügen."
  }
  $articleEnd += '</article>'.Length
  $html = $html.Insert($articleEnd, $card)
  Set-Content -Path $indexPath -Value $html -Encoding UTF8
  Write-Host "Domino-Kachel wurde in index.html eingefügt." -ForegroundColor Green
}

Write-Host "Release 0.4 ist installiert. Jetzt in GitHub Desktop committen und pushen." -ForegroundColor Cyan
