import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type Parte = {
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: string;
  tempo_minutos: number;
  cena?: string;
  requer_ajudante?: boolean;
};

type Designacao = {
  estudante?: { nome: string; cargo: string };
  ajudante?: { nome: string; cargo: string };
};

type ProgramDisplayProps = {
  partes?: Parte[];
  isEditable?: boolean;
  onEditDesignacao?: (designacao: any) => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  dataFormatada?: string;
  dataFimFormatada?: string;
  findDesignacao: (numero_parte: number) => Designacao | undefined;
  needsLocalAssignment: (parte: Parte, designacao?: Designacao) => boolean;
  getBadgeColorByType: (tipo: string) => string;
  getIconByType: (tipo: string) => React.ReactNode;
  TIPO_PARTE_LABELS: Record<string, string>;
};

export function ProgramDisplay({
  partes,
  isEditable,
  onEditDesignacao,
  onNavigatePrevious,
  onNavigateNext,
  dataFormatada,
  dataFimFormatada,
  findDesignacao,
  needsLocalAssignment,
  getBadgeColorByType,
  getIconByType,
  TIPO_PARTE_LABELS,
}: ProgramDisplayProps) {
  // Fallback visual para ausência de dados
  if (!partes || partes.length === 0) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="bg-jw-navy text-white">
          <CardTitle className="text-center flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Semana de {dataFormatada} a {dataFimFormatada}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-full flex flex-col items-center gap-4">
            <div className="animate-pulse w-2/3 h-8 bg-gray-200 rounded" />
            <div className="animate-pulse w-1/2 h-8 bg-gray-200 rounded" />
            <div className="animate-pulse w-3/4 h-8 bg-gray-200 rounded" />
            <div className="text-muted-foreground text-center mt-4">
              Nenhuma programação encontrada para esta semana.<br />
              Verifique se o material foi importado corretamente ou tente novamente mais tarde.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-jw-navy text-white">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigatePrevious}
            disabled={!onNavigatePrevious}
            className="text-white hover:bg-jw-navy-light"
          >
            <ChevronLeft className="w-5 h-5" />
            Semana Anterior
          </Button>
          
          <CardTitle className="text-center flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Semana de {dataFormatada} a {dataFimFormatada}
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateNext}
            disabled={!onNavigateNext}
            className="text-white hover:bg-jw-navy-light"
          >
            Próxima Semana
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16 text-center">Nº</TableHead>
              <TableHead>Parte</TableHead>
              <TableHead className="w-24 text-center">Tipo</TableHead>
              <TableHead className="w-20 text-center">Tempo</TableHead>
              <TableHead>Designado</TableHead>
              <TableHead>Assistente</TableHead>
              {isEditable && <TableHead className="w-16"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {partes.map((parte) => {
              const designacao = findDesignacao(parte.numero_parte);
              const requiresAssignment = needsLocalAssignment(parte, designacao);
              return (
                <TableRow key={parte.numero_parte} className={requiresAssignment ? 'bg-yellow-50' : ''}>
                  <TableCell className="text-center font-medium">{parte.numero_parte}</TableCell>
                  <TableCell>
                    <div className="font-medium">{parte.titulo_parte}</div>
                    {parte.cena && (
                      <div className="text-xs text-gray-500 mt-1">Cena: {parte.cena}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getBadgeColorByType(parte.tipo_parte)}>
                      {getIconByType(parte.tipo_parte)}
                      <span className="ml-1">{TIPO_PARTE_LABELS[parte.tipo_parte]}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {parte.tempo_minutos} min
                  </TableCell>
                  <TableCell>
                    {designacao?.estudante ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{designacao.estudante.nome}</span>
                        <span className="text-xs text-gray-500">{designacao.estudante.cargo}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                        [Para designar]
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {parte.requer_ajudante ? (
                      designacao?.ajudante ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{designacao.ajudante.nome}</span>
                          <span className="text-xs text-gray-500">{designacao.ajudante.cargo}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                          [Assistente]
                        </Badge>
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  {isEditable && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEditDesignacao && onEditDesignacao(designacao || {
                          numero_parte: parte.numero_parte,
                          titulo_parte: parte.titulo_parte,
                          tipo_parte: parte.tipo_parte,
                          tempo_minutos: parte.tempo_minutos,
                          cena: parte.cena
                        })}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                        [Para designar]
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {parte.requer_ajudante ? (
                      designacao?.ajudante ? (
                        <div className="flex flex-col">
                          export * from './ProgramDisplay.fixed';
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                            [Assistente]
                          </Badge>
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    
                    {isEditable && (
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEditDesignacao && onEditDesignacao(designacao || {
                            numero_parte: parte.numero_parte,
                            titulo_parte: parte.titulo_parte,
                            tipo_parte: parte.tipo_parte,
                            tempo_minutos: parte.tempo_minutos,
                            cena: parte.cena
                          })}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}