param(
  [string]$FrontendUrl = "http://localhost:8080",
  [string]$BackendUrl = "http://localhost:3001",
  [string]$Scenario = "testsprite_tests/scenarios/min_smoke.json"
)

Write-Host "🚀 Running TestSprite smoke tests"

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Error "Python not found in PATH. Please install Python and try again."
  exit 1
}

# Prompt for API key securely
$secure = Read-Host -AsSecureString "Enter TESTSPRITE_API_KEY"
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if (-not $plain -or $plain.Trim().Length -eq 0) {
  Write-Error "TESTSPRITE_API_KEY is required. Aborting."
  exit 1
}

$env:TESTSPRITE_API_KEY = $plain

Write-Host "🌐 Frontend: $FrontendUrl"
Write-Host "🔧 Backend:  $BackendUrl"
Write-Host "📝 Scenario:  $Scenario"

python "testsprite_tests/run_testsprite_with_api.py" --scenario "$Scenario" --frontend "$FrontendUrl" --backend "$BackendUrl"

exit $LASTEXITCODE

