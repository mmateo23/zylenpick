$ErrorActionPreference = "Stop"

$sourceRoot = "C:\Users\Manu\Documents\FknFood"
$targetRoot = "C:\Users\Manu\Documents\FknFood-full-backup"

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

$robocopyArgs = @(
  $sourceRoot,
  $targetRoot,
  "/E",
  "/XO",
  "/FFT",
  "/R:1",
  "/W:1",
  "/XJ",
  "/XD",
  "$targetRoot"
)

& robocopy @robocopyArgs | Out-Host

if ($LASTEXITCODE -ge 8) {
  throw "robocopy falló al copiar el proyecto completo. Código: $LASTEXITCODE"
}

Write-Host ""
Write-Host "Backup completo actualizado en $targetRoot"
