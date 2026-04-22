

# Plano de Reformulação — Sistema Ministerial Simplificado

## Problema

O projeto acumulou complexidade excessiva: 3 dashboards (Admin, Instrutor, Estudante), dependências de backend Express local (`useBackendApi`, `/api/*`), múltiplas páginas redundantes, e fluxo de onboarding pesado. Nada funciona de ponta a ponta. O sistema precisa ser simplificado para funcionar.

## Decisão Arquitetural

Eliminar o Admin Dashboard e todas as dependências de backend local. O Instrutor Dashboard se torna o painel central, carregando programação diretamente dos JSONs mock já existentes em `src/data/programacoes-completas-2025.json` (9 semanas, set-nov 2025). O instrutor apenas designa estudantes às partes. Estudantes visualizam suas designações no portal.

## O que já existe e funciona

- `src/data/programacoes-completas-2025.json` — 9 semanas completas com partes estruturadas
- `useEstudantes` — CRUD de estudantes via Supabase direto (funciona)
- `ProgramacaoViewer` — componente que exibe programação e permite designar estudantes
- Tabelas Supabase: `estudantes`, `designacoes`, `programas`, `profiles` — com RLS funcional
- Auth via Supabase (login/signup) — funciona

## O que está quebrado / é desnecessário

- `useBackendApi` — faz fetch para `/api/*` (backend Express que não existe no Lovable)
- `InstrutorDashboard` — depende de `useBackendApi` para carregar programações e designações
- `Programas.tsx` — faz fetch para `/api/programacoes/mock` (não existe)
- `Designacoes.tsx` — faz fetch para `/api/programacoes` (não existe)
- `backend/` — diretório inteiro de Express (inútil no Lovable)
- `src/pages/admin/ProgramasDashboard.tsx` + `src/components/admin/*` — admin dashboard
- `GlobalDataContext`, `useUnifiedData`, `useInstructorDashboard` — camadas de abstração sobre dados que não carregam
- `OnboardingContext` + `SequentialFlow` — onboarding complexo que bloqueia acesso

## Plano de Implementação

### Fase 1: Novo Dashboard do Instrutor (substituir o atual)

Reescrever `InstrutorDashboard.tsx` para:
1. Carregar programação de `src/data/programacoes-completas-2025.json` (import estático)
2. Carregar estudantes via `useEstudantes` (já funciona)
3. Carregar/salvar designações via Supabase direto (`designacoes` table)
4. Usar `ProgramacaoViewer` existente para exibir semanas e permitir designações
5. Remover toda dependência de `useBackendApi`

### Fase 2: Simplificar Designações

Reescrever a lógica de salvar/carregar designações:
- `INSERT INTO designacoes` direto via Supabase client (sem `/api/`)
- `SELECT FROM designacoes` com filtro por `user_id` e `id_programa`
- Eliminar `Designacoes.tsx` como página separada (integrar no dashboard)

### Fase 3: Limpar rotas e navegação

Remover do `App.tsx`:
- Rota `/admin/programas`
- Rota `/importar-programacao`
- Rota `/reunioes`
- Rota `/designacoes` (funcionalidade integrada ao dashboard)
- Rota `/primeiro-programa`

Manter:
- `/` (landing), `/auth`, `/dashboard`, `/estudantes`, `/portal`, `/relatorios`
- `/bem-vindo`, `/configuracao-inicial` (onboarding simplificado)

### Fase 4: Simplificar Onboarding

Reduzir de 5 etapas para 2:
1. Configuração inicial (congregação/cargo)
2. Cadastrar estudantes

Após isso, acesso direto ao dashboard com programação já carregada.

### Fase 5: Limpar código morto

Remover ou arquivar:
- `backend/` inteiro
- `useBackendApi.ts`
- `useProgramasAdmin.ts`, `useProgramasImport.ts`
- `useJWorgIntegration.ts`
- `src/components/admin/*`
- `src/pages/admin/*`
- `PDFProgrammingManager.tsx`, `JWContentParser.tsx`, `JWorgTest.tsx`
- `GlobalDataContext.tsx`, `useUnifiedData.ts`
- Múltiplos hooks não utilizados

### Fase 6: Portal do Estudante

Simplificar `EstudantePortal.tsx` para:
- Consultar `designacoes` onde `id_estudante = user.id` (via Supabase)
- Exibir lista de designações com semana, parte, tempo
- Botão de confirmação (`UPDATE designacoes SET confirmado = true`)

## Estrutura final de rotas

```text
/              → Landing page
/auth          → Login/Cadastro
/dashboard     → Instrutor: programação + designações + estudantes (tabs)
/estudantes    → Gestão completa de estudantes
/portal        → Estudante: ver suas designações
/relatorios    → Relatórios e exportação
```

## Detalhes Técnicos

**Dados de programação**: Import estático do JSON. Sem fetch, sem parsing de PDF, sem backend.

```typescript
import programacaoData from '@/data/programacoes-completas-2025.json';
```

**Designações**: CRUD direto via Supabase client.

```typescript
// Salvar
await supabase.from('designacoes').insert({
  titulo_parte: parte.titulo,
  tipo_parte: parte.tipo,
  id_estudante: estudanteId,
  id_ajudante: ajudanteId,
  tempo_minutos: parte.duracao,
  data_designacao: semana.dataInicio,
  user_id: user.id
});

// Carregar
const { data } = await supabase
  .from('designacoes')
  .select('*')
  .eq('user_id', user.id);
```

**Resultado esperado**: Dashboard funcional com programação visível, designações salvando no banco, estudantes gerenciáveis, portal do estudante mostrando designações. Sem dependências externas quebradas.

