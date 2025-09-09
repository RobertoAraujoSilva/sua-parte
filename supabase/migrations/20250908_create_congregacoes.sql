create extension if not exists pgcrypto;

create table if not exists public.congregacoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  pais text not null default 'Brasil',
  cidade text,
  endereco text,
  telefone text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.congregacoes enable row level security;

do $$ begin
  begin
    create policy "read_congregacoes_all" on public.congregacoes for select using (true);
  exception when duplicate_object then null; end;
end $$;

-- Optional: updated_at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists set_updated_at on public.congregacoes;
create trigger set_updated_at before update on public.congregacoes
for each row execute procedure public.set_updated_at();

