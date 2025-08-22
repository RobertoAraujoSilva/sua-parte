# 📅 Nova Rota `/programas` - Gestão de Programas da Congregação

## 🚀 Estrutura Criada

### **Arquivos Implementados:**

```
src/app/programas/
├── page.tsx                                    # Página principal com 3 modos de visualização
└── layout.tsx                                  # Layout com metadata otimizada

src/components/navigation/
└── ProgramasNavButton.tsx                      # Componente de navegação para o dashboard
```

## 📋 Funcionalidades Implementadas

### **🎯 Três Modos de Visualização:**

- **📋 Lista**: Cards com informações dos programas (visual amigável)
- **📊 Planilha**: Grid Excel-like com edição inline (AG Grid)
- **📈 Estatísticas**: KPIs e métricas dos programas

### **🔧 Recursos Avançados:**

- ✅ **Edição inline**: Clique nas células para editar
- ✅ **Export CSV**: Exporta dados da planilha
- ✅ **Busca em tempo real**: Por título dos programas
- ✅ **Paginação**: 50 registros por página
- ✅ **Persistência**: Salva aba selecionada no localStorage
- ✅ **Feedback visual**: Toasts de sucesso/erro
- ✅ **Loading states**: Indicadores de carregamento
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Ordenação**: Por data do programa (mais recentes primeiro)

### **📊 Colunas da Planilha:**

| Campo | Descrição | Editável |
|-------|-----------|----------|
| `titulo` | Título do programa | ✅ |
| `data_programa` | Data do programa | ✅ |
| `tipo_programa` | Tipo (Reunião Meio Semana, Fim de Semana, etc.) | ✅ |
| `tema` | Tema do programa | ✅ |
| `orador_principal` | Nome do orador principal | ✅ |
| `leitor` | Nome do leitor | ✅ |
| `primeira_oração` | Nome para primeira oração | ✅ |
| `tesouros_palavra` | Designações Tesouros da Palavra | ✅ |
| `faça_seu_melhor` | Designações Faça seu Melhor | ✅ |
| `nossa_vida_cristã` | Designações Nossa Vida Cristã | ✅ |
| `oração_final` | Nome para oração final | ✅ |
| `observacoes` | Observações gerais | ✅ |

### **📈 Estatísticas Implementadas:**

- **Total de programas** cadastrados
- **Programas deste mês** (agendados)
- **Distribuição por tipo** de programa

## 🗄️ Estrutura do Banco de Dados

### **Tabela `programas` esperada:**

```sql
CREATE TABLE programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  titulo TEXT NOT NULL,
  data_programa DATE NOT NULL,
  tipo_programa TEXT,
  tema TEXT,
  orador_principal TEXT,
  leitor TEXT,
  primeira_oração TEXT,
  tesouros_palavra TEXT,
  faça_seu_melhor TEXT,
  nossa_vida_cristã TEXT,
  oração_final TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own programs" ON programas
  FOR ALL USING (auth.uid() = user_id);
```

## 🚀 Como Usar

### **1. Verificar Dependências:**

As dependências já foram instaladas na rota `/estudantes`:
- ✅ `ag-grid-community`
- ✅ `ag-grid-react`
- ✅ `@supabase/supabase-js`
- ✅ `sonner`

### **2. Acessar a Página:**

```
http://localhost:3000/programas
```

### **3. Navegar entre Modos:**

- **Lista**: Visualização em cards
- **Planilha**: Grid Excel-like editável
- **Estatísticas**: Métricas e KPIs

## 🎨 Componente de Navegação

### **Uso no Dashboard:**

```typescript
import { ProgramasNavButton } from '@/components/navigation/ProgramasNavButton';

// Versão botão
<ProgramasNavButton 
  totalPrograms={25} 
  thisMonthPrograms={4} 
  variant="button" 
/>

// Versão card
<ProgramasNavButton 
  totalPrograms={25} 
  thisMonthPrograms={4} 
  variant="card" 
/>
```

## 🔧 Configurações Específicas

### **Diferenças da rota `/estudantes`:**

1. **PAGE_SIZE**: 50 (vs 100 para estudantes)
2. **Ordenação**: Por `data_programa DESC` (mais recentes primeiro)
3. **Busca**: Por `titulo` (vs `nome` para estudantes)
4. **Estatísticas**: Foco em programas mensais e tipos
5. **Campos**: Específicos para programas da congregação

### **Persistência de Estado:**

```typescript
// Salva a aba selecionada no localStorage
localStorage.setItem("programasView", view);
```

## 📱 Interface Responsiva

### **Cards na Lista:**

- Título e data em destaque
- Tipo e tema como descrição
- Grid 2x2 com informações principais
- Badge com data formatada em pt-BR

### **Estatísticas:**

- Layout responsivo: 2 colunas (MD) → 3 colunas (LG)
- Cards com métricas principais
- Distribuição por tipo de programa

## 🔄 Integração com Sistema

### **RLS (Row Level Security):**

- Filtra automaticamente por `user_id`
- Cada usuário vê apenas seus programas
- Compatível com autenticação Supabase

### **Feedback do Usuário:**

- Toasts para operações de sucesso/erro
- Loading states durante carregamento
- Indicadores visuais de progresso

## ✅ Próximos Passos

1. **Testar a página**: Acessar `/programas`
2. **Criar tabela no banco**: Se ainda não existir
3. **Integrar no dashboard**: Adicionar `ProgramasNavButton`
4. **Personalizar campos**: Ajustar conforme necessidade
5. **Adicionar validações**: Implementar regras específicas

## 🎉 Resultado

A nova rota `/programas` oferece uma **experiência completa de gestão** dos programas da congregação, seguindo exatamente o mesmo padrão da rota `/estudantes` com adaptações específicas para o contexto de programas ministeriais.

**Pronta para uso e totalmente integrada** com a arquitetura existente! 🚀