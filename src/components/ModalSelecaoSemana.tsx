/**
 * Modal de Seleção de Semana para Geração de Designações
 * 
 * Este componente permite ao usuário selecionar uma semana específica para gerar
 * designações automáticas, verificando se já existem designações e oferecendo
 * opção de regeneração com confirmação.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, AlertTriangle, Info, Zap, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek, isSameWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import type { ProgramaRow } from '@/types/designacoes';

interface ModalSelecaoSemanaProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (dadosSelecao: DadosSelecaoSemana) => void;
  carregando?: boolean;
}

export interface DadosSelecaoSemana {
  dataInicioSemana: string;
  idPrograma: string;
  programa: ProgramaRow;
  existemDesignacoes: boolean;
  quantidadeDesignacoes: number;
  modoRegeneracao: boolean;
}

interface ProgramaComDesignacoes extends ProgramaRow {
  quantidadeDesignacoes: number;
  existemDesignacoes: boolean;
}

export const ModalSelecaoSemana: React.FC<ModalSelecaoSemanaProps> = ({
  aberto,
  onFechar,
  onConfirmar,
  carregando = false
}) => {
  const [programasDisponiveis, setProgramasDisponiveis] = useState<ProgramaComDesignacoes[]>([]);
  const [programaSelecionado, setProgramaSelecionado] = useState<ProgramaComDesignacoes | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [modoRegeneracao, setModoRegeneracao] = useState(false);
  const [carregandoProgramas, setCarregandoProgramas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar programas disponíveis quando o modal abrir
  useEffect(() => {
    if (aberto) {
      carregarProgramas();
    }
  }, [aberto]);

  const carregarProgramas = async () => {
    setCarregandoProgramas(true);
    setErro(null);

    try {
      // Carregar programas dos últimos 2 meses e próximas 4 semanas
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 60); // 2 meses atrás
      
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 28); // 4 semanas à frente

      const { data: programas, error: programasError } = await supabase
        .from('programas')
        .select('*')
        .gte('data_inicio_semana', dataInicio.toISOString().split('T')[0])
        .lte('data_inicio_semana', dataFim.toISOString().split('T')[0])
        .eq('status', 'ativo')
        .order('data_inicio_semana', { ascending: true });

      if (programasError) {
        throw new Error(`Erro ao carregar programas: ${programasError.message}`);
      }

      // Para cada programa, verificar se já tem designações
      const programasComDesignacoes: ProgramaComDesignacoes[] = [];

      for (const programa of programas || []) {
        const { count, error: countError } = await supabase
          .from('designacoes')
          .select('*', { count: 'exact' })
          .eq('id_programa', programa.id);

        if (countError) {
          console.error('Erro ao contar designações:', countError);
        }

        programasComDesignacoes.push({
          ...programa,
          quantidadeDesignacoes: count || 0,
          existemDesignacoes: (count || 0) > 0
        });
      }

      setProgramasDisponiveis(programasComDesignacoes);
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
      setErro(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setCarregandoProgramas(false);
    }
  };

  const handleSelecionarPrograma = (programaId: string) => {
    const programa = programasDisponiveis.find(p => p.id === programaId);
    if (programa) {
      setProgramaSelecionado(programa);
      setDataSelecionada(new Date(programa.data_inicio_semana));
      setModoRegeneracao(programa.existemDesignacoes);
    }
  };

  const handleSelecionarData = (data: Date | undefined) => {
    if (!data) return;

    setDataSelecionada(data);
    
    // Encontrar programa correspondente à data selecionada
    const inicioSemana = startOfWeek(data, { weekStartsOn: 1 }); // Segunda-feira
    const dataInicioSemana = format(inicioSemana, 'yyyy-MM-dd');
    
    const programa = programasDisponiveis.find(p => p.data_inicio_semana === dataInicioSemana);
    
    if (programa) {
      setProgramaSelecionado(programa);
      setModoRegeneracao(programa.existemDesignacoes);
    } else {
      setProgramaSelecionado(null);
      setModoRegeneracao(false);
    }
  };

  const handleConfirmar = () => {
    if (!programaSelecionado || !dataSelecionada) return;

    const dadosSelecao: DadosSelecaoSemana = {
      dataInicioSemana: programaSelecionado.data_inicio_semana,
      idPrograma: programaSelecionado.id,
      programa: programaSelecionado,
      existemDesignacoes: programaSelecionado.existemDesignacoes,
      quantidadeDesignacoes: programaSelecionado.quantidadeDesignacoes,
      modoRegeneracao
    };

    onConfirmar(dadosSelecao);
  };

  const handleFechar = () => {
    setProgramaSelecionado(null);
    setDataSelecionada(undefined);
    setModoRegeneracao(false);
    setErro(null);
    onFechar();
  };

  const obterStatusPrograma = (programa: ProgramaComDesignacoes) => {
    if (programa.existemDesignacoes) {
      return (
        <Badge variant="secondary" className="ml-2">
          {programa.quantidadeDesignacoes} designação(ões)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="ml-2">
        Sem designações
      </Badge>
    );
  };

  const podeConfirmar = programaSelecionado && dataSelecionada && !carregando;

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-jw-gold" />
            Gerar Designações Automáticas
          </DialogTitle>
          <DialogDescription>
            Selecione a semana para gerar designações automáticas seguindo as regras S-38-T.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {erro && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {/* Seleção por Lista de Programas */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Selecionar por Programa</label>
            <Select
              value={programaSelecionado?.id || ''}
              onValueChange={handleSelecionarPrograma}
              disabled={carregandoProgramas}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={carregandoProgramas ? "Carregando programas..." : "Selecione um programa"}
                />
              </SelectTrigger>
              <SelectContent>
                {programasDisponiveis.map((programa) => (
                  <SelectItem key={programa.id} value={programa.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        Semana de {format(new Date(programa.data_inicio_semana), 'dd/MM/yyyy', { locale: ptBR })}
                        {programa.mes_apostila && ` - ${programa.mes_apostila}`}
                      </span>
                      {obterStatusPrograma(programa)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Seleção por Calendário */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Selecionar por Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={carregandoProgramas}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataSelecionada ? (
                    format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    "Selecione uma data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={handleSelecionarData}
                  locale={ptBR}
                  disabled={(date) => {
                    // Desabilitar datas que não têm programa correspondente
                    const inicioSemana = startOfWeek(date, { weekStartsOn: 1 });
                    const dataInicioSemana = format(inicioSemana, 'yyyy-MM-dd');
                    return !programasDisponiveis.some(p => p.data_inicio_semana === dataInicioSemana);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Informações do Programa Selecionado */}
          {programaSelecionado && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Programa Selecionado</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Semana:</span>
                    <span className="font-medium">
                      {format(new Date(programaSelecionado.data_inicio_semana), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  {programaSelecionado.mes_apostila && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Apostila:</span>
                      <span className="font-medium">{programaSelecionado.mes_apostila}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    {obterStatusPrograma(programaSelecionado)}
                  </div>
                </div>

                {programaSelecionado.existemDesignacoes && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Designações Existentes</AlertTitle>
                    <AlertDescription>
                      Esta semana já possui {programaSelecionado.quantidadeDesignacoes} designação(ões). 
                      Ao continuar, as designações existentes serão removidas e novas serão geradas.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar} 
            disabled={!podeConfirmar}
            className="bg-jw-blue hover:bg-jw-blue-dark"
          >
            {carregando ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : modoRegeneracao ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar Designações
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Gerar Designações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
