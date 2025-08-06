@echo off
setlocal enabledelayedexpansion

REM Batch script para executar testes Cypress específicos da Sarah
REM Sistema Ministerial - Teste de Registro de Estudante com Data de Nascimento
REM Windows ES Module Compatible

echo.
echo 🧪 Executando Testes Cypress - Registro da Sarah com Data de Nascimento
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: package.json não encontrado
    echo    Certifique-se de estar no diretório raiz do projeto
    echo    Diretório atual: %CD%
    pause
    exit /b 1
)

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo ⚠️ node_modules não encontrado. Instalando dependências...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
)

REM Configurações da Sarah
echo 📋 Configuração do Teste da Sarah:
echo    Nome: Sarah Rackel Ferreira Lima
echo    Email: franklima.flm@gmail.com
echo    Data de Nascimento: 25/09/2009 (14 anos)
echo    Congregação: Market Harborough
echo    Cargo: Publicador Não Batizado
echo    Base URL: https://sua-parte.lovable.app
echo.

REM Verificar argumentos
if "%1"=="--help" goto :help
if "%1"=="-h" goto :help
if "%1"=="--open" goto :open
if "%1"=="-o" goto :open

REM Verificar se Cypress está instalado
echo 🔍 Verificando instalação do Cypress...
call npx cypress --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ❌ Cypress não encontrado. Instalando...
    call npm install cypress --save-dev
    if !ERRORLEVEL! NEQ 0 (
        echo ❌ Erro ao instalar Cypress
        pause
        exit /b 1
    )
)

REM Executar teste padrão da Sarah
echo 🤖 Executando testes da Sarah em modo headless...
echo.
echo 📁 Arquivo de teste: cypress/e2e/sarah-student-registration.cy.ts
echo 🌐 URL base: https://sua-parte.lovable.app
echo.

REM Usar caminho completo para npx para evitar problemas de PATH
call "%~dp0..\node_modules\.bin\cypress.cmd" run --spec "cypress/e2e/sarah-student-registration.cy.ts" 2>nul
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️ Tentando com npx...
    call npx cypress run --spec "cypress/e2e/sarah-student-registration.cy.ts"
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 Testes da Sarah concluídos com sucesso!
    echo.
    echo 📊 Resultados:
    echo    - Vídeos salvos em: cypress/videos/
    echo    - Screenshots se houver falhas: cypress/screenshots/
    echo.
    echo 🎂 Funcionalidades Testadas:
    echo    ✅ Registro com data de nascimento
    echo    ✅ Validação de idade 6-100 anos
    echo    ✅ Cálculo automático da idade
    echo    ✅ Armazenamento no banco de dados
    echo    ✅ Exibição no portal do estudante
    echo    ✅ Login e acesso ao portal
    echo.
    echo 💡 Comandos úteis:
    echo    npm run test:sarah                 # Executar teste da Sarah
    echo    npm run cypress:open               # Modo interativo
    echo    scripts\test-sarah-cypress.bat --open # Este script em modo interativo
) else (
    echo.
    echo ❌ Testes falharam
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Verificar se a aplicação está rodando
    echo    2. Verificar conectividade de rede
    echo    3. Verificar se o email da Sarah não está em uso
    echo    4. Executar em modo interativo: scripts\test-sarah-cypress.bat --open
    echo    5. Verificar se a funcionalidade de data de nascimento está implementada
)
goto :end

:open
echo 🖥️ Abrindo Cypress em modo interativo...
echo.
npx cypress open
goto :end

:help
echo.
echo 🧪 Script de Testes Cypress - Sarah Student Registration
echo.
echo Uso: scripts\test-sarah-cypress.bat [opções]
echo.
echo Opções:
echo   --open, -o              Abrir Cypress em modo interativo
echo   --help, -h              Mostrar esta ajuda
echo.
echo Exemplos:
echo   scripts\test-sarah-cypress.bat
echo   scripts\test-sarah-cypress.bat --open
echo.
echo 🎂 Funcionalidades Testadas:
echo   • Registro de estudante com data de nascimento
echo   • Validação de idade para Escola do Ministério 6-100 anos
echo   • Cálculo automático da idade em tempo real
echo   • Armazenamento da data de nascimento no banco de dados
echo   • Exibição da data de nascimento e idade no portal do estudante
echo   • Login e acesso ao portal personalizado
echo   • Validação de casos extremos muito jovem, muito velho, data futura
echo.
echo 👤 Dados de Teste da Sarah:
echo   • Nome: Sarah Rackel Ferreira Lima
echo   • Email: franklima.flm@gmail.com
echo   • Data de Nascimento: 25/09/2009 14 anos
echo   • Congregação: Market Harborough
echo   • Cargo: Publicador Não Batizado
echo.

:end
pause
