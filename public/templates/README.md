# Modelos de Planilha - Sistema Ministerial

Este diretório contém os modelos de planilha para importação de dados no Sistema Ministerial.

## 📋 Modelo de Estudantes

O modelo `modelo_estudantes.xlsx` é gerado dinamicamente pelo sistema e contém:

### Colunas Obrigatórias:
- **Nome Completo**: Nome completo do estudante
- **Idade**: Idade em anos (número)
- **Gênero (M/F)**: M para Masculino, F para Feminino
- **Família / Agrupamento**: Nome da família ou agrupamento
- **Cargo Congregacional**: Um dos seguintes valores:
  - Ancião
  - Servo Ministerial
  - Pioneiro Regular
  - Publicador Batizado
  - Publicador Não Batizado
  - Estudante Novo
- **Status (Ativo/Inativo)**: Ativo ou Inativo

### Colunas Opcionais:
- **Data de Nascimento**: Formato DD/MM/AAAA
- **Parente Responsável**: Nome do responsável (obrigatório para menores)
- **Parentesco**: Relação familiar (Pai, Mãe, etc.)
- **Data de Batismo**: Formato DD/MM/AAAA
- **Telefone**: Número de telefone
- **E-mail**: Endereço de e-mail
- **Observações**: Observações adicionais

## 🔧 Como Usar

1. Baixe o modelo através do botão "Baixar Modelo" no sistema
2. Preencha os dados conforme as especificações
3. Salve o arquivo em formato Excel (.xlsx)
4. Faça upload através da aba "Importar Planilha"

## ⚠️ Validações

O sistema validará automaticamente:
- Campos obrigatórios preenchidos
- Formatos de data corretos
- E-mails válidos
- Telefones válidos
- Consistência entre idade e data de nascimento
- Responsáveis para menores de idade
