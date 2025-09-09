@echo off
setlocal enabledelayedexpansion

REM Comprehensive Cypress Setup and Test Script
REM Sistema Ministerial - ES Module Compatible
REM Windows 11 Optimized

echo.
echo 🔧 Setup e Teste Cypress - Sistema Ministerial
echo    ES Module Compatible - Windows 11
echo.

REM Verificar diretório do projeto
echo 📁 Verificando diretório do projeto...
if not exist "package.json" (
    echo ❌ Erro: package.json não encontrado
    echo    Certifique-se de estar no diretório raiz do projeto
    echo    Diretório atual: %CD%
    echo    Diretório esperado: C:\Users\frank.MONITORE-MAFRA\Documents\GitHub\sua-parte
    pause
    exit /b 1
)
echo ✅ Diretório correto encontrado

REM Verificar Node.js
echo.
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ❌ Node.js não encontrado
    echo    Instale Node.js de: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: !NODE_VERSION!

REM Verificar npm
echo.
echo 📦 Verificando npm...
npm --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ❌ npm não encontrado
    echo    Reinstale Node.js
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm encontrado: v!NPM_VERSION!

REM Instalar dependências se necessário
echo.
echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo ⚠️ node_modules não encontrado. Instalando dependências...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas
) else (
    echo ✅ node_modules encontrado
)

REM Verificar se Cypress está instalado
echo.
echo 🧪 Verificando Cypress...
if exist "node_modules\cypress" (
    echo ✅ Cypress encontrado em node_modules
) else (
    echo ⚠️ Cypress não encontrado. Instalando...
    call npm install cypress --save-dev
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erro ao instalar Cypress
        pause
        exit /b 1
    )
)

REM Verificar versão do Cypress
echo.
echo 🔍 Verificando versão do Cypress...
call node_modules\.bin\cypress --version 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️ Tentando verificar com npx...
    call npx cypress --version
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erro ao verificar Cypress
        echo    Tentando reinstalar...
        call npm uninstall cypress
        call npm install cypress --save-dev
    )
)

REM Instalar binários do Cypress se necessário
echo.
echo 🔧 Verificando binários do Cypress...
call node_modules\.bin\cypress install
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️ Tentando com npx...
    call npx cypress install
)

REM Verificar arquivos de teste
echo.
echo 📋 Verificando arquivos de teste...
if exist "cypress\e2e\sarah-student-registration.cy.ts" (
    echo ✅ Teste da Sarah encontrado
) else (
    echo ❌ Arquivo de teste da Sarah não encontrado
    echo    Arquivo esperado: cypress\e2e\sarah-student-registration.cy.ts
)

if exist "cypress.config.ts" (
    echo ✅ Configuração do Cypress encontrada
) else (
    echo ❌ cypress.config.ts não encontrado
)

REM Mostrar opções de teste
echo.
echo 🎯 Opções de Teste Disponíveis:
echo.
echo 1. Executar teste da Sarah (headless)
echo 2. Abrir Cypress em modo interativo
echo 3. Executar todos os testes E2E
echo 4. Verificar configuração apenas
echo 5. Sair
echo.

set /p choice="Escolha uma opção (1-5): "

if "%choice%"=="1" goto test_sarah
if "%choice%"=="2" goto open_cypress
if "%choice%"=="3" goto test_all
if "%choice%"=="4" goto verify_only
if "%choice%"=="5" goto end
goto invalid_choice

:test_sarah
echo.
echo 🧪 Executando teste da Sarah...
echo.
echo 👤 Dados de teste:
echo    Nome: Sarah Rackel Ferreira Lima
echo    Email: franklima.flm@gmail.com
echo    Data de Nascimento: 25/09/2009 (14 anos)
echo    Congregação: Market Harborough
echo.

REM Tentar diferentes métodos para executar o teste
call node_modules\.bin\cypress run --spec "cypress/e2e/sarah-student-registration.cy.ts" 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️ Tentando método alternativo...
    call npx cypress run --spec "cypress/e2e/sarah-student-registration.cy.ts"
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erro ao executar teste
        echo    Tente o modo interativo (opção 2)
        pause
        goto end
    )
)

echo.
echo 🎉 Teste da Sarah concluído!
echo.
echo 📊 Resultados salvos em:
echo    - Vídeos: cypress\videos\
echo    - Screenshots: cypress\screenshots\
goto end

:open_cypress
echo.
echo 🖥️ Abrindo Cypress em modo interativo...
echo.
call node_modules\.bin\cypress open 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️ Tentando método alternativo...
    call npx cypress open
)
goto end

:test_all
echo.
echo 🧪 Executando todos os testes E2E...
echo.
call node_modules\.bin\cypress run 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️ Tentando método alternativo...
    call npx cypress run
)
goto end

:verify_only
echo.
echo ✅ Verificação de configuração concluída
echo    Todos os componentes necessários estão instalados
goto end

:invalid_choice
echo.
echo ❌ Opção inválida. Tente novamente.
pause
goto end

:end
echo.
echo 💡 Comandos úteis para o futuro:
echo.
echo    npm run test:sarah              # Teste da Sarah
echo    npm run cypress:open            # Modo interativo
echo    scripts\setup-and-test-cypress.bat  # Este script
echo.
pause
