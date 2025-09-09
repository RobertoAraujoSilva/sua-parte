API de Programações e Designações (versão inicial)

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

