-- =====================================================
-- POLÍTICAS RLS (Row Level Security) para Sistema Unificado
-- =====================================================

-- =====================================================
-- 1. POLÍTICAS PARA ADMIN (Acesso Total)
-- =====================================================

-- Admin pode ver todas as versões MWB
CREATE POLICY "Admin can view all MWB versions" ON mwb_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode inserir/editar versões MWB
CREATE POLICY "Admin can manage MWB versions" ON mwb_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar arquivos oficiais
CREATE POLICY "Admin can manage official files" ON official_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar programação unificada
CREATE POLICY "Admin can manage unified programming" ON unified_programming
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar partes da programação
CREATE POLICY "Admin can manage programming parts" ON programming_parts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar regras S-38
CREATE POLICY "Admin can manage S-38 rules" ON s38_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar congregações
CREATE POLICY "Admin can manage congregations" ON congregations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar instrutores de congregação
CREATE POLICY "Admin can manage congregation instructors" ON congregation_instructors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode ver todas as designações
CREATE POLICY "Admin can view all assignments" ON congregation_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode ver todo o histórico
CREATE POLICY "Admin can view all history" ON assignment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admin pode gerenciar notificações
CREATE POLICY "Admin can manage notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- 2. POLÍTICAS PARA INSTRUTOR (Acesso Local)
-- =====================================================

-- Instrutor pode ver versões MWB publicadas
CREATE POLICY "Instructor can view published MWB versions" ON mwb_versions
    FOR SELECT USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM congregation_instructors ci
            JOIN profiles p ON p.user_id = ci.user_id
            WHERE ci.user_id = auth.uid() 
            AND ci.status = 'active'
            AND p.role = 'instructor'
        )
    );

-- Instrutor pode ver arquivos oficiais de versões publicadas
CREATE POLICY "Instructor can view official files from published versions" ON official_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mwb_versions mv
            JOIN congregation_instructors ci ON ci.user_id = auth.uid()
            WHERE mv.id = official_files.mwb_version_id
            AND mv.status = 'published'
            AND ci.status = 'active'
        )
    );

-- Instrutor pode ver programação unificada publicada
CREATE POLICY "Instructor can view published unified programming" ON unified_programming
    FOR SELECT USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM congregation_instructors ci
            WHERE ci.user_id = auth.uid() 
            AND ci.status = 'active'
        )
    );

-- Instrutor pode ver partes da programação publicada
CREATE POLICY "Instructor can view published programming parts" ON programming_parts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM unified_programming up
            JOIN congregation_instructors ci ON ci.user_id = auth.uid()
            WHERE up.id = programming_parts.unified_programming_id
            AND up.status = 'published'
            AND ci.status = 'active'
        )
    );

-- Instrutor pode ver regras S-38 ativas
CREATE POLICY "Instructor can view active S-38 rules" ON s38_rules
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM congregation_instructors ci
            JOIN profiles p ON p.user_id = ci.user_id
            WHERE ci.user_id = auth.uid() 
            AND ci.status = 'active'
            AND p.role = 'instructor'
        )
    );

-- Instrutor pode ver sua congregação
CREATE POLICY "Instructor can view own congregation" ON congregations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM congregation_instructors ci
            WHERE ci.congregation_id = congregations.id
            AND ci.user_id = auth.uid() 
            AND ci.status = 'active'
        )
    );

-- Instrutor pode ver instrutores da sua congregação
CREATE POLICY "Instructor can view congregation instructors" ON congregation_instructors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM congregation_instructors ci
            WHERE ci.congregation_id = congregation_instructors.congregation_id
            AND ci.user_id = auth.uid() 
            AND ci.status = 'active'
        )
    );

-- Instrutor pode gerenciar designações da sua congregação
CREATE POLICY "Instructor can manage own congregation assignments" ON congregation_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM congregation_instructors ci
            WHERE ci.congregation_id = congregation_assignments.congregation_id
            AND ci.user_id = auth.uid() 
            AND ci.status = 'active'
        )
    );

-- Instrutor pode ver histórico das suas designações
CREATE POLICY "Instructor can view own assignment history" ON assignment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM congregation_assignments ca
            JOIN congregation_instructors ci ON ci.congregation_id = ca.congregation_id
            WHERE ca.id = assignment_history.congregation_assignment_id
            AND ci.user_id = auth.uid() 
            AND ci.status = 'active'
        )
    );

-- Instrutor pode ver notificações relacionadas às suas designações
CREATE POLICY "Instructor can view related notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM congregation_assignments ca
            JOIN congregation_instructors ci ON ci.congregation_id = ca.congregation_id
            WHERE ci.user_id = auth.uid() 
            AND ci.status = 'active'
            AND (
                notifications.user_id = auth.uid() OR
                notifications.metadata->>'congregation_id' = ca.congregation_id::text
            )
        )
    );

-- =====================================================
-- 3. POLÍTICAS PARA ESTUDANTE (Acesso Individual)
-- =====================================================

-- Estudante pode ver versões MWB publicadas
CREATE POLICY "Student can view published MWB versions" ON mwb_versions
    FOR SELECT USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'student'
        )
    );

-- Estudante pode ver arquivos oficiais de versões publicadas
CREATE POLICY "Student can view official files from published versions" ON official_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mwb_versions mv
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE mv.id = official_files.mwb_version_id
            AND mv.status = 'published'
            AND p.role = 'student'
        )
    );

-- Estudante pode ver programação unificada publicada
CREATE POLICY "Student can view published unified programming" ON unified_programming
    FOR SELECT USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'student'
        )
    );

-- Estudante pode ver partes da programação publicada
CREATE POLICY "Student can view published programming parts" ON programming_parts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM unified_programming up
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE up.id = programming_parts.unified_programming_id
            AND up.status = 'published'
            AND p.role = 'student'
        )
    );

-- Estudante pode ver regras S-38 ativas
CREATE POLICY "Student can view active S-38 rules" ON s38_rules
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'student'
        )
    );

-- Estudante pode ver congregações ativas
CREATE POLICY "Student can view active congregations" ON congregations
    FOR SELECT USING (
        status = 'active' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'student'
        )
    );

-- Estudante pode ver suas próprias designações
CREATE POLICY "Student can view own assignments" ON congregation_assignments
    FOR SELECT USING (
        student_id = auth.uid() OR
        assistant_student_id = auth.uid()
    );

-- Estudante pode confirmar suas designações
CREATE POLICY "Student can update own assignments" ON congregation_assignments
    FOR UPDATE USING (
        student_id = auth.uid() OR
        assistant_student_id = auth.uid()
    ) WITH CHECK (
        student_id = auth.uid() OR
        assistant_student_id = auth.uid()
    );

-- Estudante pode ver histórico das suas designações
CREATE POLICY "Student can view own assignment history" ON assignment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM congregation_assignments ca
            WHERE ca.id = assignment_history.congregation_assignment_id
            AND (ca.student_id = auth.uid() OR ca.assistant_student_id = auth.uid())
        )
    );

-- Estudante pode ver suas próprias notificações
CREATE POLICY "Student can view own notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- =====================================================
-- 4. POLÍTICAS ESPECIAIS
-- =====================================================

-- Usuários autenticados podem ver perfis básicos
CREATE POLICY "Authenticated users can view basic profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

-- Usuários podem editar seu próprio perfil
CREATE POLICY "Users can edit own profile" ON profiles
    FOR UPDATE USING (
        user_id = auth.uid()
    ) WITH CHECK (
        user_id = auth.uid()
    );

-- =====================================================
-- 5. POLÍTICAS DE AUDITORIA
-- =====================================================

-- Todos os usuários autenticados podem ver histórico de suas ações
CREATE POLICY "Users can view own audit history" ON assignment_history
    FOR SELECT USING (
        changed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM congregation_assignments ca
            WHERE ca.id = assignment_history.congregation_assignment_id
            AND (ca.student_id = auth.uid() OR ca.assistant_student_id = auth.uid())
        )
    );

-- =====================================================
-- 6. VERIFICAÇÕES DE SEGURANÇA
-- =====================================================

-- Verificar se as políticas foram criadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'mwb_versions', 'official_files', 'unified_programming', 
        'programming_parts', 's38_rules', 'congregations', 
        'congregation_instructors', 'congregation_assignments', 
        'assignment_history', 'notifications'
    );
    
    RAISE NOTICE 'Total de políticas RLS criadas: %', policy_count;
END $$;
