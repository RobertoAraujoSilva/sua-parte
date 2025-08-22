# Respostas às Perguntas-Chave sobre Arquitetura do Sistema

## 📅 Programação (Admin)

### 1. O Admin Dashboard sempre carrega a programação diretamente dos PDFs oficiais (MWB), ou pode também vir de uma API centralizada já processada em JSON?

O Admin Dashboard pode carregar programação de ambas as fontes:
- **PDFs oficiais**: Através do componente `PdfUpload` que faz parsing automático de arquivos MWB
- **API centralizada**: O sistema suporta importação via `JWContentParser` que permite colar conteúdo diretamente do site JW.org

O sistema processa automaticamente os dados extraídos e os armazena no banco de dados Supabase, permitindo acesso posterior sem necessidade de reprocessamento.

### 2. Caso um novo PDF seja lançado (ex.: 5 meses à frente), o Admin deve atualizar automaticamente a agenda ou precisa de um processo manual de importação?

Atualmente, o processo é **manual**:
- O Admin precisa fazer upload do novo PDF através do componente `PdfUpload`
- O sistema faz parsing automático do conteúdo
- Não há verificação automática de novos materiais (embora haja menção a um serviço de "verificação de atualizações" no backend)

Há potencial para implementação de atualização automática através do serviço de backend mencionado em `backend/README.md`.

### 3. O Admin pode editar a programação (corrigir títulos, tempos, etc.) ou deve ser somente leitura, mantendo total fidelidade ao MWB?

O Admin pode **editar** a programação:
- Após a importação, os programas são armazenados no banco de dados
- É possível visualizar, editar e deletar programas
- O sistema permite regenerar designações para programas existentes
- Há controles de status (`pending`, `generated`, `approved`) que permitem revisão antes da aprovação final

## 🏠 Congregações (Instrutor)

### 4. Cada congregação herda a mesma programação do Admin — mas um Instrutor pode alterar a ordem ou remover partes, ou apenas atribuir nomes?

O Instrutor pode:
- **Atribuir nomes** aos estudantes para cada parte da programação
- **Visualizar e revisar** as designações geradas automaticamente
- **Confirmar ou regerar** as designações conforme necessário

Não há evidência de funcionalidade para alterar a ordem ou remover partes da programação original - o foco está na atribuição de estudantes às partes existentes.

### 5. Quando um Instrutor faz designações, isso afeta apenas a congregação dele, certo? (nunca global).

**Correto**. Cada congregação tem seus próprios dados isolados:
- O sistema utiliza Row Level Security (RLS) no Supabase para isolar dados por usuário/congregação
- As designações são vinculadas ao `user_id` do instrutor
- Não há compartilhamento de designações entre congregações

### 6. Se dois instrutores editarem ao mesmo tempo, existe algum controle de conflitos (ex.: lock, revisão, última gravação vence)?

Não há menção a um sistema sofisticado de controle de conflitos:
- O sistema utiliza um modelo de "última gravação vence" implícito através do banco de dados
- Não há locks de edição ou sistema de revisão de conflitos
- O IndexedDB para offline funciona com um sistema de "outbox" para sincronização posterior, mas não resolve conflitos complexos

## 👨‍🎓 Estudantes

### 7. A lista de estudantes é independente por congregação ou pode haver compartilhamento (ex.: mesmo estudante em duas congregações)?

A lista de estudantes é **independente por congregação**:
- Cada estudante pertence a uma única congregação (vinculada ao `user_id`)
- O sistema utiliza RLS para garantir que cada instrutor veja apenas os estudantes de sua congregação
- Não há funcionalidade para compartilhamento de estudantes entre congregações

### 8. Os estudantes têm restrições automáticas (ex.: não repetir a mesma parte em 2 semanas seguidas)?

Sim, o sistema tem restrições automáticas robustas:
- **Balanceamento histórico**: O sistema considera as últimas 8 semanas de designações para evitar sobrecarga
- **Regras S-38-T**: Validação automática de qualificações por tipo de parte
- **Relacionamentos familiares**: Verificação para pares de gêneros diferentes
- **Distribuição equitativa**: Algoritmo de balanceamento para distribuir designações de forma justa

### 9. É permitido ao Instrutor sobrescrever designações sugeridas pelo sistema ou elas devem ser "fixas"?

O Instrutor pode **revisar e regerar** as designações:
- As designações geradas automaticamente ficam em status "rascunho" até serem aprovadas
- É possível regerar designações quantas vezes forem necessárias
- O sistema mostra prévia das designações antes da confirmação final
- Após aprovação, ainda é possível editar manualmente no banco de dados

## 🔄 Sincronização / Offline

### 10. Quando offline, o Instrutor deve poder ver e editar designações — e ao voltar online, elas sincronizam automaticamente?

Sim, o sistema tem capacidades offline robustas:
- **IndexedDB**: Armazena estudantes, programas e designações localmente
- **Outbox pattern**: Operações pendentes são armazenadas para sincronização posterior
- **Fallback automático**: Quando offline, o sistema tenta carregar dados do cache local
- **Sincronização manual**: Botão para sincronizar alterações pendentes

### 11. Em caso de conflito na sincronização (ex.: 2 instrutores designam o mesmo estudante na mesma parte, offline), qual deve ser a regra? Último vence? Avisar conflito?

O sistema atual implementa um modelo de **"último vence"**:
- O sistema de outbox armazena operações localmente
- Na sincronização, as operações são aplicadas em ordem
- Não há detecção automática de conflitos complexos
- O sistema não avisa sobre conflitos - simplesmente aplica as alterações

### 12. O Admin também precisa de modo offline, ou só o Instrutor?

Ambos precisam, e o sistema suporta:
- O Admin Dashboard também pode funcionar offline
- Dados são armazenados localmente via IndexedDB
- Funcionalidade de download de dados para uso offline disponível para ambos os perfis
- Interface mostra status de conexão e contagem de operações pendentes

## 📤 PDFs e Exportação

### 13. O PDF exportado do Admin traz só a agenda global ou pode incluir notas internas?

O PDF exportado pode incluir informações detalhadas:
- **Designações completas**: Estudantes atribuídos a cada parte
- **Detalhes das partes**: Títulos, tempos, tipos
- **Informações dos estudantes**: Nomes, cargos
- **Ajudantes**: Quando aplicável, informações dos ajudantes

Não há menção específica a "notas internas", mas todas as informações estruturadas são incluídas.

### 14. O PDF do Instrutor traz nomes dos estudantes designados ou deve ser possível gerar uma versão "sem nomes"?

Atualmente, o PDF inclui **nomes dos estudantes designados**:
- O sistema gera PDFs com todas as informações das designações
- Não há opção configurável para gerar versão sem nomes
- O PDF é destinado principalmente para uso interno do instrutor

### 15. O formato do PDF deve ser idêntico ao modelo oficial (como no MWB) ou pode ter ajustes visuais?

O formato do PDF pode ter **ajustes visuais**:
- O sistema gera PDFs com layout próprio otimizado para visualização das designações
- Não tenta replicar exatamente o formato do MWB oficial
- O foco está na clareza das informações das designações e não na fidelidade visual ao documento original
