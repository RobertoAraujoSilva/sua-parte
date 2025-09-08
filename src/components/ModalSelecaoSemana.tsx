import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProgramaRow } from "@/types/designacoes";

export type DadosSelecaoSemana = {
  idPrograma: string;
  dataInicioSemana: string;
  modoRegeneracao: boolean;
};

interface ModalSelecaoSemanaProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (dados: DadosSelecaoSemana) => void;
  carregando: boolean;
}

export const ModalSelecaoSemana = ({ 
  aberto, 
  onFechar, 
  onConfirmar, 
  carregando 
}: ModalSelecaoSemanaProps) => {
  const { toast } = useToast();
  const [programasDisponiveis, setProgramasDisponiveis] = useState<ProgramaRow[]>([]);
  const [programaSelecionado, setProgramaSelecionado] = useState<string>("");
  const [modoRegeneracao, setModoRegeneracao] = useState(false);
  const [carregandoProgramas, setCarregandoProgramas] = useState(true);

  useEffect(() => {
    if (aberto) {
      carregarProgramas();
    }
  }, [aberto]);

  const carregarProgramas = async () => {
    try {
      setCarregandoProgramas(true);
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .order('data_inicio_semana', { ascending: false })
        .limit(20);

      if (error) throw error;

      setProgramasDisponiveis((data as any) || []);
      if (data?.length > 0) {
        setProgramaSelecionado((data as any)[0]?.id?.toString() || "");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar programas",
        description: "Não foi possível carregar os programas disponíveis. Tente novamente.",
      });
    } finally {
      setCarregandoProgramas(false);
    }
  };

  const handleConfirmar = () => {
    if (!programaSelecionado) {
      toast({
        variant: "destructive",
        title: "Seleção inválida",
        description: "Por favor, selecione um programa.",
      });
      return;
    }

    const programa = programasDisponiveis.find(p => p.id.toString() === programaSelecionado);
    if (!programa) return;

    onConfirmar({
      idPrograma: programa.id.toString(),
      dataInicioSemana: programa.data_inicio_semana,
      modoRegeneracao,
    });
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Selecionar Semana para Designações
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {carregandoProgramas ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : programasDisponiveis.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum programa disponível. Crie um programa primeiro.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="programa">Programa/Semana</Label>
                <Select 
                  value={programaSelecionado}
                  onValueChange={setProgramaSelecionado}
                >
                  <SelectTrigger id="programa">
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programasDisponiveis.map((programa) => (
                      <SelectItem key={programa.id} value={programa.id.toString()}>
                        {new Date(programa.data_inicio_semana).toLocaleDateString('pt-BR')} - {programa.mes_apostila}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="regeneracao"
                  checked={modoRegeneracao}
                  onCheckedChange={(checked) => setModoRegeneracao(!!checked)}
                />
                <Label htmlFor="regeneracao" className="text-sm">
                  Modo Regeneração (remover designações existentes)
                </Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar} 
            disabled={carregando || carregandoProgramas || !programaSelecionado}
          >
            {carregando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              'Confirmar e Gerar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
