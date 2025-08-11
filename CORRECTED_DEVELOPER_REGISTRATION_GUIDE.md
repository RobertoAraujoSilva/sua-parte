# 🔧 CORRECTED DEVELOPER REGISTRATION GUIDE
## Como se Cadastrar e Usar o Painel de Desenvolvedor - VERSÃO CORRIGIDA

**⚠️ IMPORTANTE**: Este guia substitui as instruções anteriores que continham erros críticos.

---

## **🚨 PRÉ-REQUISITOS OBRIGATÓRIOS**

### **ANTES DE SEGUIR ESTE GUIA, VOCÊ DEVE:**

1. **Aplicar a Migração do Banco de Dados** (CRÍTICO):
   ```sql
   -- Execute este SQL no Supabase Dashboard > SQL Editor
   -- Arquivo: supabase/migrations/20250811120000_add_developer_role_and_template_system.sql
   ```

2. **Verificar se a Migração Foi Aplicada**:
   ```sql
   -- Teste se o papel developer existe:
   SELECT unnest(enum_range(NULL::user_role));
   -- Deve retornar: instrutor, estudante, developer, family_member
   ```

**❌ SEM ESTA MIGRAÇÃO, NADA FUNCIONARÁ!**

---

## **🔐 1. COMO OBTER O PAPEL DE DESENVOLVEDOR**

### **Método 1: Via Supabase Dashboard (Recomendado)**

1. **Acesse o Supabase Dashboard** do projeto
2. **Vá para Table Editor** → **profiles**
3. **Encontre seu registro** pelo email
4. **Edite a coluna `role`** para `'developer'`
5. **Salve as alterações**

### **Método 2: Via SQL (Avançado)**

```sql
-- 1. Primeiro, encontre seu user_id
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Verifique se já tem um perfil
SELECT * FROM profiles WHERE id = 'seu-user-id-aqui';

-- 3. Se não existir perfil, crie um:
INSERT INTO profiles (id, nome_completo, role, congregacao)
VALUES ('seu-user-id-aqui', 'Seu Nome', 'developer', 'Sua Congregação');

-- 4. Se já existir, apenas atualize o papel:
UPDATE profiles 
SET role = 'developer' 
WHERE id = 'seu-user-id-aqui';
```

### **Verificação de Sucesso**:
```sql
-- Confirme que o papel foi definido corretamente:
SELECT nome_completo, role, congregacao 
FROM profiles 
WHERE id = auth.uid();
-- Deve retornar role = 'developer'
```

---

## **🚪 2. ACESSANDO O PAINEL DE DESENVOLVEDOR**

### **Após ter o papel de desenvolvedor:**

1. **Faça login** no Sistema Ministerial
2. **Navegue para**: `/admin/developer`
3. **Ou use a URL completa**: `https://seu-dominio.com/admin/developer`

### **Verificação de Acesso:**
- ✅ **Com papel 'developer'**: Verá o painel com 3 abas
- ❌ **Sem papel 'developer'**: Será redirecionado com mensagem de erro

---

## **📋 3. PROCESSO COMPLETO DE PROCESSAMENTO DE CONTEÚDO**

### **Aba 1: "Processar Conteúdo"**

#### **Passo 1: Obter Conteúdo JW.org**
```
1. Vá para JW.org → Biblioteca → Nossa Vida e Ministério Cristão
2. Abra a apostila da semana desejada
3. Copie TODO o conteúdo da página (Ctrl+A, Ctrl+C)
4. Cole no campo "Conteúdo JW.org" no painel
```

#### **Passo 2: Configurar Datas**
- **Data de Início**: Segunda-feira da semana (ex: 2024-08-11)
- **Data de Fim**: Domingo da semana (ex: 2024-08-17)

#### **Passo 3: Nome da Congregação (Opcional)**
- Adicione para personalizar o template

#### **Passo 4: Processar Conteúdo**
- Clique em **"Processar Conteúdo"**
- Sistema extrairá automaticamente:
  - ✅ 12 partes da reunião
  - ✅ Cânticos (abertura, meio, encerramento)
  - ✅ Leitura bíblica
  - ✅ Tempos de cada parte
  - ✅ Tipos S-38-T corretos

#### **Passo 5: Revisar Conteúdo Processado**
Verifique se identificou corretamente:
- **Semana**: "11-17 de agosto"
- **Cânticos**: Abertura: 88, Meio: 94, Encerramento: 89
- **Leitura Bíblica**: "PROVÉRBIOS 26"
- **12 Partes**: Todas as partes da reunião

#### **Passo 6: Adicionar Notas**
```
Exemplo:
"Programa processado para semana 11-17 de agosto. 
Verificar se estudantes têm acesso aos vídeos mencionados.
Leitura bíblica: Provérbios 26:1-11."
```

#### **Passo 7: Gerar Template Excel**
- Clique em **"Gerar Template Excel"**
- Sistema criará arquivo com:
  - **Aba Principal**: Programa completo
  - **Aba Instruções**: Regras S-38-T
  - **Aba Validação**: Listas e validações

---

## **📤 4. PUBLICANDO TEMPLATES PARA INSTRUTORES**

### **Aba 2: "Templates"**

#### **Passo 1: Localizar Template Processado**
- Status será **"Template Pronto"** (template_ready)
- Verá: número de partes, tempo total, data de processamento

#### **Passo 2: Publicar Template**
```
1. Clique no botão "Publicar" do template
2. Confirme a publicação
3. Status mudará para "Publicado" (published)
4. Template ficará disponível na Biblioteca de Templates
```

#### **Passo 3: Verificar Disponibilidade**
- Template aparecerá na **Biblioteca de Templates**
- Instrutores poderão baixar e usar

---

## **📊 5. MONITORAMENTO E ESTATÍSTICAS**

### **Aba 3: "Estatísticas"**

Monitore:
- **Templates Processados**: Total criados
- **Templates Publicados**: Disponíveis para instrutores
- **Downloads**: Quantas vezes foram baixados
- **Instrutores Únicos**: Quantos instrutores diferentes usaram

---

## **👥 6. FLUXO COMPLETO DESENVOLVEDOR → INSTRUTOR**

### **Desenvolvedor**:
```
1. Acessa /admin/developer
2. Cola conteúdo JW.org
3. Configura datas
4. Processa conteúdo
5. Gera template Excel
6. Adiciona notas
7. Publica template
```

### **Instrutor**:
```
1. Acessa Programas
2. Clica "Biblioteca de Templates"
3. Encontra template da semana
4. Baixa Excel
5. Preenche estudantes
6. Faz upload
7. Sistema gera designações
```

---

## **🔧 7. RESOLUÇÃO DE PROBLEMAS**

### **Erro: "Acesso Negado"**
- **Causa**: Papel não é 'developer'
- **Solução**: Verificar e corrigir papel no banco

### **Erro: "Template fields don't exist"**
- **Causa**: Migração não foi aplicada
- **Solução**: Aplicar migração obrigatória

### **Erro: "Cannot insert template"**
- **Causa**: Campos de template ausentes
- **Solução**: Verificar se migração foi aplicada corretamente

### **Template não aparece na biblioteca**
- **Causa**: Status não é 'published'
- **Solução**: Publicar template na aba Templates

---

## **✅ 8. VERIFICAÇÃO DE FUNCIONAMENTO**

### **Teste Completo**:
1. ✅ Consegue acessar `/admin/developer`
2. ✅ Consegue colar e processar conteúdo JW.org
3. ✅ Consegue gerar template Excel
4. ✅ Consegue publicar template
5. ✅ Template aparece na Biblioteca de Templates
6. ✅ Instrutores conseguem baixar template

### **Se Algum Teste Falhar**:
- Verificar se migração foi aplicada
- Verificar se papel é 'developer'
- Verificar logs do console para erros

---

## **🎯 RESUMO DAS CORREÇÕES**

### **Problemas da Versão Anterior**:
- ❌ Papel 'developer' não existia no banco
- ❌ Campos de template não existiam
- ❌ Instruções não funcionariam

### **Versão Corrigida**:
- ✅ Migração cria papel 'developer'
- ✅ Migração adiciona campos de template
- ✅ Instruções testadas e funcionais

---

**Status**: ✅ **FUNCIONAL APÓS APLICAR MIGRAÇÃO**  
**Próximos Passos**: 
1. Aplicar migração obrigatória
2. Seguir este guia corrigido
3. Testar fluxo completo
