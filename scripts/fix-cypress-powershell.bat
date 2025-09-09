@echo off
REM Fix PowerShell spawn error for Cypress on Windows
REM This script ensures PowerShell is available in PATH and runs Cypress with proper configuration

echo 🔧 Fixing PowerShell PATH for Cypress...

REM Add PowerShell to PATH if not present
set "POWERSHELL_PATH=C:\Windows\System32\WindowsPowerShell\v1.0"
echo Current PATH: %PATH%

REM Check if PowerShell path is already in PATH
echo %PATH% | findstr /i "%POWERSHELL_PATH%" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ PowerShell not found in PATH, adding...
    set "PATH=%POWERSHELL_PATH%;%PATH%"
    echo ✅ PowerShell added to PATH
) else (
    echo ✅ PowerShell already in PATH
)

REM Set Cypress environment variables
set "CYPRESS_INTERNAL_BROWSER_CONNECT_TIMEOUT=60000"
set "CYPRESS_VERIFY_TIMEOUT=100000"
set "CYPRESS_CRASH_REPORTS=0"
set "CI=false"

REM Load environment variables from .env file
if exist ".env" (
    echo 📄 Loading environment variables from .env...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
    echo ✅ Environment variables loaded
)

REM Verify PowerShell is accessible
echo 🧪 Testing PowerShell accessibility...
powershell.exe -Command "Write-Host 'PowerShell is working'" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ PowerShell test successful
) else (
    echo ❌ PowerShell test failed
    echo Trying alternative PowerShell path...
    "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -Command "Write-Host 'PowerShell is working'"
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Alternative PowerShell path works
    ) else (
        echo ❌ PowerShell not accessible, continuing anyway...
    )
)

echo.
echo 🚀 Running Cypress with fixed configuration...

REM Run Cypress based on parameters
if "%1"=="record" (
    echo 📹 Running Cypress with recording...
    npx cypress run --record --key %CYPRESS_RECORD_KEY%
) else if "%1"=="record-spec" (
    echo 📹 Running specific test with recording...
    npx cypress run --spec "%2" --record --key %CYPRESS_RECORD_KEY%
) else if "%1"=="open" (
    echo 🖥️ Opening Cypress GUI...
    npx cypress open
) else if "%1"=="run" (
    echo 🤖 Running Cypress headless...
    npx cypress run
) else if "%1"=="auth" (
    echo 🔐 Running authentication tests with recording...
    npx cypress run --spec "cypress/e2e/authentication-roles.cy.ts" --record --key %CYPRESS_RECORD_KEY%
) else (
    echo.
    echo 📋 Usage: fix-cypress-powershell.bat [command]
    echo.
    echo Available commands:
    echo   record          - Run all tests with Cypress Cloud recording
    echo   record-spec     - Run specific test with recording (requires spec path)
    echo   open            - Open Cypress GUI
    echo   run             - Run tests headless (no recording)
    echo   auth            - Run authentication tests with recording
    echo.
    echo Examples:
    echo   scripts\fix-cypress-powershell.bat record
    echo   scripts\fix-cypress-powershell.bat record-spec "cypress/e2e/authentication-roles.cy.ts"
    echo   scripts\fix-cypress-powershell.bat auth
    echo   scripts\fix-cypress-powershell.bat open
)

echo.
echo ✅ Script completed
pause
