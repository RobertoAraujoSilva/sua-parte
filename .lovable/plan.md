

# Fazer o Firecrawl buscar dados atualizados do JW.org conforme idioma

## Situacao Atual

A Edge Function `firecrawl-jworg` ja existe e esta correta -- ela recebe `{ language }`, monta a URL correspondente, chama Firecrawl, parseia o markdown e retorna `ParsedWeek[]`. O hook `useJWorgIntegration` e o API helper `firecrawl-jworg.ts` tambem ja estao implementados com a cadeia de fallback (Firecrawl -> Cheerio -> Mock).

Porem, ha um bug: quando o usuario muda o idioma via `setLanguage()`, os dados **nao sao rebuscados**. O `useEffect` so roda na montagem (sem dependencia de `currentLanguage`).

## Plano

### 1. Corrigir re-fetch ao mudar idioma no hook

No `src/hooks/useJWorgIntegration.ts`:
- Adicionar `currentLanguage` como dependencia do `useEffect` para que ao mudar o idioma, o sistema automaticamente busque novos dados do JW.org na lingua selecionada
- Isso garante que `fetchAllWeeks()` sera chamado novamente com o idioma correto

### 2. Mostrar fonte de dados e idioma na UI de teste

No `src/components/JWorgTest.tsx`:
- Adicionar display do `dataSource` (firecrawl/cheerio/mock) para o usuario saber de onde vieram os dados
- Adicionar botoes para alternar idioma (PT/EN) que chamam `setLanguage()`
- Isso permite testar facilmente se o Firecrawl esta buscando dados nas duas linguas

### Arquivos a modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useJWorgIntegration.ts` | Adicionar `currentLanguage` no `useEffect` deps |
| `src/components/JWorgTest.tsx` | Adicionar seletor de idioma e indicador de fonte |

