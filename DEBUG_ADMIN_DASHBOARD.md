# 🐛 Debug do Dashboard Administrativo - Sistema Ministerial

## 🚨 **Problema Identificado**

O Dashboard Administrativo não está funcionando. Este guia ajudará a identificar e resolver o problema.

## 🔍 **Como Testar**

### **1. Acessar o Dashboard**
- URL: `http://localhost:8080/admin`
- Certifique-se de que o servidor está rodando (`npm run dev`)

### **2. Verificar o Console do Navegador**
- Abra as **Ferramentas do Desenvolvedor** (F12)
- Vá para a aba **Console**
- Procure por mensagens de erro ou logs de debug

### **3. Botões de Debug Disponíveis**

#### **🐛 Debug Auth**
- Mostra o estado atual da autenticação no console
- Verifica se o usuário está logado e qual é sua role

#### **🔧 Test Login**
- Testa o login direto com credenciais de admin
- Email: `amazonwebber007@gmail.com`
- Senha: `admin123`

#### **🗄️ Test DB**
- Testa a conexão com o banco de dados Supabase
- Verifica se a tabela `profiles` está acessível

#### **👤 Force Profile**
- Força o carregamento do perfil do usuário
- Útil quando o perfil não carrega automaticamente

## 📊 **Informações de Debug Exibidas**

### **Painel de Debug (Development Only)**
- Estado do usuário (logado/não logado)
- ID e email do usuário
- Informações do perfil
- Role do usuário
- Status de admin
- Logs de operações

### **Tela de Acesso Negado (Debug)**
- Informações detalhadas do usuário
- Role no profile vs role no metadata
- Status de admin
- Debug info completo

## 🔧 **Possíveis Problemas e Soluções**

### **1. Usuário não está logado**
**Sintoma:** Tela de loading infinita
**Solução:** 
- Fazer login primeiro em `/auth`
- Verificar se as credenciais estão corretas

### **2. Usuário não tem role de admin**
**Sintoma:** Tela de "Acesso Negado"
**Solução:**
- Verificar se o usuário tem role `admin` no banco
- Usar botão "Force Profile" para recarregar perfil

### **3. Problema de conexão com banco**
**Sintoma:** Erros de conexão no console
**Solução:**
- Verificar configurações do Supabase
- Usar botão "Test DB" para diagnosticar

### **4. Perfil não carrega**
**Sintoma:** `isAdmin` sempre false
**Solução:**
- Usar botão "Force Profile"
- Verificar se a tabela `profiles` existe

## 📋 **Checklist de Verificação**

- [ ] Servidor rodando na porta 8080
- [ ] Usuário logado no sistema
- [ ] Usuário tem role `admin` no banco
- [ ] Conexão com Supabase funcionando
- [ ] Tabela `profiles` existe e é acessível
- [ ] Console do navegador sem erros críticos

## 🎯 **Próximos Passos**

1. **Testar cada botão de debug** para identificar o problema
2. **Verificar o console** para mensagens de erro
3. **Confirmar credenciais** de admin
4. **Verificar banco de dados** se necessário
5. **Reportar resultados** dos testes

## 📞 **Suporte**

Se os testes não resolverem o problema:
1. Copie todas as mensagens do console
2. Tire screenshot da tela de debug
3. Descreva qual botão falhou e qual erro apareceu

---

**🔧 Sistema preparado para debug!**
**🐛 Use os botões de teste para identificar o problema!**
