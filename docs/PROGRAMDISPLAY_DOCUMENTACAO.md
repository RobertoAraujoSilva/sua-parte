# Documentação do Componente ProgramDisplay

## Visão Geral

O componente `ProgramDisplay` é responsável por exibir a programação semanal de reuniões ministeriais no sistema Sua-Parte. Ele apresenta uma interface visual padronizada e intuitiva para visualizar as partes da reunião, seus designados e assistentes, seguindo o modelo S-38-T.

## Problema Resolvido

O componente resolve os seguintes problemas:

- **Falta de padronização:** Fornece um modelo visual claro e consistente para todas as congregações.
- **Designações manuais propensas a erro:** Destaca visualmente campos que precisam ser preenchidos localmente.
- **Dificuldade de navegação entre semanas:** Permite navegar facilmente entre programações passadas e futuras.
- **Ausência de feedback visual:** Utiliza cores, badges e ícones para destacar tipos de partes e status de designação.

## Propriedades (Props)

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|------------|
| `partes` | `ParteProgramaS38T[]` | Sim | Array de partes da programação semanal |
| `designacoes` | `DesignacaoComEstudantes[]` | Não | Array de designações associadas às partes |
| `dataInicioSemana` | `string` | Sim | Data de início da semana no formato DD/MM/YYYY |
| `isEditable` | `boolean` | Não | Define se as designações podem ser editadas |
| `onEditDesignacao` | `(designacao: DesignacaoComEstudantes) => void` | Não | Função chamada ao clicar no botão de editar |
| `onNavigatePrevious` | `() => void` | Não | Função para navegar para a semana anterior |
| `onNavigateNext` | `() => void` | Não | Função para navegar para a próxima semana |
| `loading` | `boolean` | Não | Indica se os dados estão sendo carregados |

## Estados Visuais

O componente possui diferentes estados visuais para lidar com diferentes cenários:

1. **Estado de Carregamento (Loading):** Exibe um skeleton de carregamento enquanto os dados estão sendo buscados.
2. **Estado Vazio (Empty):** Exibe uma mensagem quando não há programação disponível para a semana.
3. **Estado Normal:** Exibe a tabela completa com todas as partes e designações.

## Recursos Visuais

- **Badges Coloridos:** Cada tipo de parte possui uma cor específica para fácil identificação.
- **Destaque para Designações Pendentes:** Linhas com fundo amarelo para partes que precisam de designação local.
- **Navegação entre Semanas:** Botões para navegar entre semanas anteriores e posteriores.
- **Informações Detalhadas:** Exibe número da parte, título, tipo, tempo, designado e assistente.

## Exemplo de Uso

```tsx
import { ProgramDisplay } from '@/components/programs/ProgramDisplay';
import { useState } from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProgramaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Formatar data para exibição
  const dataInicioSemana = format(currentWeek, 'dd/MM/yyyy', { locale: ptBR });
  
  // Funções de navegação
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };
  
  // Função para editar designação
  const handleEditDesignacao = (designacao) => {
    console.log('Editar designação:', designacao);
    // Implementar lógica de edição
  };
  
  return (
    <div className="container mx-auto py-6">
      <ProgramDisplay
        partes={partesExemplo}
        designacoes={designacoesExemplo}
        dataInicioSemana={dataInicioSemana}
        isEditable={true}
        onEditDesignacao={handleEditDesignacao}
        onNavigatePrevious={handlePreviousWeek}
        onNavigateNext={handleNextWeek}
        loading={loading}
      />
    </div>
  );
}
```

## Comportamentos Especiais

### Destaque para Designações Pendentes

O componente utiliza a função `needsLocalAssignment` para determinar se uma parte precisa de designação local. Uma parte é destacada com fundo amarelo quando:

- Não há estudante designado para a parte
- A parte requer ajudante, mas não há ajudante designado

### Badges por Tipo de Parte

Cada tipo de parte possui uma cor específica definida pela função `getBadgeColorByType`, facilitando a identificação visual rápida:

- **Leitura Bíblica:** Azul
- **Discurso:** Verde
- **Demonstração:** Roxo
- **Tesouros da Palavra:** Vermelho
- **Joias Espirituais:** Amarelo
- **Vida Cristã:** Laranja
- **Outros tipos:** Cinza

## Considerações de Performance

- O componente utiliza renderização condicional para evitar problemas com dados ausentes.
- Implementa estados de fallback para carregamento e ausência de dados.
- Utiliza componentes de UI reutilizáveis do sistema de design.

## Integração com o Sistema

O componente `ProgramDisplay` é utilizado em várias partes do sistema:

1. **Página de Programas:** Para visualizar e gerenciar programações semanais.
2. **Dashboard do Instrutor:** Para visualização rápida das próximas programações.
3. **Página de Prévia de Programa:** Para revisar programações antes de finalizar.

## Manutenção e Evolução

Ao modificar este componente, considere:

- Manter a compatibilidade com o modelo S-38-T
- Preservar os destaques visuais para campos que precisam de atenção
- Garantir que a navegação entre semanas continue funcionando
- Testar com diferentes quantidades de dados e em diferentes dispositivos

---

> Esta documentação serve como referência para o uso e manutenção do componente ProgramDisplay, facilitando sua integração e evolução no sistema Sua-Parte.