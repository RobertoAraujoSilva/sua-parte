# 🧪 Script de Execução dos Testes Cypress - Sistema Ministerial
# ================================================================

Write-Host "🧪 EXECUTANDO TESTES CYPRESS - SISTEMA MINISTERIAL" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Configurar variáveis de ambiente
$env:CYPRESS_INSTRUCTOR_EMAIL = "frankwebber33@hotmail.com"
$env:CYPRESS_INSTRUCTOR_PASSWORD = "senha123"
$env:CYPRESS_STUDENT_EMAIL = "franklinmarceloferreiradelima@gmail.com"
$env:CYPRESS_STUDENT_PASSWORD = "senha123"
$env:FRANKLIN_EMAIL = "franklinmarceloferreiradelima@gmail.com"
$env:FRANKLIN_PASSWORD = "senha123"

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Erro ao instalar dependências"
        }
    } catch {
        Write-Host "❌ Erro ao instalar dependências: $_" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

# Verificar se o Cypress está instalado
try {
    $cypressVersion = npx cypress --version
    Write-Host "✅ Cypress encontrado: $cypressVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando Cypress..." -ForegroundColor Yellow
    try {
        npm install cypress --save-dev
        if ($LASTEXITCODE -ne 0) {
            throw "Erro ao instalar Cypress"
        }
    } catch {
        Write-Host "❌ Erro ao instalar Cypress: $_" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Iniciando aplicação em modo de desenvolvimento..." -ForegroundColor Yellow
Write-Host ""

# Iniciar aplicação em background
$devServer = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WindowStyle Minimized -PassThru

# Aguardar aplicação inicializar
Write-Host "⏳ Aguardando aplicação inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar se a aplicação está rodando
Write-Host "🔍 Verificando se a aplicação está rodando..." -ForegroundColor Yellow
$maxAttempts = 10
$attempt = 0

do {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Aplicação rodando em http://localhost:5173" -ForegroundColor Green
            break
        }
    } catch {
        if ($attempt -lt $maxAttempts) {
            Write-Host "⏳ Tentativa $attempt/$maxAttempts - Aguardando aplicação..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        } else {
            Write-Host "❌ Aplicação não respondeu após $maxAttempts tentativas" -ForegroundColor Red
            Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
            Read-Host "Pressione Enter para sair"
            exit 1
        }
    }
} while ($attempt -lt $maxAttempts)

Write-Host ""
Write-Host "🧪 Executando testes Cypress..." -ForegroundColor Yellow
Write-Host ""

# Executar testes específicos
Write-Host "📋 Executando teste completo do sistema..." -ForegroundColor Cyan
try {
    npx cypress run --spec "cypress/e2e/sistema-ministerial-completo.cy.ts" --browser chrome --headed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Todos os testes passaram com sucesso!" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "Alguns testes falharam"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Alguns testes falharam. Verificando detalhes..." -ForegroundColor Red
    Write-Host ""
    
    # Executar testes em modo interativo para debug
    Write-Host "🔍 Abrindo Cypress em modo interativo para debug..." -ForegroundColor Yellow
    try {
        npx cypress open
    } catch {
        Write-Host "❌ Erro ao abrir Cypress interativo: $_" -ForegroundColor Red
    }
}

# Parar aplicação de desenvolvimento
Write-Host "🛑 Parando servidor de desenvolvimento..." -ForegroundColor Yellow
try {
    Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Servidor parado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível parar o servidor automaticamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Testes concluídos!" -ForegroundColor Green
Write-Host ""
Read-Host "Pressione Enter para sair"
