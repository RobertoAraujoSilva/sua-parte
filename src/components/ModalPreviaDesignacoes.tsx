import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, CheckCircle, Users, Clock, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { DesignacaoGerada, EstatisticasDesignacao, ConflitosDesignacao } from "@/types/designacoes";
import type { EstudanteRow } from "@/types/estudantes";

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
  carregando: boolean;
}

export const ModalPreviaDesignacoes = ({
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
  carregando,
}: ModalPreviaDesignacoesProps) => {
  const { toast } = useToast();

  const getEstudanteNome = (id: string) => {
    const estudante = estudantes.find(e => e.id === id);
    return estudante ? estudante.nome : `ID: ${id}`;
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Prévia de Designações - Semana de {new Date(dataInicioSemana).toLocaleDateString('pt-BR')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 -mx-6">
          {/* Statistics Section */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-700">Total Designações</div>
                <div className="text-2xl font-bold">{estatisticas.totalDesignacoes}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">Masculino</div>
                <div className="text-2xl font-bold">{estatisticas.distribuicaoPorGenero.masculino}</div>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg">
                <div className="text-sm text-pink-700">Feminino</div>
                <div className="text-2xl font-bold">{estatisticas.distribuicaoPorGenero.feminino}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-700">Com Ajudante</div>
                <div className="text-2xl font-bold">{estatisticas.estudantesComAjudante}</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <div className="text-sm text-indigo-700">Pares Formados</div>
                <div className="text-2xl font-bold">{estatisticas.paresFormados}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-sm text-yellow-700">Pares Familiares</div>
                <div className="text-2xl font-bold">{estatisticas.paresFamiliares}</div>
              </div>
            </div>
          </section>

          {/* Conflicts Section */}
          {conflitos.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                Conflitos Detectados ({conflitos.length})
              </h3>
              <div className="space-y-2">
                {conflitos.map((conflito, index) => (
                  <Alert key={index} variant="warning">
                    <AlertDescription>
                      <span className="font-medium">{conflito.tipo}:</span> {conflito.descricao} (Parte {conflito.numero_parte})
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </section>
          )}

          {/* Recommendations Section */}
          {recomendacoes.length > 0 && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Recomendações
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {recomendacoes.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Assignments Preview */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Designações Geradas ({designacoes.length})
            </h3>
            <div className="space-y-4">
              {designacoes.map((designacao, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Parte {designacao.numero_parte}</Badge>
                    <Badge>{designacao.tipo_parte}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Estudante:</span> {getEstudanteNome(designacao.id_estudante)}
                    </div>
                    {designacao.id_ajudante && (
                      <div>
                        <span className="font-medium">Ajudante:</span> {getEstudanteNome(designacao.id_ajudante)}
                      </div>
                    )}
                    {designacao.cena && (
                      <div>
                        <span className="font-medium">Cenário:</span> {designacao.cena}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {designacao.tempo_minutos} minutos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onRegenerar} disabled={carregando}>
            Regenerar
          </Button>
          <Button variant="outline" onClick={onFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar} disabled={carregando || conflitos.length > 0}>
            {carregando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar e Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
