import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProgramDisplay, Designacao, Parte } from '@/components/programs/ProgramDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, BookOpen, MessageSquare, Clock, Mic, Users } from 'lucide-react';

// Dados de exemplo para demonstração
const exemploPartes: Parte[] = [
  {
    numero_parte: 1,
    titulo_parte: 'Oração de Abertura',
    tipo_parte: 'oracao_abertura',
    tempo_minutos: 1,
    requer_ajudante: false,
  },
  {
    numero_parte: 2,
    titulo_parte: 'Comentários Iniciais',
    tipo_parte: 'comentarios_iniciais',
    tempo_minutos: 3,
    requer_ajudante: false,
  },
  {
    numero_parte: 3,
    titulo_parte: 'Leitura da Bíblia: Mateus 24:3-14',
    tipo_parte: 'leitura_biblica',
    tempo_minutos: 4,
    requer_ajudante: false,
  },
  {
    numero_parte: 4,
    titulo_parte: 'Tesouros da Palavra de Deus',
    tipo_parte: 'tesouros_palavra',
    tempo_minutos: 10,
    requer_ajudante: false,
  },
  {
    numero_parte: 5,
    titulo_parte: 'Joias Espirituais',
    tipo_parte: 'joias_espirituais',
    tempo_minutos: 8,
    requer_ajudante: false,
  },
  {
    numero_parte: 6,
    titulo_parte: 'Primeira Conversa',
    tipo_parte: 'parte_ministerio',
    tempo_minutos: 3,
    cena: 'Apresentando as boas novas a um vizinho',
    requer_ajudante: true,
  },
  {
    numero_parte: 7,
    titulo_parte: 'Revisita',
    tipo_parte: 'parte_ministerio',
    tempo_minutos: 4,
    cena: 'Respondendo a uma objeção sobre a Bíblia',
    requer_ajudante: true,
  },
  {
    numero_parte: 8,
    titulo_parte: 'Discurso: A Importância da Oração',
    tipo_parte: 'discurso',
    tempo_minutos: 5,
    requer_ajudante: false,
  },
  {
    numero_parte: 9,
    titulo_parte: 'Nossa Vida Cristã',
    tipo_parte: 'vida_crista',
    tempo_minutos: 15,
    requer_ajudante: false,
  },
  {
    numero_parte: 10,
    titulo_parte: 'Estudo Bíblico da Congregação',
    tipo_parte: 'estudo_biblico_congregacao',
    tempo_minutos: 30,
    requer_ajudante: false,
  },
  {
    numero_parte: 11,
    titulo_parte: 'Comentários Finais',
    tipo_parte: 'comentarios_finais',
    tempo_minutos: 3,
    requer_ajudante: false,
  },
  {
    numero_parte: 12,
    titulo_parte: 'Oração de Encerramento',
    tipo_parte: 'oracao_encerramento',
    tempo_minutos: 1,
    requer_ajudante: false,
  },
];

const exemploDesignacoes: any[] = [
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
      genero: 'masculino',
    },
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
      genero: 'masculino',
    },
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
      genero: 'feminino',
    },
    ajudante: {
      id: '4',
      nome: 'Ana Costa',
      cargo: 'publicadora_batizada',
      genero: 'feminino',
    },
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
      genero: 'masculino',
    },
  },
];

const ProgramDisplayDemo: React.FC = () => {
  // Estado para controlar a semana atual (para demonstração)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Datas de exemplo para navegação entre semanas
  const weekDates = ['2024-06-03', '2024-06-10', '2024-06-17', '2024-06-24'];

  const currentDate = useMemo(() => new Date(weekDates[currentWeekIndex]), [currentWeekIndex]);
  const endDate = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 6);
    return d;
  }, [currentDate]);

  const dataFormatada = useMemo(() => currentDate.toLocaleDateString('pt-BR'), [currentDate]);
  const dataFimFormatada = useMemo(() => endDate.toLocaleDateString('pt-BR'), [endDate]);

  const TIPO_PARTE_LABELS: Record<string, string> = {
    oracao_abertura: 'Oração de Abertura',
    comentarios_iniciais: 'Comentários Iniciais',
    leitura_biblica: 'Leitura da Bíblia',
    tesouros_palavra: 'Tesouros da Palavra',
    joias_espirituais: 'Joias Espirituais',
    parte_ministerio: 'Parte no Ministério',
    discurso: 'Discurso',
    vida_crista: 'Nossa Vida Cristã',
    estudo_biblico_congregacao: 'Estudo Bíblico da Congregação',
    comentarios_finais: 'Comentários Finais',
    oracao_encerramento: 'Oração de Encerramento',
  };

  const getBadgeColorByType = (tipo: string) => {
    switch (tipo) {
      case 'leitura_biblica':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tesouros_palavra':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'joias_espirituais':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'parte_ministerio':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'discurso':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'vida_crista':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'estudo_biblico_congregacao':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'oracao_abertura':
      case 'oracao_encerramento':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'comentarios_iniciais':
      case 'comentarios_finais':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIconByType = (tipo: string) => {
    const cls = 'w-4 h-4';
    switch (tipo) {
      case 'leitura_biblica':
        return <BookOpen className={cls} />;
      case 'parte_ministerio':
        return <MessageSquare className={cls} />;
      case 'discurso':
        return <Mic className={cls} />;
      case 'estudo_biblico_congregacao':
        return <Users className={cls} />;
      default:
        return <Clock className={cls} />;
    }
  };

  const findDesignacao = (numero_parte: number): Designacao | undefined => {
    const d = exemploDesignacoes.find((x) => x.numero_parte === numero_parte);
    if (!d) return undefined;
    const resultado: Designacao = {};
    if (d.estudante) resultado.estudante = { nome: d.estudante.nome, cargo: d.estudante.cargo };
    if (d.ajudante) resultado.ajudante = { nome: d.ajudante.nome, cargo: d.ajudante.cargo };
    return resultado;
  };

  const needsLocalAssignment = (parte: Parte, designacao?: Designacao) => {
    if (!designacao?.estudante) return true;
    if (parte.requer_ajudante && !designacao.ajudante) return true;
    return false;
  };

  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) setCurrentWeekIndex((i) => i - 1);
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weekDates.length - 1) setCurrentWeekIndex((i) => i + 1);
  };

  const handleEditDesignacao = (designacao: any) => {
    console.log('Editar designação:', designacao);
    alert(`Editar designação: ${designacao.titulo_parte ?? ''}`);
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
                partes={exemploPartes}
                isEditable={true}
                onEditDesignacao={handleEditDesignacao}
                onNavigatePrevious={handlePreviousWeek}
                onNavigateNext={handleNextWeek}
                dataFormatada={dataFormatada}
                dataFimFormatada={dataFimFormatada}
                findDesignacao={findDesignacao}
                needsLocalAssignment={needsLocalAssignment}
                getBadgeColorByType={getBadgeColorByType}
                getIconByType={getIconByType}
                TIPO_PARTE_LABELS={TIPO_PARTE_LABELS}
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
                partes={exemploPartes}
                isEditable={false}
                onNavigatePrevious={handlePreviousWeek}
                onNavigateNext={handleNextWeek}
                dataFormatada={dataFormatada}
                dataFimFormatada={dataFimFormatada}
                findDesignacao={findDesignacao}
                needsLocalAssignment={needsLocalAssignment}
                getBadgeColorByType={getBadgeColorByType}
                getIconByType={getIconByType}
                TIPO_PARTE_LABELS={TIPO_PARTE_LABELS}
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
