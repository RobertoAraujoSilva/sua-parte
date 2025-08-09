/**
 * Modal de Prévia de Designações Geradas
 * 
 * Este componente exibe uma prévia das designações geradas automaticamente,
 * incluindo estatísticas de distribuição e permitindo revisão antes da
 * confirmação final.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Users, 
  BarChart3, 
  Save,
  RefreshCw,
  Eye
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DesignacaoGerada, EstatisticasDesignacao, ConflitosDesignacao } from '@/types/designacoes';
import type { EstudanteRow } from '@/types/estudantes';

interface ModalPreviaDesignacoesProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
  onRegenerar: () => void;
  designacoes: DesignacaoGerada[];
  estudantes: EstudanteRow[];
  estatisticas: EstatisticasDesignacao;
  conflitos: ConflitosDesignacao[];
  recomendacoes: string[];
  dataInicioSemana: string;
  carregando?: boolean;
}

export const ModalPreviaDesignacoes: React.FC<ModalPreviaDesignacoesProps> = ({
  aberto,
  onFechar,
  onConfirmar,
  onRegenerar,
  designacoes,
  estudantes,
  estatisticas,
  conflitos,
  recomendacoes,
  dataInicioSemana,
  carregando = false
}) => {
  const [tabAtiva, setTabAtiva] = useState('designacoes');

  /**
   * Safely formats a date string, handling invalid dates gracefully
   */
  const formatarDataSegura = (dataString: string): string => {
    if (!dataString || dataString.trim() === '') {
      return 'Data não informada';
    }

    try {
      // Try to parse the date string
      const data = parseISO(dataString);

      // Check if the parsed date is valid
      if (!isValid(data)) {
        console.warn(`Data inválida recebida: "${dataString}"`);
        return 'Data inválida';
      }

      // Format the valid date
      return format(data, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Data recebida:', dataString);
      return 'Erro na data';
    }
  };

  const obterNomeEstudante = (estudanteId: string): string => {
    const estudante = estudantes.find(e => e.id === estudanteId);
    return estudante?.nome || 'Estudante não encontrado';
  };

  const obterGeneroEstudante = (estudanteId: string): string => {
    const estudante = estudantes.find(e => e.id === estudanteId);
    return estudante?.genero || 'desconhecido';
  };

  const obterCargoEstudante = (estudanteId: string): string => {
    const estudante = estudantes.find(e => e.id === estudanteId);
    return estudante?.cargo || 'desconhecido';
  };

  const obterBadgeGenero = (genero: string) => {
    return genero === 'masculino' ? (
      <Badge variant="outline" className="text-blue-600 border-blue-600">M</Badge>
    ) : (
      <Badge variant="outline" className="text-pink-600 border-pink-600">F</Badge>
    );
  };

  const obterBadgeTipoParte = (tipoParte: string) => {
    const cores = {
      'leitura_biblica': 'bg-green-100 text-green-800',
      'discurso': 'bg-blue-100 text-blue-800',
      'demonstracao': 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      'leitura_biblica': 'Leitura',
      'discurso': 'Discurso',
      'demonstracao': 'Demonstração'
    };

    return (
      <Badge className={cores[tipoParte as keyof typeof cores] || 'bg-gray-100 text-gray-800'}>
        {labels[tipoParte as keyof typeof labels] || tipoParte}
      </Badge>
    );
  };

  const temConflitos = conflitos.length > 0;
  const podeConfirmar = designacoes.length > 0 && !carregando;

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-jw-gold" />
            Prévia das Designações
          </DialogTitle>
          <DialogDescription>
            Semana de {formatarDataSegura(dataInicioSemana)} -
            Revise as designações antes de confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="designacoes" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Designações ({designacoes.length})
              </TabsTrigger>
              <TabsTrigger value="estatisticas" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="validacao" className="flex items-center gap-2">
                {temConflitos ? (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                Validação
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="designacoes" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Designações Propostas</CardTitle>
                    <CardDescription>
                      Lista completa das designações geradas para esta semana
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parte</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estudante</TableHead>
                          <TableHead>Ajudante</TableHead>
                          <TableHead>Tempo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {designacoes.map((designacao, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {designacao.numero_parte}
                            </TableCell>
                            <TableCell>
                              {obterBadgeTipoParte(designacao.tipo_parte)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {obterBadgeGenero(obterGeneroEstudante(designacao.id_estudante))}
                                <div>
                                  <div className="font-medium">
                                    {obterNomeEstudante(designacao.id_estudante)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {obterCargoEstudante(designacao.id_estudante)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {designacao.id_ajudante ? (
                                <div className="flex items-center gap-2">
                                  {obterBadgeGenero(obterGeneroEstudante(designacao.id_ajudante))}
                                  <div>
                                    <div className="font-medium">
                                      {obterNomeEstudante(designacao.id_ajudante)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {obterCargoEstudante(designacao.id_ajudante)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {designacao.tempo_minutos} min
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estatisticas" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Gênero</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Masculino:</span>
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {estatisticas.distribuicaoPorGenero.masculino}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Feminino:</span>
                          <Badge variant="outline" className="text-pink-600 border-pink-600">
                            {estatisticas.distribuicaoPorGenero.feminino}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pares Formados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de pares:</span>
                          <Badge variant="outline">{estatisticas.paresFormados}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Pares familiares:</span>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {estatisticas.paresFamiliares}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Distribuição por Cargo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(estatisticas.distribuicaoPorCargo).map(([cargo, quantidade]) => (
                          <div key={cargo} className="flex justify-between">
                            <span className="capitalize">{cargo.replace('_', ' ')}:</span>
                            <Badge variant="outline">{quantidade}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="validacao" className="mt-0">
                <div className="space-y-4">
                  {/* Conflitos */}
                  {conflitos.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Conflitos Detectados ({conflitos.length})</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 space-y-1">
                          {conflitos.map((conflito, index) => (
                            <li key={index} className="text-sm">
                              • {conflito.descricao}
                              {conflito.sugestao && (
                                <span className="block text-xs text-muted-foreground ml-2">
                                  Sugestão: {conflito.sugestao}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Validação Aprovada</AlertTitle>
                      <AlertDescription>
                        Todas as designações estão em conformidade com as regras S-38-T.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Recomendações */}
                  {recomendacoes.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Recomendações</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 space-y-1">
                          {recomendacoes.map((recomendacao, index) => (
                            <li key={index} className="text-sm">
                              • {recomendacao}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <Separator />

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onFechar} disabled={carregando}>
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              onClick={onRegenerar} 
              disabled={carregando}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar
            </Button>
          </div>
          
          <Button 
            onClick={onConfirmar} 
            disabled={!podeConfirmar}
            className="bg-jw-blue hover:bg-jw-blue-dark"
          >
            {carregando ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Confirmar e Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
