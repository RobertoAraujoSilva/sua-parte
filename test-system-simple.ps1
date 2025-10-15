# Sistema Ministerial - Verificacao Completa
Write-Host "Iniciando verificacao do Sistema Ministerial..." -ForegroundColor Green

# Testar Backend
Write-Host "Testando Backend (porta 3000)..." -ForegroundColor Yellow
try {
    $backendTest = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
    if ($backendTest.TcpTestSucceeded) {
        Write-Host "Backend: CONECTADO" -ForegroundColor Green
        
        # Testar API Status
        $status = Invoke-RestMethod -Uri "http://localhost:3000/api/status" -Method Get
        Write-Host "API Status: $($status.status)" -ForegroundColor Cyan
        Write-Host "Versao: $($status.version)" -ForegroundColor Cyan
        Write-Host "Modo: $($status.mode)" -ForegroundColor Cyan
    }
    else {
        Write-Host "Backend: DESCONECTADO" -ForegroundColor Red
    }
}
catch {
    Write-Host "Erro no Backend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Testar Frontend
Write-Host "Testando Frontend (porta 8080)..." -ForegroundColor Yellow
try {
    $frontendTest = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
    if ($frontendTest.TcpTestSucceeded) {
        Write-Host "Frontend: CONECTADO" -ForegroundColor Green
    }
    else {
        Write-Host "Frontend: DESCONECTADO" -ForegroundColor Red
    }
}
catch {
    Write-Host "Erro no Frontend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Testar APIs
Write-Host "Testando APIs..." -ForegroundColor Yellow
try {
    $programacoes = Invoke-RestMethod -Uri "http://localhost:3000/api/programacoes/mock?mes=2025-09" -Method Get
    Write-Host "API Programacoes: $($programacoes.Count) semanas disponiveis" -ForegroundColor Green
}
catch {
    Write-Host "Erro na API Programacoes: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar arquivos
Write-Host ""
Write-Host "Verificando arquivos de dados..." -ForegroundColor Yellow
$docsPath = "docs\Oficial\programacoes-json"
if (Test-Path $docsPath) {
    $jsonFiles = Get-ChildItem -Path $docsPath -Filter "*.json"
    Write-Host "Arquivos JSON encontrados: $($jsonFiles.Count)" -ForegroundColor Green
    foreach ($file in $jsonFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor Cyan
    }
}
else {
    Write-Host "Pasta de dados nao encontrada" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificacao concluida!" -ForegroundColor Green
Write-Host "URLs de acesso:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "  Backend: http://localhost:3000/api" -ForegroundColor White