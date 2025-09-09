-- Create enum types for better data validation
CREATE TYPE app_genero AS ENUM ('masculino', 'feminino');
CREATE TYPE app_cargo AS ENUM ('anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo');
CREATE TYPE status_programa AS ENUM ('ativo', 'inativo', 'arquivado');

-- Create profiles table for designadores (users who create assignments)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  congregacao TEXT,
  cargo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create estudantes table
CREATE TABLE public.estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  idade INTEGER CHECK (idade > 0 AND idade <= 120),
  genero app_genero NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  data_batismo DATE,
  cargo app_cargo NOT NULL,
  id_pai_mae UUID REFERENCES public.estudantes(id),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on estudantes
ALTER TABLE public.estudantes ENABLE ROW LEVEL SECURITY;

-- Create estudantes policies
CREATE POLICY "Users can view their own students"
  ON public.estudantes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own students"
  ON public.estudantes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
  ON public.estudantes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
  ON public.estudantes FOR DELETE
  USING (auth.uid() = user_id);

-- Create programas table
CREATE TABLE public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_inicio_semana DATE NOT NULL,
  mes_apostila VARCHAR(20),
  partes JSONB NOT NULL,
  status status_programa DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on programas
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

-- Create programas policies
CREATE POLICY "Users can view their own programs"
  ON public.programas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own programs"
  ON public.programas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON public.programas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs"
  ON public.programas FOR DELETE
  USING (auth.uid() = user_id);

-- Create designacoes table
CREATE TABLE public.designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  id_programa UUID REFERENCES public.programas(id) ON DELETE CASCADE,
  id_estudante UUID REFERENCES public.estudantes(id) ON DELETE CASCADE,
  numero_parte INTEGER CHECK (numero_parte BETWEEN 3 AND 7),
  tipo_parte VARCHAR(50) NOT NULL,
  cena VARCHAR(50),
  tempo_minutos INTEGER CHECK (tempo_minutos > 0),
  id_ajudante UUID REFERENCES public.estudantes(id),
  confirmado BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on designacoes
ALTER TABLE public.designacoes ENABLE ROW LEVEL SECURITY;

-- Create designacoes policies
CREATE POLICY "Users can view their own assignments"
  ON public.designacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assignments"
  ON public.designacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
  ON public.designacoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments"
  ON public.designacoes FOR DELETE
  USING (auth.uid() = user_id);

-- Create notificacoes table for tracking notifications
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  id_estudante UUID REFERENCES public.estudantes(id) ON DELETE CASCADE,
  id_designacao UUID REFERENCES public.designacoes(id) ON DELETE CASCADE,
  tipo_envio VARCHAR(20) CHECK (tipo_envio IN ('email', 'whatsapp', 'sms')),
  status_envio VARCHAR(20) CHECK (status_envio IN ('pendente', 'enviado', 'erro', 'entregue')),
  data_envio TIMESTAMPTZ,
  erro_detalhes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Create notificacoes policies
CREATE POLICY "Users can view their own notifications"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notificacoes FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estudantes_updated_at
  BEFORE UPDATE ON public.estudantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programas_updated_at
  BEFORE UPDATE ON public.programas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designacoes_updated_at
  BEFORE UPDATE ON public.designacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, congregacao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(NEW.raw_user_meta_data->>'congregacao', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create useful indexes for better performance
CREATE INDEX idx_estudantes_user_id ON public.estudantes(user_id);
CREATE INDEX idx_estudantes_cargo ON public.estudantes(cargo);
CREATE INDEX idx_estudantes_genero ON public.estudantes(genero);
CREATE INDEX idx_programas_user_id ON public.programas(user_id);
CREATE INDEX idx_programas_data_inicio ON public.programas(data_inicio_semana);
CREATE INDEX idx_designacoes_user_id ON public.designacoes(user_id);
CREATE INDEX idx_designacoes_programa ON public.designacoes(id_programa);
CREATE INDEX idx_designacoes_estudante ON public.designacoes(id_estudante);