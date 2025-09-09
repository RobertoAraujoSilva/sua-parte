@echo off
REM Script para executar Cypress com correções para Windows
REM Resolve problemas de PowerShell spawn error

echo 🔧 Configurando ambiente para Cypress...

REM Adicionar PowerShell ao PATH se não estiver presente
set "POWERSHELL_PATH=C:\Windows\System32\WindowsPowerShell\v1.0"
set "PATH=%POWERSHELL_PATH%;%PATH%"

REM Configurar variáveis de ambiente para Cypress
set "CYPRESS_INTERNAL_BROWSER_CONNECT_TIMEOUT=60000"
set "CYPRESS_VERIFY_TIMEOUT=100000"
set "CYPRESS_RECORD_KEY=a0b30189-faea-475f-9aa8-89eface58524"

REM Verificar se o servidor de desenvolvimento está rodando
echo 🌐 Verificando servidor de desenvolvimento...
curl -s http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Servidor não está rodando em http://localhost:8080
    echo 💡 Execute 'npm run dev' em outro terminal primeiro
    pause
    exit /b 1
)

echo ✅ Servidor encontrado em http://localhost:8080

REM Executar Cypress baseado no parâmetro
if "%1"=="open" (
    echo 🖥️ Abrindo Cypress em modo interativo...
    npx cypress open
) else if "%1"=="headless" (
    echo 🤖 Executando Cypress em modo headless...
    npx cypress run --spec "cypress/e2e/auditoria_sistema_ministerial.cy.ts" --browser chrome
) else if "%1"=="audit" (
    echo 🔍 Executando teste de auditoria...
    npx cypress run --spec "cypress/e2e/auditoria_sistema_ministerial.cy.ts" --browser chrome --headless
) else if "%1"=="record" (
    echo 📹 Executando teste de auditoria com gravação no Cypress Cloud...
    npx cypress run --spec "cypress/e2e/auditoria_sistema_ministerial.cy.ts" --browser chrome --headless --record
) else if "%1"=="record-all" (
    echo 📹 Executando todos os testes com gravação no Cypress Cloud...
    npx cypress run --record
) else if "%1"=="auth" (
    echo 🔐 Executando testes de autenticação e roles...
    npx cypress run --spec "cypress/e2e/authentication-roles.cy.ts" --browser chrome --headless
) else if "%1"=="auth-record" (
    echo 🔐📹 Executando testes de autenticação com gravação no Cypress Cloud...
    npx cypress run --spec "cypress/e2e/authentication-roles.cy.ts" --browser chrome --headless --record
) else (
    echo 📋 Uso: run-cypress-fixed.bat [open|headless|audit|record|record-all|auth|auth-record]
    echo.
    echo   open       - Abre Cypress em modo interativo
    echo   headless   - Executa todos os testes em modo headless
    echo   audit      - Executa apenas o teste de auditoria
    echo   record     - Executa teste de auditoria com gravação no Cypress Cloud
    echo   record-all - Executa todos os testes com gravação no Cypress Cloud
    echo   auth       - Executa testes de autenticação e roles
    echo   auth-record- Executa testes de autenticação com gravação no Cypress Cloud
    echo.
    echo 🔧 Executando teste de auditoria por padrão...
    npx cypress run --spec "cypress/e2e/auditoria_sistema_ministerial.cy.ts" --browser chrome --headless
)

echo.
echo ✅ Execução concluída!
pause
