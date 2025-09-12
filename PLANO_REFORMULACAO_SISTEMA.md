# 📋 PLANO DE REFORMULAÇÃO - SISTEMA MINISTERIAL SIMPLIFICADO

## 🎯 OBJETIVO
Eliminar a complexidade do Admin Dashboard e centralizar tudo no **Dashboard do Instrutor**, usando programação mockada dos PDFs oficiais.

## 🔄 MUDANÇAS ARQUITETURAIS

### ❌ O QUE SERÁ REMOVIDO
- **Admin Dashboard completo** (`src/pages/AdminDashboard.tsx`, `src/components/admin/*`)
- **Sistema de download/scraping JW.org** (rotas backend, parsers automáticos)
- **Publicação de programas** (upload para congregações)
- **Gestão de múltiplas congregações**
- **Sistema de aprovação/moderação**

### ✅ O QUE SERÁ MANTIDO/SIMPLIFICADO
- **Dashboard do Instrutor** (painel principal)
- **Portal do Estudante** (visualização de designações)
- **Autenticação Supabase** (login/logout)
- **CRUD de estudantes** (cadastro local)
- **Sistema de designações** (atribuir estudantes às partes)

## 📊 NOVA ARQUITETURA

```
┌─────────────────────────────────────────────────┐
│                 SISTEMA SIMPLIFICADO            │
├─────────────────────────────────────────────────┤
│  👨‍🏫 INSTRUTOR DASHBOARD (Principal)            │
│  ├── Programação mockada (JSON dos PDFs)        │
│  ├── Lista de estudantes locais                 │
│  └── Interface de designação                    │
├─────────────────────────────────────────────────┤
│  👨‍🎓 ESTUDANTE PORTAL                           │
│  ├── Login pessoal                              │
│  └── Visualização das suas designações          │
├─────────────────────────────────────────────────┤
│  🗄️ BACKEND SIMPLIFICADO                        │
│  ├── Auth (Supabase)                            │
│  ├── CRUD Estudantes                            │
│  └── CRUD Designações                           │
└─────────────────────────────────────────────────┘
```

## 📁 NOVA ESTRUTURA DE ARQUIVOS

```
sua-parte/
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── Auth.tsx                    # Login unificado
│   │   ├── InstructorDashboard.tsx     # Painel principal
│   │   └── StudentDashboard.tsx        # Portal estudante
│   ├── 📁 components/
│   │   ├── ProgramacaoViewer.tsx       # Exibe programação mockada
│   │   ├── DesignacaoManager.tsx       # Interface designação
│   │   └── EstudantesList.tsx          # Lista estudantes
│   ├── 📁 data/
│   │   └── programacoes-setembro-2025.json  # Mock das 4 semanas
│   └── 📁 hooks/
│       ├── useEstudantes.ts            # CRUD estudantes
│       └── useDesignacoes.ts           # CRUD designações
├── 📁 backend/
│   ├── server.js                       # API básica
│   ├── routes/
│   │   ├── estudantes.js               # CRUD estudantes
│   │   └── designacoes.js              # CRUD designações
│   └── middleware/auth.js              # Middleware Supabase
├── 📁 docs/Oficial/
│   ├── mwb_E_202507.pdf               # PDFs originais
│   ├── mwb_T_202601.pdf
│   ├── mwb_E_202511.pdf
│   ├── mwb_E_202509.pdf
│   └── programacoes-json/             # JSONs extraídos
└── README.md                          # Documentação atualizada
```

## 🚀 FLUXO SIMPLIFICADO

### 👨‍🏫 Instrutor
1. **Login** → Dashboard Instrutor
2. **Visualiza** programação da semana (mockada)
3. **Designa** estudantes para cada parte
4. **Salva** designações no Supabase

### 👨‍🎓 Estudante  
1. **Login** → Portal Estudante
2. **Visualiza** suas designações pessoais
3. **Acessa** referências e materiais

## 📋 TAREFAS DE IMPLEMENTAÇÃO

### 🗑️ FASE 1: LIMPEZA (Remover Admin)
- [ ] Excluir `src/pages/AdminDashboard.tsx`
- [ ] Excluir `src/components/admin/*`
- [ ] Remover rotas `/admin` do roteador
- [ ] Excluir hooks de download/scraping
- [ ] Limpar backend (rotas de publicação)

### 🏗️ FASE 2: MOCK DA PROGRAMAÇÃO
- [ ] Criar `programacoes-setembro-2025.json` com as 4 semanas
- [ ] Implementar `ProgramacaoViewer.tsx`
- [ ] Integrar JSON no `InstructorDashboard.tsx`

### 🎯 FASE 3: SISTEMA DE DESIGNAÇÃO
- [ ] Criar `DesignacaoManager.tsx`
- [ ] Implementar drag-and-drop de estudantes
- [ ] Salvar designações no Supabase
- [ ] Exibir designações no `StudentDashboard.tsx`

### 📚 FASE 4: DOCUMENTAÇÃO
- [ ] Atualizar README.md
- [ ] Criar guia de uso simplificado
- [ ] Documentar estrutura JSON

## 📄 ESTRUTURA DO JSON (Programação Mockada)

```json
{
  "mes": "setembro-2025",
  "semanas": [
    {
      "periodo": "8-14 de setembro 2025",
      "tema": "Provérbios 30",
      "programacao": [
        {
          "secao": "Tesouros da Palavra de Deus",
          "partes": [
            {
              "id": "tpd_1",
              "titulo": "Não me dês nem pobreza nem riquezas",
              "duracao": 10,
              "tipo": "consideracao",
              "designado": null
            },
            {
              "id": "tpd_2", 
              "titulo": "Joias espirituais",
              "duracao": 10,
              "tipo": "participacao",
              "designado": null
            },
            {
              "id": "tpd_3",
              "titulo": "Leitura da Bíblia",
              "duracao": 4,
              "referencias": "Prov. 30:1-14",
              "tipo": "leitura",
              "designado": null
            }
          ]
        }
      ]
    }
  ]
}
```

## 🎯 VANTAGENS DA REFORMULAÇÃO

✅ **Menos complexidade** - Apenas 2 dashboards (Instrutor + Estudante)  
✅ **Desenvolvimento mais rápido** - Foco apenas na designação  
✅ **Menos bugs** - Sem scraping, sem sincronização complexa  
✅ **Fonte confiável** - PDFs oficiais como base  
✅ **Manutenção simples** - Atualizar JSON quando sair novo PDF  

## 📅 CRONOGRAMA ESTIMADO

- **Semana 1**: Limpeza (remover Admin Dashboard)
- **Semana 2**: Mock da programação + JSON
- **Semana 3**: Sistema de designação
- **Semana 4**: Testes + documentação

## 🚦 CRITÉRIOS DE ACEITE

- [ ] Admin Dashboard completamente removido
- [ ] Instrutor consegue ver programação das 4 semanas de setembro
- [ ] Instrutor consegue designar estudantes às partes
- [ ] Estudante consegue ver suas designações pessoais
- [ ] Sistema funciona offline (dados locais)
- [ ] Documentação atualizada

---

**🎯 Resultado Final**: Sistema focado, simples e funcional, onde o Instrutor é o centro das operações e os estudantes apenas visualizam suas designações.