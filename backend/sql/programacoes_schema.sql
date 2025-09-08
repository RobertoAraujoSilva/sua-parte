-- Programação (modelo, sem nomes)
create table if not exists programacoes (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end   date not null,
  status text not null check (status in ('rascunho','publicada')),
  congregation_scope text not null check (congregation_scope in ('global','scoped')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Itens (estrutura da semana)
create table if not exists programacao_itens (
  id uuid primary key default gen_random_uuid(),
  programacao_id uuid not null references programacoes(id) on delete cascade,
  "order" int not null,
  section text not null check (section in ('OPENING','TREASURES','APPLY','LIVING','CLOSING')),
  type text not null check (type in (
    'song','opening_comments','talk','spiritual_gems','bible_reading',
    'starting','following','making_disciples','local_needs','cbs','concluding_comments'
  )),
  minutes int not null,
  -- regras e rótulos bilíngues:
  rules jsonb,
  lang  jsonb not null, -- { en: {title,notes?}, pt: {title,notes?} }
  created_at timestamptz default now()
);

-- evita duplicar a mesma semana/escopo
create unique index if not exists uq_programacoes_week_scope
  on programacoes (week_start, week_end, congregation_scope);

-- Índices para performance
create index if not exists idx_programacoes_status on programacoes (status);
create index if not exists idx_programacoes_week_start on programacoes (week_start);
create index if not exists idx_programacao_itens_programacao_id on programacao_itens (programacao_id);
create index if not exists idx_programacao_itens_order on programacao_itens ("order");

-- RLS (Row Level Security) - opcional, pode ser configurado depois
-- alter table programacoes enable row level security;
-- alter table programacao_itens enable row level security;

-- Política para leitura pública de programações publicadas
-- create policy "Programações publicadas são visíveis para todos" on programacoes
--   for select using (status = 'publicada');

-- Política para leitura pública de itens de programações publicadas
-- create policy "Itens de programações publicadas são visíveis para todos" on programacao_itens
--   for select using (
--     exists (
--       select 1 from programacoes 
--       where programacoes.id = programacao_itens.programacao_id 
--       and programacoes.status = 'publicada'
--     )
--   );
