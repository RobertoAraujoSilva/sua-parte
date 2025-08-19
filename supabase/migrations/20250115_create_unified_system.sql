-- =====================================================
-- Sistema Unificado: Admin, Instrutor e Estudante
-- Gerenciamento de Programação MWB Unificada
-- =====================================================

-- 1. Tabela de Versões MWB (Admin controla)
CREATE TABLE IF NOT EXISTS mwb_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_code VARCHAR(20) NOT NULL UNIQUE, -- ex: MWB_2025_09
    language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    publication_date DATE NOT NULL,
    start_month INTEGER NOT NULL, -- 1-12
    end_month INTEGER NOT NULL, -- 1-12
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Arquivos Oficiais (Admin uploads)
CREATE TABLE IF NOT EXISTS official_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mwb_version_id UUID REFERENCES mwb_versions(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'rtf', 'sql', 'image'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    content_hash VARCHAR(64), -- Para verificar integridade
    metadata JSONB, -- Metadados específicos do arquivo
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'error')),
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Programação Unificada (Admin gera)
CREATE TABLE IF NOT EXISTS unified_programming (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mwb_version_id UUID REFERENCES mwb_versions(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    week_number INTEGER NOT NULL, -- 1-52
    week_title VARCHAR(200),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mwb_version_id, week_number)
);

-- 4. Tabela de Partes da Programação (Admin define)
CREATE TABLE IF NOT EXISTS programming_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unified_programming_id UUID REFERENCES unified_programming(id) ON DELETE CASCADE,
    part_type VARCHAR(100) NOT NULL, -- 'leitura_biblica', 'tesouros', 'vida_crista'
    part_title VARCHAR(200) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    requirements JSONB NOT NULL, -- Regras S-38
    content_references JSONB, -- Referências bíblicas, páginas PDF
    order_in_meeting INTEGER NOT NULL,
    section VARCHAR(100), -- 'abertura', 'tesouros', 'ministério', 'vida_crista'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Regras S-38 (Admin configura)
CREATE TABLE IF NOT EXISTS s38_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code VARCHAR(50) NOT NULL UNIQUE, -- ex: 'leitura_sem_introducao'
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'qualificacao', 'duracao', 'restricao'
    rule_conditions JSONB NOT NULL, -- Condições da regra
    rule_actions JSONB NOT NULL, -- Ações a serem aplicadas
    is_active BOOLEAN DEFAULT true,
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Congregações (Admin gerencia)
CREATE TABLE IF NOT EXISTS congregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE, -- Código único da congregação
    language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    meeting_day VARCHAR(20) DEFAULT 'sunday', -- 'sunday', 'monday', etc
    meeting_time TIME,
    address TEXT,
    contact_info JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Instrutores por Congregação (Admin designa)
CREATE TABLE IF NOT EXISTS congregation_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    congregation_id UUID REFERENCES congregations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'instructor' CHECK (role IN ('instructor', 'coordinator', 'assistant')),
    permissions JSONB, -- Permissões específicas
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(congregation_id, user_id)
);

-- 8. Tabela de Designações por Congregação (Instrutor gerencia)
CREATE TABLE IF NOT EXISTS congregation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    congregation_id UUID REFERENCES congregations(id) ON DELETE CASCADE,
    programming_part_id UUID REFERENCES programming_parts(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    student_id UUID REFERENCES auth.users(id),
    assistant_student_id UUID REFERENCES auth.users(id), -- Para partes que precisam de assistente
    assigned_by UUID REFERENCES auth.users(id), -- Instrutor que fez a designação
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    confirmation_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(congregation_id, programming_part_id, week_start_date)
);

-- 9. Tabela de Histórico de Designações (Auditoria)
CREATE TABLE IF NOT EXISTS assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    congregation_assignment_id UUID REFERENCES congregation_assignments(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'confirmed', 'completed'
    previous_state JSONB, -- Estado anterior
    new_state JSONB, -- Novo estado
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Notificações (Sistema automático)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'assignment', 'reminder', 'system'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB, -- Dados específicos da notificação
    delivery_methods JSONB DEFAULT '["app"]', -- ['app', 'email', 'whatsapp']
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_mwb_versions_status ON mwb_versions(status);
CREATE INDEX IF NOT EXISTS idx_mwb_versions_year_month ON mwb_versions(year, start_month, end_month);
CREATE INDEX IF NOT EXISTS idx_official_files_version ON official_files(mwb_version_id);
CREATE INDEX IF NOT EXISTS idx_unified_programming_version_week ON unified_programming(mwb_version_id, week_number);
CREATE INDEX IF NOT EXISTS idx_programming_parts_programming ON programming_parts(unified_programming_id);
CREATE INDEX IF NOT EXISTS idx_congregation_assignments_congregation_week ON congregation_assignments(congregation_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_congregation_assignments_student ON congregation_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE mwb_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_programming ENABLE ROW LEVEL SECURITY;
ALTER TABLE programming_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE s38_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregation_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÕES DE TRIGGER
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_mwb_versions_updated_at BEFORE UPDATE ON mwb_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unified_programming_updated_at BEFORE UPDATE ON unified_programming FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_s38_rules_updated_at BEFORE UPDATE ON s38_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_congregations_updated_at BEFORE UPDATE ON congregations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_congregation_instructors_updated_at BEFORE UPDATE ON congregation_instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir regras S-38 básicas
INSERT INTO s38_rules (rule_code, rule_name, rule_description, rule_type, rule_conditions, rule_actions, admin_user_id) VALUES
('leitura_sem_introducao', 'Leitura sem Introdução', 'Leitura bíblica deve ser feita sem introdução ou conclusão', 'qualificacao', 
 '{"part_type": "leitura_biblica"}', 
 '{"instruction": "Ler diretamente o texto bíblico sem introdução ou conclusão"}', 
 (SELECT id FROM auth.users WHERE email = 'amazonwebber007@gmail.com' LIMIT 1)),

('duracao_leitura_4min', 'Duração da Leitura', 'Leitura bíblica deve ter 4 minutos', 'duracao',
 '{"part_type": "leitura_biblica"}',
 '{"duration": 4, "unit": "minutes"}',
 (SELECT id FROM auth.users WHERE email = 'amazonwebber007@gmail.com' LIMIT 1)),

('qualificacao_masculino_batizado', 'Qualificação Masculina', 'Parte requer homem batizado', 'qualificacao',
 '{"gender": "masculino", "baptism_status": "batizado"}',
 '{"allowed": true, "message": "Homem batizado pode realizar esta parte"}',
 (SELECT id FROM auth.users WHERE email = 'amazonwebber007@gmail.com' LIMIT 1));

-- Inserir versão MWB de exemplo
INSERT INTO mwb_versions (version_code, language, title, description, publication_date, start_month, end_month, year, status, admin_user_id) VALUES
('MWB_2025_09', 'pt-BR', 'Apostila de Setembro-Outubro 2025', 'Programação para setembro e outubro de 2025', '2025-09-01', 9, 10, 2025, 'published',
 (SELECT id FROM auth.users WHERE email = 'amazonwebber007@gmail.com' LIMIT 1));

-- Inserir congregação de exemplo
INSERT INTO congregations (name, code, language, meeting_day, meeting_time, admin_user_id) VALUES
('Congregação Exemplo', 'CONG001', 'pt-BR', 'sunday', '09:30:00',
 (SELECT id FROM auth.users WHERE email = 'amazonwebber007@gmail.com' LIMIT 1));

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE mwb_versions IS 'Versões do Manual de Vida e Ministério (Admin controla)';
COMMENT ON TABLE official_files IS 'Arquivos oficiais do JW.org (PDFs, RTFs, SQLs)';
COMMENT ON TABLE unified_programming IS 'Programação unificada gerada pelo Admin';
COMMENT ON TABLE programming_parts IS 'Partes individuais da programação (Admin define)';
COMMENT ON TABLE s38_rules IS 'Regras e validações baseadas no S-38';
COMMENT ON TABLE congregations IS 'Congregações do sistema (Admin gerencia)';
COMMENT ON TABLE congregation_instructors IS 'Instrutores designados para congregações';
COMMENT ON TABLE congregation_assignments IS 'Designações de estudantes por congregação';
COMMENT ON TABLE assignment_history IS 'Histórico de mudanças nas designações';
COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';
