import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, BookOpen, Play, Mic, X } from 'lucide-react';
import type { EstudanteWithParent } from '@/types/estudantes';

export interface Parte {
  id: string;
  titulo: string;
  duracao: number;
  tipo?: string;
  referencias?: string | string[];
}

export interface Secao {
  secao: string;
  partes: Parte[];
}

export interface Semana {
  periodo: string;
  tema: string;
  cantico_abertura?: string;
  cantico_meio?: string;
  cantico_encerramento?: string;
  programacao: Secao[];
}

export interface DesignacaoLocal {
  id: string;
  parte_id: string;
  semana_periodo: string;
  id_estudante: string;
  id_ajudante?: string | null;
  titulo_parte: string;
  tipo_parte?: string | null;
  tempo_minutos?: number | null;
}

interface ProgramacaoViewerProps {
  semanas: Semana[];
  estudantes: EstudanteWithParent[];
  designacoes: DesignacaoLocal[];
  onDesignar: (parte: Parte, semana: Semana, estudanteId: string, ajudanteId?: string) => void;
  onRemover: (designacaoId: string) => void;
}

const getIconForTipo = (tipo?: string) => {
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

const getColorForTipo = (tipo?: string) => {
  switch (tipo) {
    case 'leitura':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'consideracao':
    case 'video+consideracao':
      return 'bg-secondary text-secondary-foreground border-border';
    case 'discurso':
      return 'bg-accent text-accent-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export function ProgramacaoViewer({
  semanas,
  estudantes,
  designacoes,
  onDesignar,
  onRemover,
}: ProgramacaoViewerProps) {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>(semanas[0]?.periodo ?? '');

  const semanaAtual = useMemo(
    () => semanas.find((s) => s.periodo === selectedPeriodo) ?? semanas[0],
    [semanas, selectedPeriodo]
  );

  if (!semanaAtual) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma programação disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMinutos = semanaAtual.programacao.reduce(
    (total, secao) => total + secao.partes.reduce((s, p) => s + (p.duracao || 0), 0),
    0
  );

  const designacaoPara = (parteId: string) =>
    designacoes.find((d) => d.parte_id === parteId && d.semana_periodo === semanaAtual.periodo);

  const estudantesDisponiveis = (parteId: string) => {
    const designadosNaSemana = new Set(
      designacoes
        .filter((d) => d.semana_periodo === semanaAtual.periodo && d.parte_id !== parteId)
        .flatMap((d) => [d.id_estudante, d.id_ajudante].filter(Boolean) as string[])
    );
    return estudantes.filter((e) => !designadosNaSemana.has(e.id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>{semanaAtual.periodo}</CardTitle>
              <CardDescription>
                <strong>Tema:</strong> {semanaAtual.tema}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {totalMinutos} min totais
            </div>
          </div>
          {semanas.length > 1 && (
            <div className="flex items-center gap-3 pt-3">
              <label className="text-sm font-medium">Semana:</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semanas.map((s) => (
                    <SelectItem key={s.periodo} value={s.periodo}>
                      {s.periodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {semanaAtual.programacao.map((secao, secaoIdx) => (
          <Card key={secaoIdx}>
            <CardHeader>
              <CardTitle className="text-lg">{secao.secao}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {secao.partes.map((parte) => {
                const designacao = designacaoPara(parte.id);
                const estudante = designacao ? estudantes.find((e) => e.id === designacao.id_estudante) : null;
                const disponiveis = estudantesDisponiveis(parte.id);

                return (
                  <div key={parte.id} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={`text-xs ${getColorForTipo(parte.tipo)}`}>
                        {getIconForTipo(parte.tipo)}
                        <span className="ml-1">{parte.tipo ?? 'parte'}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {parte.duracao} min
                      </Badge>
                    </div>
                    <h4 className="font-medium">{parte.titulo}</h4>
                    {parte.referencias && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Referências:</strong>{' '}
                        {Array.isArray(parte.referencias) ? parte.referencias.join('; ') : parte.referencias}
                      </p>
                    )}

                    <Separator className="my-3" />

                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium w-24">Designado:</label>
                      {estudante && designacao ? (
                        <div className="flex items-center gap-2">
                          <Badge>{estudante.nome}</Badge>
                          <Button variant="outline" size="sm" onClick={() => onRemover(designacao.id)}>
                            <X className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(value) => onDesignar(parte, semanaAtual, value)}
                          disabled={disponiveis.length === 0}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Selecionar estudante" />
                          </SelectTrigger>
                          <SelectContent>
                            {disponiveis.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.nome}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({e.genero === 'masculino' ? 'M' : 'F'})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
