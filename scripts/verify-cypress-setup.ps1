# PowerShell script para verificar a configuração do Cypress
# Sistema Ministerial - Verificação de Setup

Write-Host "🔍 Verificando Configuração do Cypress - Sistema Ministerial" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Função para verificar comandos
function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# 1. Verificar Node.js
Write-Host "1️⃣ Verificando Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    # Verificar versão mínima (v16+)
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 16) {
        $warnings += "Node.js versão $nodeVersion pode ser muito antiga. Recomendado v16+"
    }
} else {
    $errors += "Node.js não encontrado. Instale de https://nodejs.org/"
}

# 2. Verificar npm
Write-Host "2️⃣ Verificando npm..." -ForegroundColor Yellow
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "   ✅ npm encontrado: v$npmVersion" -ForegroundColor Green
} else {
    $errors += "npm não encontrado. Reinstale Node.js"
}

# 3. Verificar npx
Write-Host "3️⃣ Verificando npx..." -ForegroundColor Yellow
if (Test-Command "npx") {
    $npxVersion = npx --version
    Write-Host "   ✅ npx encontrado: v$npxVersion" -ForegroundColor Green
} else {
    $errors += "npx não encontrado. Reinstale Node.js"
}

# 4. Verificar diretório do projeto
Write-Host "4️⃣ Verificando diretório do projeto..." -ForegroundColor Yellow
$expectedPath = "C:\Users\frank.MONITORE-MAFRA\Documents\GitHub\sua-parte"
$currentPath = Get-Location

if ($currentPath.Path -eq $expectedPath) {
    Write-Host "   ✅ Diretório correto: $currentPath" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Diretório atual: $currentPath" -ForegroundColor Yellow
    Write-Host "   ⚠️ Esperado: $expectedPath" -ForegroundColor Yellow
    $warnings += "Você pode não estar no diretório correto do projeto"
}

# 5. Verificar package.json
Write-Host "5️⃣ Verificando package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
    
    # Verificar se é ES module
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.type -eq "module") {
        Write-Host "   ✅ Projeto configurado como ES module" -ForegroundColor Green
    }
} else {
    $errors += "package.json não encontrado. Verifique se está no diretório correto"
}

# 6. Verificar node_modules
Write-Host "6️⃣ Verificando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules encontrado" -ForegroundColor Green
} else {
    $warnings += "node_modules não encontrado. Execute 'npm install'"
}

# 7. Verificar Cypress
Write-Host "7️⃣ Verificando Cypress..." -ForegroundColor Yellow
try {
    $cypressVersion = npx cypress --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Cypress encontrado" -ForegroundColor Green
        Write-Host "   $cypressVersion" -ForegroundColor Gray
    } else {
        $warnings += "Cypress não encontrado. Execute 'npm install'"
    }
} catch {
    $warnings += "Erro ao verificar Cypress. Execute 'npm install'"
}

# 8. Verificar arquivos de teste
Write-Host "8️⃣ Verificando arquivos de teste..." -ForegroundColor Yellow

$testFiles = @(
    "cypress/e2e/sarah-student-registration.cy.ts",
    "cypress/e2e/franklin-login.cy.ts",
    "cypress/fixtures/sarah-user.json",
    "cypress/support/commands.ts",
    "cypress.config.ts"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        $warnings += "Arquivo de teste não encontrado: $file"
    }
}

# 9. Verificar scripts npm
Write-Host "9️⃣ Verificando scripts npm..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $scripts = $packageJson.scripts
    
    $expectedScripts = @("test:sarah", "test:birth-date", "cypress:open", "cypress:run")
    
    foreach ($script in $expectedScripts) {
        if ($scripts.$script) {
            Write-Host "   ✅ npm run $script" -ForegroundColor Green
        } else {
            $warnings += "Script npm não encontrado: $script"
        }
    }
}

# 10. Verificar conectividade
Write-Host "🔟 Verificando conectividade..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://sua-parte.lovable.app" -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Aplicação acessível: https://sua-parte.lovable.app" -ForegroundColor Green
    } else {
        $warnings += "Aplicação pode não estar funcionando corretamente"
    }
} catch {
    $warnings += "Não foi possível acessar a aplicação. Verifique a internet"
}

# Resumo
Write-Host ""
Write-Host "📊 Resumo da Verificação" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 Tudo configurado corretamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Comandos prontos para uso:" -ForegroundColor Green
    Write-Host "   npm run test:sarah" -ForegroundColor White
    Write-Host "   npm run cypress:open" -ForegroundColor White
    Write-Host "   .\scripts\test-sarah-cypress.ps1 -Open" -ForegroundColor White
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ Erros encontrados:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   • $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️ Avisos:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "🔧 Próximos passos:" -ForegroundColor Cyan
    if ($errors.Count -gt 0) {
        Write-Host "   1. Corrija os erros listados acima" -ForegroundColor White
        Write-Host "   2. Execute este script novamente" -ForegroundColor White
    } else {
        Write-Host "   1. Execute 'npm install' para instalar dependências" -ForegroundColor White
        Write-Host "   2. Tente executar os testes: npm run test:sarah" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "💡 Comandos de teste disponíveis:" -ForegroundColor Cyan
Write-Host "   npm run test:sarah                    # Teste da Sarah" -ForegroundColor White
Write-Host "   npm run test:birth-date               # Teste de data de nascimento" -ForegroundColor White
Write-Host "   npm run cypress:open                  # Modo interativo" -ForegroundColor White
Write-Host "   .\scripts\test-sarah-cypress.ps1      # Script PowerShell" -ForegroundColor White
Write-Host "   scripts\test-sarah-cypress.bat        # Script Batch" -ForegroundColor White
Write-Host ""
