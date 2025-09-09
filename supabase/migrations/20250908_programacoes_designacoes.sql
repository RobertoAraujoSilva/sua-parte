-- Enable required extensions
create extension if not exists pgcrypto;

-- Programações (modelo sem nomes)
create table if not exists public.programacoes (
  id uuid primary key default gen_random_uuid(),
  congregacao_id uuid null,
  semana_data_inicio date not null,
  semana_data_fim date not null,
  status text not null check (status in ('rascunho','publicada')),
  created_at timestamptz default now()
);

-- Itens da programação (estrutura/tempos/tema, sem nomes)
create table if not exists public.programacao_itens (
  id uuid primary key default gen_random_uuid(),
  programacao_id uuid not null references public.programacoes(id) on delete cascade,
  ordem int not null,
  secao text not null,
  tipo text not null,
  titulo text not null,
  tema text null,
  tempo_min int not null,
  regras_papel jsonb null,
  unique(programacao_id, ordem)
);

-- Designações por congregação
create table if not exists public.designacoes (
  id uuid primary key default gen_random_uuid(),
  programacao_id uuid not null references public.programacoes(id) on delete cascade,
  congregacao_id uuid not null,
  created_at timestamptz default now(),
  unique(programacao_id, congregacao_id)
);

-- Designações por item
create table if not exists public.designacao_itens (
  id uuid primary key default gen_random_uuid(),
  designacao_id uuid not null references public.designacoes(id) on delete cascade,
  programacao_item_id uuid not null references public.programacao_itens(id) on delete cascade,
  principal_estudante_id uuid null,
  assistente_estudante_id uuid null,
  observacoes text null,
  unique(designacao_id, programacao_item_id)
);

-- Row Level Security (adjust policies as needed)
alter table public.programacoes enable row level security;
alter table public.programacao_itens enable row level security;
alter table public.designacoes enable row level security;
alter table public.designacao_itens enable row level security;

-- Basic read policies (open for development; tighten in prod)
do $$ begin
  begin
    create policy "read_programacoes_all" on public.programacoes for select using (true);
  exception when duplicate_object then null; end;
  begin
    create policy "read_programacao_itens_all" on public.programacao_itens for select using (true);
  exception when duplicate_object then null; end;
  begin
    create policy "read_designacoes_all" on public.designacoes for select using (true);
  exception when duplicate_object then null; end;
  begin
    create policy "read_designacao_itens_all" on public.designacao_itens for select using (true);
  exception when duplicate_object then null; end;
end $$;

