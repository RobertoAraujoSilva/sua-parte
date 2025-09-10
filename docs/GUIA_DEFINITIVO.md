# GUIA DEFINITIVO — Fluxo Completo (Admin → Instrutor → Estudante)

Este guia descreve, de ponta a ponta, a sequência de páginas e cliques para operar o sistema desde o login do Admin até o dia do discurso do estudante. Cada página é numerada e, dentro de cada página, os botões/ações são numerados em ordem cronológica típica de uso. Inclui também checagens rápidas para validar se os botões estão funcionando conforme esperado.

Observação: este guia cobre três painéis distintos (Dashboards): Admin, Instrutor e Estudante.

## Convenções

- Páginas são numeradas por papel: A- (Admin), I- (Instrutor), E- (Estudante).
- Botões/Ações dentro da página: B1, B2, ... na ordem de uso recomendada.
- “Verificação” indica o efeito esperado (navegação, toast, alteração de status, chamada API/Supabase).

## Pré‑requisitos (rápido)

- Login concluído com conta válida (ver Auth).
- Supabase configurado (URL/Anon Key no frontend) e RLS aplicadas (programas/designações/histórico).
- Backend opcional (materiais/JW.org) ativo em `http://localhost:3001` se desejar usar rotas Admin de programação.
- Bucket `programas` criado no Storage (se quiser armazenar PDFs) e políticas de leitura/escrita configuradas.

---

## A. Painel do Admin

### A1. Página de Login (Rota: `/auth`)

- B1 — Entrar
  - Ação: Informar email/senha e autenticar.
  - Verificação: Redireciona para `/admin` (ou `/dashboard`) com sessão válida; log “SIGNED_IN” no console.

### A2. Admin Dashboard — Programação Semanal (Rota: `/admin`)

- B1 — Importar do MWB
  - Ação: Carrega um modelo de programação (seed) na tela.
  - Verificação: Lista de itens por seção exibida; status “rascunho”.

- B2 — Duplicar semana
  - Ação: Duplica a semana atual para edição.
  - Verificação: Campos de data mantidos/ajustados, status permanece “rascunho”.

- B3 — Salvar rascunho
  - Ação: Envia `POST /api/programacoes` (backend) com status “rascunho”.
  - Verificação: Alerta “Rascunho salvo” (ou toast); no backend, registro na tabela `programacoes`.

- B4 — Publicar
  - Ação: Envia `POST /api/programacoes` (backend) com status “publicada”.
  - Verificação: Alerta “Programa publicado para os Instrutores”; instrutor passa a ver semana publicada.

- B5 — Imprimir/Exportar
  - Ação: Abre diálogo de impressão do navegador (exportar PDF da página atual sem nomes).
  - Verificação: Diálogo de impressão aparece.

- B6 — Alternar idioma (Português/English)
  - Ação: Alterna rótulos dos itens.
  - Verificação: Títulos/observações alternam entre PT/EN.

- B7 — Selecionar Semana (Date Picker)
  - Ação: Define `week_start`, calcula `week_end`.
  - Verificação: Cabeçalho atualiza a semana; itens continuam visíveis.

---

## B. Painel do Instrutor

### I1. Programas (Rota: `/programas`)

- B1 — Upload de PDF MWB (botão “Selecionar arquivo”)
  - Ação: Seleciona o arquivo (ex: `mwb_E_202509.pdf`). Faz parsing mínimo (nome do arquivo) e prepara `partes`.
  - Verificação: Toast “Planilha/PDF recebido” (ou log). Tamanho/arquivo exibidos no console. Em seguida, o sistema salva um registro em `public.programas` com `user_id`.

- B2 — Gerar Designações
  - Ação: Gera 12 partes com base na semana/partes; carrega ~34 estudantes ativos; aplica regras e pareamentos.
  - Verificação: Logs “Geradas 12 designações” e lista de designações atribuídas no console.

- B3 — Visualizar
  - Ação: Abre o modal de detalhes do programa (ou painel com partes e status).
  - Verificação: Modal/cartão exibe semana, partes e status de designações.

- B4 — Revisar Designações / Ver Designações
  - Ação: Navega para `/programa/{id}` (pré-visualização com as designações do programa).
  - Verificação: Página “Programa Preview” com lista das 12 partes e seus designados.

- B5 — Download
  - Ação: Tenta baixar o PDF do Storage bucket `programas`; se não existir, gera PDF on‑the‑fly.
  - Verificação: Se o arquivo existir no bucket, download inicia. Caso contrário, PDF gerado pelo utilitário.

- B6 — Deletar
  - Ação: Remove o programa de `public.programas` (confirmação antes).
  - Verificação: Item some da lista. Toast “Programa Deletado”.

Notas sobre RLS/erros comuns no I1:
- 403 ao salvar designações indica falta de INSERT em `assignment_history` (corrigido por migração). Tente novamente após aplicar.
- 400 no Storage indica bucket ou políticas ausentes (criar/ajustar e reenviar arquivo).

### I2. Programa Preview (Rota: `/programa/{id}`)

- B1 — Confirmar/Salvar Designações
  - Ação: Salva designações em `public.designacoes`. Gatilhos podem gravar em `assignment_history`.
  - Verificação: Toast de sucesso; status do programa pode mudar para “Rascunho”/“Aprovado” conforme fluxo.

- B2 — Regenerar (se disponível)
  - Ação: Reexecuta a geração com as mesmas partes (útil para ajustes rápidos).
  - Verificação: Logs de geração e nova lista; designações persistidas após salvar.

- B3 — Voltar
  - Ação: Retorna à lista de Programas.
  - Verificação: Página `/programas` com lista atualizada.

### I3. Designações (Rota: `/designacoes` ou via “Ver Designações”)

- B1 — Revisar lista de designações
  - Ação: Lista consolidada (por semana) com filtros.
  - Verificação: Contagem consistente com o programa selecionado.

- B2 — Ajustar/Editar (quando disponível)
  - Ação: Edita designação específica (trocar estudante/assistente/tempo).
  - Verificação: Atualização em `public.designacoes` e possível registro em `assignment_history`.

### I4. Estudantes (Rota: `/estudantes`)

- B1 — Importar/Adicionar Estudantes
  - Ação: Importa via Excel (quando habilitado) ou adiciona manualmente.
  - Verificação: `public.estudantes` atualizado; “Carregados X estudantes ativos” nos logs.

- B2 — Edição Inline
  - Ação: Ajusta cargo/qualificações.
  - Verificação: Persistência via Supabase; toasts de sucesso.

---

## C. Portal do Estudante

### E1. Student Dashboard (Rota: `/estudante/:id` ou `/portal/estudante`)

- B1 — Minhas Designações (lista)
  - Ação: Exibe as designações do estudante com status (pendente/confirmada/completada).
  - Verificação: Componente `StudentAssignmentView` carrega via Supabase; se tempo real estiver habilitado, atualiza automaticamente.

- B2 — Confirmar Participação
  - Ação: Botão/controle para `update { confirmado: true }` em `public.designacoes` (linha do estudante).
  - Verificação: Toast “Participação confirmada”; status alterado para “Confirmada”.

- B3 — Baixar/Ver Material (quando disponível)
  - Ação: Download de PDF do programa/seção ou link para leitura.
  - Verificação: Arquivo abre/baixa corretamente (se presente no Storage; senão, use PDF gerado pelo Instrutor).

- B4 — Voltar / Navegação
  - Ação: Retorna à página anterior ou ao hub do Portal.
  - Verificação: Navegação padrão do navegador/rota configurada.

---

## D. Sequência Cronológica Recomendada

1) Admin (A1 → A2):
   - Acessa `/auth`, faz login (B1).
   - Em `/admin`: Importar do MWB (B1), ajustar datas/idioma (B6/B7), Salvar rascunho (B3) e depois Publicar (B4).

2) Instrutor (I1 → I2 → I3):
   - Em `/programas`: Upload PDF (B1) → Gerar Designações (B2) → Visualizar (B3) → Revisar/Ver Designações (B4).
   - Em `/programa/{id}`: Confirmar/Salvar Designações (B1). Se necessário, Regenerar (B2).
   - Em `/designacoes`: Revisar lista final (B1) e pequenos ajustes (B2).
   - (Opcional) Em `/estudantes`: validar/atualizar cadastro e qualificações.

3) Estudante (E1):
   - Acessa o Portal, revisa Minhas Designações (B1) e confirma participação (B2).
   - No dia do discurso, utiliza o material de apoio (B3).

---

## E. Verificação de Botões (Checklist)

### Admin
- A2‑B1 Importar do MWB → Carrega seed; itens por seção visíveis.
- A2‑B3 Salvar rascunho → 200 no `POST /api/programacoes`; alerta “Rascunho salvo”.
- A2‑B4 Publicar → 200 no `POST /api/programacoes`; alerta “Programa publicado”.
- A2‑B5 Imprimir/Exportar → Abre diálogo de impressão.

### Instrutor — Programas
- I1‑B1 Upload PDF → Toast/log; registro em `public.programas` com `user_id`.
- I1‑B2 Gerar Designações → Logs “Geradas 12 designações”.
- I1‑B4 Revisar Designações → Navega `/programa/{id}`.
- I2‑B1 Confirmar/Salvar → INSERT em `public.designacoes` (sem 403). Se houver audit, `assignment_history` recebe INSERT.
- I1‑B5 Download → Storage inicia download se existir; fallback gera PDF.
- I1‑B6 Deletar → 200 no DELETE; item some e toast.

### Estudante
- E1‑B2 Confirmar Participação → UPDATE em `public.designacoes.confirmado = true`; toast de sucesso.

---

## F. Observações e Dicas

- Caso veja 403 ao salvar designações: aplicar as migrações RLS adicionadas (assignment_history/designacoes).
- Para download via Storage, crie o bucket `programas` e aplique as políticas; caso não exista, o botão de Download cai no PDF gerado pelo sistema.
- Warnings de acessibilidade (Dialog Description) não impedem o fluxo — ajuste posteriormente.
- Ferramentas de diagnóstico em DEV: `resetSupabaseAuth()`, painéis de health e logs no console ajudam a identificar sessões inválidas/headers.

