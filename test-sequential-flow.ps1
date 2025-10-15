# Teste do Fluxo Sequencial - Sistema Ministerial
Write-Host "Testando Fluxo Sequencial do Sistema..." -ForegroundColor Green

# Testar redirecionamento de rotas
Write-Host ""
Write-Host "Testando redirecionamentos..." -ForegroundColor Yellow

# Testar rota de compatibilidade /api/programas -> /api/programacoes/mock
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/programas?mes=2025-09" -Method Get -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 302) {
        Write-Host "Redirecionamento /api/programas: FUNCIONANDO (302)" -ForegroundColor Green
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor Cyan
    }
}
catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "Redirecionamento /api/programas: FUNCIONANDO (302)" -ForegroundColor Green
    }
    else {
        Write-Host "Erro no redirecionamento: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Testar dados de programacao especifica
Write-Host ""
Write-Host "Testando dados especificos..." -ForegroundColor Yellow

try {
    $semana = Invoke-RestMethod -Uri "http://localhost:3000/api/programacoes/mock?semana=2025-09-08" -Method Get
    Write-Host "Semana especifica: ENCONTRADA" -ForegroundColor Green
    Write-Host "ID: $($semana.idSemana)" -ForegroundColor Cyan
    Write-Host "Label: $($semana.semanaLabel)" -ForegroundColor Cyan
    Write-Host "Tema: $($semana.tema)" -ForegroundColor Cyan
    Write-Host "Secoes: $($semana.programacao.Count)" -ForegroundColor Cyan
}
catch {
    Write-Host "Erro ao buscar semana: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar estrutura de arquivos do projeto
Write-Host ""
Write-Host "Verificando estrutura do projeto..." -ForegroundColor Yellow

$estrutura = @(
    @{ Path = "src\components\SequentialFlow.tsx"; Desc = "Componente de Fluxo Sequencial" },
    @{ Path = "src\contexts\OnboardingContext.tsx"; Desc = "Contexto de Onboarding" },
    @{ Path = "src\contexts\AuthContext.tsx"; Desc = "Contexto de Autenticacao" },
    @{ Path = "backend\routes\programacoes.js"; Desc = "Rotas de Programacoes" },
    @{ Path = "backend\routes\designacoes.js"; Desc = "Rotas de Designacoes" },
    @{ Path = "FLUXO_SEQUENCIAL.md"; Desc = "Documentacao do Fluxo" }
)

foreach ($item in $estrutura) {
    if (Test-Path $item.Path) {
        Write-Host "OK: $($item.Desc)" -ForegroundColor Green
    }
    else {
        Write-Host "FALTANDO: $($item.Desc)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Teste do fluxo sequencial concluido!" -ForegroundColor Green