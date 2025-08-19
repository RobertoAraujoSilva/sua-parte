@echo off
echo 🧪 EXECUTANDO TESTES CYPRESS - SISTEMA MINISTERIAL
echo ==================================================

REM Configurar variáveis de ambiente
set CYPRESS_INSTRUCTOR_EMAIL=frankwebber33@hotmail.com
set CYPRESS_INSTRUCTOR_PASSWORD=senha123
set CYPRESS_STUDENT_EMAIL=franklinmarceloferreiradelima@gmail.com
set CYPRESS_STUDENT_PASSWORD=senha123
set FRANKLIN_EMAIL=franklinmarceloferreiradelima@gmail.com
set FRANKLIN_PASSWORD=senha123

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
)

REM Verificar se o Cypress está instalado
npx cypress --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando Cypress...
    npm install cypress --save-dev
    if errorlevel 1 (
        echo ❌ Erro ao instalar Cypress
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Iniciando aplicação em modo de desenvolvimento...
echo.

REM Iniciar aplicação em background
start "Sistema Ministerial - Dev Server" cmd /c "npm run dev"

REM Aguardar aplicação inicializar
echo ⏳ Aguardando aplicação inicializar...
timeout /t 10 /nobreak >nul

REM Verificar se a aplicação está rodando
echo 🔍 Verificando se a aplicação está rodando...
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    echo ⏳ Aguardando mais tempo para aplicação inicializar...
    timeout /t 15 /nobreak >nul
)

echo.
echo 🧪 Executando testes Cypress...
echo.

REM Executar testes específicos
echo 📋 Executando teste completo do sistema...
npx cypress run --spec "cypress/e2e/sistema-ministerial-completo.cy.ts" --browser chrome --headed

if errorlevel 1 (
    echo.
    echo ❌ Alguns testes falharam. Verificando detalhes...
    echo.
    
    REM Executar testes em modo interativo para debug
    echo 🔍 Abrindo Cypress em modo interativo para debug...
    npx cypress open
) else (
    echo.
    echo ✅ Todos os testes passaram com sucesso!
    echo.
)

REM Parar aplicação de desenvolvimento
echo 🛑 Parando servidor de desenvolvimento...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🎉 Testes concluídos!
echo.
pause
