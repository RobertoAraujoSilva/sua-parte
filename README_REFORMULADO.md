# 📚 Sistema Ministerial - Versão Simplificada

## 🎯 **Visão Geral**

Sistema ministerial simplificado para gestão de designações da Escola do Ministério Teocrático das Testemunhas de Jeová. **Versão 2.0** focada na simplicidade e eficiência.

### ✨ **Principais Características**

- **🎯 Dashboard do Instrutor** - Interface única e centralizada
- **📋 Programação Mockada** - Baseada nos PDFs oficiais JW.org
- **👥 Gestão de Estudantes** - Cadastro e designação simplificados
- **🔒 Autenticação Segura** - Via Supabase com RLS
- **📱 Interface Responsiva** - Mobile, tablet e desktop

---

## 🚀 **Início Rápido**

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/RobertoAraujoSilva/sua-parte.git

# Navegue para o diretório
cd sua-parte

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute migrações
npx supabase db push

# Inicie o sistema
npm run dev
```

### **Acessar o Sistema**
```
Frontend: http://localhost:8080
Backend:  http://localhost:3000
Login: amazonwebber007@gmail.com / admin123
```

---

## 🏗️ **Arquitetura Simplificada**

### **📁 Estrutura do Projeto**
```
sua-parte/
├── 📁 src/                      
│   ├── 📁 pages/
│   │   ├── InstrutorDashboard.tsx    # ✅ Dashboard Principal
│   │   ├── Auth.tsx                  # ✅ Sistema de Login
│   │   └── StudentDashboard.tsx      # ✅ Portal do Estudante
│   ├── 📁 components/
│   │   └── InstructorDashboardSimplified.tsx  # ✅ Interface Principal
│   ├── 📁 data/
│   │   └── programacoes-completas-2025.json   # ✅ Programação Mockada
│   └── 📁 contexts/
│       └── AuthContext.tsx           # ✅ Autenticação
├── 📁 backend/                      
│   ├── server.js                     # ✅ Servidor Simplificado
│   └── routes/
│       ├── programacoes.js           # ✅ APIs de Programação
│       └── designacoes.js            # ✅ APIs de Designações
├── 📁 docs/Oficial/                 
│   ├── mwb_E_202507.pdf             # ✅ PDFs Oficiais
│   ├── mwb_T_202601.pdf
│   ├── mwb_E_202511.pdf
│   └── mwb_E_202509.pdf
└── README.md
```

---

## 🎯 **Funcionalidades Principais**

### **👨‍🏫 Dashboard do Instrutor**
- **📅 Seleção de Semana** - Escolha entre 9 semanas de programação
- **📋 Programação Completa** - Baseada nos PDFs oficiais JW.org
- **👥 Designação de Estudantes** - Interface drag-and-drop intuitiva
- **💾 Salvamento Automático** - Designações salvas no Supabase
- **📊 Resumo Semanal** - Estatísticas de designações

### **👨‍🎓 Portal do Estudante**
- **📱 Visualização Pessoal** - Apenas suas designações
- **📅 Calendário Semanal** - Organização clara das partes
- **🔔 Notificações** - Alertas de designações
- **📋 Histórico** - Designações anteriores

### **📚 Sistema de Programação Mockada**
- **9 semanas completas** de setembro a novembro 2025
- **Estrutura oficial** baseada nos PDFs JW.org
- **Partes categorizadas** por tipo e duração
- **Referências bíblicas** completas

---

## 🔧 **Scripts Disponíveis**

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia frontend e backend simultaneamente |
| `npm run dev:frontend-only` | Apenas frontend (porta 8080) |
| `npm run dev:backend-only` | Apenas backend (porta 3000) |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Executa ESLint |
| `npm run cypress:run` | Executa testes E2E |

---

## 📊 **Dados Mockados Incluídos**

### **📅 Programação Completa (9 semanas)**
- **Setembro 2025**: Provérbios 30, Provérbios 31, Eclesiastes 1-2
- **Outubro 2025**: Eclesiastes 3-4, 5-6, 7-8, 9-10, 11-12
- **Novembro 2025**: Cântico de Salomão 1-2

### **👥 Estudantes de Exemplo**
- **4 estudantes** pré-cadastrados
- **Diferentes gêneros** e privilégios
- **Qualificações S-38-T** aplicadas

---

## 🔒 **Segurança e Autenticação**

### **✅ Row Level Security (RLS)**
- **Políticas aplicadas** em todas as tabelas
- **Acesso controlado** por perfil de usuário
- **Auditoria completa** de operações

### **🔐 Controle de Acesso**
- **Instrutor**: Acesso completo ao dashboard
- **Estudante**: Apenas suas designações
- **Família**: Portal familiar limitado

---

## 🎨 **Design System**

### **🎨 Cores JW**
- **Azul JW**: `#1e3a8a` (Navy)
- **Dourado JW**: `#f59e0b` (Gold)
- **Azul Claro**: `#3b82f6` (Blue)

### **📱 Responsividade**
- **Mobile First** - Otimizado para celulares
- **Tablet** - Layout adaptativo
- **Desktop** - Interface completa

---

## 🚀 **Deploy e Produção**

### **✅ Build de Produção**
```bash
npm run build
# Gera pasta dist/ com arquivos otimizados
```

### **🌐 Deploy no Render**
- **Frontend**: Deploy automático via GitHub
- **Backend**: Servidor Node.js simplificado
- **Database**: Supabase em nuvem

---

## 📈 **Vantagens da Versão Simplificada**

### **✅ Benefícios Técnicos**
- **95% menos complexidade** - Sem scraping JW.org
- **Manutenção simplificada** - Menos dependências
- **Performance otimizada** - Carregamento mais rápido
- **Debugging facilitado** - Código mais limpo

### **✅ Benefícios para o Usuário**
- **Interface única** - Sem confusão entre dashboards
- **Programação sempre atualizada** - Baseada nos PDFs oficiais
- **Foco na designação** - Objetivo principal do sistema
- **Experiência consistente** - Menos pontos de falha

---

## 🔄 **Fluxo de Trabalho Simplificado**

### **👨‍🏫 Para o Instrutor:**
1. **Login** → Dashboard do Instrutor
2. **Selecionar semana** → Escolher programação
3. **Designar estudantes** → Arrastar e soltar
4. **Salvar** → Designações no Supabase

### **👨‍🎓 Para o Estudante:**
1. **Login** → Portal do Estudante
2. **Visualizar designações** → Suas partes da semana
3. **Preparar** → Estudar e se preparar

---

## 📞 **Suporte e Contato**

- **📧 Email**: amazonwebber007@gmail.com
- **🐛 Issues**: GitHub Issues
- **📖 Documentação**: Pasta docs/
- **🔧 Debug**: Console do navegador

---

## 🙏 **Agradecimentos**

Desenvolvido com dedicação para servir às congregações das Testemunhas de Jeová.

> *"Tudo o que fizerem, façam de todo o coração, como para Jeová, e não para homens."* — Colossenses 3:23

---

<div align="center">

**🎯 Sistema Ministerial Simplificado v2.0**  
*Foco na simplicidade, eficiência e facilidade de uso*

</div>
