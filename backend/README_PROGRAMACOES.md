# 📋 API de Programações Ministeriais

Backend Express + Supabase para programações ministeriais **sem nomes**.

## 🎯 Funcionalidades Principais

- **Programações Ministeriais**: API para criar/obter programações semanais (modelo sem nomes)
- **Estrutura Bilíngue**: Suporte completo para PT/EN
- **Validação Robusta**: Validação de payload e regras de negócio
- **Upsert Inteligente**: Evita duplicação de semanas
- **Service Key**: Backend usa service key para operações privilegiadas

## 🚀 Instalação Rápida

```bash
cd backend
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` no diretório `backend/`:

```env
PORT=3000
SUPABASE_URL=https://nwpuurgwnnuejqinkvrh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_key_aqui
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🗄️ Schema do Banco

Execute o SQL em `backend/sql/programacoes_schema.sql`:

```sql
-- Programação (modelo, sem nomes)
create table if not exists programacoes (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end   date not null,
  status text not null check (status in ('rascunho','publicada')),
  congregation_scope text not null check (congregation_scope in ('global','scoped')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Itens (estrutura da semana)
create table if not exists programacao_itens (
  id uuid primary key default gen_random_uuid(),
  programacao_id uuid not null references programacoes(id) on delete cascade,
  "order" int not null,
  section text not null check (section in ('OPENING','TREASURES','APPLY','LIVING','CLOSING')),
  type text not null check (type in (
    'song','opening_comments','talk','spiritual_gems','bible_reading',
    'starting','following','making_disciples','local_needs','cbs','concluding_comments'
  )),
  minutes int not null,
  rules jsonb,
  lang  jsonb not null, -- { en: {title,notes?}, pt: {title,notes?} }
  created_at timestamptz default now()
);
```

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Teste da API
```bash
node test-programacoes.js
```

## 📡 API Endpoints

### POST /api/programacoes
Cria/atualiza programação (upsert por week_start/week_end/congregation_scope)

**Payload:**
```json
{
  "week_start": "2025-11-03",
  "week_end": "2025-11-09", 
  "status": "publicada",
  "congregation_scope": "global",
  "items": [
    {
      "order": 1,
      "section": "OPENING",
      "type": "song",
      "minutes": 3,
      "rules": null,
      "lang": {
        "en": { "title": "Song 1" },
        "pt": { "title": "Cântico 1" }
      }
    }
  ]
}
```

### GET /api/programacoes
Obtém programação por semana

**Query params:**
- `week_start=YYYY-MM-DD` (obrigatório)
- `week_end=YYYY-MM-DD` (obrigatório)  
- `congregation_scope=global` (opcional, default: global)

**Exemplo:**
```bash
curl "http://localhost:3000/api/programacoes?week_start=2025-11-03&week_end=2025-11-09"
```

### GET /api/status
Retorna status do sistema

## 🧪 Teste Completo

```bash
# 1. Iniciar backend
npm run dev

# 2. Em outro terminal, testar
node test-programacoes.js
```

## 🔄 Fluxo de Integração

1. **Admin** (frontend) → POST `/api/programacoes` → salva programação
2. **Instrutor** (frontend) → GET `/api/programacoes` → obtém programação
3. **Instrutor** → cria designações baseadas na estrutura obtida

## 📁 Estrutura

```
backend/
├── config/
│   ├── database.js      # Cliente Supabase
│   └── supabase.js      # Config alternativa
├── routes/
│   └── programacoes.js  # API programações
├── sql/
│   └── programacoes_schema.sql
├── test-programacoes.js # Teste da API
├── server.js           # Servidor Express
└── .env               # Configurações
```

## 🔧 Notas Técnicas

- **Frontend** NUNCA usa a service key; só o backend
- **Instrutor** vai consumir **GET /api/programacoes** e depois gravar **designações** em outra rota
- Para **bilingue**: no Admin você já alterna `langTab` e lê `item.lang[pt|en]`. O backend só armazena o JSON como veio
- **Upsert**: evita duplicação da mesma semana/escopo
- **Validação**: payload é validado antes de persistir
