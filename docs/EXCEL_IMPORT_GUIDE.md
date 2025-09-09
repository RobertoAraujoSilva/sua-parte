# 📋 Guia Completo: Importação de Planilhas Excel - Sistema Ministerial

## 1. 🔍 Status de Funcionamento

### ✅ **Funcionalidade Completamente Implementada**
A funcionalidade de importação de planilhas Excel está **100% funcional** e pronta para uso em produção. Todos os componentes foram implementados e testados:

- ✅ **SpreadsheetUpload**: Componente principal com interface drag & drop
- ✅ **useSpreadsheetImport**: Hook para lógica de importação
- ✅ **spreadsheetProcessor**: Utilitários de processamento e validação
- ✅ **TemplateDownload**: Geração dinâmica de modelo Excel
- ✅ **ImportHelp**: Documentação integrada

### 🚧 **Limitações Atuais**
1. **Relacionamentos Familiares**: Não processa automaticamente relacionamentos pai/filho (TODO implementado)
2. **Duplicatas**: Não verifica duplicatas por nome antes da importação
3. **Rollback**: Não há funcionalidade de desfazer importação
4. **Logs Detalhados**: Não mantém histórico de importações

## 2. 📖 Guia Passo a Passo Completo

### **Passo 1: Acessar a Funcionalidade**

1. **Via Dashboard**:
   - Clique no botão "Importar Planilha" no Dashboard principal
   - Será redirecionado para `/estudantes?tab=import`

2. **Via Página de Estudantes**:
   - Navegue para "Estudantes" no menu
   - Clique na aba "Importar" (4ª aba)
   - Ou clique no botão "Importar Planilha" no cabeçalho

### **Passo 2: Baixar o Modelo Excel**

1. **Download Automático**:
   - Clique no botão "Baixar Modelo" (azul, destacado)
   - Arquivo `modelo_estudantes.xlsx` será baixado automaticamente
   - Toast de confirmação aparecerá

2. **Conteúdo do Modelo**:
   - **Cabeçalhos**: 13 colunas predefinidas
   - **Exemplos**: 2 linhas de dados de exemplo
   - **Formatação**: Larguras de coluna otimizadas

### **Passo 3: Preencher a Planilha**

#### **Campos Obrigatórios** (❗ Erro se não preenchidos):
```
Nome Completo          → Mínimo 2 caracteres
Idade                  → Número entre 1 e 120
Gênero (M/F)          → Exatamente "M" ou "F"
Família / Agrupamento  → Texto obrigatório
Cargo Congregacional   → Valor da lista permitida
Status (Ativo/Inativo) → "Ativo" ou "Inativo"
```

#### **Campos Opcionais** (⚠️ Aviso se inválidos):
```
Data de Nascimento     → DD/MM/AAAA
Parente Responsável    → Texto livre
Parentesco            → Texto livre (Pai, Mãe, etc.)
Data de Batismo       → DD/MM/AAAA
Telefone              → Números, espaços, parênteses, hífens
E-mail                → Formato válido de email
Observações           → Texto livre
```

#### **Valores Permitidos**:

**Gênero**:
- `M`, `F`, `Masculino`, `Feminino`, `masculino`, `feminino`

**Cargo Congregacional**:
- `Ancião`
- `Servo Ministerial`
- `Pioneiro Regular`
- `Publicador Batizado`
- `Publicador Não Batizado`
- `Estudante Novo`
- `Visitante` (convertido para "Estudante Novo")

**Status**:
- `Ativo`, `Inativo`, `ativo`, `inativo`, `true`, `false`, `1`, `0`

### **Passo 4: Upload e Validação**

1. **Upload do Arquivo**:
   - **Drag & Drop**: Arraste o arquivo para a área destacada
   - **Clique**: Use o botão "Selecionar Arquivo"
   - **Formatos**: `.xlsx`, `.xls`
   - **Limite**: 10MB máximo

2. **Validação Automática**:
   - Sistema processa linha por linha
   - Validações executadas em tempo real
   - Feedback visual durante processamento

### **Passo 5: Interpretar Resultados**

#### **Tela de Prévia**:
```
┌─────────────────────────────────────┐
│ Estatísticas da Importação          │
├─────────────────────────────────────┤
│ ✅ Válidos: XX registros            │
│ ❌ Com Erros: XX registros          │
│ ⚠️ Com Avisos: XX registros         │
│ 📊 Taxa de Sucesso: XX%             │
└─────────────────────────────────────┘
```

#### **Tipos de Feedback**:

**✅ Registros Válidos**:
- Passaram em todas as validações
- Serão importados com sucesso
- Podem ter avisos não-críticos

**❌ Registros com Erros**:
- Falham em validações obrigatórias
- **NÃO serão importados**
- Precisam ser corrigidos na planilha

**⚠️ Registros com Avisos**:
- Passaram nas validações obrigatórias
- **Serão importados**
- Contêm inconsistências menores

#### **Exemplos de Erros Comuns**:
```
❌ "Nome completo é obrigatório e deve ter pelo menos 2 caracteres"
❌ "Idade deve ser um número entre 1 e 120"
❌ "Gênero deve ser M ou F"
❌ "Cargo congregacional inválido: [valor]"
❌ "E-mail inválido"
❌ "Telefone inválido"
```

#### **Exemplos de Avisos**:
```
⚠️ "Idade informada (25) não confere com data de nascimento"
⚠️ "Data de batismo inválida - será ignorada"
⚠️ "Data de nascimento inválida"
⚠️ "Menor de idade sem responsável definido"
```

### **Passo 6: Confirmar Importação**

1. **Revisão Final**:
   - Verifique estatísticas de importação
   - Confirme que registros válidos estão corretos
   - Decida se aceita avisos ou corrige planilha

2. **Executar Importação**:
   - Clique "Importar XX Estudantes"
   - Processamento em lotes de 10 registros
   - Feedback visual de progresso

3. **Resultado Final**:
   - Relatório de importação detalhado
   - Contadores de sucessos e falhas
   - Opção de nova importação

## 3. 🔧 Especificações Técnicas

### **Formatos Suportados**
- **.xlsx** (Excel 2007+) - Recomendado
- **.xls** (Excel 97-2003) - Compatibilidade

### **Limites Técnicos**
- **Tamanho**: 10MB máximo por arquivo
- **Linhas**: Sem limite específico (limitado pela memória)
- **Processamento**: Lotes de 10 registros para evitar timeout
- **Timeout**: 30 segundos por lote

### **Mapeamentos de Dados**

#### **Gênero**:
```typescript
'M' → 'masculino'
'F' → 'feminino'
'Masculino' → 'masculino'
'Feminino' → 'feminino'
```

#### **Cargos**:
```typescript
'Ancião' → 'anciao'
'Servo Ministerial' → 'servo_ministerial'
'Pioneiro Regular' → 'pioneiro_regular'
'Publicador Batizado' → 'publicador_batizado'
'Publicador Não Batizado' → 'publicador_nao_batizado'
'Estudante Novo' → 'estudante_novo'
'Visitante' → 'estudante_novo' // Fallback
```

#### **Status**:
```typescript
'Ativo' → true
'Inativo' → false
'1' → true
'0' → false
```

#### **Datas**:
```typescript
'DD/MM/AAAA' → 'YYYY-MM-DD'
'DD/MM/AA' → 'YYYY-MM-DD'
'DD-MM-AAAA' → 'YYYY-MM-DD'
'DD-MM-AA' → 'YYYY-MM-DD'
```

### **Validações Implementadas**

#### **Campos Obrigatórios**:
- Nome: String, mínimo 2 caracteres
- Idade: Número, 1-120
- Gênero: Valor válido do mapeamento
- Família: String não vazia
- Cargo: Valor válido do mapeamento
- Status: Valor válido do mapeamento

#### **Validações de Formato**:
- **Email**: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Telefone**: Regex `/^[\d\s\-()]+$/` + mínimo 8 caracteres
- **Datas**: Parsing com date-fns, múltiplos formatos

#### **Validações de Consistência**:
- Idade vs Data de Nascimento (diferença máxima 1 ano)
- Menores de 18 anos devem ter responsável
- Data de batismo posterior ao nascimento

## 4. 📋 Casos de Uso Específicos

### **Estudantes Menores de Idade**

#### **Validação Automática**:
```typescript
if (idade < 18 && (!parente_responsavel || !parentesco)) {
  warnings.push('Menor de idade sem responsável definido');
}
```

#### **Campos Obrigatórios para Menores**:
- Parente Responsável: Nome do responsável
- Parentesco: Relação (Pai, Mãe, Tutor, etc.)

#### **Exemplo Correto**:
```
Nome: Maria Santos
Idade: 16
Parente Responsável: João Santos
Parentesco: Pai
```

### **Relacionamentos Familiares**

#### **Status Atual**:
- ✅ Campos capturados na importação
- ❌ Relacionamentos não processados automaticamente
- 🔄 TODO: Implementar matching de nomes

#### **Dados Salvos**:
```typescript
{
  familia: "Família Silva",
  parente_responsavel: "João Silva",
  parentesco: "Pai",
  id_pai_mae: null // Será implementado
}
```

### **Dados Duplicados**

#### **Comportamento Atual**:
- Sistema **não verifica** duplicatas antes da importação
- Supabase pode rejeitar por constraints únicas
- Erros de duplicata aparecem no relatório final

#### **Recomendação**:
- Limpe dados existentes antes de importação em massa
- Ou implemente verificação de duplicatas (TODO)

### **Importação em Lotes Grandes**

#### **Otimizações Implementadas**:
- **Processamento em lotes**: 10 registros por vez
- **Validação assíncrona**: Não bloqueia interface
- **Feedback de progresso**: Indicadores visuais
- **Tratamento de erros**: Continua mesmo com falhas parciais

#### **Exemplo com 50+ Estudantes**:
```
Lote 1: Registros 1-10   ✅ Sucesso
Lote 2: Registros 11-20  ✅ Sucesso  
Lote 3: Registros 21-30  ❌ Erro (continua)
Lote 4: Registros 31-40  ✅ Sucesso
Lote 5: Registros 41-50  ✅ Sucesso

Resultado: 40 importados, 10 com erro
```

## 5. 🔧 Troubleshooting

### **Problemas Comuns e Soluções**

#### **❌ "Planilha está vazia"**
**Causa**: Arquivo sem dados ou só cabeçalhos
**Solução**: Adicione pelo menos uma linha de dados

#### **❌ "Arquivo muito grande. Limite máximo: 10MB"**
**Causa**: Arquivo Excel excede 10MB
**Solução**:
- Remova formatações desnecessárias
- Divida em múltiplos arquivos
- Use formato .xlsx (mais compacto)

#### **❌ "Erro ao ler arquivo Excel"**
**Causa**: Arquivo corrompido ou formato inválido
**Solução**:
- Salve novamente como .xlsx
- Verifique se não há caracteres especiais no nome
- Teste com arquivo modelo

#### **⚠️ "Idade informada não confere com data de nascimento"**
**Causa**: Inconsistência entre campos
**Solução**:
- Corrija idade ou data de nascimento
- Ou remova data de nascimento (campo opcional)

#### **❌ "Cargo congregacional inválido"**
**Causa**: Valor não está na lista permitida
**Solução**: Use exatamente os valores:
```
Ancião
Servo Ministerial
Pioneiro Regular
Publicador Batizado
Publicador Não Batizado
Estudante Novo
```

#### **❌ "Gênero deve ser M ou F"**
**Causa**: Valor diferente de M/F
**Solução**: Use apenas "M" ou "F" (maiúsculas)

#### **❌ "E-mail inválido"**
**Causa**: Formato de email incorreto
**Solução**:
- Use formato: nome@dominio.com
- Deixe vazio se não tiver email

#### **🔄 "Importação travou no meio"**
**Causa**: Erro de rede ou timeout
**Solução**:
- Verifique conexão com internet
- Tente novamente com arquivo menor
- Divida importação em lotes menores

### **Verificações de Diagnóstico**

#### **1. Verificar Arquivo**:
```bash
# Tamanho do arquivo
ls -lh arquivo.xlsx

# Abrir no Excel/LibreOffice
# Verificar se abre corretamente
```

#### **2. Verificar Dados**:
- Primeira linha deve ser cabeçalhos
- Dados começam na linha 2
- Não há linhas completamente vazias
- Caracteres especiais estão corretos

#### **3. Verificar Conexão**:
- Sistema está online
- Supabase está acessível
- Usuário está autenticado

### **Logs e Debugging**

#### **Console do Navegador**:
```javascript
// Verificar erros no console (F12)
// Procurar por:
"Batch import error:"
"Error reading Excel file:"
"Validation error:"
```

#### **Network Tab**:
- Verificar chamadas para Supabase
- Status codes 200 = sucesso
- Status codes 4xx/5xx = erro

## 6. 🎯 Resumo de Funcionalidades

### ✅ **Implementado e Funcional**
- [x] Upload drag & drop de arquivos Excel
- [x] Geração dinâmica de modelo com exemplos
- [x] Validação completa de dados (obrigatórios + opcionais)
- [x] Mapeamento automático de valores
- [x] Processamento em lotes para performance
- [x] Interface de prévia com estatísticas
- [x] Relatório detalhado de importação
- [x] Tratamento robusto de erros
- [x] Documentação integrada (ImportHelp)
- [x] Integração com sistema de autenticação
- [x] Salvamento no banco Supabase

### 🔄 **Próximas Melhorias**
- [ ] Verificação de duplicatas por nome
- [ ] Processamento de relacionamentos familiares
- [ ] Histórico de importações
- [ ] Funcionalidade de rollback
- [ ] Importação incremental (apenas novos)
- [ ] Validação de dados contra estudantes existentes

## 7. 📚 Arquivos de Implementação

### **Componentes React**
- `src/components/SpreadsheetUpload.tsx` - Componente principal de upload
- `src/components/TemplateDownload.tsx` - Botão de download do modelo
- `src/components/ImportHelp.tsx` - Documentação integrada

### **Hooks e Lógica**
- `src/hooks/useSpreadsheetImport.ts` - Hook principal de importação
- `src/utils/spreadsheetProcessor.ts` - Processamento e validação
- `src/types/spreadsheet.ts` - Tipos TypeScript

### **Integração**
- `src/pages/Estudantes.tsx` - Aba de importação
- `src/pages/Dashboard.tsx` - Botões de acesso rápido
- `src/hooks/useEstudantes.ts` - Função de importação em massa

## 8. 🔗 Links Relacionados

### **Documentação Técnica**
- [README.md](../README.md) - Visão geral do projeto
- [PRD.md](PRD.md) - Product Requirements Document
- [PLANO.md](PLANO.md) - Plano de implementação

### **Funcionalidades Relacionadas**
- [FAMILY_INVITATIONS_FEATURE.md](FAMILY_INVITATIONS_FEATURE.md) - Sistema de convites
- [STUDENT_PORTAL_IMPLEMENTATION.md](STUDENT_PORTAL_IMPLEMENTATION.md) - Portal do estudante

### **Correções e Melhorias**
- [BUILD_ERRORS_FIXED.md](BUILD_ERRORS_FIXED.md) - Correções de build
- [SECURITY_FIX_REPORT.md](SECURITY_FIX_REPORT.md) - Correções de segurança

---

**📅 Última Atualização**: Janeiro 2025
**👨‍💻 Autor**: Sistema Ministerial Development Team
**📧 Contato**: amazonwebber007@gmail.com

A funcionalidade de importação de planilhas Excel está **completamente operacional** e pronta para uso em produção! 🎉
