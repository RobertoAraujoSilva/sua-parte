

# 📋 Lista de Problemas para Resolver dia 14/08/2025

## 🔥 **Prioridade Alta - Sistema de Designações**

### 1. **Página Designações Incompleta**
- **Problema**: Código truncado na linha 245 - função `handleConfirmarSelecao` não finalizada
- **Impacto**: Sistema de geração automática não funciona
- **Ação**: Completar implementação da lógica de geração e salvamento

### 2. **Modal de Seleção de Semana**
- **Problema**: Componente `ModalSelecaoSemana` referenciado mas não implementado
- **Impacto**: Não é possível selecionar programas para gerar designações
- **Ação**: Criar modal com seleção de programa e opções de regeneração

### 3. **Modal de Prévia de Designações**
- **Problema**: Componente `ModalPreviaDesignacoes` referenciado mas não implementado
- **Impacto**: Não é possível revisar designações antes de salvar
- **Ação**: Criar modal de prévia com estatísticas e opção de ajustes

## ⚙️ **Prioridade Média - Utilitários e Lógica**

### 4. **Gerador de Designações**
- **Problema**: Classe `GeradorDesignacoes` pode estar incompleta
- **Impacto**: Algoritmo de distribuição pode não funcionar corretamente
- **Ação**: Verificar e completar implementação do algoritmo S-38-T

### 5. **Data Loaders**
- **Problema**: Funções `carregarDadosCompletos`, `carregarProgramaPorData` podem estar faltando
- **Impacto**: Dados não carregam para geração
- **Ação**: Implementar carregamento de estudantes, programas e histórico

### 6. **Balanceador Histórico**
- **Problema**: Classe `BalanceadorHistorico` pode não estar implementada
- **Impacto**: Distribuição não considera participações anteriores
- **Ação**: Implementar lógica de balanceamento baseada em histórico

## 🌐 **Prioridade Média - Internacionalização**

### 7. **Finalizar Traduções para Inglês**
- **Problema**: Sistema de traduções incompleto para mercado internacional
- **Impacto**: Usuários de língua inglesa não conseguem usar o sistema
- **Ação**: 
  - Completar arquivo `en.json` com todas as traduções
  - Verificar componentes que ainda usam texto hardcoded
  - Testar alternância de idiomas em todas as páginas
  - Validar traduções técnicas e termos específicos das Testemunhas de Jeová

## 🎯 **Prioridade Baixa - Melhorias UX**

### 8. **Estados de Loading**
- **Problema**: UX durante carregamento pode estar incompleta
- **Impacto**: Usuário não sabe o que está acontecendo
- **Ação**: Adicionar spinners e mensagens de progresso

### 9. **Tratamento de Erros**
- **Problema**: Classe `TratadorErros` pode não estar completa
- **Impacto**: Erros não são tratados adequadamente
- **Ação**: Implementar tratamento robusto de erros

### 10. **Debug Panel**
- **Problema**: `DebugPanel` importado mas pode não estar sendo usado
- **Impacto**: Dificulta debugging em produção
- **Ação**: Verificar se está funcionando corretamente

## 🔍 **Investigação Necessária**

### 11. **Types de Designações**
- **Verificar**: Se todos os tipos em `@/types/designacoes` estão corretos
- **Ação**: Validar interfaces com banco de dados

### 12. **Integração com Supabase**
- **Verificar**: Se queries estão otimizadas e funcionando
- **Ação**: Testar carregamento de programas com designações

### 13. **Tutorial Button**
- **Verificar**: Se componente de tutorial está implementado
- **Ação**: Garantir que ajuda contextual funciona

---

## 🎯 **Plano de Ação para Amanhã**

1. **Manhã**: 
   - Completar página Designações e modais
   - Finalizar traduções para inglês

2. **Tarde**: 
   - Implementar/verificar utilitários de geração
   - Testar sistema bilíngue

3. **Final**: 
   - Testes e refinamentos UX
   - Commit das traduções

**Meta**: Sistema de designações automáticas 100% funcional + Sistema bilíngue completo! 🚀

---

## 📝 **Checklist de Traduções**

### Arquivos a Verificar:
- [ ] `src/locales/en.json` - Completar todas as traduções
- [ ] `src/components/Header.tsx` - Verificar textos hardcoded
- [ ] `src/components/Hero.tsx` - Validar traduções do herói
- [ ] `src/components/Features.tsx` - Traduzir funcionalidades
- [ ] `src/components/Benefits.tsx` - Traduzir benefícios
- [ ] `src/components/FAQSection.tsx` - Traduzir FAQ completo
- [ ] `src/pages/Auth.tsx` - Traduzir formulários de login
- [ ] `src/pages/Dashboard.tsx` - Traduzir dashboard
- [ ] `src/pages/Estudantes.tsx` - Traduzir gestão de estudantes
- [ ] `src/pages/Programas.tsx` - Traduzir gestão de programas
- [ ] `src/pages/Designacoes.tsx` - Traduzir sistema de designações

### Termos Específicos a Traduzir:
- [ ] "Escola do Ministério Teocrático" → "Theocratic Ministry School"
- [ ] "Testemunhas de Jeová" → "Jehovah's Witnesses"
- [ ] "Congregação" → "Congregation"
- [ ] "Ancião" → "Elder"
- [ ] "Servo Ministerial" → "Ministerial Servant"
- [ ] "Designações" → "Assignments"
- [ ] "Leitura da Bíblia" → "Bible Reading"
- [ ] "Demonstração" → "Demonstration"
- [ ] "Discurso" → "Talk"
- [ ] "Ajudante" → "Assistant"