# Plano de Produção - Sistema Ministerial

## ✅ Itens resolvidos

1. **Credenciais expostas** — Removidas senhas/emails de `scripts/setup-github-secrets.md` e `cypress.env.json`
2. **Referências hardcoded ao Supabase antigo** — `emergencyLogout.ts` e `forceLogout.ts` agora usam `VITE_SUPABASE_PROJECT_ID` dinâmico
3. **Storage bucket `programas`** — Criado via migração com políticas RLS
4. **Backend Node.js** — `useMaterials.ts` e `usePDFProgramming.ts` reescritos para usar Supabase Storage direto (sem `localhost:3001`)
5. **`supabase/.temp/project-ref`** — Atualizado para projeto Cloud correto

## Próximos passos

- Testar fluxos: login, dashboard instrutor, designações
- Publicar via botão Publish do Lovable
