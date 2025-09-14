import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  FileText, 
  Upload, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  Mail,
  MessageSquare,
  QrCode,
  Heart
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { useAuth } from "@/contexts/AuthContext";
import { useEstudantes } from "@/hooks/useEstudantes";
import { JWContentParser } from "@/components/JWContentParser";

// Tipos para o sistema de designações
interface DesignacaoMinisterial {
  id: string;
  semana: string;
  data_inicio: string;
  parte_numero: number;
  parte_titulo: string;
  parte_tempo: number;
  parte_tipo: 'leitura_biblica' | 'demonstracao' | 'discurso' | 'estudo_biblico';
  estudante_principal_id: string;
  estudante_ajudante_id?: string;
  cena?: string;
  referencia_biblica?: string;
  instrucoes?: string;
  status: 'pendente' | 'confirmada' | 'concluida';
  notificado_em?: string;
  confirmado_em?: string;
}

interface ProgramaSemanal {
  id: string;
  semana: string;
  data_inicio: string;
  mes_ano: string;
  partes: ParteMeeting[];
  pdf_url?: string;
  criado_em: string;
  atualizado_em: string;
}

interface ParteMeeting {
  numero: number;
  titulo: string;
  tempo: number;
  tipo: string;
  secao: string;
  referencia?: string;
  cena?: string;
  instrucoes?: string;
}

// Componente para importação de PDFs das apostilas
const ImportacaoPDF: React.FC<{ onImportComplete: (programa: ProgramaSemanal) => void }> = ({ onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF da apostila MWB.",
        variant: "destructive"
      });
    }
  };

  const processPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // Simular processamento do PDF (implementar com pdf-parse)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados mockados baseados nos PDFs fornecidos
      const mockData = {
        semana: "2-8 de dezembro de 2024",
        data_inicio: "2024-12-02",
        mes_ano: "dezembro de 2024",
        partes: [
          {
            numero: 3,
            titulo: "Leitura da Bíblia",
            tempo: 4,
            tipo: "leitura_biblica",
            secao: "TESOUROS",
            referencia: "Provérbios 25:1-17",
            instrucoes: "Apenas homens. Sem introdução ou conclusão."
          },
          {
            numero: 4,
            titulo: "Iniciando conversas",
            tempo: 3,
            tipo: "demonstracao",
            secao: "MINISTERIO",
            cena: "De casa em casa",
            instrucoes: "Demonstração. Ajudante do mesmo sexo ou parente."
          },
          {
            numero: 5,
            titulo: "Cultivando o interesse",
            tempo: 4,
            tipo: "demonstracao",
            secao: "MINISTERIO",
            cena: "Revisita",
            instrucoes: "Demonstração. Ajudante do mesmo sexo."
          },
          {
            numero: 6,
            titulo: "Explicando suas crenças",
            tempo: 5,
            tipo: "discurso",
            secao: "MINISTERIO",
            instrucoes: "Discurso. Apenas homens qualificados."
          }
        ]
      };

      setExtractedData(mockData);
      
      toast({
        title: "PDF processado com sucesso!",
        description: `Extraídas ${mockData.partes.length} partes da reunião.`
      });

    } catch (error) {
      toast({
        title: "Erro ao processar PDF",
        description: "Não foi possível extrair os dados da apostila.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmarImportacao = () => {
    if (extractedData) {
      const programa: ProgramaSemanal = {
        id: Date.now().toString(),
        semana: extractedData.semana,
        data_inicio: extractedData.data_inicio,
        mes_ano: extractedData.mes_ano,
        partes: extractedData.partes,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      
      onImportComplete(programa);
      setSelectedFile(null);
      setExtractedData(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Apostila MWB (PDF)
        </CardTitle>
        <CardDescription>
          Faça upload do PDF oficial da apostila "Vida e Ministério Cristão" para extrair automaticamente as partes da reunião
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar arquivo PDF:</label>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
        </div>

        {selectedFile && !extractedData && (
          <Button 
            onClick={processPDF} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processando PDF...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Processar Apostila
              </>
            )}
          </Button>
        )}

        {extractedData && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dados extraídos:</strong> {extractedData.semana}
                <br />
                <strong>Partes identificadas:</strong> {extractedData.partes.length}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Partes da reunião:</h4>
              {extractedData.partes.map((parte: ParteMeeting, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{parte.numero}. {parte.titulo}</span>
                    {parte.referencia && (
                      <span className="text-sm text-gray-600 ml-2">({parte.referencia})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{parte.tempo} min</Badge>
                    <Badge variant="outline">{parte.tipo}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={confirmarImportacao} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Importação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para geração automática de designações
const GeradorDesignacoes: React.FC<{ 
  programa: ProgramaSemanal | null;
  estudantes: any[];
  onDesignacoesGeradas: (designacoes: DesignacaoMinisterial[]) => void;
}> = ({ programa, estudantes, onDesignacoesGeradas }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [designacoesGeradas, setDesignacoesGeradas] = useState<DesignacaoMinisterial[]>([]);

  const gerarDesignacoes = async () => {
    if (!programa || !estudantes.length) return;

    setIsGenerating(true);
    try {
      // Simular lógica de geração automática seguindo regras S-38
      await new Promise(resolve => setTimeout(resolve, 1500));

      const designacoes: DesignacaoMinisterial[] = [];
      
      // Filtrar estudantes por critérios
      const homens = estudantes.filter(e => e.genero === 'masculino' && e.ativo);
      const mulheres = estudantes.filter(e => e.genero === 'feminino' && e.ativo);
      const qualificados = homens.filter(e => 
        ['anciao', 'servo_ministerial', 'publicador_batizado'].includes(e.cargo)
      );

      programa.partes.forEach((parte, index) => {
        let estudantePrincipal = null;
        let estudanteAjudante = null;

        // Aplicar regras oficiais do S-38-E conforme tipo da parte
        switch (parte.numero) {
          case 3: // Talk (Tesouros da Palavra de Deus)
            // Apenas anciãos ou servos ministeriais qualificados
            if (qualificados.length > 0) {
              estudantePrincipal = qualificados[Math.floor(Math.random() * qualificados.length)];
            }
            break;

          case 4: // Spiritual Gems (Joias Espirituais)
            // Apenas anciãos ou servos ministeriais qualificados
            if (qualificados.length > 0) {
              estudantePrincipal = qualificados[Math.floor(Math.random() * qualificados.length)];
            }
            break;

          case 5: // Bible Reading (Leitura da Bíblia)
            // Apenas estudantes masculinos
            if (homens.length > 0) {
              estudantePrincipal = homens[Math.floor(Math.random() * homens.length)];
            }
            break;

          case 7: // Starting a Conversation
            // Homem ou mulher, assistente do mesmo sexo ou parente
            const estudantesConversacao = [...homens, ...mulheres];
            if (estudantesConversacao.length > 0) {
              estudantePrincipal = estudantesConversacao[Math.floor(Math.random() * estudantesConversacao.length)];

              if (estudantePrincipal) {
                const mesmoSexo = estudantePrincipal.genero === 'masculino' ? homens : mulheres;
                const ajudantesPossiveis = mesmoSexo.filter(e => e.id !== estudantePrincipal.id);
                if (ajudantesPossiveis.length > 0) {
                  estudanteAjudante = ajudantesPossiveis[Math.floor(Math.random() * ajudantesPossiveis.length)];
                }
              }
            }
            break;

          case 8: // Following Up
            // Homem ou mulher, assistente do mesmo sexo
            const estudantesRevisita = [...homens, ...mulheres];
            if (estudantesRevisita.length > 0) {
              estudantePrincipal = estudantesRevisita[Math.floor(Math.random() * estudantesRevisita.length)];

              if (estudantePrincipal) {
                const mesmoSexo = estudantePrincipal.genero === 'masculino' ? homens : mulheres;
                const ajudantesPossiveis = mesmoSexo.filter(e => e.id !== estudantePrincipal.id);
                if (ajudantesPossiveis.length > 0) {
                  estudanteAjudante = ajudantesPossiveis[Math.floor(Math.random() * ajudantesPossiveis.length)];
                }
              }
            }
            break;

          case 9: // Making Disciples
            // Homem ou mulher, assistente do mesmo sexo
            const estudantesDiscipulos = [...homens, ...mulheres];
            if (estudantesDiscipulos.length > 0) {
              estudantePrincipal = estudantesDiscipulos[Math.floor(Math.random() * estudantesDiscipulos.length)];

              if (estudantePrincipal) {
                const mesmoSexo = estudantePrincipal.genero === 'masculino' ? homens : mulheres;
                const ajudantesPossiveis = mesmoSexo.filter(e => e.id !== estudantePrincipal.id);
                if (ajudantesPossiveis.length > 0) {
                  estudanteAjudante = ajudantesPossiveis[Math.floor(Math.random() * ajudantesPossiveis.length)];
                }
              }
            }
            break;

          case 10: // Explaining Your Beliefs (Demonstration)
            // Homem ou mulher, assistente do mesmo sexo ou parente
            const estudantesExplicarDemo = [...homens, ...mulheres];
            if (estudantesExplicarDemo.length > 0) {
              estudantePrincipal = estudantesExplicarDemo[Math.floor(Math.random() * estudantesExplicarDemo.length)];

              if (estudantePrincipal) {
                const mesmoSexo = estudantePrincipal.genero === 'masculino' ? homens : mulheres;
                const ajudantesPossiveis = mesmoSexo.filter(e => e.id !== estudantePrincipal.id);
                if (ajudantesPossiveis.length > 0) {
                  estudanteAjudante = ajudantesPossiveis[Math.floor(Math.random() * ajudantesPossiveis.length)];
                }
              }
            }
            break;

          case 11: // Explaining Your Beliefs (Talk)
            // Apenas estudantes masculinos
            if (homens.length > 0) {
              estudantePrincipal = homens[Math.floor(Math.random() * homens.length)];
            }
            break;

          case 16: // Congregation Bible Study
            // Apenas anciãos ou servos ministeriais qualificados
            if (qualificados.length > 0) {
              estudantePrincipal = qualificados[Math.floor(Math.random() * qualificados.length)];
            }
            break;
        }

        if (estudantePrincipal) {
          designacoes.push({
            id: `${programa.id}-${parte.numero}`,
            semana: programa.semana,
            data_inicio: programa.data_inicio,
            parte_numero: parte.numero,
            parte_titulo: parte.titulo,
            parte_tempo: parte.tempo,
            parte_tipo: parte.tipo as any,
            estudante_principal_id: estudantePrincipal.id,
            estudante_ajudante_id: estudanteAjudante?.id,
            cena: parte.cena,
            referencia_biblica: parte.referencia,
            instrucoes: parte.instrucoes,
            status: 'pendente'
          });
        }
      });

      setDesignacoesGeradas(designacoes);
      onDesignacoesGeradas(designacoes);

      toast({
        title: "Designações geradas!",
        description: `${designacoes.length} designações foram criadas automaticamente.`
      });

    } catch (error) {
      toast({
        title: "Erro ao gerar designações",
        description: "Não foi possível gerar as designações automaticamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!programa) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Primeiro importe uma apostila MWB para gerar as designações.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Geração Automática de Designações
        </CardTitle>
        <CardDescription>
          Gere designações automaticamente seguindo as regras do documento S-38
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Programa:</p>
            <p className="text-sm text-gray-600">{programa.semana}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Estudantes disponíveis:</p>
            <p className="text-sm text-gray-600">{estudantes.length} estudantes</p>
          </div>
        </div>

        <Button 
          onClick={gerarDesignacoes} 
          disabled={isGenerating || estudantes.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Gerando designações...
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Gerar Designações Automaticamente
            </>
          )}
        </Button>

        {designacoesGeradas.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Designações geradas:</h4>
            <div className="space-y-2">
              {designacoesGeradas.map((designacao, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{designacao.parte_titulo}</p>
                    <p className="text-sm text-gray-600">
                      Estudante: {estudantes.find(e => e.id === designacao.estudante_principal_id)?.nome}
                      {designacao.estudante_ajudante_id && (
                        <> + {estudantes.find(e => e.id === designacao.estudante_ajudante_id)?.nome}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{designacao.parte_tempo} min</Badge>
                    <Badge variant="outline">{designacao.parte_tipo}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para sistema de notificações
const SistemaNotificacoes: React.FC<{ designacoes: DesignacaoMinisterial[] }> = ({ designacoes }) => {
  const [isEnviando, setIsEnviando] = useState(false);
  const [notificacoesEnviadas, setNotificacoesEnviadas] = useState<string[]>([]);

  const enviarNotificacoes = async () => {
    setIsEnviando(true);
    try {
      // Simular envio de notificações
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const designacoesPendentes = designacoes.filter(d => d.status === 'pendente');
      setNotificacoesEnviadas(designacoesPendentes.map(d => d.id));
      
      toast({
        title: "Notificações enviadas!",
        description: `${designacoesPendentes.length} estudantes foram notificados por e-mail e WhatsApp.`
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar notificações",
        description: "Não foi possível enviar as notificações.",
        variant: "destructive"
      });
    } finally {
      setIsEnviando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Sistema de Notificações
        </CardTitle>
        <CardDescription>
          Envie notificações automáticas por e-mail e WhatsApp para os estudantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Designações pendentes:</p>
            <p className="text-sm text-gray-600">
              {designacoes.filter(d => d.status === 'pendente').length}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Já notificadas:</p>
            <p className="text-sm text-gray-600">{notificacoesEnviadas.length}</p>
          </div>
        </div>

        <Button 
          onClick={enviarNotificacoes} 
          disabled={isEnviando || designacoes.length === 0}
          className="w-full"
        >
          {isEnviando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Enviando notificações...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Notificações
            </>
          )}
        </Button>

        <div className="space-y-2">
          <h4 className="font-medium">Configurações de notificação:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>E-mail com detalhes da parte</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>WhatsApp com link para portal</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Lembrete 24h antes da reunião</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para portal do estudante com PIX
const PortalEstudante: React.FC = () => {
  const [chavePixCopiada, setChavePixCopiada] = useState(false);
  
  // Chave PIX para doações (substitua pela chave real)
  const chavePix = "sua-chave-pix@exemplo.com";

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setChavePixCopiada(true);
    toast({
      title: "Chave PIX copiada!",
      description: "A chave PIX foi copiada para a área de transferência."
    });
    setTimeout(() => setChavePixCopiada(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Minhas Designações
          </CardTitle>
          <CardDescription>
            Visualize suas designações e prepare-se para as partes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exemplo de designação */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Leitura da Bíblia</h4>
              <Badge variant="secondary">4 min</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Semana:</strong> 2-8 de dezembro de 2024</p>
              <p><strong>Referência:</strong> Provérbios 25:1-17</p>
              <p><strong>Instruções:</strong> Apenas homens. Sem introdução ou conclusão.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">Confirmada</Badge>
              <Button size="sm" variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Preparada
              </Button>
            </div>
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica de preparação:</strong> Para a leitura da Bíblia, pratique a pronúncia e 
              familiarize-se com o contexto dos versículos. Lembre-se de não fazer introdução ou conclusão.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Sistema de doações via PIX */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Apoie o Sistema
          </CardTitle>
          <CardDescription>
            Ajude a manter o sistema funcionando com uma doação voluntária
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">QR Code PIX</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Chave PIX:</p>
              <div className="flex items-center gap-2">
                <Input 
                  value={chavePix} 
                  readOnly 
                  className="text-center"
                />
                <Button 
                  size="sm" 
                  onClick={copiarChavePix}
                  variant={chavePixCopiada ? "default" : "outline"}
                >
                  {chavePixCopiada ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    "Copiar"
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>💝 Sua doação ajuda a manter o sistema gratuito para todas as congregações</p>
              <p>🔒 Doações são anônimas e voluntárias</p>
              <p>💰 Custo mensal: R$ 50 (servidor + domínio)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal
export default function Designacoes() {
  const { user } = useAuth();
  const { estudantes } = useEstudantes();
  const [programaAtual, setProgramaAtual] = useState<ProgramaSemanal | null>(null);
  const [designacoes, setDesignacoes] = useState<DesignacaoMinisterial[]>([]);
  const [activeTab, setActiveTab] = useState("importar");

  const handleProgramaImportado = (programa: ProgramaSemanal) => {
    setProgramaAtual(programa);
    setActiveTab("gerar");
    toast({
      title: "Programa importado!",
      description: `Programa da semana ${programa.semana} foi importado com sucesso.`
    });
  };

  const handleDesignacoesGeradas = (novasDesignacoes: DesignacaoMinisterial[]) => {
    setDesignacoes(novasDesignacoes);
    setActiveTab("notificar");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero
          title="Sistema de Designações Ministeriais"
          subtitle="Automatize a atribuição de designações da Reunião Vida e Ministério Cristão"
        />

        {/* Card de instruções oficiais S-38-E */}
        <div className="container mx-auto p-6">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Instruções Oficiais S-38-E
              </CardTitle>
              <CardDescription>
                Segue o fluxo e regras oficiais para atribuição de partes e designações da Reunião Vida e Ministério Cristão. <a href="https://www.jw.org/pt/publicacoes/jw-meeting-workbook/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver documento completo</a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <ul className="list-disc pl-6">
                <li><strong>Comentários Iniciais:</strong> 1 min. Gerar expectativa para o programa.</li>
                <li><strong>Tesouros da Palavra de Deus:</strong> Discurso (10 min, ancião/servo qualificado), Joias espirituais (10 min, ancião/servo qualificado), Leitura da Bíblia (4 min, apenas homens).</li>
                <li><strong>Ministério de Campo:</strong> Iniciando conversas, Revisita, Fazendo discípulos, Explicando crenças (ver regras de gênero e ajudante).</li>
                <li><strong>Vivendo como Cristãos:</strong> Partes de aplicação, Estudo bíblico de congregação (30 min, ancião/servo qualificado).</li>
                <li><strong>Comentários Finais:</strong> 3 min. Resumo, prévia da próxima semana, nomes dos designados.</li>
                <li><strong>Regras de designação:</strong> Gênero, cargo, ajudante do mesmo sexo ou parente, tempo de cada parte, validação automática.</li>
              </ul>
              <div className="mt-2 text-xs text-gray-500">Baseado no documento S-38-E 11/23. Para detalhes completos, consulte o <a href="https://www.jw.org/pt/publicacoes/jw-meeting-workbook/" target="_blank" rel="noopener noreferrer" className="underline">site oficial</a>.</div>
            </CardContent>
          </Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="importar" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importar
              </TabsTrigger>
              <TabsTrigger value="gerar" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Gerar
              </TabsTrigger>
              <TabsTrigger value="notificar" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notificar
              </TabsTrigger>
              <TabsTrigger value="portal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Portal
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="importar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImportacaoPDF onImportComplete={handleProgramaImportado} />
                <JWContentParser onParseComplete={handleProgramaImportado} />
              </div>
            </TabsContent>

            <TabsContent value="gerar" className="space-y-6">
              <GeradorDesignacoes 
                programa={programaAtual}
                estudantes={estudantes || []}
                onDesignacoesGeradas={handleDesignacoesGeradas}
              />
            </TabsContent>

            <TabsContent value="notificar" className="space-y-6">
              <SistemaNotificacoes designacoes={designacoes} />
            </TabsContent>

            <TabsContent value="portal" className="space-y-6">
              <PortalEstudante />
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Relatórios e Estatísticas
                  </CardTitle>
                  <CardDescription>
                    Visualize relatórios de participação e eficiência do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm text-gray-600">Designações automáticas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">87%</div>
                        <div className="text-sm text-gray-600">Taxa de visualização</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">2.3min</div>
                        <div className="text-sm text-gray-600">Tempo médio/semana</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">R$ 47</div>
                        <div className="text-sm text-gray-600">Doações mensais</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Relatório PDF
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Planilha Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <Button variant="outline" onClick={() => window.location.href = '/programas'}>Voltar</Button>
        <Button variant="default" onClick={() => window.location.href = '/relatorios'}>Prosseguir</Button>
      </div>
    </div>
  );
}
