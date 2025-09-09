@echo off
echo 🚀 Testando Cypress Cloud com credenciais corretas...

REM Configurar variáveis de ambiente
set "CYPRESS_RECORD_KEY=a0b30189-faea-475f-9aa8-89eface58524"
set "CYPRESS_INTERNAL_BROWSER_CONNECT_TIMEOUT=60000"
set "CYPRESS_VERIFY_TIMEOUT=100000"

REM Verificar se o servidor está rodando
echo 🔍 Verificando servidor...
curl -s http://localhost:8080 > nul
if %errorlevel% neq 0 (
    echo ❌ Servidor não encontrado em http://localhost:8080
    echo 💡 Execute 'npm run dev' em outro terminal primeiro
    pause
    exit /b 1
)

echo ✅ Servidor encontrado em http://localhost:8080

REM Executar teste específico de autenticação
echo 🧪 Executando teste de autenticação com gravação...
npx cypress run --record --spec "cypress/e2e/authentication-roles.cy.ts"

echo 🎉 Teste concluído!
echo 📊 Verifique os resultados em: https://cloud.cypress.io/projects/o6ctse
pause
