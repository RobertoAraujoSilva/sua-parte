# 🔐 Guia de Troubleshooting - Autenticação

## 📋 Credenciais de Teste Atualizadas

### **Instrutor (Admin)**
- **Email:** `frankwebber33@hotmail.com`
- **Senha:** `senha123`
- **Role:** `instrutor`
- **Cargo:** `conselheiro_assistente`

### **Estudante (Usuário)**
- **Email:** `franklinmarceloferreiradelima@gmail.com`
- **Senha:** `senha123`
- **Role:** `estudante`
- **Cargo:** `publicador_nao_batizado`

### **Teste Simples (Novo)**
- **Email:** `teste@sistema.com`
- **Senha:** `123456`
- **Role:** `instrutor`
- **Cargo:** `anciao`

## 🔧 Configuração Corrigida

### **Variáveis de Ambiente**
```env
# Supabase environment variables
VITE_SUPABASE_URL=https://nwpuurgwnnuejqinkvrh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak
```

### **Configuração Central**
- ✅ Criado arquivo `src/lib/supabase.ts` com configuração padronizada
- ✅ Todas as páginas devem importar de `@/lib/supabase`
- ✅ Validação automática de variáveis de ambiente

## 🚨 Problemas Comuns e Soluções

### **1. "Invalid login credentials"**
**Causa:** Senha incorreta ou usuário não existe
**Solução:** 
- Use as credenciais atualizadas acima
- Experimente a conta de teste simples: `teste@sistema.com` / `123456`
- Verifique se não há espaços extras no email/senha
- Use os botões de credenciais de teste na tela de login (ambiente dev)

### **2. "Missing environment variables"**
**Causa:** Variáveis VITE_SUPABASE_* não definidas
**Solução:**
- Verifique se o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento após alterar .env

### **3. "Failed to load resource: 400"**
**Causa:** Configuração incorreta do Supabase
**Solução:**
- Verifique se a URL do Supabase está correta
- Confirme se a chave anônima é válida

### **4. Página não carrega após login**
**Causa:** Redirecionamento ou roteamento incorreto
**Solução:**
- Limpe o cache do navegador
- Verifique se as rotas estão configuradas corretamente

## 🔍 Ferramentas de Debug

### **Console do Navegador**
```javascript
// Verificar configuração do Supabase
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Testar credenciais
import { testCredentials } from '@/lib/supabase';
const result = await testCredentials('frankwebber33@hotmail.com', 'senha123');
console.log('Teste de login:', result);
```

### **Verificação de Saúde**
```javascript
import { checkSupabaseHealth } from '@/lib/supabase';
const health = await checkSupabaseHealth();
console.log('Saúde do Supabase:', health);
```

## 📝 Checklist de Verificação

### **Antes de Reportar Problemas:**
- [ ] Verificar se as variáveis de ambiente estão corretas
- [ ] Confirmar se o servidor foi reiniciado após alterar .env
- [ ] Testar com as credenciais atualizadas
- [ ] Limpar cache do navegador
- [ ] Verificar console do navegador para erros
- [ ] Testar em modo incógnito

### **Informações para Debug:**
- [ ] URL atual da aplicação
- [ ] Mensagem de erro completa
- [ ] Console logs do navegador
- [ ] Credenciais utilizadas (sem a senha)
- [ ] Versão do navegador

## 🔄 Como Resetar Autenticação

### **Limpar Dados Locais:**
```javascript
// No console do navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Forçar Logout:**
```javascript
import { supabase } from '@/lib/supabase';
await supabase.auth.signOut();
```

## 📞 Suporte

Se os problemas persistirem após seguir este guia:

1. **Verificar logs do servidor** de desenvolvimento
2. **Testar em ambiente limpo** (modo incógnito)
3. **Verificar status do Supabase** em status.supabase.com
4. **Reportar com informações completas** do checklist acima

## 🎯 Testes Rápidos

### **Teste 1: Configuração**
```bash
# Verificar se variáveis estão definidas
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### **Teste 2: Conectividade**
```bash
# Testar conexão com Supabase
curl -I https://nwpuurgwnnuejqinkvrh.supabase.co
```

### **Teste 3: Autenticação**
- Abrir aplicação em modo incógnito
- Tentar login com: `teste@sistema.com` / `123456` (mais confiável)
- Alternativamente: `frankwebber33@hotmail.com` / `senha123`
- Usar botões de credenciais de teste na tela de login
- Verificar se redireciona corretamente

---

**Última atualização:** Janeiro 2025  
**Credenciais válidas até:** Indefinido (ambiente de desenvolvimento)