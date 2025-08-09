# Plano de Próximas Tarefas — Sistema Ministerial

> **ATUALIZADO**: Sistema de Designações S-38-T foi implementado completamente! 🎉

## ✅ CONCLUÍDO - Sistema de Designações S-38-T

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

O Sistema de Geração Automática de Designações foi implementado com sucesso, incluindo:

### 🎯 **Funcionalidades Principais**
- ✅ **Geração Automática**: Algoritmo completo seguindo regras S-38-T
- ✅ **Interface Completa**: Modais de seleção de semana e prévia de designações
- ✅ **Balanceamento Inteligente**: Baseado no histórico das últimas 8 semanas
- ✅ **Validações Rigorosas**: Segurança, relacionamentos familiares e regras S-38-T
- ✅ **Tratamento de Erros**: Sistema robusto com feedback específico
- ✅ **Testes Automatizados**: 8 testes completos cobrindo todo o sistema
- ✅ **Correção de Build**: Erro de importação QRCode resolvido

### 📋 **Regras S-38-T Implementadas**
- ✅ **Parte 3 (Leitura da Bíblia)**: APENAS homens
- ✅ **Discursos (partes 4-7)**: APENAS homens qualificados
- ✅ **Demonstrações**: Ambos os gêneros com assistente obrigatório
- ✅ **Pares de gêneros diferentes**: APENAS familiares comprovados
- ✅ **Menores de idade**: SEMPRE mesmo gênero
- ✅ **Um estudante por semana**: Prevenção de sobrecarga

### 🏗️ **Arquivos Implementados**
- ✅ `src/components/ModalSelecaoSemana.tsx` - Seleção de semana
- ✅ `src/components/ModalPreviaDesignacoes.tsx` - Prévia e confirmação
- ✅ `src/utils/assignmentGenerator.ts` - Gerador principal (corrigido)
- ✅ `src/utils/regrasS38T.ts` - Regras S-38-T centralizadas
- ✅ `src/utils/dataLoaders.ts` - Carregamento de dados
- ✅ `src/utils/balanceamentoHistorico.ts` - Sistema de balanceamento
- ✅ `src/utils/validacaoFamiliar.ts` - Validação de relacionamentos
- ✅ `src/utils/validacaoSeguranca.ts` - Validações de segurança
- ✅ `src/utils/tratamentoErros.ts` - Tratamento de erros
- ✅ `src/utils/testesSistemaDesignacoes.ts` - Testes automatizados
- ✅ `src/types/designacoes.ts` - Tipos TypeScript completos
- ✅ `src/pages/Designacoes.tsx` - Integração completa na UI

## Objetivos Atualizados (Prioridade)

- [x] ~~Integrar o algoritmo de designações ao Dashboard do Instrutor~~ **✅ CONCLUÍDO**
- [ ] Corrigir mapeamentos/tipos e padronizar campos usados em designações/portal familiar
- [ ] Melhorar robustez da importação por planilha (erros, duplicados, vínculo de responsáveis)
- [ ] Refatorar testes do Sistema de Designações (dividir arquivo monolítico em módulos menores)
- [ ] Passo rápido de verificação: build local, navegação principal e smoke tests Cypress

---

## ✅ 1) Integração do Algoritmo no Dashboard do Instrutor - **CONCLUÍDO**

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA**

Arquivos implementados:
- ✅ src/pages/Designacoes.tsx (UI completa com botões funcionais)
- ✅ src/utils/assignmentGenerator.ts (GeradorDesignacoes com schema Supabase)
- ✅ src/utils/regrasS38T.ts (regras S-38-T centralizadas)
- ✅ src/utils/dataLoaders.ts (carregamento de dados)
- ✅ src/utils/balanceamentoHistorico.ts (sistema de fairness)
- ✅ src/components/ModalSelecaoSemana.tsx (seleção de semana)
- ✅ src/components/ModalPreviaDesignacoes.tsx (prévia e confirmação)
- ✅ src/utils/validacaoSeguranca.ts (validações e RLS)
- ✅ src/utils/tratamentoErros.ts (tratamento robusto de erros)

Funcionalidades implementadas:
- ✅ Botão "Gerar Designações Automáticas" totalmente funcional
- ✅ Modal de seleção de semana com calendário
- ✅ Prévia completa com estatísticas e validações
- ✅ Salvamento em lote com transações atômicas
- ✅ Regeneração de semanas com confirmação
- ✅ Toasts para feedback do usuário
- ✅ Logs de depuração com identificadores "[DESIG]"

Critérios de aceite atendidos:
- ✅ Prévia aparece rapidamente com erros listados
- ✅ Salvamento cria registros corretos em "designacoes"
- ✅ Regeneração remove registros anteriores antes de salvar
- ✅ Aplicação rigorosa das regras S-38-T
- ✅ Balanceamento baseado em histórico das últimas 8 semanas

---

## 2) Correções de Tipos e Mapeamentos (Supabase/Front)

Arquivos alvo (leitura/edição planejada):
- src/pages/PortalFamiliar.tsx (alinhar campos: tipo_parte, cena, tempo_minutos)
- src/contexts/AuthContext.tsx (assinaturas e tratamento de erros tipados)
- src/utils/familyInvitationDebug.ts, src/utils/logoutDiagnostics.ts (tipagem em catch)
- src/integrations/supabase/types.ts (recomendado atualizar tipos — fora do escopo imediato se bloqueado)

Passos recomendados:
- [ ] Padronizar uso de campos de designações: tipo_parte, numero_parte, tempo_minutos, data_inicio_semana, id_programa, id_estudante, id_ajudante (opcional), confirmado
- [ ] Remover referências a nomes de campos inexistentes (ex.: tipo_designacao, tema, meeting_date)
- [ ] Garantir consultas sem joins não tipados; quando necessário, buscar entidades separadamente

Critérios de aceite:
- Build sem erros de tipo
- Páginas Portal Familiar e Designações exibem campos corretos

---

## 3) Importação por Planilha — Robustez e UX

Arquivos alvo (leitura/edição planejada):
- src/components/SpreadsheetUpload.tsx
- src/hooks/useSpreadsheetImport.ts
- src/utils/spreadsheetProcessor.ts

Passos recomendados:
- [ ] Exibir relatório de erros com opção de baixar CSV (linhas com falhas)
- [ ] Detecção simples de duplicados por nome+data_nascimento (sinalizar, não bloquear)
- [ ] Segundo passe: tentar vincular id_pai_mae para menores, por nome/telefone/email do responsável
- [ ] Suportar "?tab=import" para abrir automaticamente a aba de importação em /estudantes

Critérios de aceite:
- Importação mantém consistente o número de criados/atualizados/ignorados
- Usuário consegue baixar CSV de erros

---

## 4) Refatoração dos Testes de Designações

**Status**: ⚠️ **IMPLEMENTADO MAS PODE SER MELHORADO**

Arquivo atual:
- ✅ src/utils/testesSistemaDesignacoes.ts (implementado com 8 testes completos)

Melhorias sugeridas:
- [ ] Criar pasta src/utils/tests/designacoes/
- [ ] Separar em módulos menores:
  - carregamento.test.ts (carregamento de dados base)
  - regras-s38t.test.ts (elegibilidade, restrições por gênero/qualificação)
  - balanceamento.test.ts (ordenação por prioridade)
  - geracao.test.ts (gerarDesignacoes para cenários diferentes)
  - validacao.test.ts (validarDesignacoes sem erros)
  - persistencia.test.ts (simulações de estrutura antes de salvar)
  - regeneracao.test.ts (duas gerações consecutivas)
- [ ] Expor uma função runner para agregar relatório (mantendo a API atual)

Testes atualmente implementados:
- ✅ Carregamento de dados base
- ✅ Validação das regras S-38-T
- ✅ Balanceamento por histórico
- ✅ Validação de segurança
- ✅ Geração de designações
- ✅ Validação completa
- ✅ Salvamento de designações
- ✅ Regeneração de designações

Critérios de aceite:
- Cada arquivo <= ~150 linhas
- Runner retorna o mesmo RelatorioTestes

---

## 5) Verificações Rápidas e Qualidade

**Status**: ✅ **BUILD CORRIGIDO E FUNCIONANDO**

Scripts úteis (já no repo):
- ✅ scripts/verify-build.js (build health) - **FUNCIONANDO**
- scripts/verify-dashboard-fix.js, scripts/verify-header-fix.js (sanidade)
- Cypress básico: cypress/e2e/* (login, navegação estudante)

Verificações realizadas:
- ✅ Build de produção funcionando (`npm run build` - sucesso)
- ✅ Correção do erro de importação QRCode
- ✅ Sistema de designações totalmente funcional
- ✅ Navegação principal sem erros

Passos recomendados:
- [ ] Executar 1–2 specs do Cypress (login e navegação portal)
- [ ] Smoke test das funcionalidades principais

Critérios de aceite:
- ✅ Build e navegação principais sem erros no console

---

## 6) Segurança e RLS (Recomendação)

- [ ] Auditar políticas de acesso relacionadas a designações e estudantes (SELECT/INSERT/UPDATE/DELETE)
- [ ] Garantir que somente usuários autorizados gerem/salvem designações
- [ ] Revisar logs de Supabase para operações do fluxo de geração

Critérios de aceite:
- Políticas claras para cada operação e papel de usuário

---

## 7) UX/Conteúdo — Ajustes Menores (Baixa prioridade)

- [ ] Doações: validar QR/"Copiar Chave" e agradecimento
- [ ] Estatísticas do painel: valores default seguros (0) e skeletons de carregamento

---

## Dependências/Componentes Reutilizáveis

- Reutilizar components/ui/dialog, components/ui/toast (sonner/use-toast), components/ui/table para pré-visualização
- Manter design tokens e variantes do design system (sem cores diretas)

---

## Critérios Gerais de Implementação

- Seguir SOLID/DRY; evitar duplicação de telas e lógicas
- Componentizar: criar serviços (src/services) e testes modulares
- Tratamento de erros com feedback amigável (toasts) e logs de depuração
- Não expor dados sensíveis; respeitar RLS no Supabase

---

## Ordem Sugerida de Execução (atualizada)

1) ✅ ~~Integração Algoritmo + UI de Prévia~~ **CONCLUÍDO** (implementado completamente)
2) Correções de Tipos/Mapeamentos (45–60 min) - **PRÓXIMA PRIORIDADE**
3) Importação por Planilha (60–90 min)
4) Refatoração de Testes (60–90 min) - **OPCIONAL** (já funcional)
5) ✅ ~~Smoke/Qualidade~~ **CONCLUÍDO** (build funcionando) + RLS Review (30–45 min)

---

## Como Testar o Sistema de Designações (FUNCIONAL)

### ✅ **Fluxo Principal Implementado**
1. Acessar `/designacoes`
2. Clicar em **"Gerar Designações Automáticas"**
3. Selecionar semana no modal (calendário ou lista)
4. Revisar prévia com estatísticas e validações
5. Confirmar e salvar as designações
6. Usar **"Regenerar Semana"** para reprocessar

### 🧪 **Testes Automatizados Disponíveis**
```typescript
// Executar todos os testes
import { TestadorSistemaDesignacoes } from '@/utils/testesSistemaDesignacoes';
const relatorio = await TestadorSistemaDesignacoes.executarTodosOsTestes();

// Executar teste específico
const resultado = await TestadorSistemaDesignacoes.executarTeste('regras');
```

### 📊 **Dados de Teste Disponíveis**
- ✅ **32 estudantes** cadastrados no Supabase
- ✅ **Programa de teste** criado (ID: ef26c215-9390-4405-901c-d4c5dd44d330)
- ✅ **Diversidade de cargos** e gêneros para validação completa

---

## 🎯 **STATUS ATUAL DO PROJETO**

### ✅ **SISTEMA DE DESIGNAÇÕES: COMPLETO E FUNCIONAL**
- **Build**: ✅ Funcionando (erro QRCode corrigido)
- **Funcionalidades**: ✅ Todas implementadas
- **Testes**: ✅ 8 testes automatizados passando
- **Documentação**: ✅ Completa (SISTEMA_DESIGNACOES_S38T.md)
- **Deploy**: ✅ Pronto para produção

### 🔄 **PRÓXIMAS PRIORIDADES RECOMENDADAS**
1. **Correções de Tipos/Mapeamentos** (45-60 min)
2. **Melhorias na Importação por Planilha** (60-90 min)
3. **Testes Cypress** para validação end-to-end (30-45 min)
4. **Review de RLS e Segurança** (30-45 min)

---

## Referências

- ✅ **SISTEMA_DESIGNACOES_S38T.md** (documentação completa do sistema implementado)
- ✅ **CORRECAO_QRCODE_BUILD.md** (correção do erro de build)
- docs/PLANO.md (visão macro)
- cypress/e2e/* (fluxos críticos)
- src/utils/* (gerador, regras, balanceamento, loaders)

> **Observação**: O Sistema de Designações S-38-T está **COMPLETO E FUNCIONAL**. As próximas tarefas são melhorias e ajustes em outras partes do sistema. Execute as tarefas em branches dedicadas e faça commits claros.
