import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  Users,
  BookOpen,
  Play,
  Mic,
  X,
  CalendarX,
  Download,
  FlaskConical,
  Plus,
  ChevronDown,
} from 'lucide-react';
import type { EstudanteWithParent } from '@/types/estudantes';
import { periodoDaSemanaAtual } from '@/utils/programacaoDates';

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
  onAtualizarJWorg?: () => void;
  onTestarImportacao?: () => void;
  onAdicionarManual?: () => void;
  loadingAtualizar?: boolean;
  loadingTestar?: boolean;
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
  onAtualizarJWorg,
  onTestarImportacao,
  onAdicionarManual,
  loadingAtualizar,
  loadingTestar,
}: ProgramacaoViewerProps) {
  const periodoAtual = useMemo(() => periodoDaSemanaAtual(semanas), [semanas]);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>(() => periodoDaSemanaAtual(semanas) ?? '');

  useEffect(() => {
    setSelectedPeriodo((periodoSelecionado) => {
      if (periodoSelecionado && semanas.some((semana) => semana.periodo === periodoSelecionado)) {
        return periodoSelecionado;
      }
      return periodoAtual ?? '';
    });
  }, [periodoAtual, semanas]);

  const semanaAtual = useMemo(
    () => semanas.find((s) => s.periodo === selectedPeriodo),
    [semanas, selectedPeriodo]
  );

  if (!semanaAtual) {
    const hojeFormatado = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-5">
              <CalendarX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Nenhuma programação para esta semana
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Hoje é <strong className="text-foreground">{hojeFormatado}</strong>. Ainda não temos a
              programação cadastrada para o período atual. Escolha uma das opções abaixo para
              continuar.
            </p>

            {semanas.length > 0 && (
              <div className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-2 text-left">
                <label className="text-sm font-medium text-foreground">
                  Ver uma semana já cadastrada
                </label>
                <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar uma semana" />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent>
                    {semanas.map((semana) => (
                      <SelectItem key={semana.periodo} value={semana.periodo}>
                        {semana.periodo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Download className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Importar do JW.org</CardTitle>
              <CardDescription>
                Baixe a programação mais recente diretamente da fonte oficial.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button
                className="w-full"
                onClick={onAtualizarJWorg}
                disabled={!onAtualizarJWorg || loadingAtualizar}
              >
                {loadingAtualizar ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Atualizar programação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground mb-3">
                <FlaskConical className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Testar importação</CardTitle>
              <CardDescription>
                Verifique se o JW.org está respondendo e quantas semanas podem ser extraídas.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button
                variant="secondary"
                className="w-full"
                onClick={onTestarImportacao}
                disabled={!onTestarImportacao || loadingTestar}
              >
                {loadingTestar ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Testar importação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground mb-3">
                <Plus className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Adicionar manualmente</CardTitle>
              <CardDescription>
                Cadastre a programação desta semana você mesmo, parte por parte.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={onAdicionarManual}
                disabled={!onAdicionarManual}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar programação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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
