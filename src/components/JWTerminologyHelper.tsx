import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Info
} from 'lucide-react';

interface TerminologyEntry {
  term: string;
  definition: string;
  context: string;
  s38tRule?: string;
  examples?: string[];
}

interface JWTerminologyHelperProps {
  className?: string;
}

export const JWTerminologyHelper: React.FC<JWTerminologyHelperProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('meeting-parts');

  const terminology: Record<string, TerminologyEntry[]> = {
    'meeting-parts': [
      {
        term: 'Comentários Iniciais',
        definition: 'Abertura da reunião com comentários sobre o programa da semana',
        context: 'Primeira parte da reunião, sempre conduzida por um ancião ou servo ministerial',
        s38tRule: 'Apenas homens qualificados (anciãos ou servos ministeriais)',
        examples: ['Boas-vindas', 'Visão geral do programa', 'Anúncios importantes']
      },
      {
        term: 'Tesouros da Palavra de Deus',
        definition: 'Seção que destaca pontos importantes da leitura bíblica semanal',
        context: 'Segunda seção da reunião, baseada na leitura bíblica designada',
        s38tRule: 'Apenas homens qualificados (anciãos ou servos ministeriais)',
        examples: ['Análise de versículos', 'Contexto histórico', 'Aplicação prática']
      },
      {
        term: 'Joias Espirituais',
        definition: 'Comentários sobre pontos interessantes da leitura bíblica',
        context: 'Parte interativa onde a congregação participa com comentários',
        s38tRule: 'Conduzida por homens qualificados, participação de toda congregação'
      },
      {
        term: 'Leitura da Bíblia',
        definition: 'Leitura em voz alta de uma porção das Escrituras',
        context: 'Demonstração de habilidade de leitura pública',
        s38tRule: 'Apenas homens (qualquer idade apropriada)',
        examples: ['Leitura clara', 'Entonação adequada', 'Ritmo apropriado']
      },
      {
        term: 'Faça Seu Melhor no Ministério',
        definition: 'Seção com demonstrações práticas do ministério de campo',
        context: 'Três partes que simulam situações reais do ministério',
        s38tRule: 'Irmãs podem participar, mas não ensinar homens batizados',
        examples: ['Iniciando conversas', 'Cultivando interesse', 'Fazendo discípulos']
      },
      {
        term: 'Nossa Vida Cristã',
        definition: 'Seção final com considerações sobre vida cristã prática',
        context: 'Aplicação dos princípios bíblicos na vida diária',
        s38tRule: 'Apenas homens qualificados (anciãos ou servos ministeriais)',
        examples: ['Considerações', 'Vídeos', 'Entrevistas']
      },
      {
        term: 'Estudo Bíblico de Congregação',
        definition: 'Estudo participativo de publicação da organização',
        context: 'Última parte da reunião, com participação da congregação',
        s38tRule: 'Conduzido por ancião ou servo ministerial',
        examples: ['Perguntas e respostas', 'Comentários', 'Aplicação prática']
      }
    ],
    'roles': [
      {
        term: 'Ancião',
        definition: 'Homem maduro espiritualmente que supervisiona a congregação',
        context: 'Qualificado para todas as partes de ensino e supervisão',
        s38tRule: 'Pode conduzir qualquer parte da reunião',
        examples: ['Comentários iniciais', 'Tesouros', 'Vida cristã', 'Estudo bíblico']
      },
      {
        term: 'Servo Ministerial',
        definition: 'Homem que serve em capacidades específicas na congregação',
        context: 'Qualificado para partes de ensino, mas não supervisão',
        s38tRule: 'Pode conduzir partes de ensino, exceto algumas restrições',
        examples: ['Comentários iniciais', 'Tesouros', 'Vida cristã']
      },
      {
        term: 'Publicador Batizado',
        definition: 'Membro batizado da congregação que participa no ministério',
        context: 'Qualificado para partes do ministério e leitura bíblica',
        s38tRule: 'Homens: leitura bíblica e ministério. Mulheres: apenas ministério',
        examples: ['Leitura da Bíblia (homens)', 'Partes do ministério']
      },
      {
        term: 'Estudante',
        definition: 'Pessoa que estuda a Bíblia mas ainda não foi batizada',
        context: 'Pode participar em partes do ministério com supervisão',
        s38tRule: 'Participação limitada, sempre com supervisão',
        examples: ['Partes do ministério (com orientação)']
      }
    ],
    's38t-rules': [
      {
        term: 'Restrições de Gênero',
        definition: 'Regras sobre quais partes homens e mulheres podem conduzir',
        context: 'Baseadas nos princípios bíblicos de 1 Coríntios 14:34, 35',
        s38tRule: 'Mulheres não ensinam homens batizados em ambiente de congregação',
        examples: ['Homens: todas as partes de ensino', 'Mulheres: partes do ministério']
      },
      {
        term: 'Qualificações Espirituais',
        definition: 'Requisitos espirituais para diferentes tipos de designações',
        context: 'Baseadas em 1 Timóteo 3 e Tito 1',
        s38tRule: 'Diferentes partes requerem diferentes níveis de qualificação',
        examples: ['Anciãos: supervisão', 'Servos: ensino', 'Publicadores: ministério']
      },
      {
        term: 'Relacionamentos Familiares',
        definition: 'Considerações especiais para famílias nas designações',
        context: 'Marido e esposa podem trabalhar juntos no ministério',
        s38tRule: 'Casais podem ter designações juntos nas partes do ministério',
        examples: ['Esposo como estudante, esposa como ajudante']
      },
      {
        term: 'Supervisão Adequada',
        definition: 'Necessidade de supervisão qualificada em certas situações',
        context: 'Especialmente importante para estudantes e novos publicadores',
        s38tRule: 'Estudantes sempre precisam de supervisão qualificada',
        examples: ['Ancião supervisionando estudante', 'Servo orientando novo publicador']
      }
    ]
  };

  const categories = [
    { id: 'meeting-parts', label: 'Partes da Reunião', icon: BookOpen },
    { id: 'roles', label: 'Cargos e Qualificações', icon: Users },
    { id: 's38t-rules', label: 'Regras S-38-T', icon: AlertTriangle }
  ];

  const currentTerms = terminology[selectedCategory] || [];

  return (
    <div className={`jw-terminology-helper ${className}`}>
      {/* Help Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-16 right-4 z-40 shadow-lg"
        title="Ajuda com Terminologia JW"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Terminologia JW
      </Button>

      {/* Terminology Panel */}
      {isOpen && (
        <Card className="fixed bottom-32 right-4 z-40 w-96 max-h-96 overflow-y-auto shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Terminologia JW</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Explicações sobre termos e regras das Testemunhas de Jeová
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Tabs */}
            <div className="flex gap-1 flex-wrap">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>

            {/* Terms List */}
            <div className="space-y-3">
              {currentTerms.map((entry, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm text-jw-navy">
                      {entry.term}
                    </h4>
                    {entry.s38tRule && (
                      <Badge variant="outline" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        S-38-T
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-gray-700">
                    {entry.definition}
                  </p>

                  <div className="text-xs text-gray-600">
                    <strong>Contexto:</strong> {entry.context}
                  </div>

                  {entry.s38tRule && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <strong className="text-yellow-800">Regra S-38-T:</strong>
                          <p className="text-yellow-700 mt-1">{entry.s38tRule}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {entry.examples && (
                    <div className="text-xs">
                      <strong className="text-gray-600">Exemplos:</strong>
                      <ul className="list-disc list-inside text-gray-600 mt-1 space-y-0.5">
                        {entry.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {currentTerms.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum termo encontrado nesta categoria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
