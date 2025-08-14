# 🌐 Guia Completo de Tradução do Sistema Ministerial

## 📋 Visão Geral

Este documento fornece um guia completo para traduzir todo o Sistema Ministerial para múltiplos idiomas. O sistema já possui uma infraestrutura de tradução implementada usando i18next, mas muitas páginas ainda precisam ser convertidas para usar o sistema de traduções.

## 🏗️ Arquitetura de Tradução

### Estrutura Atual
```
src/
├── locales/
│   ├── pt.json    # Traduções em Português
│   └── en.json    # Traduções em Inglês
├── hooks/
│   └── useTranslation.ts    # Hook personalizado
├── contexts/
│   └── LanguageContext.tsx  # Contexto de idioma
└── i18n.ts                  # Configuração do i18next
```

### Como Funciona
- **Hook useTranslation**: `const { t } = useTranslation();`
- **Uso**: `t('chave.da.traducao')` retorna o texto traduzido
- **Estrutura JSON**: Organizadas por seções (navigation, auth, students, etc.)

## 📍 Status Atual das Rotas

### ✅ PÁGINAS JÁ TRADUZIDAS
1. **/** - Homepage (Index.tsx)
   - Hero section
   - Features
   - Benefits
   - FAQ
   - Footer

2. **/funcionalidades** - Funcionalidades.tsx
   - Página de funcionalidades completa

3. **/congregacoes** - Congregacoes.tsx
   - Página de congregações com depoimentos

### 🔄 PÁGINAS PARCIALMENTE TRADUZIDAS
4. **Header/Navigation** - Header.tsx
   - Menu principal traduzido
   - Botão de idioma funcionando

### ❌ PÁGINAS QUE PRECISAM SER TRADUZIDAS

#### Páginas Públicas
5. **/auth** - Auth.tsx
6. **/demo** - Demo.tsx
7. **/suporte** - Suporte.tsx
8. **/sobre** - Sobre.tsx
9. **/doar** - Doar.tsx

#### Páginas de Onboarding
10. **/bem-vindo** - BemVindo.tsx
11. **/configuracao-inicial** - ConfiguracaoInicial.tsx
12. **/primeiro-programa** - PrimeiroPrograma.tsx

#### Páginas do Instrutor
13. **/dashboard** - Dashboard.tsx
14. **/estudantes** - Estudantes.tsx
15. **/programas** - ProgramasOptimized.tsx
16. **/programa/:id** - ProgramaPreview.tsx
17. **/designacoes** - DesignacoesOptimized.tsx
18. **/relatorios** - Relatorios.tsx
19. **/reunioes** - Reunioes.tsx

#### Páginas do Estudante
20. **/estudante/:id** - EstudantePortal.tsx
21. **/estudante/:id/familia** - FamiliaPage.tsx

#### Páginas de Convite
22. **/convite/aceitar** - ConviteAceitar.tsx
23. **/portal-familiar** - PortalFamiliar.tsx

#### Página de Erro
24. **404** - NotFound.tsx

## 🛠️ Como Traduzir uma Página

### Passo 1: Identificar Textos Hardcoded
Procure por strings em português diretamente no código:
```tsx
// ❌ Texto hardcoded
<h1>Gestão de Estudantes</h1>
<p>Cadastre e gerencie alunos da escola</p>
```

### Passo 2: Adicionar Chaves de Tradução
Nos arquivos `src/locales/pt.json` e `src/locales/en.json`:

**pt.json:**
```json
{
  "students": {
    "title": "Gestão de Estudantes",
    "subtitle": "Cadastre e gerencie alunos da escola"
  }
}
```

**en.json:**
```json
{
  "students": {
    "title": "Student Management", 
    "subtitle": "Register and manage school students"
  }
}
```

### Passo 3: Usar o Hook de Tradução
```tsx
import { useTranslation } from '@/hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('students.title')}</h1>
      <p>{t('students.subtitle')}</p>
    </div>
  );
};
```

### Passo 4: Testar
1. Mude o idioma usando o botão no header
2. Verifique se os textos mudam corretamente
3. Procure por erros no console (chaves não encontradas)

## 📝 Convenções de Nomenclatura

### Estrutura de Chaves
```json
{
  "secao": {
    "subsecao": {
      "elemento": "Texto traduzido"
    }
  }
}
```

### Exemplos de Seções
- `common` - Textos comuns (botões, labels)
- `navigation` - Menu e navegação
- `auth` - Autenticação e login
- `students` - Gestão de estudantes
- `programs` - Programas e apostilas
- `assignments` - Designações
- `reports` - Relatórios
- `dashboard` - Dashboard
- `forms` - Formulários
- `errors` - Mensagens de erro
- `notifications` - Notificações

## 🎯 Prioridades de Tradução

### Alta Prioridade (Fluxo Principal)
1. **/auth** - Página de login
2. **/dashboard** - Dashboard principal
3. **/estudantes** - Gestão de estudantes
4. **/programas** - Gestão de programas
5. **/designacoes** - Designações

### Média Prioridade (Onboarding)
6. **/bem-vindo** - Boas-vindas
7. **/configuracao-inicial** - Configuração
8. **/primeiro-programa** - Tutorial

### Baixa Prioridade (Páginas Secundárias)
9. **/suporte** - Suporte
10. **/sobre** - Sobre
11. **/doar** - Doações

## 🔧 Componentes que Precisam de Tradução

### Componentes de UI Reutilizáveis
- `EstudanteForm.tsx` - Formulário de estudante
- `EstudanteCard.tsx` - Card de estudante
- `AssignmentEditModal.tsx` - Modal de edição
- `AssignmentPreviewModal.tsx` - Modal de preview
- `PdfUpload.tsx` - Upload de PDF
- `SpreadsheetUpload.tsx` - Upload de planilha

### Componentes de Layout
- `QuickActions.tsx` - Ações rápidas
- `MeetingManagement.tsx` - Gestão de reuniões
- `StudentAssignmentView.tsx` - Visualização de designações

### Toolbars e Navegação
- `EstudantesToolbar.tsx`
- `ProgramasToolbar.tsx`
- `DesignacoesToolbar.tsx`
- `MobileNavigation.tsx`

## 📋 Checklist de Tradução por Página

### Para cada página, verificar:
- [ ] Títulos e subtítulos
- [ ] Labels de formulários
- [ ] Textos de botões
- [ ] Mensagens de erro
- [ ] Tooltips e ajuda
- [ ] Placeholders de inputs
- [ ] Textos de confirmação
- [ ] Breadcrumbs
- [ ] Estados vazios (empty states)
- [ ] Loading states
- [ ] Notificações/toasts

## 🚨 Problemas Comuns e Soluções

### 1. Chave não encontrada
**Erro:** `i18next::translator: missingKey pt translation chave.inexistente`
**Solução:** Adicionar a chave nos arquivos de locale

### 2. Objeto renderizado como React child
**Erro:** `Objects are not valid as a React child`
**Solução:** Usar strings simples, não objetos nas traduções

### 3. Pluralização
**Problema:** "1 estudantes" vs "2 estudante"
**Solução:** Usar lógica condicional:
```tsx
{count} {count === 1 ? t('student') : t('students')}
```

### 4. Interpolação de variáveis
```json
{
  "welcome": "Bem-vindo, {{name}}!"
}
```
```tsx
t('welcome', { name: userName })
```

## 🔄 Fluxo de Trabalho Recomendado

### 1. Análise
- Abrir a página no navegador
- Identificar todos os textos visíveis
- Listar textos hardcoded no código

### 2. Planejamento
- Definir estrutura de chaves JSON
- Organizar por seções lógicas
- Considerar reutilização de textos

### 3. Implementação
- Adicionar chaves nos locales
- Substituir textos hardcoded
- Importar useTranslation

### 4. Teste
- Testar mudança de idioma
- Verificar console por erros
- Validar todos os estados da página

### 5. Revisão
- Verificar qualidade das traduções
- Testar em diferentes tamanhos de tela
- Confirmar que nada quebrou

## 📊 Progresso Atual

### Estatísticas
- **Páginas Traduzidas:** 3/24 (12.5%)
- **Componentes Traduzidos:** ~15/50 (30%)
- **Idiomas Suportados:** 2 (PT, EN)

### Próximos Passos
1. Traduzir página de autenticação (/auth)
2. Traduzir dashboard principal
3. Traduzir gestão de estudantes
4. Traduzir gestão de programas
5. Traduzir sistema de designações

## 🎯 Meta Final

**Objetivo:** Sistema 100% bilíngue (Português/Inglês) com possibilidade de adicionar novos idiomas facilmente.

**Critério de Sucesso:** 
- Usuário pode navegar todo o sistema em qualquer idioma
- Nenhum texto hardcoded em português
- Mudança de idioma funciona em tempo real
- Todas as mensagens de erro traduzidas
- Formulários e validações traduzidos

---

## 📞 Suporte

Para dúvidas sobre tradução:
1. Consulte este documento
2. Verifique exemplos nas páginas já traduzidas
3. Teste sempre em ambos os idiomas
4. Mantenha consistência nas traduções

**Lembre-se:** A tradução não é apenas trocar palavras, mas adaptar a experiência do usuário para diferentes culturas e idiomas.