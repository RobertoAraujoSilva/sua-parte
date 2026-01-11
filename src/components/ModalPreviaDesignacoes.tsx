import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock, 
  Zap,
  BarChart3,
  List,
  RefreshCw,
  Save,
  X,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { DesignacaoPreviewCard } from "@/components/designacoes/DesignacaoPreviewCard";
import { EstatisticasDesignacoes } from "@/components/designacoes/EstatisticasDesignacoes";
import type { DesignacaoGerada, EstatisticasDesignacao, ConflitosDesignacao } from "@/types/designacoes";
import type { EstudanteRow } from "@/types/estudantes";

interface ModalPreviaDesignacoesProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (designacoesEditadas?: DesignacaoGerada[]) => void;
  onRegenerar: () => void;
  designacoes: DesignacaoGerada[];
  estudantes: EstudanteRow[];
  estatisticas: EstatisticasDesignacao;
  conflitos: ConflitosDesignacao[];
  recomendacoes: string[];
  dataInicioSemana: string;
  carregando: boolean;
}

export const ModalPreviaDesignacoes: React.FC<ModalPreviaDesignacoesProps> = ({
  aberto,
  onFechar,
  onConfirmar,
  onRegenerar,
  designacoes: designacoesIniciais,
  estudantes,
  estatisticas: estatisticasIniciais,
  conflitos,
  recomendacoes,
  dataInicioSemana,
  carregando,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("designacoes");
  const [designacoesEditadas, setDesignacoesEditadas] = useState<DesignacaoGerada[]>(designacoesIniciais);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when initial designations change
  React.useEffect(() => {
    setDesignacoesEditadas(designacoesIniciais);
    setHasChanges(false);
  }, [designacoesIniciais]);

  // Calculate updated statistics based on edited designations
  const calcularEstatisticasAtualizadas = useCallback((): EstatisticasDesignacao => {
    const estudantesMap = new Map(estudantes.map(e => [e.id, e]));
    
    let masculino = 0;
    let feminino = 0;
    let comAjudante = 0;
    let paresFormados = 0;
    let paresFamiliares = 0;
    const cargosCount: Record<string, number> = {};

    designacoesEditadas.forEach(d => {
      const estudante = estudantesMap.get(d.id_estudante);
      if (estudante) {
        if (estudante.genero === 'masculino') masculino++;
        else feminino++;

        const cargo = estudante.cargo;
        cargosCount[cargo] = (cargosCount[cargo] || 0) + 1;
      }

      if (d.id_ajudante) {
        comAjudante++;
        paresFormados++;

        const ajudante = estudantesMap.get(d.id_ajudante);
        // Check if they're family members
        if (estudante && ajudante && estudante.id_pai_mae === ajudante.id) {
          paresFamiliares++;
        }
      }
    });

    return {
      totalDesignacoes: designacoesEditadas.length,
      distribuicaoPorGenero: { masculino, feminino },
      distribuicaoPorCargo: cargosCount,
      estudantesComAjudante: comAjudante,
      paresFormados,
      paresFamiliares
    };
  }, [designacoesEditadas, estudantes]);

  const estatisticasAtualizadas = hasChanges ? calcularEstatisticasAtualizadas() : estatisticasIniciais;

  const handleUpdateDesignacao = useCallback((designacaoAtualizada: DesignacaoGerada) => {
    setDesignacoesEditadas(prev => 
      prev.map(d => 
        d.numero_parte === designacaoAtualizada.numero_parte 
          ? designacaoAtualizada 
          : d
      )
    );
    setHasChanges(true);
    toast({
      title: "Designação atualizada",
      description: `Parte ${designacaoAtualizada.numero_parte} foi modificada.`,
    });
  }, [toast]);

  const handleConfirmar = () => {
    onConfirmar(hasChanges ? designacoesEditadas : undefined);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Prévia de Designações
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Semana de {formatDate(dataInicioSemana)}
            {hasChanges && (
              <Badge variant="secondary" className="ml-2">
                <RefreshCw className="w-3 h-3 mr-1" />
                Com alterações
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Alerts Section */}
        {conflitos.length > 0 && (
          <div className="px-6 py-3 bg-destructive/10 border-b">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">{conflitos.length} conflito(s) detectado(s)</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="designacoes" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Designações ({designacoesEditadas.length})
              </TabsTrigger>
              <TabsTrigger value="estatisticas" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="avisos" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Avisos ({conflitos.length + recomendacoes.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="designacoes" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Clique em <strong>Editar</strong> para ajustar qualquer designação antes de salvar.
                </p>
              </div>
              <div className="grid gap-3">
                {designacoesEditadas.map((designacao, index) => (
                  <DesignacaoPreviewCard
                    key={`${designacao.numero_parte}-${index}`}
                    designacao={designacao}
                    estudantes={estudantes}
                    onUpdate={handleUpdateDesignacao}
                    editable={!carregando}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="estatisticas" className="mt-0">
              <EstatisticasDesignacoes estatisticas={estatisticasAtualizadas} />
            </TabsContent>

            <TabsContent value="avisos" className="mt-0 space-y-6">
              {/* Conflicts */}
              {conflitos.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Conflitos ({conflitos.length})
                  </h3>
                  <div className="space-y-2">
                    {conflitos.map((conflito, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <span className="font-medium capitalize">{conflito.tipo}:</span> {conflito.descricao}
                          <span className="text-xs ml-2">(Parte {conflito.numero_parte})</span>
                          {conflito.sugestao && (
                            <p className="text-xs mt-1 opacity-80">
                              💡 Sugestão: {conflito.sugestao}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommendations */}
              {recomendacoes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-amber-600">
                    <Lightbulb className="h-4 w-4" />
                    Recomendações ({recomendacoes.length})
                  </h3>
                  <div className="space-y-2">
                    {recomendacoes.map((rec, index) => (
                      <Alert key={index} className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                        <Lightbulb className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                          {rec}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </section>
              )}

              {/* No issues */}
              {conflitos.length === 0 && recomendacoes.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-green-700">Tudo certo!</h3>
                  <p className="text-sm text-muted-foreground">
                    Nenhum conflito ou recomendação encontrada.
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator />

        <DialogFooter className="px-6 py-4 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2">
            {hasChanges && (
              <p className="text-xs text-muted-foreground">
                ⚠️ Você fez alterações nas designações
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onRegenerar} disabled={carregando}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
            <Button variant="outline" onClick={onFechar} disabled={carregando}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmar} 
              disabled={carregando || conflitos.length > 0}
              className="bg-primary"
            >
              {carregando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Confirmar e Salvar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
