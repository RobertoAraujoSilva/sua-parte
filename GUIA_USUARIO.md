# 👥 Sistema Ministerial - Guia do Usuário

> **Manual completo para instrutores e estudantes**

---

## 🎯 Introdução

O Sistema Ministerial é uma plataforma web desenvolvida para facilitar a gestão de designações da Escola do Ministério Teocrático. Este guia apresenta todas as funcionalidades disponíveis para cada tipo de usuário.

---

## 🔐 Primeiros Passos

### 1. Acesso ao Sistema
- **URL**: `http://localhost:3000` (desenvolvimento)
- **Navegadores suportados**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, mobile

### 2. Criação de Conta
1. Acesse a página inicial
2. Clique em "Criar Conta"
3. Preencha os dados solicitados
4. Confirme o email recebido
5. Faça login com suas credenciais

### 3. Tipos de Usuário
- **👨‍🏫 Instrutor**: Acesso completo ao sistema
- **👨‍🎓 Estudante**: Acesso ao portal do estudante
- **🔧 Desenvolvedor**: Acesso a ferramentas de debug

---

## 👨‍🏫 Guia do Instrutor

### Dashboard Principal

#### Visão Geral
- **Estatísticas em tempo real**
- **Ações rápidas** para tarefas comuns
- **Notificações** importantes
- **Acesso direto** às principais funcionalidades

#### Navegação
- **Dashboard**: Página inicial com resumo
- **Estudantes**: Gestão completa de estudantes
- **Programas**: Importação e gestão de programas
- **Designações**: Visualização e edição de designações
- **Relatórios**: Estatísticas e análises

### 👥 Gestão de Estudantes

#### Cadastro Individual
1. Acesse **Estudantes** → **Novo**
2. Preencha os campos obrigatórios:
   - **Nome completo**
   - **Idade**
   - **Gênero** (Masculino/Feminino)
   - **Cargo** (Estudante Novo, Publicador, etc.)
3. Campos opcionais:
   - **Email** (para notificações)
   - **Telefone**
   - **Data do batismo**
   - **Observações**
4. Clique em **Salvar**

#### Importação em Massa
1. Acesse **Estudantes** → **Importar**
2. Baixe o **template Excel**
3. Preencha a planilha com os dados
4. Faça upload do arquivo
5. Revise os dados importados
6. Confirme a importação

#### Planilha Editável (NOVA FUNCIONALIDADE)
1. Acesse **Estudantes** → **Planilha**
2. **Visualize todos os estudantes** em formato de planilha
3. **Edite qualquer campo** clicando duplo na célula
4. **Navegue com Tab** entre as células
5. **Dados são salvos automaticamente** ao sair da célula
6. **Use filtros** para encontrar estudantes específicos
7. **Redimensione colunas** conforme necessário

**Dicas da Planilha:**
- ✅ Edição inline de todos os campos
- ✅ Salvamento automático no banco
- ✅ Altura das linhas se ajusta ao conteúdo
- ✅ Quebra de texto em observações longas
- ✅ Validação em tempo real
- ✅ Desfazer com Ctrl+Z

#### Gestão Familiar
1. **Cadastre o responsável** primeiro
2. **Adicione familiares** através do botão "Adicionar Familiar"
3. **Envie convites** por email para familiares
4. **Gerencie relacionamentos** na aba "Família"

### 📊 Gestão de Programas

#### Importação de PDF
1. Acesse **Programas** → **Importar Novo Programa**
2. **Selecione o PDF** da apostila oficial
3. O sistema **extrai automaticamente**:
   - Data da semana
   - Mês da apostila
   - Partes do programa
   - Tempos de cada parte
4. **Revise os dados** extraídos
5. **Salve o programa**

#### Importação via JW.org
1. Acesse **Programas** → **Importar do JW.org**
2. **Copie o conteúdo** da reunião do site JW.org
3. **Cole no campo** de texto
4. Clique em **Analisar Conteúdo**
5. **Revise e salve** o programa

#### Geração de Designações
1. **Selecione um programa** importado
2. Clique em **Gerar Designações**
3. O sistema **automaticamente**:
   - Distribui as partes entre os estudantes
   - Respeita qualificações e restrições
   - Evita repetições excessivas
   - Balanceia participações
4. **Revise as designações** geradas
5. **Edite individualmente** se necessário
6. **Aprove o programa** quando satisfeito

#### Geração de PDF
1. **Acesse um programa aprovado**
2. Clique em **Baixar PDF**
3. O PDF gerado contém:
   - **Cabeçalho** com informações do programa
   - **Lista completa** de designações
   - **Nomes dos designados** claramente visíveis
   - **Tempos e tipos** de cada parte
   - **Formatação profissional** para impressão

### 📈 Relatórios e Estatísticas

#### Dashboard de Estatísticas
- **Total de estudantes** cadastrados
- **Estudantes ativos/inativos**
- **Distribuição por cargo**
- **Distribuição por gênero**
- **Menores de idade**

#### Painel do Instrutor
1. Acesse **Estudantes** → **Painel do Instrutor**
2. Visualize estudantes organizados por:
   - **Nível de progresso**
   - **Tipos de discurso**
   - **Qualificações**
3. **Arraste e solte** para reorganizar
4. **Atualize qualificações** diretamente

---

## 👨‍🎓 Guia do Estudante

### Portal do Estudante

#### Acesso
1. Faça login com suas credenciais
2. Será redirecionado automaticamente para o **Portal do Estudante**

#### Funcionalidades Disponíveis

##### Minhas Designações
- **Visualize suas designações** atuais e futuras
- **Detalhes de cada parte**:
  - Data da reunião
  - Tipo de parte
  - Tempo disponível
  - Ajudante (se aplicável)
- **Status de confirmação**

##### Histórico
- **Histórico completo** de participações
- **Estatísticas pessoais**
- **Progresso ao longo do tempo**

##### Perfil
- **Visualize seus dados** cadastrais
- **Solicite alterações** ao instrutor
- **Atualize informações** de contato

---

## 🔧 Funcionalidades Avançadas

### Sistema de Notificações
- **Email automático** para novas designações
- **Lembretes** antes das reuniões
- **Confirmações** de recebimento

### Gestão de Convites Familiares
1. **Instrutor envia convite** por email
2. **Familiar recebe link** de cadastro
3. **Familiar se cadastra** automaticamente
4. **Relacionamento familiar** é estabelecido

### Backup e Exportação
- **Exportação de dados** em Excel
- **Backup automático** no Supabase
- **Histórico de alterações**

---

## 💡 Dicas e Truques

### Para Instrutores

#### Otimização do Fluxo de Trabalho
1. **Importe estudantes** em massa via Excel
2. **Use a planilha editável** para atualizações rápidas
3. **Importe programas** diretamente do JW.org
4. **Revise designações** antes de aprovar
5. **Gere PDFs** para distribuição

#### Melhores Práticas
- ✅ **Mantenha dados atualizados** regularmente
- ✅ **Revise qualificações** dos estudantes
- ✅ **Balanceie participações** manualmente quando necessário
- ✅ **Use observações** para notas importantes
- ✅ **Aprove programas** apenas após revisão completa

### Para Estudantes

#### Acompanhamento
- ✅ **Verifique regularmente** suas designações
- ✅ **Confirme recebimento** quando solicitado
- ✅ **Mantenha dados** de contato atualizados
- ✅ **Comunique indisponibilidades** ao instrutor

---

## 🆘 Solução de Problemas

### Problemas Comuns

#### Login não funciona
1. **Verifique email e senha**
2. **Confirme email** se necessário
3. **Use "Esqueci minha senha"** se necessário
4. **Limpe cache** do navegador

#### Dados não aparecem
1. **Recarregue a página** (F5)
2. **Verifique conexão** com internet
3. **Aguarde alguns segundos** (carregamento)
4. **Entre em contato** com suporte

#### Erro ao importar arquivo
1. **Verifique formato** do arquivo (PDF/Excel)
2. **Confirme tamanho** (máximo 10MB)
3. **Use template oficial** para Excel
4. **Tente arquivo diferente**

#### Planilha não salva
1. **Aguarde confirmação** (toast verde)
2. **Verifique conexão** com internet
3. **Recarregue página** se necessário
4. **Tente novamente** a edição

### Contato para Suporte
- 📧 **Email**: amazonwebber007@gmail.com
- 🐛 **Reportar bug**: GitHub Issues
- 📖 **Documentação**: Pasta docs/ do projeto

---

## 📱 Uso em Dispositivos Móveis

### Compatibilidade
- ✅ **Smartphones** (iOS/Android)
- ✅ **Tablets** (iPad/Android)
- ✅ **Interface responsiva**
- ✅ **Touch-friendly**

### Limitações Mobile
- ⚠️ **Planilha editável** melhor em desktop
- ⚠️ **Upload de arquivos** pode ser limitado
- ⚠️ **Algumas funcionalidades** otimizadas para desktop

---

## 🔒 Segurança e Privacidade

### Proteção de Dados
- 🔐 **Dados criptografados** em trânsito e repouso
- 🔐 **Acesso restrito** por usuário
- 🔐 **Backup seguro** automático
- 🔐 **Logs de auditoria**

### Boas Práticas de Segurança
- ✅ **Use senhas fortes**
- ✅ **Não compartilhe credenciais**
- ✅ **Faça logout** em computadores públicos
- ✅ **Mantenha dados atualizados**

---

## 📞 Suporte e Treinamento

### Recursos Disponíveis
- 📖 **Documentação completa**
- 🎥 **Tutoriais em vídeo** (em desenvolvimento)
- 💬 **Suporte por email**
- 🔧 **Treinamento personalizado**

### Horários de Suporte
- **Segunda a Sexta**: 9h às 18h
- **Resposta em**: até 24 horas
- **Urgências**: contato direto

---

*Guia atualizado em: Janeiro 2025*
*Versão do sistema: 1.0.0*

---

**🙏 Desenvolvido com dedicação para servir às congregações das Testemunhas de Jeová**