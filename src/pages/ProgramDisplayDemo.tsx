import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgramDisplay from '@/components/programs/ProgramDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// Dados de exemplo para demonstração
const exemploPartes = [
  {
    numero_parte: 1,
    titulo_parte: 'Oração de Abertura',
    tipo_parte: 'oracao_abertura',
    tempo_minutos: 1,
    requer_ajudante: false
  },
  {
    numero_parte: 2,
    titulo_parte: 'Comentários Iniciais',
    tipo_parte: 'comentarios_iniciais',
    tempo_minutos: 3,
    requer_ajudante: false
  },
  {
    numero_parte: 3,
    titulo_parte: 'Leitura da Bíblia: Mateus 24:3-14',
    tipo_parte: 'leitura_biblica',
    tempo_minutos: 4,
    requer_ajudante: false,
    restricao_genero: 'masculino'
  },
  {
    numero_parte: 4,
    titulo_parte: 'Tesouros da Palavra de Deus',
    tipo_parte: 'tesouros_palavra',
    tempo_minutos: 10,
    requer_ajudante: false
  },
  {
    numero_parte: 5,
    titulo_parte: 'Joias Espirituais',
    tipo_parte: 'joias_espirituais',
    tempo_minutos: 8,
    requer_ajudante: false
  },
  {
    numero_parte: 6,
    titulo_parte: 'Primeira Conversa',
    tipo_parte: 'parte_ministerio',
    tempo_minutos: 3,
    cena: 'Apresentando as boas novas a um vizinho',
    requer_ajudante: true
  },
  {
    numero_parte: 7,
    titulo_parte: 'Revisita',
    tipo_parte: 'parte_ministerio',
    tempo_minutos: 4,
    cena: 'Respondendo a uma objeção sobre a Bíblia',
    requer_ajudante: true
  },
  {
    numero_parte: 8,
    titulo_parte: 'Discurso: A Importância da Oração',
    tipo_parte: 'discurso',
    tempo_minutos: 5,
    requer_ajudante: false
  },
  {
    numero_parte: 9,
    titulo_parte: 'Nossa Vida Cristã',
    tipo_parte: 'vida_crista',
    tempo_minutos: 15,
    requer_ajudante: false
  },
  {
    numero_parte: 10,
    titulo_parte: 'Estudo Bíblico da Congregação',
    tipo_parte: 'estudo_biblico_congregacao',
    tempo_minutos: 30,
    requer_ajudante: false
  },
  {
    numero_parte: 11,
    titulo_parte: 'Comentários Finais',
    tipo_parte: 'comentarios_finais',
    tempo_minutos: 3,
    requer_ajudante: false
  },
  {
    numero_parte: 12,
    titulo_parte: 'Oração de Encerramento',
    tipo_parte: 'oracao_encerramento',
    tempo_minutos: 1,
    requer_ajudante: false
  }
];

const exemploDesignacoes = [
  {
    id_estudante: '1',
    numero_parte: 1,
    titulo_parte: 'Oração de Abertura',
    tipo_parte: 'oracao_abertura',
    tempo_minutos: 1,
    estudante: {
      id: '1',
      nome: 'João Silva',
      cargo: 'anciao',
      genero: 'masculino'
    }
  },
  {
    id_estudante: '2',
    numero_parte: 3,
    titulo_parte: 'Leitura da Bíblia: Mateus 24:3-14',
    tipo_parte: 'leitura_biblica',
    tempo_minutos: 4,
    estudante: {
      id: '2',
      nome: 'Pedro Santos',
      cargo: 'servo_ministerial',
      genero: 'masculino'
    }
  },
  {
    id_estudante: '3',
    numero_parte: 6,
    titulo_parte: 'Primeira Conversa',
    tipo_parte: 'parte_ministerio',
    tempo_minutos: 3,
    cena: 'Apresentando as boas novas a um vizinho',
    id_ajudante: '4',
    estudante: {
      id: '3',
      nome: 'Maria Oliveira',
      cargo: 'pioneira_regular',
      genero: 'feminino'
    },
    ajudante: {
      id: '4',
      nome: 'Ana Costa',
      cargo: 'publicadora_batizada',
      genero: 'feminino'
    }
  },
  {
    id_estudante: '5',
    numero_parte: 8,
    titulo_parte: 'Discurso: A Importância da Oração',
    tipo_parte: 'discurso',
    tempo_minutos: 5,
    estudante: {
      id: '5',
      nome: 'Carlos Ferreira',
      cargo: 'anciao',
      genero: 'masculino'
    }
  }
];

const ProgramDisplayDemo: React.FC = () => {
  // Estado para controlar a semana atual (para demonstração)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  
  // Datas de exemplo para navegação entre semanas
  const weekDates = [
    '2024-06-03',
    '2024-06-10',
    '2024-06-17',
    '2024-06-24',
  ];
  
  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };
  
  const handleNextWeek = () => {
    if (currentWeekIndex < weekDates.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };
  
  const handleEditDesignacao = (designacao: any) => {
    console.log('Editar designação:', designacao);
    // Aqui seria implementada a lógica para abrir um modal de edição
    alert(`Editar designação: ${designacao.titulo_parte}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-jw-navy mb-6">Demonstração do Componente ProgramDisplay</h1>
          
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertTitle>Sobre este componente</AlertTitle>
            <AlertDescription>
              O componente <code>ProgramDisplay</code> exibe a programação oficial de cada semana em formato de tabela, 
              com cores e badges para cada tipo de parte. Permite navegação fácil entre semanas e destaca campos 
              que precisam ser preenchidos localmente.
            </AlertDescription>
          </Alert>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Exemplo com Designações Parciais</CardTitle>
              <CardDescription>
                Este exemplo mostra o componente com algumas designações já feitas e outras pendentes.
                Os campos em amarelo indicam designações que precisam ser preenchidas localmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramDisplay 
                dataInicioSemana={weekDates[currentWeekIndex]}
                partes={exemploPartes}
                designacoes={exemploDesignacoes}
                onNavigatePrevious={handlePreviousWeek}
                onNavigateNext={handleNextWeek}
                onEditDesignacao={handleEditDesignacao}
                isEditable={true}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Exemplo Somente Leitura</CardTitle>
              <CardDescription>
                Este exemplo mostra o componente em modo somente leitura, sem a opção de editar designações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramDisplay 
                dataInicioSemana={weekDates[currentWeekIndex]}
                partes={exemploPartes}
                designacoes={exemploDesignacoes}
                onNavigatePrevious={handlePreviousWeek}
                onNavigateNext={handleNextWeek}
                isEditable={false}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProgramDisplayDemo;