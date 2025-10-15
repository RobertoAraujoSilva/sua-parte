# 🔍 Script de Verificação Completa do Sistema Ministerial
# Testa backend, frontend e fluxo de dados

Write-Host "🚀 Iniciando verificação completa do Sistema Ministerial..." -ForegroundColor Green
Write-Host ""

# Função para testar conexão
function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$Port
    )
    
    Write-Host "🔍 Testando $ServiceName..." -ForegroundColor Yellow
    
    # Testar conexão TCP
    $tcpTest = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "  ✅ Porta $Port: CONECTADA" -ForegroundColor Green
        
        # Testar HTTP se URL fornecida
        if ($Url) {
            try {
                $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
                Write-Host "  ✅ HTTP: RESPONDENDO" -ForegroundColor Green
                return $response
            }
            catch {
                Write-Host "  ❌ HTTP: ERRO - $($_.Exception.Message)" -ForegroundColor Red
                return $null
            }
        }
        return $true
    }
    else {
        Write-Host "  ❌ Porta $Port: DESCONECTADA" -ForegroundColor Red
        return $false
    }
}

# 1. Testar Backend
Write-Host "=" * 50
$backendStatus = Test-Service -ServiceName "Backend API" -Url "http://localhost:3000/api/status" -Port 3000

if ($backendStatus) {
    Write-Host "📊 Status do Backend:" -ForegroundColor Cyan
    Write-Host "  • Status: $($backendStatus.status)" -ForegroundColor White
    Write-Host "  • Versão: $($backendStatus.version)" -ForegroundColor White
    Write-Host "  • Modo: $($backendStatus.mode)" -ForegroundColor White
    Write-Host "  • Timestamp: $($backendStatus.timestamp)" -ForegroundColor White
}

# 2. Testar Frontend
Write-Host ""
Write-Host "=" * 50
$frontendStatus = Test-Service -ServiceName "Frontend React" -Port 8080

# 3. Testar APIs específicas
Write-Host ""
Write-Host "=" * 50
Write-Host "🔍 Testando APIs específicas..." -ForegroundColor Yellow

# Testar programações
try {
    $programacoes = Invoke-RestMethod -Uri "http://localhost:3000/api/programacoes/mock?mes=2025-09" -Method Get -TimeoutSec 5
    Write-Host "  ✅ API Programações: $($programacoes.Count) semanas disponíveis" -ForegroundColor Green
    
    # Mostrar primeira semana
    if ($programacoes.Count -gt 0) {
        $primeira = $programacoes[0]
        Write-Host "    📅 Primeira semana: $($primeira.semanaLabel)" -ForegroundColor Cyan
        Write-Host "    📖 Tema: $($primeira.tema)" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "  ❌ API Programações: ERRO - $($_.Exception.Message)" -ForegroundColor Red
}

# Testar rota de compatibilidade
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/programas?mes=2025-09" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 302) {
        Write-Host "  ✅ Redirecionamento /api/programas: FUNCIONANDO" -ForegroundColor Green
    }
}
catch {
    Write-Host "  ❌ Redirecionamento /api/programas: ERRO - $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Verificar arquivos de dados
Write-Host ""
Write-Host "=" * 50
Write-Host "🔍 Verificando arquivos de dados..." -ForegroundColor Yellow

$docsPath = "docs\Oficial\programacoes-json"
if (Test-Path $docsPath) {
    $jsonFiles = Get-ChildItem -Path $docsPath -Filter "*.json"
    Write-Host "  ✅ Pasta de dados: ENCONTRADA" -ForegroundColor Green
    Write-Host "  📁 Arquivos JSON: $($jsonFiles.Count)" -ForegroundColor Cyan
    
    foreach ($file in $jsonFiles) {
        Write-Host "    • $($file.Name)" -ForegroundColor White
    }
}
else {
    Write-Host "  ❌ Pasta de dados: NÃO ENCONTRADA" -ForegroundColor Red
}

# 5. Resumo final
Write-Host ""
Write-Host "=" * 50
Write-Host "📋 RESUMO DA VERIFICAÇÃO" -ForegroundColor Magenta
Write-Host ""

$services = @(
    @{ Name = "Backend API (3000)"; Status = $backendStatus -ne $false -and $backendStatus -ne $null },
    @{ Name = "Frontend React (8080)"; Status = $frontendStatus -ne $false },
    @{ Name = "Dados Mockados"; Status = Test-Path $docsPath }
)

foreach ($service in $services) {
    $icon = if ($service.Status) { "✅" } else { "❌" }
    $color = if ($service.Status) { "Green" } else { "Red" }
    Write-Host "$icon $($service.Name)" -ForegroundColor $color
}

Write-Host ""
if ($services | Where-Object { -not $_.Status }) {
    Write-Host "⚠️  Alguns serviços apresentam problemas. Verifique os logs acima." -ForegroundColor Yellow
}
else {
    Write-Host "🎉 Todos os serviços estão funcionando corretamente!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌐 URLs de acesso:" -ForegroundColor Cyan
Write-Host "  • Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host "  • Status: http://localhost:3000/api/status" -ForegroundColor White
Write-Host ""