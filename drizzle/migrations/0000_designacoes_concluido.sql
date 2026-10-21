ALTER TABLE public.designacoes ADD COLUMN IF NOT EXISTS concluido boolean NOT NULL DEFAULT false;
ALTER TABLE public.designacoes ADD COLUMN IF NOT EXISTS concluido_em timestamptz;