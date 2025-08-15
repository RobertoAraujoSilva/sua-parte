# 🎯 Sistema Ministerial Backend

Backend completo para download automático de materiais JW.org e geração de programas semanais para congregações.

## 🚀 Funcionalidades

### **📥 Download Automático de Materiais**
- ✅ **Verificação periódica** do JW.org (diariamente às 3h)
- ✅ **Suporte a múltiplos idiomas** (PT-BR, EN-US, ES-ES, etc.)
- ✅ **Download inteligente** (não baixa arquivos duplicados)
- ✅ **Formatos suportados**: PDF, DAISY, JWPUB, RTF

### **📋 Geração de Programas**
- ✅ **Programas semanais** baseados nos materiais baixados
- ✅ **Estrutura automática** (Abertura, Estudo, Vida e Ministério, Fechamento)
- ✅ **Partes específicas** por tipo de material
- ✅ **Sistema de publicação** para congregações

### **💾 Gerenciamento de Armazenamento**
- ✅ **Backup automático** dos materiais
- ✅ **Limpeza inteligente** de arquivos antigos
- ✅ **Monitoramento de espaço** em disco
- ✅ **Restauração de backups**

### **🔔 Sistema de Notificações**
- ✅ **Notificação de admins** sobre novos materiais
- ✅ **Aviso para congregações** sobre programas disponíveis
- ✅ **Alertas de sistema** para problemas

## 🏗️ Arquitetura

```
backend/
├── server.js              # Servidor principal
├── services/
│   ├── jwDownloader.js    # Download de materiais JW.org
│   ├── programGenerator.js # Geração de programas semanais
│   ├── materialManager.js  # Gerenciamento de materiais
│   └── notificationService.js # Notificações
├── routes/
│   ├── admin.js           # Rotas administrativas
│   ├── materials.js       # Gerenciamento de materiais
│   └── programs.js        # Geração de programas
├── config/
│   ├── mwbSources.json    # URLs dos materiais
│   └── database.js        # Configuração do Supabase
└── docs/
    ├── Oficial/           # Materiais baixados
    ├── Programas/         # Programas gerados
    └── Backup/            # Backups do sistema
```

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** ou **yarn**
- **Acesso ao Supabase** (projeto configurado)
- **Permissões de escrita** na pasta `docs/`

## 🚀 Instalação

### 1. **Instalar Dependências**
```bash
cd backend
npm install
```

### 2. **Configurar Variáveis de Ambiente**
Criar arquivo `.env` na raiz do backend:
```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações de Download
JW_CHECK_INTERVAL=0 3 * * *  # Cron: diariamente às 3h
JW_TIMEZONE=America/Sao_Paulo
```

### 3. **Verificar Configuração dos Materiais**
Editar `config/mwbSources.json`:
```json
{
  "pt-BR": {
    "name": "Português (Brasil)",
    "url": "https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/",
    "downloadPath": "docs/Oficial/PT-BR",
    "active": true
  }
}
```

## 🎯 Uso

### **Iniciar o Servidor**
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

### **Verificar Status**
```bash
curl http://localhost:3001/api/status
```

## 📚 API Endpoints

### **🔐 Autenticação**
Todas as rotas requerem header `Authorization` (simplificado para desenvolvimento).

### **📊 Status do Sistema**
```http
GET /api/status
```

### **📥 Materiais**
```http
GET    /api/materials              # Listar materiais
GET    /api/materials/:filename    # Obter material específico
POST   /api/materials/download     # Baixar material por URL
POST   /api/materials/check-updates # Verificar atualizações
POST   /api/materials/sync-all     # Sincronizar todos
```

### **📋 Programas**
```http
GET    /api/programs               # Listar programas
GET    /api/programs/:id           # Obter programa específico
POST   /api/programs               # Gerar novo programa
POST   /api/programs/:id/publish   # Publicar programa
PUT    /api/programs/:id           # Atualizar programa
DELETE /api/programs/:id           # Deletar programa
```

### **⚙️ Administração**
```http
GET    /api/admin/status           # Status do sistema
POST   /api/admin/check-updates    # Verificar atualizações
POST   /api/admin/generate-program # Gerar programa
POST   /api/admin/publish-program/:id # Publicar programa
```

## 🔄 Agendamento Automático

### **Download Diário**
```javascript
// Executa diariamente às 3h da manhã (horário de São Paulo)
cron.schedule('0 3 * * *', async () => {
  // Verifica e baixa novos materiais
}, { timezone: 'America/Sao_Paulo' });
```

### **Health Check**
```javascript
// Verifica saúde do sistema a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  // Monitora status dos serviços
});
```

## 📁 Estrutura de Pastas

### **docs/Oficial/**
Materiais baixados do JW.org:
- `mwb_T_202509.pdf` - Meeting Workbook em português
- `mwb_E_202509.pdf` - Meeting Workbook em inglês
- `S-38_E.rtf` - Diretrizes S-38

### **docs/Programas/**
Programas semanais gerados:
- `programa_202509_pt-BR.json` - Programa de setembro/2025

### **docs/Backup/**
Backups automáticos do sistema:
- `backup_2025-08-15T14-30-00/` - Backup com timestamp

## 🧪 Testes

### **Testar Download**
```bash
curl -X POST http://localhost:3001/api/materials/test/download \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/"}'
```

### **Testar Geração de Programa**
```bash
curl -X POST http://localhost:3001/api/programs/test/generate \
  -H "Authorization: Bearer test"
```

## 🔧 Manutenção

### **Backup Manual**
```bash
npm run backup
```

### **Limpeza de Arquivos Antigos**
```bash
npm run cleanup
```

### **Verificar Saúde**
```bash
curl http://localhost:3001/api/materials/health
```

## 🚨 Troubleshooting

### **Problema: Download falha**
```bash
# Verificar logs
tail -f logs/error.log

# Verificar conectividade
curl -I https://www.jw.org
```

### **Problema: Erro de permissão**
```bash
# Verificar permissões da pasta docs
ls -la docs/
chmod 755 docs/
```

### **Problema: Erro de banco**
```bash
# Verificar conexão Supabase
curl http://localhost:3001/api/status
```

## 📈 Monitoramento

### **Logs do Sistema**
- ✅ **Download de materiais**
- ✅ **Geração de programas**
- ✅ **Backups automáticos**
- ✅ **Erros e exceções**

### **Métricas Disponíveis**
- 📊 **Espaço em disco**
- 📊 **Materiais baixados**
- 📊 **Programas gerados**
- 📊 **Status dos serviços**

## 🔐 Segurança

### **Autenticação**
- ✅ **Middleware de autenticação** em todas as rotas
- ✅ **Validação de entrada** em todas as APIs
- ✅ **Sanitização de dados** para prevenir injeção

### **Rate Limiting**
- ✅ **Limite de requisições** por IP
- ✅ **Timeout em downloads** para evitar sobrecarga
- ✅ **Validação de URLs** para downloads

## 🚀 Deploy

### **Produção**
```bash
# Build de produção
npm run build

# Iniciar servidor
NODE_ENV=production npm start
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📞 Suporte

### **Logs de Erro**
- Verificar `logs/error.log`
- Monitorar console do servidor
- Verificar status da API

### **Contato**
- **Desenvolvedor**: Roberto Araujo da Silva
- **Email**: amazonwebber007@gmail.com
- **Projeto**: Sistema Ministerial Global

---

## 🎉 Status do Sistema

✅ **Backend Funcional**
✅ **Download Automático**
✅ **Geração de Programas**
✅ **Sistema de Notificações**
✅ **Backup Automático**
✅ **Monitoramento de Saúde**

**O Sistema Ministerial Backend está pronto para produção!** 🚀
