# Sua-Parte — Documentação Estendida

Este documento complementa o README.md com detalhes operacionais para planejamento e evolução do sistema.

## Papéis e Capacidades por Dashboard

### Admin Dashboard
- Importar materiais oficiais (PDF, JWPub, RTF) com pré-visualização por semana/parte.
- Edição leve após importação: títulos, tempos, observações e correções de parsing.
- Publicação universal (todas as congregações) ou segmentada por congregação/idioma/região, com agendamento.
- Histórico e rollback de publicações; monitoramento de serviços do backend.

### Dashboard do Instrutor
- Visualização da programação: lista de semanas (padrão) ou calendário (toggle), filtros por mês/idioma.
- Gestão de estudantes e designações por parte (S-38), com notas e status.
- Exportação de relatórios de designações em PDF/Excel.
- Offline-first: trabalho completo offline; sincronização automática quando reconectar.

### Portal do Estudante
- Notificações de designação: in-app (toasts/central) e opcional por e-mail/WhatsApp (mediante consentimento e configuração).
- Acesso a instruções práticas da parte e materiais de estudo disponibilizados pelo admin.
- Histórico de partes realizadas e confirmação de leitura/recebimento (ack) opcional.

## Fluxo de Dados (alto nível)
```
Admin importa programas  ->  Publica (todas/segmentado)  ->  Instrutor recebe semanas
Instrutor designa estudantes  ->  Publica designações  ->  Estudante é notificado e acessa
```

## Offline-first e Sincronização (Instrutor)
- Armazenamento local: IndexedDB + Service Worker para dados e fila de operações.
- Alterações offline (estudantes/designações/notas) são persistidas localmente e sincronizadas assim que houver conexão.
- Estratégia de conflitos: last-write-wins por padrão, com aviso quando houver divergências.
- Indicadores: status de sincronização, fila pendente e ação manual "Sincronizar agora".

## Modelo de Dados (Supabase)
- Tabelas principais (nomes ilustrativos; alinhar com migrações existentes):
  - `congregacoes`: congregação e metadados (região/idioma).
  - `profiles`: usuários com `role` (admin/instrutor/estudante) e congregação.
  - `programas`: semanas/partes publicadas (fonte oficial importada), idioma/período.
  - `estudantes`: cadastro local por congregação, status, observações.
  - `designacoes`: vínculo estudante-parte-semana, status e notas.
- Segurança: RLS por congregação e papel; privilégios mínimos; auditoria de mudanças sensíveis.

## Materiais Estáticos (Backend)
- O backend serve `docs/Oficial` via `/materials` (porta padrão 3001).
- Exemplos: `http://localhost:3001/materials/mwb_E_202507.pdf`.
- Recomendações: evitar espaços/parênteses em nomes; quando necessário, usar encoding na URL (`%20`).

## Deploy (Visão Geral)
- Frontend (Vite/React):
  - Vercel ou Netlify (build `npm run build`, diretório `dist/`).
  - Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em variáveis de ambiente.
- Backend (Express):
  - Railway ou Render. Definir `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` e apontar `DOCS_PATH` se parametrizado.
  - Alternativa: converter rotas para Supabase Edge Functions quando aplicável (leitura/publicação).
- Banco (Supabase):
  - Aplicar migrações, habilitar RLS, revisar políticas por papel e criar chaves de serviço com escopo mínimo.

## Relatórios e Exportações (Instrutor)
- Exportar designações por semana/mês em PDF/Excel.
- Padrão visual consistente (cabeçalho com congregação, período e legenda de status).
- Opção de incluir observações e tempos estimados.

## Notificações (Estudante)
- In-app: centro de notificações, toasts e contadores.
- E-mail: templates simples (assíncrono; opt-in).
- WhatsApp: integração opcional futura (requer consentimento e provedor API conforme LGPD).

## Boas Práticas e Segurança
- Não expor segredos no frontend; usar env vars. Rotas sensíveis protegidas por RLS.
- Guard clauses e fail-fast em APIs; logs com correlação de requisições.
- Componentes e hooks curtos, reutilizáveis; Tailwind + shadcn/ui para consistência.

## Roadmap Sugerido
- [ ] Parametrizar `DOCS_PATH` no backend via `process.env.DOCS_PATH`.
- [ ] Implementar preview e edição leve na importação do Admin.
- [ ] Tabela/roteiro de sincronização offline (fila, replays, conflitos).
- [ ] Exportações PDF/Excel no Instrutor.
- [ ] Notificações e-mail (primeira etapa) e in-app com ack.
- [ ] Guia de deploy com exemplos práticos (Railway/Render + Vercel/Netlify).

## Doações / Apoio
> Este sistema é oferecido gratuitamente. Caso queira apoiar o desenvolvimento, utilize o QR Code de doação Pix disponível no portal do estudante.

---
Para dúvidas técnicas específicas, consulte também: `ADMIN_DASHBOARD_INTEGRATION.md`, `DEBUG_ADMIN_DASHBOARD.md` e `README_ESTUDANTES.md`.

## Conflitos e Regras (S‑38)
- Versionamento e detecção de conflitos
  - Campos: `programas.versao`, `designacoes.versao`, `updated_at`.
  - Ao sincronizar: se `programa.versao_local < programa.versao_remota`, marcar designações ligadas a partes alteradas/removidas como "em conflito".
  - Last-write-wins apenas quando não houve alteração estrutural da parte (título/tipo/elegibilidade/tempo/ordem).
- Regras de elegibilidade e gênero
  - Bible Reading: estudante masculino; sem intro/conclusão.
  - Explaining Your Beliefs: talk → masculino; demo → ambos; assistente mesmo gênero ou familiar.
  - Starting/Following/Making: aluno e assistente mesmo gênero; familiar permitido.
  - Spiritual Gems: Q&A, respostas ≤30s; sem leitura obrigatória.
- Aplicação técnica
  - Validador no frontend ao criar/editar designação (bloqueia opções inválidas).
  - Constraint lógica no backend/Supabase via policies/checks suaves (preferir validação na aplicação + auditoria).
  - Campo `settings` por designação para registrar cenário: `house_to_house|informal|public`.

## Semanas Especiais, Timing e Settings (S‑38)
- Semanas especiais
  - `feriados_especiais(tipo)`: memorial/assembly/convention → ocultar reunião (ou marcar sem designações).
  - `visit_overseer`: substituir CBS (30 min) por service talk; ajustar comentários finais.
  - Job diário atualiza tabela e seta flags nas semanas futuras.
- Timing
  - `partes.tempo_min` por item; somatório por seção e total (1h45).
  - UI mostra barra/contador por seção e alerta de estouro.
  - Bloqueie salvar se exceder limites configurados.
- Settings (cenários)
  - Campos sugeridos em `designacoes.settings`:
    - `general`: `house_to_house|informal|public`.
    - `mode`: `door|phone|letter|cart|street|park|work|school|transit|other`.
  - UI com presets e descrição, persistidos por designação.

## Fluxo de Sincronização (Instrutor)
- Offline-first
  - IndexedDB: tabelas espelho de `estudantes`, `designacoes`, `programas` (somente leitura) e fila `operations`.
  - Service Worker: background sync quando a rede voltar.
- Fila e replay
  - `operations`: {id, entity, action, payload, baseVersion, createdAt}.
  - Ao reenviar: verificar `baseVersion` vs remoto; se divergente, marcar conflito.
- UI/Resolução
  - Indicadores: status online/offline, itens na fila, último sync.
  - Modal de conflitos mostrando diff (parte/estudante/campos alterados) com escolha de resolução.
