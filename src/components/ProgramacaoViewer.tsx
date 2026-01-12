import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Users, BookOpen, Play, Mic, User } from 'lucide-react';
import type { EstudanteWithParent } from '@/types/estudantes';

interface ProgramacaoViewerProps {
  programacao: any;
  estudantes: EstudanteWithParent[];
  designacoes: any[];
  onDesignar: (parteId: string, estudanteId: string, ajudanteId?: string) => void;
  onRemoverDesignacao: (parteId: string) => void;
}

const getIconForTipo = (tipo: string) => {
  switch (tipo) {
    case 'leitura':
      return <BookOpen className="h-4 w-4" />;
    case 'consideracao':
    case 'video+consideracao':
      return <Play className="h-4 w-4" />;
    case 'discurso':
      return <Mic className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getColorForTipo = (tipo: string) => {
  switch (tipo) {
    case 'leitura':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'consideracao':
    case 'video+consideracao':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'discurso':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'joias':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ProgramacaoViewer({
  programacao,
  estudantes,
  designacoes,
  onDesignar,
  onRemoverDesignacao
}: ProgramacaoViewerProps) {
  const [selectedSemana, setSelectedSemana] = useState<string | null>(null);

  if (!programacao) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma programação carregada</p>
            <p className="text-sm">Importe uma programação para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const semanas = Array.isArray(programacao) ? programacao : [programacao];
  const semanaAtual = selectedSemana 
    ? semanas.find(s => s.idSemana === selectedSemana)
    : semanas[0];

  const getEstudanteDesignado = (parteId: string) => {
    const designacao = designacoes.find(d => d.idParte === parteId);
    return designacao ? estudantes.find(e => e.id === designacao.idEstudante) : null;
  };

  const getAjudanteDesignado = (parteId: string) => {
    const designacao = designacoes.find(d => d.idParte === parteId);
    return designacao?.idAjudante ? estudantes.find(e => e.id === designacao.idAjudante) : null;
  };

  const getEstudantesQualificados = (parte: any) => {
    return estudantes.filter(estudante => {
      // Verificar restrições de gênero
      if (parte.restricoes?.genero && parte.restricoes.genero !== 'todos') {
        if (parte.restricoes.genero === 'M' && estudante.genero !== 'masculino') return false;
        if (parte.restricoes.genero === 'F' && estudante.genero !== 'feminino') return false;
      }
      
      // Verificar se já foi designado para esta semana
      const jaDesignado = designacoes.some(d => 
        d.idEstudante === estudante.id && d.semanaId === semanaAtual.idSemana
      );
      
      return !jaDesignado;
    });
  };

  const totalMinutos = semanaAtual.programacao.reduce((total: number, secao: any) => 
    total + secao.partes.reduce((secTotal: number, parte: any) => secTotal + parte.duracaoMin, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getIconForTipo('consideracao')}
                {semanaAtual.semanaLabel}
              </CardTitle>
              <CardDescription>
                <strong>Tema:</strong> {semanaAtual.tema}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {totalMinutos} minutos totais
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Seleção de Semana */}
      {semanas.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Semana:</label>
              <Select value={selectedSemana || semanas[0].idSemana} onValueChange={setSelectedSemana}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semanas.map((semana: any) => (
                    <SelectItem key={semana.idSemana} value={semana.idSemana}>
                      {semana.semanaLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programação */}
      <div className="space-y-4">
        {semanaAtual.programacao.map((secao: any, secaoIndex: number) => (
          <Card key={secaoIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{secao.secao}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {secao.partes.map((parte: any, parteIndex: number) => {
                  const parteId = `${semanaAtual.idSemana}-${secaoIndex}-${parteIndex}`;
                  const estudanteDesignado = getEstudanteDesignado(parteId);
                  const ajudanteDesignado = getAjudanteDesignado(parteId);
                  const estudantesQualificados = getEstudantesQualificados(parte);
                  
                  return (
                    <div key={parteIndex} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {parte.idParte}
                            </Badge>
                            <Badge className={`text-xs ${getColorForTipo(parte.tipo)}`}>
                              {getIconForTipo(parte.tipo)}
                              <span className="ml-1">{parte.tipo}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {parte.duracaoMin}min
                            </Badge>
                          </div>
                          <h4 className="font-medium">{parte.titulo}</h4>
                          {parte.referencias && parte.referencias.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Referências:</strong> {parte.referencias.join(', ')}
                            </p>
                          )}
                          {parte.restricoes && (
                            <div className="mt-2">
                              {parte.restricoes.genero && (
                                <Badge variant="outline" className="text-xs">
                                  <User className="h-3 w-3 mr-1" />
                                  {parte.restricoes.genero === 'M' ? 'Apenas homens' : 
                                   parte.restricoes.genero === 'F' ? 'Apenas mulheres' : 'Todos'}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-3">
                        {/* Estudante Principal */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-20">Estudante:</label>
                          {estudanteDesignado ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="default">
                                {estudanteDesignado.nome}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRemoverDesignacao(parteId)}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <Select
                              onValueChange={(value) => onDesignar(parteId, value)}
                              disabled={estudantesQualificados.length === 0}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Selecionar estudante" />
                              </SelectTrigger>
                              <SelectContent>
                                {estudantesQualificados.map((estudante) => (
                                  <SelectItem key={estudante.id} value={estudante.id}>
                                    {estudante.nome}
                                    {estudante.genero && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({estudante.genero === 'masculino' ? 'M' : 'F'})
                                      </span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* Ajudante (se necessário) */}
                        {parte.ajudante && (
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-20">Ajudante:</label>
                            {ajudanteDesignado ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {ajudanteDesignado.nome}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onRemoverDesignacao(parteId)}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <Select
                                onValueChange={(value) => onDesignar(parteId, estudanteDesignado?.id || '', value)}
                                disabled={!estudanteDesignado || estudantesQualificados.length === 0}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Selecionar ajudante" />
                                </SelectTrigger>
                                <SelectContent>
                                  {estudantesQualificados
                                    .filter(e => e.id !== estudanteDesignado?.id)
                                    .map((estudante) => (
                                    <SelectItem key={estudante.id} value={estudante.id}>
                                      {estudante.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo das Designações */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Designações</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {designacoes
                .filter(d => d.semanaId === semanaAtual.idSemana)
                .map((designacao, index) => {
                  const estudante = estudantes.find(e => e.id === designacao.idEstudante);
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{designacao.tituloParte}</span>
                      <Badge variant="outline">
                        {estudante?.nome}
                      </Badge>
                    </div>
                  );
                })}
              {designacoes.filter(d => d.semanaId === semanaAtual.idSemana).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma designação feita ainda
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
