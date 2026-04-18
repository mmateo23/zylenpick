$ErrorActionPreference = "Stop"

$sourceRoot = "C:\Users\Manu\Documents\FknFood"
$targetRoot = "C:\Users\Manu\Documents\FknFood-demo-backup"

$robocopyArgs = @("/XO", "/FFT", "/R:1", "/W:1", "/NJH", "/NJS", "/NP")

$jobs = @(
  @{
    Source = Join-Path $sourceRoot "src\components\demo"
    Target = Join-Path $targetRoot "src\components\demo"
    Files  = @("*.tsx")
  },
  @{
    Source = Join-Path $sourceRoot "src\components\layout"
    Target = Join-Path $targetRoot "src\components\layout"
    Files  = @("zylenpick-footer.tsx")
  },
  @{
    Source = Join-Path $sourceRoot "src\app\demo"
    Target = Join-Path $targetRoot "src\app\demo"
    Files  = @("page.tsx")
  },
  @{
    Source = Join-Path $sourceRoot "src\app\demo\platos"
    Target = Join-Path $targetRoot "src\app\demo\platos"
    Files  = @("page.tsx")
  }
)

foreach ($job in $jobs) {
  if (-not (Test-Path $job.Source)) {
    continue
  }

  New-Item -ItemType Directory -Force -Path $job.Target | Out-Null

  & robocopy $job.Source $job.Target $job.Files @robocopyArgs | Out-Host

  if ($LASTEXITCODE -ge 8) {
    throw "robocopy falló al copiar desde $($job.Source) a $($job.Target). Código: $LASTEXITCODE"
  }
}

Write-Host ""
Write-Host "Backup actualizado en $targetRoot"
