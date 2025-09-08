-- Align schema to minimal Programações API (sem nomes)
-- Safe to run multiple times (guards/try-catch per change)

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- programacoes: rename columns to week_* and add congregation_scope + updated_at
do $$ begin
  begin
    alter table public.programacoes rename column semana_data_inicio to week_start;
  exception when undefined_column then null; end;
  begin
    alter table public.programacoes rename column semana_data_fim to week_end;
  exception when undefined_column then null; end;
end $$;

-- Add congregation_scope if missing
alter table public.programacoes
  add column if not exists congregation_scope text;

-- Backfill default value, then enforce constraint and not null
update public.programacoes set congregation_scope = coalesce(congregation_scope, 'global');

do $$ begin
  begin
    alter table public.programacoes
      add constraint programacoes_congregation_scope_chk
      check (congregation_scope in ('global','scoped'));
  exception when duplicate_object then null; end;
end $$;

alter table public.programacoes
  alter column congregation_scope set not null;

-- Add updated_at if missing
alter table public.programacoes
  add column if not exists updated_at timestamptz default now();

-- Unique index on (week_start, week_end, congregation_scope)
create unique index if not exists uq_programacoes_week_scope
  on public.programacoes (week_start, week_end, congregation_scope);

-- programacao_itens: align columns
do $$ begin
  begin
    alter table public.programacao_itens rename column ordem to "order";
  exception when undefined_column then null; end;
  begin
    alter table public.programacao_itens rename column secao to section;
  exception when undefined_column then null; end;
  begin
    alter table public.programacao_itens rename column tipo to type;
  exception when undefined_column then null; end;
  begin
    alter table public.programacao_itens rename column tempo_min to minutes;
  exception when undefined_column then null; end;
end $$;

-- Add rules/lang columns
alter table public.programacao_itens
  add column if not exists rules jsonb,
  add column if not exists lang jsonb default '{}'::jsonb;

-- Ensure lang is not null (after default)
alter table public.programacao_itens
  alter column lang set not null;

-- Drop old unique (programacao_id, ordem) index if present and recreate on (programacao_id, "order")
do $$ begin
  begin
    alter table public.programacao_itens drop constraint if exists programacao_itens_programacao_id_ordem_key;
  exception when undefined_object then null; end;
end $$;

do $$ begin
  begin
    alter table public.programacao_itens add constraint programacao_itens_programacao_order_key unique (programacao_id, "order");
  exception when duplicate_object then null; end;
end $$;

-- Make legacy columns nullable to avoid insert failures (titulo, tema)
do $$ begin
  begin
    alter table public.programacao_itens alter column titulo drop not null;
  exception when undefined_column then null; end;
  begin
    -- tema was nullable already; keep as-is if present
    perform 1;
  exception when others then null; end;
end $$;

-- Add section/type enumerated checks matching minimal API
do $$ begin
  begin
    alter table public.programacao_itens add constraint programacao_itens_section_chk
      check (section in ('OPENING','TREASURES','APPLY','LIVING','CLOSING'));
  exception when duplicate_object then null; end;
  begin
    alter table public.programacao_itens add constraint programacao_itens_type_chk
      check (type in (
        'song','opening_comments','talk','spiritual_gems','bible_reading',
        'starting','following','making_disciples','local_needs','cbs','concluding_comments'
      ));
  exception when duplicate_object then null; end;
end $$;
