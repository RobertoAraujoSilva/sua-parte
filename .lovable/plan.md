

# O que falta para ir para produção

## Estado atual

O projeto está **~90% completo** segundo a auditoria do plano. A maioria das funcionalidades (autenticação, RBAC, dashboards, designações, importação/exportação, RLS, CI/CD) já está implementada.

## Problemas críticos a resolver

### 1. Credenciais e segurança expostas no código
**Prioridade: URGENTE**

- `scripts/setup-github-secrets.md` contém senhas em texto puro (`13a21r15`) e emails reais
- `scripts/README.md` contém credenciais de teste
- `.env` contém chaves de um projeto Supabase antigo (`nwpuurgw...`) que não é o projeto Cloud atual (`plusukkkqhhlkvikhhfi`)
- `src/utils/emergencyLogout.ts` e `src/utils/forceLogout.ts` referenciam o projeto Supabase antigo (`sb-nwpuurgwnnuejqinkvrh-auth-token`)

**Ação:** Remover credenciais dos arquivos versionados, atualizar referências hardcoded para usar o projeto Cloud correto.

### 2. Backend Node.js incompatível com Lovable
**Prioridade: ALTA**

- O diretório `backend/` contém um servidor Express que **não pode rodar** no Lovable (apenas frontend + Edge Functions)
- `src/hooks/useMaterials.ts` faz fetch para `http://localhost:3001` — vai quebrar em produção
- `src/hooks/usePDFProgramming.ts` depende de `VITE_API_BASE` apontando para backend local

**Ação:** Migrar endpoints necessários para Edge Functions ou remover código de backend que não será usado, substituindo por chamadas diretas ao banco ou Edge Functions.

### 3. Storage bucket não existe
**Prioridade: ALTA**

- O bucket `programas` (para upload de PDFs) não foi criado no projeto Cloud atual
- Docs mencionam necessidade de criação manual

**Ação:** Criar o storage bucket via migração.

### 4. Referências hardcoded ao Supabase antigo
**Prioridade: MÉDIA**

- `emergencyLogout.ts` e `forceLogout.ts` referenciam `sb-nwpuurgwnnuejqinkvrh` em vez do projeto Cloud atual
- Precisam ser atualizados para funcionar corretamente

**Ação:** Substituir pelo projeto correto ou usar pattern genérico.

## Itens pendentes do plano (não-bloqueantes)

Estes itens estão marcados como incompletos mas **não bloqueiam** produção:

- 4.4 Busca global/navegação avançada
- 8.1 REST API + OpenAPI
- 8.4 Monitoring API
- 9.1 Unit tests
- 11.1 UI de geração ligada ao engine

## Checklist resumido para produção

| Item | Status | Bloqueante? |
|------|--------|-------------|
| Remover credenciais expostas nos docs/scripts | Pendente | Sim |
| Limpar referências ao Supabase antigo | Pendente | Sim |
| Resolver `useMaterials.ts` (localhost hardcoded) | Pendente | Sim |
| Resolver `usePDFProgramming.ts` (backend dependence) | Pendente | Sim |
| Criar storage bucket `programas` | Pendente | Sim |
| Remover `ProductionDebugPanel` em prod | OK (já tem check `import.meta.env.DEV`) | Não |
| RLS policies | Implementadas | Não |
| Autenticação + RBAC | Implementado | Não |
| Edge Functions (Firecrawl, JW.org) | Implementadas | Não |

## Plano de ação (ordem sugerida)

1. **Limpar segurança**: remover senhas/credenciais de arquivos versionados
2. **Atualizar referências Supabase**: corrigir `emergencyLogout.ts`, `forceLogout.ts` para projeto Cloud
3. **Criar storage bucket** `programas` no Cloud
4. **Migrar ou remover backend**: substituir `useMaterials` e `usePDFProgramming` por Edge Functions ou chamadas diretas ao Supabase
5. **Testar fluxos principais**: login, dashboard, designações, upload PDF
6. **Publicar** via botão Publish do Lovable

