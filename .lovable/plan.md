## Plano: Botão "Atualizar Programação"

Adicionar um botão visível no Dashboard do Instrutor que dispara a busca da programação atualizada do JW.org via Firecrawl, mescla com os dados estáticos existentes e atualiza a interface.

### Onde
- `src/pages/InstrutorDashboard.tsx` — header do dashboard, ao lado do título.

### Comportamento
1. Botão com ícone de refresh + label **"Atualizar Programação"**.
2. Ao clicar:
   - Chama `fetchJWorgContent('pt')` (já existente em `src/lib/api/firecrawl-jworg.ts`).
   - Mostra estado `refreshing` (spinner + label "Atualizando...").
   - Mescla semanas retornadas com as semanas estáticas do JSON, evitando duplicação por período.
   - Atualiza `lastSync` com timestamp.
   - Toast de sucesso ("Programação atualizada — N semanas") ou erro.
3. Em mobile (viewport estreito), mostrar só o ícone para não quebrar o layout.

### Detalhes técnicos
- Reaproveitar `agruparPartesPorSecao` já existente.
- Usar `Button` (variant `outline`) + `RefreshCw` do lucide-react com `animate-spin` quando `refreshing`.
- Nenhuma mudança de schema, nenhuma migração.

### Critério de aceite
- Botão aparece no header do dashboard do instrutor.
- Clique busca dados do JW.org e atualiza a lista de semanas sem recarregar a página.
- Funciona em portrait e desktop sem cortar conteúdo.
