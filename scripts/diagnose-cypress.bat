@echo off
setlocal enabledelayedexpansion

REM Diagnostic script for Cypress issues
REM Sistema Ministerial - ES Module Troubleshooting

echo.
echo 🔍 Diagnóstico Cypress - Sistema Ministerial
echo    ES Module Compatibility Check
echo.

REM Check current directory
echo 📁 Verificando diretório atual...
echo    Diretório: %CD%
if exist "package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json NÃO encontrado
    echo    Navegue para: C:\Users\frank.MONITORE-MAFRA\Documents\GitHub\sua-parte
)

REM Check Node.js
echo.
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
) else (
    echo ❌ Node.js não encontrado
)

REM Check npm
echo.
echo 📦 Verificando npm...
npm --version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: v%%i
) else (
    echo ❌ npm não encontrado
)

REM Check package.json type
echo.
echo 📄 Verificando configuração do projeto...
if exist "package.json" (
    findstr /C:"\"type\": \"module\"" package.json >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Projeto configurado como ES module
    ) else (
        echo ⚠️ Projeto não é ES module
    )
) else (
    echo ❌ package.json não encontrado
)

REM Check node_modules
echo.
echo 📦 Verificando node_modules...
if exist "node_modules" (
    echo ✅ node_modules encontrado
    if exist "node_modules\cypress" (
        echo ✅ Cypress instalado em node_modules
    ) else (
        echo ❌ Cypress NÃO encontrado em node_modules
    )
) else (
    echo ❌ node_modules NÃO encontrado
)

REM Check Cypress binary
echo.
echo 🧪 Verificando binário do Cypress...
if exist "node_modules\.bin\cypress.cmd" (
    echo ✅ Binário do Cypress encontrado
    call node_modules\.bin\cypress.cmd --version >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Binário do Cypress funcional
    ) else (
        echo ❌ Binário do Cypress com problemas
    )
) else (
    echo ❌ Binário do Cypress NÃO encontrado
)

REM Check Cypress config
echo.
echo ⚙️ Verificando configuração do Cypress...
if exist "cypress.config.ts" (
    echo ✅ cypress.config.ts encontrado
    findstr /C:"export default" cypress.config.ts >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Configuração usa ES module syntax
    ) else (
        echo ⚠️ Configuração pode ter problemas de ES module
    )
) else (
    echo ❌ cypress.config.ts NÃO encontrado
)

REM Check test files
echo.
echo 📋 Verificando arquivos de teste...
if exist "cypress\e2e\sarah-student-registration.cy.ts" (
    echo ✅ Teste da Sarah encontrado
) else (
    echo ❌ Teste da Sarah NÃO encontrado
)

if exist "cypress\support\commands.ts" (
    echo ✅ Comandos customizados encontrados
) else (
    echo ❌ Comandos customizados NÃO encontrados
)

REM Test npx command
echo.
echo 🔧 Testando comando npx...
npx --version >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ npx funcional
    npx cypress --version >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ npx cypress funcional
    ) else (
        echo ❌ npx cypress com problemas
    )
) else (
    echo ❌ npx não funcional
)

REM Summary and recommendations
echo.
echo 📊 Resumo do Diagnóstico
echo ========================

if exist "package.json" if exist "node_modules\cypress" if exist "cypress.config.ts" (
    echo.
    echo ✅ Configuração básica OK
    echo.
    echo 💡 Comandos recomendados para testar:
    echo.
    echo    1. scripts\setup-and-test-cypress.bat
    echo    2. node_modules\.bin\cypress.cmd open
    echo    3. npm run test:sarah
    echo.
) else (
    echo.
    echo ❌ Problemas encontrados
    echo.
    echo 🔧 Passos para corrigir:
    echo.
    if not exist "package.json" (
        echo    1. Navegue para o diretório correto do projeto
    )
    if not exist "node_modules" (
        echo    2. Execute: npm install
    )
    if not exist "node_modules\cypress" (
        echo    3. Execute: npm install cypress --save-dev
    )
    if not exist "cypress.config.ts" (
        echo    4. Verifique se cypress.config.ts existe
    )
    echo.
)

echo 🔗 Para mais ajuda, execute:
echo    scripts\setup-and-test-cypress.bat
echo.

pause
