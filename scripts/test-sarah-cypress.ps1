# PowerShell script para executar testes Cypress específicos da Sarah
# Sistema Ministerial - Teste de Registro de Estudante com Data de Nascimento
# ES Module Compatible - Windows 11

param(
    [switch]$Open,
    [switch]$Headless,
    [string]$Spec,
    [switch]$Help,
    [switch]$Setup
)

# Configurações da Sarah
$sarahConfig = @{
    FullName = "Sarah Rackel Ferreira Lima"
    Email = "franklima.flm@gmail.com"
    DateOfBirth = "25/09/2009"
    Congregation = "Market Harborough"
    Role = "Publicador Não Batizado"
    BaseUrl = "https://sua-parte.lovable.app"
}

# Calcular idade da Sarah
function Get-Age {
    param([datetime]$BirthDate)
    $today = Get-Date
    $age = $today.Year - $BirthDate.Year
    if ($today.DayOfYear -lt $BirthDate.DayOfYear) {
        $age--
    }
    return $age
}

$sarahBirthDate = [datetime]::ParseExact("25/09/2009", "dd/MM/yyyy", $null)
$sarahAge = Get-Age -BirthDate $sarahBirthDate

Write-Host "🧪 Executando Testes Cypress - Registro da Sarah com Data de Nascimento" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Configuração do Teste da Sarah:" -ForegroundColor Yellow
Write-Host "   Nome: $($sarahConfig.FullName)" -ForegroundColor White
Write-Host "   Email: $($sarahConfig.Email)" -ForegroundColor White
Write-Host "   Data de Nascimento: $($sarahConfig.DateOfBirth)" -ForegroundColor White
Write-Host "   Idade: $sarahAge anos" -ForegroundColor White
Write-Host "   Congregação: $($sarahConfig.Congregation)" -ForegroundColor White
Write-Host "   Cargo: $($sarahConfig.Role)" -ForegroundColor White
Write-Host "   Base URL: $($sarahConfig.BaseUrl)" -ForegroundColor White
Write-Host ""

# Função para mostrar ajuda
function Show-Help {
    Write-Host "🧪 Script de Testes Cypress - Sarah Student Registration" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\scripts\test-sarah-cypress.ps1 [opções]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "  -Open               Abrir Cypress em modo interativo" -ForegroundColor White
    Write-Host "  -Headless           Executar em modo headless" -ForegroundColor White
    Write-Host "  -Spec <arquivo>     Executar teste específico" -ForegroundColor White
    Write-Host "  -Help               Mostrar esta ajuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Yellow
    Write-Host "  .\scripts\test-sarah-cypress.ps1" -ForegroundColor White
    Write-Host "  .\scripts\test-sarah-cypress.ps1 -Open" -ForegroundColor White
    Write-Host "  .\scripts\test-sarah-cypress.ps1 -Spec 'cypress/e2e/sarah-student-registration.cy.ts'" -ForegroundColor White
    Write-Host ""
    Write-Host "🎂 Funcionalidades Testadas:" -ForegroundColor Yellow
    Write-Host "  • Registro de estudante com data de nascimento" -ForegroundColor White
    Write-Host "  • Validação de idade para Escola do Ministério (6-100 anos)" -ForegroundColor White
    Write-Host "  • Cálculo automático da idade em tempo real" -ForegroundColor White
    Write-Host "  • Armazenamento da data de nascimento no banco de dados" -ForegroundColor White
    Write-Host "  • Exibição da data de nascimento e idade no portal do estudante" -ForegroundColor White
    Write-Host "  • Login e acesso ao portal personalizado" -ForegroundColor White
    Write-Host "  • Validação de casos extremos (muito jovem, muito velho, data futura)" -ForegroundColor White
    Write-Host ""
    Write-Host "👤 Dados de Teste da Sarah:" -ForegroundColor Yellow
    Write-Host "  • Nome: $($sarahConfig.FullName)" -ForegroundColor White
    Write-Host "  • Email: $($sarahConfig.Email)" -ForegroundColor White
    Write-Host "  • Data de Nascimento: $($sarahConfig.DateOfBirth) ($sarahAge anos)" -ForegroundColor White
    Write-Host "  • Congregação: $($sarahConfig.Congregation)" -ForegroundColor White
    Write-Host "  • Cargo: $($sarahConfig.Role)" -ForegroundColor White
}

# Mostrar ajuda se solicitado
if ($Help) {
    Show-Help
    exit 0
}

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado" -ForegroundColor Red
    Write-Host "   Certifique-se de estar no diretório raiz do projeto" -ForegroundColor Yellow
    Write-Host "   Diretório atual: $(Get-Location)" -ForegroundColor Gray
    exit 1
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️ node_modules não encontrado. Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
        exit 1
    }
}

# Verificar se Cypress está instalado
Write-Host "🔍 Verificando se Cypress está instalado..." -ForegroundColor Yellow

# Tentar usar o binário local primeiro
$cypressBin = "node_modules\.bin\cypress.cmd"
if (Test-Path $cypressBin) {
    Write-Host "✅ Cypress encontrado em node_modules" -ForegroundColor Green
    try {
        $cypressVersion = & $cypressBin --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   $cypressVersion" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️ Erro ao verificar versão do Cypress" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Cypress não encontrado. Instalando..." -ForegroundColor Red
    npm install cypress --save-dev
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cypress instalado" -ForegroundColor Green
        # Instalar binários
        & "node_modules\.bin\cypress.cmd" install
    } else {
        Write-Host "❌ Erro ao instalar Cypress" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Executar testes
try {
    if ($Open) {
        Write-Host "🖥️ Abrindo Cypress em modo interativo..." -ForegroundColor Yellow
        npx cypress open
    } else {
        Write-Host "🤖 Executando testes em modo headless..." -ForegroundColor Yellow
        
        $cypressArgs = @("cypress", "run")
        
        if ($Spec) {
            $cypressArgs += "--spec"
            $cypressArgs += $Spec
            Write-Host "📁 Executando teste específico: $Spec" -ForegroundColor Gray
        } else {
            # Executar apenas testes da Sarah por padrão
            $cypressArgs += "--spec"
            $cypressArgs += "cypress/e2e/sarah-student-registration.cy.ts"
            Write-Host "📁 Executando teste principal da Sarah" -ForegroundColor Gray
        }
        
        if ($Headless) {
            $cypressArgs += "--headless"
        }
        
        Write-Host ""
        Write-Host "🚀 Comando: npx $($cypressArgs -join ' ')" -ForegroundColor Gray
        Write-Host ""
        
        & npx @cypressArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 Testes da Sarah concluídos com sucesso!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 Resultados:" -ForegroundColor Yellow
            Write-Host "   - Vídeos salvos em: cypress/videos/" -ForegroundColor White
            Write-Host "   - Screenshots (se houver falhas): cypress/screenshots/" -ForegroundColor White
            Write-Host ""
            Write-Host "🎂 Funcionalidades Testadas:" -ForegroundColor Yellow
            Write-Host "   ✅ Registro com data de nascimento" -ForegroundColor Green
            Write-Host "   ✅ Validação de idade (6-100 anos)" -ForegroundColor Green
            Write-Host "   ✅ Cálculo automático da idade" -ForegroundColor Green
            Write-Host "   ✅ Armazenamento no banco de dados" -ForegroundColor Green
            Write-Host "   ✅ Exibição no portal do estudante" -ForegroundColor Green
            Write-Host "   ✅ Login e acesso ao portal" -ForegroundColor Green
            Write-Host ""
            Write-Host "💡 Comandos úteis:" -ForegroundColor Yellow
            Write-Host "   npm run test:sarah                    # Executar teste da Sarah" -ForegroundColor White
            Write-Host "   npm run cypress:open                  # Modo interativo" -ForegroundColor White
            Write-Host "   .\scripts\test-sarah-cypress.ps1 -Open # Este script em modo interativo" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Testes falharam" -ForegroundColor Red
            Write-Host ""
            Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
            Write-Host "   1. Verificar se a aplicação está rodando" -ForegroundColor White
            Write-Host "   2. Verificar conectividade de rede" -ForegroundColor White
            Write-Host "   3. Verificar se o email da Sarah não está em uso" -ForegroundColor White
            Write-Host "   4. Executar em modo interativo: .\scripts\test-sarah-cypress.ps1 -Open" -ForegroundColor White
            Write-Host "   5. Verificar se a funcionalidade de data de nascimento está implementada" -ForegroundColor White
            exit 1
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao executar testes: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Verificar se Node.js está instalado" -ForegroundColor White
    Write-Host "   2. Verificar se npm está funcionando" -ForegroundColor White
    Write-Host "   3. Executar 'npm install' para instalar dependências" -ForegroundColor White
    Write-Host "   4. Verificar se está no diretório correto do projeto" -ForegroundColor White
    exit 1
}
