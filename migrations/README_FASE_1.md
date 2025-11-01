# Fase 1: Correções Críticas - Guia de Implementação

## 📋 Resumo

Esta migração corrige **3 problemas críticos** do Sistema Ministerial:

1. ✅ **Cria tabela `congregacoes`** com FK constraints
2. ✅ **Migra roles** de `profiles.role` para `user_roles` (segurança)
3. ✅ **Adiciona debugging** para programas failed

## 🚀 Como Executar

### 1. Acesse o SQL Editor do Supabase

Abra o link: https://supabase.com/dashboard/project/nwpuurgwnnuejqinkvrh/sql/new

### 2. Copie e cole o conteúdo do arquivo

```bash
migrations/FASE_1_CORRECOES_CRITICAS.sql
```

### 3. Execute o SQL

Clique em **"Run"** para executar toda a migração de uma vez.

### 4. Verifique os resultados

Ao final do script, você verá:

```sql
-- Verificação
Congregações criadas: 2
Roles migradas: 7
Função has_role: Funcionando
```

## ⚠️ Importante

### Antes de Executar

- ✅ Faça backup do banco de dados
- ✅ Confirme que não há usuários ativos no momento
- ✅ Verifique que você tem acesso de administrador ao Supabase

### Depois de Executar

1. **Teste o login** com diferentes roles
2. **Verifique se os estudantes aparecem** corretamente
3. **Tente gerar designações** para um programa
4. **Confirme que programas failed** foram resetados

## 🔍 Verificação Manual

Execute estas queries no SQL Editor para verificar:

```sql
-- 1. Verificar congregações
SELECT * FROM public.congregacoes;

-- 2. Verificar roles migradas
SELECT ur.*, p.nome_completo 
FROM public.user_roles ur
JOIN public.profiles p ON p.id = ur.user_id;

-- 3. Verificar função has_role
SELECT public.has_role(auth.uid(), 'admin'::app_role) as sou_admin;

-- 4. Verificar programas failed
SELECT id, titulo, assignment_status, error_details 
FROM public.programas 
WHERE assignment_status = 'failed';
```

## 📊 O que Mudou

### Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `congregacoes` | Armazena informações de congregações |
| `user_roles` | Armazena roles de usuários (segurança) |

### Colunas Adicionadas

| Tabela | Coluna | Tipo | Descrição |
|--------|--------|------|-----------|
| `profiles` | `congregacao_id` | UUID | FK para congregacoes |
| `estudantes` | `congregacao_id` | UUID | FK para congregacoes |
| `designacoes` | `congregacao_id` | UUID | FK para congregacoes |
| `programas` | `error_details` | JSONB | Detalhes de erros |
| `programas` | `last_attempt_at` | TIMESTAMPTZ | Última tentativa |

### Funções Criadas

| Função | Descrição |
|--------|-----------|
| `has_role(_user_id, _role)` | Verifica se usuário tem uma role (SECURITY DEFINER) |
| `reset_failed_program(program_id)` | Reseta um programa failed para retry |

### RLS Policies Atualizadas

Todas as policies agora usam `has_role()` para verificação segura de permissões:

- ✅ `profiles` - Admin pode ver/editar todos
- ✅ `estudantes` - Filtrados por congregação
- ✅ `programas` - Admin e criador podem gerenciar
- ✅ `designacoes` - Admin e criador podem gerenciar

## 🐛 Troubleshooting

### Erro: "relation already exists"

**Causa**: A tabela já foi criada em execução anterior  
**Solução**: É seguro ignorar, o script usa `IF NOT EXISTS`

### Erro: "column already exists"

**Causa**: A coluna já foi adicionada  
**Solução**: É seguro ignorar, o script usa `ADD COLUMN IF NOT EXISTS`

### Erro: "duplicate key value violates unique constraint"

**Causa**: Dados duplicados ao popular congregações  
**Solução**: O script usa `ON CONFLICT DO NOTHING`, não há problema

### Erro: "permission denied"

**Causa**: Você não tem permissões de administrador  
**Solução**: Entre em contato com o owner do projeto Supabase

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Execute as queries de verificação acima
3. Revise o erro específico retornado
4. Consulte a documentação do Supabase sobre RLS

## ✅ Critérios de Sucesso

Após a migração, você deve conseguir:

- [x] Fazer login com qualquer role (admin, instrutor, estudante)
- [x] Ver apenas estudantes da sua congregação
- [x] Criar novos programas
- [x] Gerar designações sem erro
- [x] Ver que programas failed foram resetados

## 🔜 Próximos Passos

Após executar com sucesso:

1. **Reprocessar programas failed**:
   ```sql
   SELECT public.reset_failed_program(id) 
   FROM public.programas 
   WHERE assignment_status = 'failed';
   ```

2. **Testar geração de designações** no frontend

3. **Verificar logs** da aplicação para confirmar que não há mais erros

4. **(OPCIONAL)** Remover coluna `profiles.role`:
   ```sql
   -- ATENÇÃO: Só execute depois de confirmar que tudo funciona!
   ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
   ```

---

**Estimativa de Tempo**: 5-10 minutos  
**Reversível**: Sim (consulte seção de Rollback no arquivo SQL)  
**Impacto**: Médio (requer restart de sessões ativas)
