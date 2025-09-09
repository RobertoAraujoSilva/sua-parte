# 🎨 System Flow Diagram - Sistema Ministerial

## 📊 Diagrama de Fluxo Principal

```mermaid
graph TB
    %% Estilo dos nós
    classDef adminNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef instructorNode fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef studentNode fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef systemNode fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef dataNode fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000

    %% Nível Administrador Geral
    A[📊 ADMINISTRADOR GERAL<br/>🌍 Sistema Ministerial Global]:::adminNode
    
    %% JW.org Integration
    JW[🌐 JW.org<br/>📚 Apostilas MWB<br/>PT/EN]:::dataNode
    
    %% Sistema Central
    SC[📡 SISTEMA CENTRAL<br/>🔄 Sincronização<br/>⚙️ Configurações]:::systemNode
    
    %% Nível Instrutores
    I1[🎓 INSTRUTOR<br/>Congregação A]:::instructorNode
    I2[🎓 INSTRUTOR<br/>Congregação B]:::instructorNode
    I3[🎓 INSTRUTOR<br/>Congregação C]:::instructorNode
    I4[🎓 INSTRUTOR<br/>...<br/>200k+ Congregações]:::instructorNode
    
    %% Nível Estudantes
    S1[👨‍🎓 ESTUDANTES<br/>Congregação A]:::studentNode
    S2[👨‍🎓 ESTUDANTES<br/>Congregação B]:::studentNode
    S3[👨‍🎓 ESTUDANTES<br/>Congregação C]:::studentNode
    S4[👨‍🎓 ESTUDANTES<br/>...<br/>Milhões]:::studentNode
    
    %% Banco de Dados
    DB[(🗄️ BANCO DE DADOS<br/>PostgreSQL + RLS)]:::dataNode
    
    %% Fluxo de dados
    A -->|1. Atualiza programação| SC
    JW -->|2. Apostilas MWB| A
    SC -->|3. Sincroniza automaticamente| I1
    SC -->|3. Sincroniza automaticamente| I2
    SC -->|3. Sincroniza automaticamente| I3
    SC -->|3. Sincroniza automaticamente| I4
    
    I1 -->|4. Designações locais| S1
    I2 -->|4. Designações locais| S2
    I3 -->|4. Designações locais| S3
    I4 -->|4. Designações locais| S4
    
    %% Banco de dados
    SC <-->|CRUD| DB
    I1 <-->|CRUD Local| DB
    I2 <-->|CRUD Local| DB
    I3 <-->|CRUD Local| DB
    I4 <-->|CRUD Local| DB
    S1 <-->|CRUD Pessoal| DB
    S2 <-->|CRUD Pessoal| DB
    S3 <-->|CRUD Pessoal| DB
    S4 <-->|CRUD Pessoal| DB
```

## 🔄 Ciclo Semanal de Reunião

```mermaid
gantt
    title 📅 Ciclo Semanal de Reunião Ministerial
    dateFormat  YYYY-MM-DD
    section 📊 Admin Geral
    Atualizar Programação    :admin1, 2025-08-25, 1d
    Sincronizar Sistema      :admin2, 2025-08-26, 1d
    Monitorar Sincronização  :admin3, 2025-08-27, 3d
    
    section 🎓 Instrutores
    Receber Programação      :instr1, 2025-08-26, 1d
    Fazer Designações        :instr2, 2025-08-27, 3d
    Preparar Reunião         :instr3, 2025-08-30, 1d
    
    section 👨‍🎓 Estudantes
    Receber Notificações     :stud1, 2025-08-27, 1d
    Preparar Partes          :stud2, 2025-08-28, 2d
    Participar Reunião       :stud3, 2025-08-30, 1d
    Confirmar Participação   :stud4, 2025-08-31, 1d
    
    section 📊 Relatórios
    Gerar Relatórios Locais  :report1, 2025-08-31, 1d
    Análise de Resultados    :report2, 2025-09-01, 1d
    Planejamento Próxima     :report3, 2025-09-01, 1d
```

## 🏗️ Arquitetura do Sistema

```mermaid
graph LR
    %% Frontend
    subgraph Frontend ["🌐 Frontend (React + TypeScript)"]
        AD[📊 AdminDashboard]
        ID[🎓 InstructorDashboard]
        SD[👨‍🎓 StudentDashboard]
        UI[🎨 UI Components]
    end
    
    %% API Gateway
    subgraph API ["🔌 API Gateway (Supabase)"]
        AUTH[🔐 Authentication]
        RLS[🛡️ Row Level Security]
        FUNC[⚡ Edge Functions]
    end
    
    %% Database
    subgraph DB ["🗄️ Database (PostgreSQL)"]
        PROFILES[👥 Profiles]
        ESTUDANTES[📚 Estudantes]
        DESIGNACOES[📋 Designações]
        CONGREGACOES[🏢 Congregações]
    end
    
    %% External Services
    subgraph EXT ["🌍 External Services"]
        JW[📚 JW.org API]
        EMAIL[📧 Email Service]
        NOTIF[🔔 Notifications]
    end
    
    %% Connections
    Frontend --> API
    API --> DB
    API --> EXT
    JW --> API
```

## 🔐 Sistema de Permissões e RLS

```mermaid
graph TD
    %% Usuários
    ADMIN[👑 Admin Geral<br/>Role: admin]:::adminNode
    INSTR[🎓 Instrutor<br/>Role: instrutor]:::instructorNode
    STUD[👨‍🎓 Estudante<br/>Role: estudante]:::studentNode
    
    %% Tabelas
    PROF[📋 Profiles<br/>RLS: user_id]:::dataNode
    EST[📚 Estudantes<br/>RLS: congregacao_id]:::dataNode
    DES[📝 Designações<br/>RLS: congregacao_id]:::dataNode
    CONG[🏢 Congregações<br/>RLS: public]:::dataNode
    
    %% Permissões
    ADMIN -->|Full Access| PROF
    ADMIN -->|Full Access| EST
    ADMIN -->|Full Access| DES
    ADMIN -->|Full Access| CONG
    
    INSTR -->|Read Own Profile| PROF
    INSTR -->|CRUD Local Estudantes| EST
    INSTR -->|CRUD Local Designações| DES
    INSTR -->|Read Own Congregação| CONG
    
    STUD -->|Read Own Profile| PROF
    STUD -->|Read Own Data| EST
    STUD -->|Read Own Designações| DES
    STUD -->|Read Own Congregação| CONG
    
    %% Estilos
    classDef adminNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef instructorNode fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef studentNode fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef dataNode fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000
```

## 📊 Fluxo de Sincronização

```mermaid
sequenceDiagram
    participant AG as 📊 Admin Geral
    participant SC as 📡 Sistema Central
    participant DB as 🗄️ Database
    participant I1 as 🎓 Instrutor 1
    participant I2 as 🎓 Instrutor 2
    participant I3 as 🎓 Instrutor N
    
    Note over AG,DB: 🔄 Processo de Sincronização
    
    AG->>SC: 1. Atualiza programação oficial
    SC->>DB: 2. Salva no banco central
    SC->>I1: 3. Notifica nova programação
    SC->>I2: 3. Notifica nova programação
    SC->>I3: 3. Notifica nova programação
    
    Note over I1,I3: ⏱️ Sincronização em tempo real
    
    I1->>DB: 4. Confirma recebimento
    I2->>DB: 4. Confirma recebimento
    I3->>DB: 4. Confirma recebimento
    
    Note over AG,DB: 📊 Monitoramento de Status
    
    SC->>AG: 5. Relatório de sincronização
    Note over AG: ✅ Todas as congregações sincronizadas
```

## 🎯 Dashboard Flow

```mermaid
graph TB
    %% Estilos
    classDef adminStyle fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef instructorStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef studentStyle fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    %% Admin Dashboard
    subgraph Admin ["📊 Dashboard Administrador Geral"]
        A1[📅 Programação Oficial<br/>2-3 meses correntes]
        A2[📚 Apostilas MWB<br/>PT/EN]
        A3[⚙️ Estrutura S-38<br/>Mundial padrão]
        A4[🔄 Sincronização<br/>200k+ congregações]
        A5[📈 Monitoramento<br/>Sistema global]
    end
    
    %% Instructor Dashboard
    subgraph Instructor ["🎓 Dashboard Instrutor Congregação"]
        I1[📥 Programação Recebida<br/>Espelho do Admin]
        I2[👥 Gestão Estudantes<br/>Locais]
        I3[📝 Designações<br/>Adaptação local]
        I4[📊 Relatórios<br/>Congregação]
    end
    
    %% Student Dashboard
    subgraph Student ["👨‍🎓 Dashboard Estudante"]
        S1[📱 Notificações<br/>Designações]
        S2[📚 Materiais<br/>Reunião]
        S3[✅ Confirmação<br/>Participação]
        S4[📊 Histórico<br/>Pessoal]
    end
    
    %% Fluxo de dados
    A1 -->|Sincroniza| I1
    A2 -->|Disponibiliza| I1
    A3 -->|Define padrão| I1
    
    I1 -->|Notifica| S1
    I2 -->|Designa| S1
    I3 -->|Atribui| S1
    
    %% Estilos aplicados
    class Admin adminStyle
    class Instructor instructorStyle
    class Student studentStyle
```

## 🌟 Benefícios e Resultados

```mermaid
mindmap
  root((Sistema Ministerial))
    🌍 Padronização Mundial
      📊 Programação oficial única
      📚 Apostilas MWB padronizadas
      ⚙️ Estrutura S-38 consistente
      🔄 Sincronização automática
    
    🎓 Flexibilidade Local
      👥 Designações locais
      📝 Adaptação à realidade
      🏢 Gestão por congregação
      📊 Relatórios personalizados
    
    🚀 Eficiência Operacional
      ⚡ Atualizações automáticas
      📱 Notificações em tempo real
      📈 Monitoramento centralizado
      🔐 Segurança por níveis
    
    💡 Inovação Tecnológica
      🌐 Integração JW.org
      📊 Analytics avançados
      🔄 Sincronização global
      📱 Interface responsiva
```

---

## 📋 Como Usar Estes Diagramas

### 🔧 **Para Desenvolvedores:**
1. **Implementação:** Use os diagramas como referência para arquitetura
2. **Fluxo de Dados:** Entenda como as informações fluem entre níveis
3. **Permissões:** Implemente RLS baseado no diagrama de segurança
4. **Sincronização:** Siga o padrão de comunicação estabelecido

### 🎯 **Para Stakeholders:**
1. **Visão Geral:** Entenda o fluxo completo do sistema
2. **Responsabilidades:** Veja claramente quem faz o quê
3. **Benefícios:** Compreenda os resultados esperados
4. **Timeline:** Acompanhe o ciclo semanal de trabalho

### 📊 **Para Testes:**
1. **Cenários:** Use os fluxos para criar casos de teste
2. **Integração:** Teste a sincronização entre níveis
3. **Permissões:** Valide o isolamento de dados por RLS
4. **Performance:** Monitore a sincronização em tempo real

---

*Estes diagramas são atualizados conforme o sistema evolui e novas funcionalidades são implementadas.*
