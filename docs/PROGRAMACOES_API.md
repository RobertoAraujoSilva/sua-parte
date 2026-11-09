API de Programações e Designações (versão inicial)

## Atualização oficial no dashboard
- O dashboard inclui as nove semanas da apostila novembro–dezembro de 2026 extraídas via Firecrawl do JW.org.
- “Atualizar Programação” importa a apostila bimestral correspondente à data atual, não a publicação mais recente do índice. Em janeiro de 2027, passa a consultar janeiro–fevereiro de 2027.
- A importação percorre todas as semanas; falhas preservam a programação anterior. Semanas importadas ficam neste navegador, e designações continuam salvas na conta.
- Não há atualização agendada: o instrutor usa o botão quando desejar buscar o período seguinte. Conteúdo ainda não publicado não é inventado.
- Testes de período: `bun run test -- src/utils/jwWorkbook.test.ts`.

Rotas Admin
- POST /api/programacoes: cria rascunho da semana, aceita payload com itens (sem nomes)
- PUT /api/programacoes/:id/publicar: muda status para "publicada"
- GET /api/programacoes?semana=YYYY-MM-DD: retorna programações que abrangem a data e seus itens
- PUT /api/programacoes/:id: atualiza datas e substitui itens (sem nomes)

Rotas Instrutor
- GET /api/programacoes/publicadas?semana=YYYY-MM-DD: retorna programações publicadas e itens
- GET /api/designacoes?programacao_id=...&congregacao_id=...: retorna designações e itens já salvos
- POST /api/designacoes: cria/atualiza designações de uma congregação

Validações principais
- bible_reading e talk exigem sexo M no principal
- cbs, opening, concluding, local_needs exigem ancião/SM no principal
- starting/following/making/public_witnessing permitem assistente (opcional)

Esquema de tabelas
- Ver arquivo supabase/migrations/20250908_programacoes_designacoes.sql

