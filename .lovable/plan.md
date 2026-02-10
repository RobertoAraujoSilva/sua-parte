

# Integrar Firecrawl para buscar programacoes JW.org em tempo real

## Situacao Atual

O sistema possui uma Edge Function (`fetch-jworg-content`) que usa `cheerio` para fazer scraping direto do `wol.jw.org`. Porem, esse approach tem limitacoes:
- Sites como JW.org podem bloquear requests diretos de servidores
- O parsing com cheerio depende da estrutura HTML exata e quebra com mudancas no site
- Conteudo renderizado via JavaScript nao e capturado

## Plano

### Passo 1: Conectar Firecrawl
- Configurar o conector Firecrawl no projeto para obter a API key como variavel de ambiente

### Passo 2: Criar Edge Function `firecrawl-jworg`
Nova Edge Function que usa Firecrawl para fazer scraping das URLs:
- `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/` (portugues)
- `https://www.jw.org/en/library/jw-meeting-workbook/` (ingles)

Estrategia:
1. Usar Firecrawl Scrape com formato `markdown` para obter conteudo limpo
2. Parsear o markdown retornado para extrair semanas, partes, duracoes, tipos e referencias
3. Retornar dados no mesmo formato `ParsedWeek[]` que a funcao atual usa

### Passo 3: Atualizar o hook `useJWorgIntegration`
- Apontar para a nova Edge Function `firecrawl-jworg` em vez de `fetch-jworg-content`
- Manter fallback para a funcao antiga caso Firecrawl falhe
- Remover dados mockados, usar dados reais

### Passo 4: Criar API helper `firecrawl-jworg`
- Frontend helper em `src/lib/api/firecrawl-jworg.ts` para chamar a edge function

---

## Detalhes Tecnicos

### Edge Function: `supabase/functions/firecrawl-jworg/index.ts`

```text
Fluxo:
1. Recebe { language: 'pt' | 'en' }
2. Busca FIRECRAWL_API_KEY do ambiente
3. Chama Firecrawl scrape API com a URL correspondente (formato: markdown)
4. Parseia o markdown para extrair:
   - Semanas (datas, leitura biblica)
   - Canticos (abertura, meio, encerramento)
   - Partes por secao (Tesouros, Ministerio, Vida Crista)
   - Tipo, duracao, titulo, descricao, referencias de cada parte
5. Retorna { success: true, weeks: ParsedWeek[] }
```

### Parsing do Markdown
O markdown retornado pelo Firecrawl tera headers (`##`, `###`) para semanas e secoes, e listas (`-`, `*`) para partes individuais. O parser usara regex para:
- Identificar datas de semana
- Separar secoes (Tesouros, Ministerio, Vida Crista)
- Extrair duracao `(X min)` de cada parte
- Classificar tipo da parte (reading, starting, following, talk, etc.)

### Mudancas no Hook
- `fetchCurrentWeek()` e `fetchNextWeeks()` chamarao `firecrawl-jworg` como primaria
- Fallback para `fetch-jworg-content` (cheerio) se Firecrawl falhar
- Cadeia: Firecrawl -> Cheerio -> Mock data

### Arquivos a criar/modificar:
| Arquivo | Acao |
|---------|------|
| `supabase/functions/firecrawl-jworg/index.ts` | Criar - nova edge function |
| `src/lib/api/firecrawl-jworg.ts` | Criar - helper API |
| `src/hooks/useJWorgIntegration.ts` | Modificar - usar nova funcao com fallback |

