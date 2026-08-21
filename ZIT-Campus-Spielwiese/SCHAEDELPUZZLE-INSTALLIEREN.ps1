$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$puzzle = Join-Path $root 'games\schaedel-puzzle'
$modelDir = Join-Path $puzzle 'models'
$vendorDir = Join-Path $puzzle 'vendor\three'
$controlsDir = Join-Path $vendorDir 'addons\controls'
$loadersDir = Join-Path $vendorDir 'addons\loaders'

New-Item -ItemType Directory -Force -Path $modelDir,$vendorDir,$controlsDir,$loadersDir | Out-Null

function Get-FileChecked {
    param([string]$Url,[string]$OutFile,[int]$MinBytes=100)
    Write-Host "  Lade: $([IO.Path]::GetFileName($OutFile))" -ForegroundColor Cyan
    $tmp = "$OutFile.download"
    if (Test-Path $tmp) { Remove-Item $tmp -Force }
    Invoke-WebRequest -Uri $Url -OutFile $tmp -UseBasicParsing -Headers @{ 'User-Agent'='ZIT-SchaedelPuzzle-Installer' }
    if (!(Test-Path $tmp)) { throw "Download fehlgeschlagen: $Url" }
    $len = (Get-Item $tmp).Length
    if ($len -lt $MinBytes) { Remove-Item $tmp -Force; throw "Datei ist unerwartet klein ($len Bytes): $Url" }
    Move-Item $tmp $OutFile -Force
}

Write-Host ''
Write-Host 'ZIT 3D-Schaedelpuzzle - Windows-Installer' -ForegroundColor Green
Write-Host '------------------------------------------------'
Write-Host 'Dieser Installer legt die 3D-Bibliothek und 22 Knochen lokal im Repository ab.'
Write-Host ''

# Three.js r180, pinned version
$threeBase = 'https://cdn.jsdelivr.net/npm/three@0.180.0'
Get-FileChecked "$threeBase/build/three.module.js" (Join-Path $vendorDir 'three.module.js') 500000
Get-FileChecked "$threeBase/build/three.core.js" (Join-Path $vendorDir 'three.core.js') 900000
Get-FileChecked "$threeBase/examples/jsm/controls/OrbitControls.js" (Join-Path $controlsDir 'OrbitControls.js') 10000
Get-FileChecked "$threeBase/examples/jsm/controls/TransformControls.js" (Join-Path $controlsDir 'TransformControls.js') 10000
Get-FileChecked "$threeBase/examples/jsm/loaders/STLLoader.js" (Join-Path $loadersDir 'STLLoader.js') 5000

# BodyParts3D/FMA skull bones
$bpBase = 'https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl'
$ids = @(
 'FMA52734','FMA52735','FMA52736','FMA52738','FMA52739','FMA52740','FMA52748',
 'FMA52788','FMA52789','FMA52892','FMA52893','FMA53645','FMA53646','FMA53647',
 'FMA53648','FMA53649','FMA53650','FMA53655','FMA53656','FMA9710','FMA54737','FMA54738'
)

$ok = 0
foreach ($id in $ids) {
    $out = Join-Path $modelDir "$id.stl"
    Get-FileChecked "$bpBase/$id.stl" $out 1000
    $ok++
}

# Verify complete installation
$missing = @()
foreach ($id in $ids) {
    if (!(Test-Path (Join-Path $modelDir "$id.stl"))) { $missing += $id }
}
$vendorFiles = @(
 (Join-Path $vendorDir 'three.module.js'),
 (Join-Path $vendorDir 'three.core.js'),
 (Join-Path $controlsDir 'OrbitControls.js'),
 (Join-Path $controlsDir 'TransformControls.js'),
 (Join-Path $loadersDir 'STLLoader.js')
)
foreach ($f in $vendorFiles) { if (!(Test-Path $f)) { $missing += $f } }

if ($missing.Count -gt 0) {
    Write-Host ''
    Write-Host 'Installation UNVOLLSTAENDIG.' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  fehlt: $_" -ForegroundColor Red }
    Read-Host 'Enter zum Beenden'
    exit 1
}

Write-Host ''
Write-Host "FERTIG: $ok von 22 Knochen + Three.js (inkl. three.core.js) wurden lokal installiert." -ForegroundColor Green
Write-Host ''
Write-Host 'Naechste Schritte:' -ForegroundColor Yellow
Write-Host '1. GitHub Desktop oeffnen.'
Write-Host '2. Die neuen Dateien committen.'
Write-Host '3. Push origin.'
Write-Host '4. Nach dem GitHub-Pages-Deployment das 3D-Schaedelpuzzle neu laden.'
Write-Host ''
Write-Host 'Wichtig: Den Ordner games\schaedel-puzzle\models und vendor mit committen.'
Write-Host ''
Read-Host 'Enter zum Beenden'
