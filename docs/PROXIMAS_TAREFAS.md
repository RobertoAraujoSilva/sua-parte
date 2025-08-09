# Plano de Próximas Tarefas — Sistema Ministerial

> Documento de orientação. Não executar as tarefas agora — apenas planejar e preparar.

## Objetivos do Dia (Prioridade)

- [ ] Integrar o algoritmo de designações ao Dashboard do Instrutor com pré-visualização e salvamento em lote
- [ ] Corrigir mapeamentos/tipos e padronizar campos usados em designações/portal familiar
- [ ] Melhorar robustez da importação por planilha (erros, duplicados, vínculo de responsáveis)
- [ ] Refatorar testes do Sistema de Designações (dividir arquivo monolítico em módulos menores)
- [ ] Passo rápido de verificação: build local, navegação principal e smoke tests Cypress

---

## 1) Integração do Algoritmo no Dashboard do Instrutor

Arquivos alvo (leitura/edição planejada):
- src/pages/Designacoes.tsx (UI e ações: gerar, regenerar, prévia)
- src/utils/assignmentGenerator.ts (garantir uso do schema real e regras S-38-T)
- src/utils/regrasS38T.ts (regras centralizadas)
- src/utils/dataLoaders.ts, src/utils/balanceamentoHistorico.ts (fonte de dados e fairness)
- Criar: src/services/assignmentsService.ts (orquestração)

Passos recomendados:
- [ ] Criar serviço assignmentsService com funções:
  - generateForProgram(programId): carrega programa (partes, data_inicio_semana), aplica GeradorDesignacoes, retorna { preview, errors }
  - save(programId, preview): insere em "designacoes" em lote; evita duplicidade por semana (apagar antes ou abortar com alerta)
  - regenerate(programId): remove designações existentes e executa generate + save
- [ ] Atualizar Designacoes.tsx:
  - Botão "Gerar Designações Automáticas": abre diálogo de prévia (usar components/ui/dialog)
  - Exibir lista de partes atribuídas, erros de validação e permitir "Confirmar e Salvar"
  - Adicionar "Regenerar Semana" com confirmação
  - Usar toasts (src/hooks/use-toast) para feedback
- [ ] Logs de depuração com identificadores claros ("[DESIG] ...")

Critérios de aceite:
- Ao gerar, a prévia aparece em até 2s e erros são listados.
- Salvar cria registros em "designacoes" com campos corretos (id_programa, id_estudante, id_ajudante?, tipo_parte, numero_parte, tempo_minutos, data_inicio_semana, confirmado=false).
- Regenerar remove registros anteriores da mesma semana antes de salvar.

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

Arquivo grande a refatorar:
- src/utils/testesSistemaDesignacoes.ts (506 linhas)

Estratégia:
- [ ] Criar pasta src/utils/tests/designacoes/
- [ ] Separar em módulos:
  - carregamento.test.ts (carregamento de dados base)
  - regras-s38t.test.ts (elegibilidade, restrições por gênero/qualificação)
  - balanceamento.test.ts (ordenação por prioridade)
  - geracao.test.ts (gerarDesignacoes para cenários diferentes)
  - validacao.test.ts (validarDesignacoes sem erros)
  - persistencia.test.ts (simulações de estrutura antes de salvar)
  - regeneracao.test.ts (duas gerações consecutivas)
- [ ] Expor uma função runner para agregar relatório (mantendo a API atual)

Critérios de aceite:
- Cada arquivo <= ~150 linhas
- Runner retorna o mesmo RelatorioTestes

---

## 5) Verificações Rápidas e Qualidade

Scripts úteis (já no repo):
- scripts/verify-build.js (build health)
- scripts/verify-dashboard-fix.js, scripts/verify-header-fix.js (sanidade)
- Cypress básico: cypress/e2e/* (login, navegação estudante)

Passos recomendados:
- [ ] Rodar verificação de build local e smoke de navegação
- [ ] Executar 1–2 specs do Cypress (login e navegação portal)

Critérios de aceite:
- Build e navegação principais sem erros no console

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

## Ordem Sugerida de Execução (estimativa)

1) Integração Algoritmo + UI de Prévia (90–120 min)
2) Correções de Tipos/Mapeamentos (45–60 min)
3) Importação por Planilha (60–90 min)
4) Refatoração de Testes (60–90 min)
5) Smoke/Qualidade e RLS Review (30–45 min)

---

## Como Testar (sem executar agora)

- Acessar /designacoes e validar fluxo: Gerar → Prévia → Confirmar (simulado)
- Verificar Portal Familiar lendo campos padronizados
- Rodar scripts de verificação e 1–2 specs do Cypress

---

## Referências

- docs/PLANO.md (visão macro)
- cypress/e2e/* (fluxos críticos)
- src/utils/* (gerador, regras, balanceamento, loaders)

> Observação: Este documento é um guia operacional para o próximo ciclo de trabalho. Execute as tarefas em branches dedicadas e faça commits claros.
