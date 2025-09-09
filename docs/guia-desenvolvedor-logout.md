# Guia do Desenvolvedor - Sistema de Logout
## Sistema Ministerial - Manual Técnico

---

## 🎯 **VISÃO GERAL**

Este documento fornece instruções completas para desenvolvedores que precisam trabalhar com o sistema de logout do Sistema Ministerial, incluindo debugging, manutenção e extensões.

---

## 🏗️ **ARQUITETURA DO SISTEMA**

### **Componentes Principais**

```
AuthContext.tsx (Core)
├── signOut() - Função principal com timeout crítico
├── clearLocalState() - Limpeza de estado local
└── CRITICAL_TIMEOUT = 1500ms

Utils/
├── debugLogger.ts - Sistema de logs
├── emergencyLogout.ts - Logout de emergência  
├── forceLogout.ts - Logout forçado
├── supabaseHealthCheck.ts - Verificação de saúde
└── logoutDiagnostics.ts - Diagnósticos específicos

Components/
├── DebugPanel.tsx - Interface de debug
└── Header.tsx - Botões de logout
```

---

## 🔧 **CONFIGURAÇÃO DE DESENVOLVIMENTO**

### **1. Instalação das Dependências**
```bash
npm install
```

### **2. Configuração do Ambiente**
```bash
# Arquivo .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### **3. Inicialização do Servidor**
```bash
npm run dev
# Servidor disponível em http://localhost:5174/
```

---

## 🧪 **FERRAMENTAS DE DEBUG**

### **Debug Panel**
**Localização:** Botão "Debug" no canto inferior direito

**Funcionalidades:**
- 🧪 **Test Direct Logout** - Teste direto do logout
- 🔽 **Test Dropdown Logout** - Teste do dropdown
- 🚨 **Force Logout** - Logout forçado
- 🏥 **Health Check** - Verificação de saúde do Supabase
- 🔍 **Logout Diagnostics** - Diagnósticos completos
- 📄 **Download TXT** - Download dos logs

### **Console Commands**
```javascript
// Logout de emergência
window.emergencyLogout()        // Bypass completo do Supabase
window.immediateLogout()        // Logout instantâneo
window.smartLogout(signOutFn)   // Tenta Supabase primeiro

// Diagnósticos
window.logoutDiagnostics.quickTest()     // Teste rápido
window.logoutDiagnostics.run()           // Diagnóstico completo
window.supabaseHealth.quickCheck()      // Verificação de saúde
window.supabaseHealth.check()           // Health check completo

// Debug tools
window.debugLogout.force()               // Força logout
window.debugLogout.clearStorage()       // Limpa storage
window.debugLogout.checkAuth()          // Verifica estado auth
```

---

## 📝 **COMO DEBUGGAR PROBLEMAS DE LOGOUT**

### **Passo 1: Verificação Inicial**
```javascript
// 1. Abrir console do navegador (F12)
// 2. Verificar estado atual
window.logoutDiagnostics.quickTest()
```

### **Passo 2: Análise Detalhada**
```javascript
// 3. Health check do Supabase
window.supabaseHealth.quickCheck()

// 4. Verificar storage
window.debugLogout.checkAuth()
```

### **Passo 3: Teste de Logout**
```javascript
// 5. Tentar logout normal primeiro
// Clicar no botão "Sair" e observar console

// 6. Se falhar, usar emergency
window.emergencyLogout()
```

### **Passo 4: Análise de Logs**
```javascript
// 7. Baixar logs para análise
// Usar botão "Download TXT" no Debug Panel
```

---

## 🔍 **INTERPRETAÇÃO DE LOGS**

### **Log de Sucesso**
```
🔄 AuthContext signOut called
🔄 Attempting signOut with critical timeout...
✅ Supabase signOut successful
🧹 Clearing local auth state...
✅ AuthContext signOut completed
```

### **Log de Timeout**
```
🔄 AuthContext signOut called
🔄 Attempting signOut with critical timeout...
⏰ CRITICAL TIMEOUT - Supabase signOut hanging, forcing completion
🧹 Clearing local auth state...
```

### **Log de Erro**
```
🔄 AuthContext signOut called
❌ SignOut error details: {"message": "...", "code": "..."}
🧹 Clearing local auth state...
```

---

## 🛠️ **MODIFICAÇÕES COMUNS**

### **Ajustar Timeout**
```typescript
// src/contexts/AuthContext.tsx
const CRITICAL_TIMEOUT = 1500; // Modificar este valor
```

### **Adicionar Novo Fallback**
```typescript
// src/utils/emergencyLogout.ts
export const customLogout = () => {
  // Sua implementação personalizada
  console.log('🔧 Custom logout initiated');
  // ...
};
```

### **Estender Diagnósticos**
```typescript
// src/utils/logoutDiagnostics.ts
// Adicionar novo teste na função runLogoutDiagnostics
results.push({
  testName: 'Seu Novo Teste',
  success: true,
  details: { /* dados do teste */ },
  timestamp: new Date().toISOString()
});
```

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS COMUNS**

### **Problema: Logout Travando**
**Solução:**
```javascript
// 1. Verificar conectividade
window.supabaseHealth.quickCheck()

// 2. Usar emergency logout
window.emergencyLogout()

// 3. Verificar se timeout é adequado
// Reduzir CRITICAL_TIMEOUT se necessário
```

### **Problema: Estado Não Limpo**
**Solução:**
```javascript
// 1. Verificar storage
window.debugLogout.checkAuth()

// 2. Limpar manualmente
window.debugLogout.clearStorage()

// 3. Verificar função clearLocalState()
```

### **Problema: Redirecionamento Falhando**
**Solução:**
```typescript
// Verificar se está usando window.location.href
window.location.href = '/auth';

// Não usar navigate() em casos de emergency
```

---

## 📊 **MONITORAMENTO E MÉTRICAS**

### **Métricas Importantes**
- **Tempo de logout:** < 1.5 segundos
- **Taxa de sucesso:** 100%
- **Uso de fallbacks:** < 10%
- **Erros de Supabase:** Monitorar tendências

### **Alertas Recomendados**
- Timeout > 2 segundos
- Taxa de fallback > 20%
- Erros consecutivos > 3

---

## 🔄 **PROCESSO DE DEPLOY**

### **Checklist Pré-Deploy**
- [ ] Testar logout em todas as páginas
- [ ] Verificar console commands funcionando
- [ ] Confirmar timeouts adequados
- [ ] Validar fallbacks funcionais
- [ ] Testar em diferentes navegadores

### **Checklist Pós-Deploy**
- [ ] Monitorar logs de produção
- [ ] Verificar métricas de sucesso
- [ ] Confirmar health checks
- [ ] Validar performance

---

## 📚 **REFERÊNCIAS TÉCNICAS**

### **Arquivos Principais**
```
src/contexts/AuthContext.tsx      - Core do sistema
src/utils/emergencyLogout.ts     - Fallbacks críticos
src/components/DebugPanel.tsx    - Interface de debug
src/utils/debugLogger.ts         - Sistema de logs
```

### **Dependências**
- **Supabase:** Cliente de autenticação
- **React:** Hooks e contexto
- **TypeScript:** Tipagem forte
- **Lucide React:** Ícones do debug panel

### **Padrões de Código**
- Usar `console.log` com emojis para identificação
- Sempre limpar estado local em fallbacks
- Implementar timeouts agressivos
- Prover múltiplos níveis de fallback

---

## 🆘 **SUPORTE E CONTATO**

### **Para Problemas Críticos**
1. Usar `window.emergencyLogout()` imediatamente
2. Coletar logs com Debug Panel
3. Documentar passos para reprodução
4. Verificar conectividade Supabase

### **Para Desenvolvimento**
- Sempre testar com Debug Panel
- Usar console commands para validação
- Implementar logs detalhados
- Seguir padrões estabelecidos

---

**Documento gerado em:** 2025-08-08  
**Versão:** 4.0 (Fix Crítico)  
**Próxima revisão:** Após feedback de produção
