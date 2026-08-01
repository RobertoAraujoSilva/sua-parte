## Objetivo

Adicionar ao Sistema Ministerial uma área exclusiva `/connect`, acessível apenas a membros **aprovados por um ancião**, onde adultos solteiros da mesma fé podem se conhecer com fins de namoro sério. O Sistema Ministerial atual (designações S-38) continua intacto — o novo módulo vive em rotas separadas e tabelas próprias.

O diferencial em relação ao PRD original: em vez de verificação por selfie/documento, **a porta de entrada é a aprovação de um ancião da congregação** — isso resolve o problema de confiança do PRD de forma muito mais forte e simples.

---

## Fluxo do produto

```text
Membro                          Ancião (moderador)
------                          ------------------
1. Solicita acesso ao Connect
   (formulário + congregação)  →  2. Vê fila de solicitações
                                    Aprova / Rejeita
3. Perfil liberado           ←
4. Preenche perfil completo
5. Descobre perfis (swipe)
6. Match mútuo → chat           7. Fila de denúncias
8. Denuncia / bloqueia       →     Suspende / bane / arquiva
```

Nada é visível para ninguém antes da aprovação. Perfis não aprovados nunca entram na descoberta.

---

## Escopo da entrega

### Banco de dados (novas tabelas, isoladas do sistema atual)

- `connect_profiles` — perfil do participante: apelido, data de nascimento, gênero, cidade/país, status espiritual (batizado / pioneiro regular / auxiliar / estudante avançado), tempo na verdade, idiomas falados, disposição para mudar de cidade/país, bio, estado do perfil (`pending`, `approved`, `rejected`, `suspended`), ancião aprovador e data de aprovação
- `connect_photos` — fotos com estado de moderação
- `connect_preferences` — filtros do usuário (faixa etária, distância/país, idiomas, status)
- `connect_swipes` — like / pass
- `connect_matches` — criado automaticamente por trigger quando há like mútuo
- `connect_messages` — mensagens do chat, com realtime ativado
- `connect_reports` — denúncias com categoria, descrição, estado e moderador responsável
- Novo papel `moderador_connect` no enum de papéis existente, validado pela função `has_role` já existente

Regras de acesso (RLS): cada pessoa vê e edita apenas o próprio perfil, preferências e swipes; perfis aprovados são visíveis entre si; mensagens apenas para os dois lados do match; anciãos moderadores enxergam a fila de aprovação e as denúncias. Fotos ficam em bucket privado com URLs assinadas.

### Frontend — área do membro (`/connect`)

- **`/connect`** — porta de entrada: explica o propósito, o código de conduta e o disclaimer de não-afiliação; mostra o estado da solicitação (pendente / rejeitada / aprovada)
- **`/connect/solicitar`** — formulário de solicitação de acesso (idade 18+, congregação, status, aceite do código de conduta)
- **`/connect/perfil`** — edição do perfil completo, fotos, preferências
- **`/connect/descobrir`** — cards com swipe (like/pass), filtros por idade, país, idioma, disposição para mudar, status
- **`/connect/matches`** — lista de matches
- **`/connect/chat/:matchId`** — chat em tempo real, com botão de denúncia/bloqueio sempre visível, envio de foto desabilitado, e aviso automático após alguns dias sugerindo transparência com pais/anciãos

### Frontend — área do ancião (`/connect/moderacao`)

- Fila de solicitações de acesso, com o perfil e a congregação informada, e botões aprovar/rejeitar
- Fila de fotos aguardando moderação
- Fila de denúncias com categorias, ação de suspender perfil ou arquivar
- Indicadores simples: solicitações pendentes, denúncias abertas, perfis ativos

### Multilíngue (EN / PT / IT / ES)

- Adicionar `it.json` e `es.json` ao sistema i18n já existente e criar o namespace `connect` em todos os 4 arquivos
- Corrigir o seletor de idioma atual (hoje o botão não troca o idioma de fato) e expandi-lo para 4 opções
- Todo texto do módulo — UI, código de conduta, mensagens de erro, categorias de denúncia — nos 4 idiomas

### Salvaguardas

- Filtro automático de linguagem inadequada em bios e mensagens
- Disclaimer permanente: projeto independente, sem afiliação, endosso ou operação pela Torre de Vigia; sem uso de logotipos ou material com direitos autorais
- Consentimento explícito para tratamento de dado religioso, com texto de LGPD/GDPR, e a possibilidade de excluir a conta do Connect sem afetar a conta do Sistema Ministerial

---

## Detalhes técnicos

- Reuso integral de `AuthContext`, `ProtectedRoute`, `has_role()` e do design system Tailwind/shadcn já presentes — nada de segunda camada de autenticação
- Novo guard `ConnectRoute` que exige sessão + `connect_profiles.status = 'approved'`; a moderação exige adicionalmente `has_role(auth.uid(), 'moderador_connect')`
- Chat em tempo real via subscriptions do backend na tabela `connect_messages`
- Match criado por trigger no banco ao detectar like recíproco, evitando corrida entre clientes
- Fotos em bucket privado com políticas por dono e leitura liberada apenas a matches e moderadores
- Idade validada no banco (18+) e no formulário
- Cálculo de distância a partir de país/cidade declarados (sem geolocalização precisa na v1, por privacidade)

## Fora desta entrega

Selfie/liveness, verificação de documento, moderação de imagem por IA, vídeo-chamada, assinatura premium e eventos regionais. A estrutura de dados já prevê esses campos, mas as funcionalidades ficam para uma fase seguinte.

## Ordem de execução

1. Migração do banco com todas as tabelas, papéis, políticas e triggers
2. Arquivos de tradução nos 4 idiomas + correção do seletor de idioma
3. Guards de rota e página de solicitação de acesso
4. Painel de moderação do ancião
5. Perfil, preferências e upload de fotos
6. Descoberta com swipe e filtros
7. Matches e chat em tempo real
8. Denúncias, bloqueio e salvaguardas de conteúdo
