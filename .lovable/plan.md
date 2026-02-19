

# Corrigir erro de build + Integrar Firecrawl para JW.org em tempo real

## Parte 1: Corrigir erro de build (DebugPanel.tsx)

O erro esta na linha 130 do `DebugPanel.tsx` onde `logLogoutAttempt('force', user)` e chamado, mas o tipo so aceita `'dropdown' | 'test'`.

**Solucao:** Alterar para `logLogoutAttempt('test', user)` no `handleForceLogout`, ja que e uma variacao de teste.

---

## Parte 2: Conectar Firecrawl

Configurar o conector Firecrawl no projeto para disponibilizar `FIRECRAWL_API_KEY` como variavel de ambiente nas Edge Functions.

---

## Parte 3: Criar Edge Function `firecrawl-jworg`

Nova Edge Function em `supabase/functions/firecrawl-jworg/index.ts` que:

1. Recebe `{ language: 'pt' | 'en' }` no body
2. Usa `FIRECRAWL_API_KEY` para chamar a API Firecrawl `/v1/scrape`
3. Faz scrape da URL correspondente ao idioma em formato `markdown`
4. Parseia o markdown com regex para extrair:
   - Semanas (datas, leitura biblica)
   - Canticos (abertura, meio, encerramento)
   - Partes por secao (Tesouros, Ministerio, Vida Crista)
   - Tipo, duracao, titulo, descricao, referencias
5. Retorna `{ success: true, weeks: ParsedWeek[] }`

URLs:
- PT: `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/`
- EN: `https://www.jw.org/en/library/jw-meeting-workbook/`

---

## Parte 4: Criar API helper frontend

Novo arquivo `src/lib/api/firecrawl-jworg.ts` com funcao para invocar a edge function `firecrawl-jworg` via `supabase.functions.invoke()`.

---

## Parte 5: Atualizar hook `useJWorgIntegration`

Modificar `src/hooks/useJWorgIntegration.ts` para:
- Chamar `firecrawl-jworg` como fonte primaria
- Fallback para `fetch-jworg-content` (cheerio) se Firecrawl falhar
- Fallback final para dados mock
- Cadeia: **Firecrawl -> Cheerio -> Mock**

---

## Arquivos afetados

| Arquivo | Acao |
|---------|------|
| `src/components/DebugPanel.tsx` | Corrigir tipo do logLogoutAttempt |
| `supabase/functions/firecrawl-jworg/index.ts` | Criar - edge function com Firecrawl |
| `src/lib/api/firecrawl-jworg.ts` | Criar - helper API |
| `src/hooks/useJWorgIntegration.ts` | Modificar - fallback chain |

