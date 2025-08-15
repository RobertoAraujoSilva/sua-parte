# 🎯 Sistema Unificado: Admin, Instrutor e Estudante

## 📋 **Visão Geral**

O **Sistema Ministerial Unificado** implementa uma arquitetura hierárquica que separa claramente as responsabilidades entre **Admin**, **Instrutor** e **Estudante**, seguindo o fluxo de trabalho ministerial das Testemunhas de Jeová.

## 🏗️ **Arquitetura do Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     ADMIN       │    │   INSTRUTOR      │    │   ESTUDANTE     │
│   (Global)      │───▶│   (Local)        │───▶│   (Individual)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   Materiais Oficiais    Designações Locais    Visualização e
   (JW.org)              (Congregação)         Preparo
```

## 🔐 **Níveis de Acesso e Responsabilidades**

### **1. ADMIN (Acesso Total)**
- **Controle Global** do sistema
- **Gerenciamento** de versões MWB
- **Upload** de arquivos oficiais
- **Configuração** de regras S-38
- **Gestão** de congregações
- **Designação** de instrutores

### **2. INSTRUTOR (Acesso Local)**
- **Gestão** da congregação local
- **Designação** de estudantes
- **Aplicação** de regras S-38
- **Aprovação** de designações
- **Relatórios** da congregação

### **3. ESTUDANTE (Acesso Individual)**
- **Visualização** de designações
- **Confirmação** de participação
- **Acesso** a materiais de preparo
- **Histórico** pessoal

## 📊 **Fluxo de Trabalho Unificado**

### **FASE 1: ADMIN (Geração de Programação)**
```
1. Baixar Materiais Oficiais
   ├── PDFs da apostila MWB
   ├── Arquivos RTF (S-38)
   ├── Base SQL de estudantes
   └── Imagens auxiliares

2. Gerar Programação Unificada
   ├── Extrair datas das reuniões
   ├── Definir partes e seções
   ├── Aplicar regras S-38
   └── Publicar para congregações

3. Configurar Regras S-38
   ├── Qualificações por parte
   ├── Durações específicas
   ├── Restrições e validações
   └── Mensagens de orientação
```

### **FASE 2: INSTRUTOR (Aplicação Local)**
```
1. Receber Programação Publicada
   ├── Visualizar semanas disponíveis
   ├── Verificar regras S-38
   └── Analisar requisitos das partes

2. Designar Estudantes
   ├── Selecionar estudantes qualificados
   ├── Aplicar regras S-38 automaticamente
   ├── Definir assistentes quando necessário
   └── Adicionar notas e observações

3. Gerenciar Designações
   ├── Aprovar confirmações
   ├── Acompanhar preparo
   ├── Registrar conclusões
   └── Gerar relatórios
```

### **FASE 3: ESTUDANTE (Consumo e Preparo)**
```
1. Receber Notificações
   ├── Designações atribuídas
   ├── Lembretes de preparo
   ├── Atualizações de horário
   └── Materiais de apoio

2. Preparar Designações
   ├── Acessar materiais oficiais
   ├── Verificar regras S-38
   ├── Confirmar participação
   └── Marcar como concluído
```

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Principais**

| Tabela | Descrição | Controle |
|--------|-----------|----------|
| `mwb_versions` | Versões do MWB | Admin |
| `official_files` | Arquivos oficiais | Admin |
| `unified_programming` | Programação unificada | Admin |
| `programming_parts` | Partes da programação | Admin |
| `s38_rules` | Regras S-38 | Admin |
| `congregations` | Congregações | Admin |
| `congregation_instructors` | Instrutores por congregação | Admin |
| `congregation_assignments` | Designações locais | Instrutor |
| `assignment_history` | Histórico de mudanças | Sistema |
| `notifications` | Sistema de notificações | Sistema |

### **Relacionamentos**

```sql
-- Hierarquia de dados
mwb_versions (1) ── (N) official_files
mwb_versions (1) ── (N) unified_programming
unified_programming (1) ── (N) programming_parts
congregations (1) ── (N) congregation_instructors
congregations (1) ── (N) congregation_assignments
programming_parts (1) ── (N) congregation_assignments
```

## 🔒 **Segurança e Controle de Acesso**

### **Políticas RLS (Row Level Security)**

#### **Admin (Acesso Total)**
- ✅ Visualizar todas as versões MWB
- ✅ Gerenciar arquivos oficiais
- ✅ Configurar programação unificada
- ✅ Definir regras S-38
- ✅ Gerenciar congregações
- ✅ Ver todas as designações

#### **Instrutor (Acesso Local)**
- ✅ Visualizar versões publicadas
- ✅ Acessar arquivos oficiais
- ✅ Ver programação unificada
- ✅ Gerenciar designações locais
- ✅ Ver regras S-38 ativas
- ✅ Acessar relatórios da congregação

#### **Estudante (Acesso Individual)**
- ✅ Visualizar versões publicadas
- ✅ Ver suas designações
- ✅ Confirmar participação
- ✅ Acessar materiais de preparo
- ✅ Ver histórico pessoal

## 📱 **Funcionalidades por Nível**

### **Dashboard Admin**
```
┌─────────────────────────────────────────────────────────┐
│ 🏠 ADMIN DASHBOARD                                     │
├─────────────────────────────────────────────────────────┤
│ 📊 Estatísticas do Sistema                             │
│ ├── Total de congregações: 25                          │
│ ├── Total de usuários: 1,250                           │
│ ├── Versões MWB ativas: 3                              │
│ └── Designações este mês: 450                          │
│                                                        │
│ 🚀 Ações Rápidas                                       │
│ ├── 📥 Baixar materiais oficiais                      │
│ ├── ⚙️ Configurar regras S-38                          │
│ ├── 🏢 Gerenciar congregações                          │
│ └── 📋 Gerar programação unificada                     │
│                                                        │
│ 📈 Relatórios Globais                                  │
│ ├── Participação por congregação                       │
│ ├── Uso de regras S-38                                 │
│ └── Estatísticas de designações                        │
└─────────────────────────────────────────────────────────┘
```

### **Dashboard Instrutor**
```
┌─────────────────────────────────────────────────────────┐
│ 🏠 INSTRUTOR DASHBOARD                                 │
├─────────────────────────────────────────────────────────┤
│ 🏢 Congregação: Central                                │
│ 📅 Próxima Reunião: Domingo, 25/08/2025               │
│ ⏰ Horário: 09:30                                       │
│                                                        │
│ 📋 Designações da Semana                               │
│ ├── ✅ Leitura: João Silva (Confirmado)                │
│ ├── ⏳ Tesouros: Maria Santos (Pendente)              │
│ ├── ⏳ Vida Cristã: Pedro Costa (Pendente)             │
│ └── 🔄 Ministério: Ana Oliveira (Em preparo)           │
│                                                        │
│ 🎯 Ações Pendentes                                     │
│ ├── 📝 Revisar designações não confirmadas             │
│ ├── 📊 Gerar relatório semanal                         │
│ └── 🔔 Enviar lembretes                                │
└─────────────────────────────────────────────────────────┘
```

### **Dashboard Estudante**
```
┌─────────────────────────────────────────────────────────┐
│ 🏠 ESTUDANTE DASHBOARD                                 │
├─────────────────────────────────────────────────────────┤
│ 👤 João Silva                                          │
│ 🏢 Congregação: Central                                │
│ 📅 Próxima Designação: Domingo, 25/08/2025             │
│                                                        │
│ 📖 Minhas Designações                                  │
│ ├── ✅ Leitura Bíblica (Confirmado)                     │
│ │   📚 Mateus 24:14                                    │
│ │   ⏱️ 4 minutos                                       │
│ │   📄 Página 15 da apostila                           │
│ └── 🔄 Próxima: Tesouros (Pendente)                    │
│                                                        │
│ 📚 Materiais de Preparo                                │
│ ├── 📖 Apostila MWB Setembro-Outubro 2025              │
│ ├── 📋 Instruções S-38                                 │
│ └── 🎥 Vídeos de orientação                            │
└─────────────────────────────────────────────────────────┘
```

## 🔄 **Fluxo de Dados e Sincronização**

### **Sincronização Online**
```
1. Admin faz alterações → Banco de dados atualizado
2. Sistema detecta mudanças → Notificações enviadas
3. Instrutores recebem atualizações → Dashboard atualizado
4. Estudantes veem mudanças → Preparo ajustado
```

### **Modo Offline**
```
1. Dados baixados para dispositivo local
2. Alterações feitas offline
3. Sincronização automática quando online
4. Resolução de conflitos inteligente
```

## 📱 **Notificações e Comunicação**

### **Tipos de Notificação**

| Tipo | Descrição | Destinatário | Método |
|------|-----------|--------------|---------|
| `assignment` | Nova designação | Estudante | App, Email, WhatsApp |
| `reminder` | Lembrete de preparo | Estudante | App, Email |
| `update` | Mudança na programação | Instrutor | App, Email |
| `system` | Atualizações do sistema | Todos | App |

### **Configuração de Notificações**
```typescript
interface NotificationPreferences {
  email_enabled: boolean;
  app_enabled: boolean;
  whatsapp_enabled: boolean;
  reminder_timing: number; // horas antes
}
```

## 📊 **Relatórios e Analytics**

### **Relatórios por Nível**

#### **Admin (Global)**
- Estatísticas do sistema
- Participação por congregação
- Uso de regras S-38
- Performance geral

#### **Instrutor (Local)**
- Designações da congregação
- Participação dos estudantes
- Relatórios semanais/mensais
- Análise de tendências

#### **Estudante (Individual)**
- Histórico pessoal
- Progresso nas designações
- Materiais acessados
- Tempo de preparo

## 🚀 **Implementação e Deploy**

### **Estrutura de Arquivos**
```
src/
├── types/
│   └── unified-system.ts          # Tipos TypeScript
├── components/
│   ├── admin/                     # Componentes Admin
│   ├── instructor/                # Componentes Instrutor
│   └── student/                   # Componentes Estudante
├── services/
│   ├── mwb-service.ts            # Serviço MWB
│   ├── assignment-service.ts     # Serviço Designações
│   └── notification-service.ts   # Serviço Notificações
└── utils/
    ├── s38-validator.ts          # Validador S-38
    └── file-processor.ts         # Processador de Arquivos
```

### **Configuração do Banco**
```bash
# Aplicar migrações
npx supabase db push

# Verificar políticas RLS
npx supabase db diff --schema public
```

## 🔧 **Configuração e Personalização**

### **Variáveis de Ambiente**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Sistema
NEXT_PUBLIC_DEFAULT_LANGUAGE=pt-BR
NEXT_PUBLIC_TIMEZONE=America/Sao_Paulo
NEXT_PUBLIC_S38_RULES_ENABLED=true
NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true

# Arquivos
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,rtf,sql,image,zip
```

### **Configuração de Regras S-38**
```typescript
// Exemplo de regra personalizada
const customRule: S38Rule = {
  rule_code: 'leitura_sem_introducao',
  rule_name: 'Leitura sem Introdução',
  rule_type: 'qualificacao',
  rule_conditions: {
    part_type: 'leitura_biblica'
  },
  rule_actions: {
    instruction: 'Ler diretamente o texto bíblico',
    duration: 4,
    unit: 'minutes'
  }
};
```

## 📈 **Monitoramento e Manutenção**

### **Logs do Sistema**
- Operações de usuário
- Mudanças na programação
- Aplicação de regras S-38
- Erros e exceções

### **Backup e Restauração**
- Backup automático diário
- Restauração pontual
- Versionamento de dados
- Migração entre ambientes

## 🎯 **Próximos Passos**

### **Fase 1: Implementação Base**
- [x] Estrutura do banco de dados
- [x] Tipos TypeScript
- [x] Políticas RLS
- [ ] Componentes React básicos

### **Fase 2: Funcionalidades Core**
- [ ] Upload de materiais oficiais
- [ ] Geração de programação unificada
- [ ] Sistema de designações
- [ ] Validação S-38

### **Fase 3: Recursos Avançados**
- [ ] Notificações em tempo real
- [ ] Relatórios avançados
- [ ] Modo offline
- [ ] Integração com WhatsApp

### **Fase 4: Otimização**
- [ ] Performance e cache
- [ ] Testes automatizados
- [ ] Documentação completa
- [ ] Deploy em produção

## 🤝 **Contribuição e Suporte**

### **Desenvolvimento**
1. Fork do repositório
2. Criação de branch para feature
3. Implementação com testes
4. Pull request com documentação

### **Suporte**
- 📧 Email: suporte@sistema-ministerial.com
- 📱 WhatsApp: +55 11 99999-9999
- 📖 Documentação: `/docs`
- 🐛 Issues: GitHub Issues

---

**Sistema Ministerial Unificado** - Transformando a gestão ministerial com tecnologia moderna e segurança robusta. 🚀
