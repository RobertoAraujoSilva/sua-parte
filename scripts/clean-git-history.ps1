# Script para limpar o histórico do Git e remover arquivos grandes

# Lista de arquivos grandes a serem removidos
$largeFiles = @(
    "cypress/videos/sistema-ministerial-completo.cy.ts.mp4",
    "docs/Oficial/mwb_T_202509.daisy.zip",
    "docs/Oficial/mwb_T_202507.daisy.zip",
    "docs/Oficial/mwb_T_202511.jwpub",
    "docs/Oficial/mwb_T_202509.jwpub",
    "docs/Oficial/mwb_E_202509.pdf",
    "docs/Oficial/mwb_E_202511.pdf",
    "docs/Oficial/mwb_E_202507.pdf"
)

# Criar um branch temporário
Write-Host "Criando branch temporário..."
git checkout --orphan temp_branch

# Adicionar todos os arquivos exceto os grandes
Write-Host "Adicionando arquivos ao branch temporário..."
git add --all

# Remover os arquivos grandes do staging
foreach ($file in $largeFiles) {
    Write-Host "Removendo $file do staging..."
    git reset HEAD "$file"
}

# Commit no branch temporário
Write-Host "Criando commit no branch temporário..."
git commit -m "Commit inicial sem arquivos grandes"

# Remover o branch main
Write-Host "Removendo branch main..."
git branch -D main

# Renomear o branch temporário para main
Write-Host "Renomeando branch temporário para main..."
git branch -m main

# Forçar push para o repositório remoto
Write-Host "Forçando push para o repositório remoto..."
git push -f origin main

Write-Host "Limpeza do histórico concluída com sucesso!"