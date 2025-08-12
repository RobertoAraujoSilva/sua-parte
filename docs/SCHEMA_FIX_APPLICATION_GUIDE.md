# Guia para Aplicar Correções do Schema - Sistema Ministerial

## 🚨 Problema Identificado
O sistema está apresentando erro `column programas.semana does not exist` porque as colunas `semana` e `arquivo` não existem na tabela `programas`.

## ✅ **STATUS ATUAL: COLUNAS CRIADAS, FUNÇÕES RPC FALTANDO**

As colunas `semana` e `arquivo` foram criadas com sucesso, mas agora está faltando a função RPC `get_programs_complete` que o frontend precisa.

## 🔧 Solução Completa

### **Passo 1: Criar Funções RPC (EXECUTAR AGORA)**

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script de Funções RPC**
   - Copie e cole o conteúdo do arquivo `scripts/create-rpc-functions.sql`
   - Clique em "Run" para executar

4. **Verifique o Resultado**
   - Você deve ver uma tabela listando as 3 funções criadas:
     - `get_programs_complete`
     - `check_programa_duplicate`
     - `check_student_duplicate`

### **Passo 2: Testar o Sistema**

Após criar as funções RPC:

1. **Recarregue a página** de Programas no frontend
2. **Verifique se o erro desapareceu**
3. **Confirme que os programas carregam normalmente**

## 📋 O que Cada Script Faz

### **Script 1: `fix-programas-schema.sql` (JÁ EXECUTADO ✅)**
- ✅ Adiciona colunas `semana` e `arquivo`
- ✅ Atualiza registros existentes
- ✅ Adiciona constraints NOT NULL

### **Script 2: `create-rpc-functions.sql` (EXECUTAR AGORA)**
- ✅ Cria função `get_programs_complete` para buscar programas
- ✅ Cria função `check_programa_duplicate` para verificar duplicatas
- ✅ Cria função `check_student_duplicate` para verificar estudantes
- ✅ Concede permissões necessárias

## 🚀 Após Resolver

Com as funções RPC criadas, o sistema deve funcionar completamente e você poderá:

1. **Carregar programas** sem erros
2. **Importar novos programas** com verificação de duplicatas
3. **Continuar com o Checklist de Harmonização**:
   - Configuração inicial com wizard
   - Validação S-38-T no backend
   - Melhorias no parser de PDF
   - Sistema de geração de designações
   - Comunicação com estudantes
   - Relatórios e métricas

## 🆘 Suporte

Se ainda houver problemas após criar as funções RPC:

1. **Verifique os Logs** do console do navegador
2. **Confirme que as funções foram criadas** no Supabase
3. **Teste as funções individualmente** no SQL Editor

---

**Status**: ✅ Colunas criadas, ⚠️ Funções RPC pendentes
**Próximo**: Executar `create-rpc-functions.sql` no Supabase Dashboard
