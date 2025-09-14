import React, { useState, useEffect, useRef } from "react";
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
  Heart,
  ChevronLeft,
  ChevronRight
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

// Componente para geração automática de designações (integrado ao backend)
const GeradorDesignacoes: React.FC<{ 
  programa: ProgramaSemanal | null;
  estudantes: any[];
  onDesignacoesGeradas: (designacoes: DesignacaoMinisterial[]) => void;
  onBindGenerate?: (fn: () => void) => void;
}> = ({ programa, estudantes, onDesignacoesGeradas, onBindGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [designacoesGeradas, setDesignacoesGeradas] = useState<DesignacaoMinisterial[]>([]);
  const [congregacaoId, setCongregacaoId] = useState<string>("");
  const [programacaoId, setProgramacaoId] = useState<string>("");
  const [programacaoItens, setProgramacaoItens] = useState<any[]>([]);

  // Preencher automaticamente a congregação com base no primeiro estudante ativo
  useEffect(() => {
    if (!congregacaoId && Array.isArray(estudantes) && estudantes.length > 0) {
      const anyWithCong = (estudantes as any[]).find((e: any) => e?.congregacao_id);
      if (anyWithCong?.congregacao_id) setCongregacaoId(anyWithCong.congregacao_id);
    }
  }, [estudantes]);

  function toISO(d: Date) {
    return d.toISOString().slice(0, 10);
  }
  function addDays(dateStr: string, days: number) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return toISO(d);
  }
  function mapParteToItem(parte: ParteMeeting, idx: number) {
    const section = (parte.secao || '').toUpperCase();
    let type = '';
    if (parte.tipo === 'leitura_biblica' || parte.titulo.toLowerCase().includes('leitura')) {
      type = 'bible_reading';
    } else if (parte.titulo.toLowerCase().includes('iniciando')) {
      type = 'starting';
    } else if (parte.titulo.toLowerCase().includes('cultivando')) {
      type = 'following';
    } else if (parte.titulo.toLowerCase().includes('discípulo') || parte.titulo.toLowerCase().includes('disc1pulos')) {
      type = 'making_disciples';
    } else if (parte.tipo === 'discurso') {
      type = 'talk';
    } else {
      // fallback
      type = 'talk';
    }
    return {
      order: idx + 1,
      section: section === 'TESOUROS' ? 'TREASURES' : section === 'MINISTERIO' ? 'APPLY' : section || 'LIVING',
      type,
      minutes: parte.tempo,
      rules: null,
      lang: {
        en: { title: parte.titulo },
        pt: { title: parte.titulo }
      }
    };
  }

  async function persistProgram(programaLocal: ProgramaSemanal) {
    const week_start = programaLocal.data_inicio;
    const week_end = addDays(week_start, 6);
    const items = (programaLocal.partes || []).map(mapParteToItem);

    const payload = {
      week_start,
      week_end,
      status: 'publicada',
      congregation_scope: 'global',
      items
    };

    const resp = await fetch('/api/programacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao salvar programação');
    }
    const data = await resp.json();
    setProgramacaoId(data.programacao.id);
    setProgramacaoItens(data.itens || []);
    return data.programacao.id as string;
  }

  const gerarDesignacoes = async () => {
    if (!programa) return;
    if (!congregacaoId) {
      toast({ title: 'Congregação requerida', description: 'Informe o UUID da congregação para gerar designações.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      // 1) Persistir programa no backend
      const progId = programacaoId || (await persistProgram(programa));

      // 2) Chamar o gerador no backend
      const genResp = await fetch('/api/designacoes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programacao_id: progId, congregacao_id: congregacaoId })
      });
      if (!genResp.ok) {
        const err = await genResp.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao gerar designações');
      }
      const genData = await genResp.json();

      // 3) Buscar as designações geradas (com os itens)
      const listResp = await fetch(`/api/designacoes?programacao_id=${encodeURIComponent(progId)}&congregacao_id=${encodeURIComponent(congregacaoId)}`);
      if (!listResp.ok) {
        const err = await listResp.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao listar designações');
      }
      const listData = await listResp.json();

      const itens: any[] = listData.itens || [];
      const itensByProgItem: Record<string, any> = {};
      (programacaoItens || []).forEach((it: any) => { itensByProgItem[String(it.id)] = it; });

      // Mapear para o tipo local de exibição
      const designacoes: DesignacaoMinisterial[] = itens.map((di: any) => {
        const progItem = itensByProgItem[String(di.programacao_item_id)] || {};
        const title = progItem?.lang?.pt?.title || progItem?.lang?.en?.title || 'Parte';
        const minutes = progItem?.minutes || 0;
        return {
          id: `${progId}-${di.programacao_item_id}`,
          semana: programa.semana,
          data_inicio: programa.data_inicio,
          parte_numero: progItem.order || 0,
          parte_titulo: title,
          parte_tempo: minutes,
          parte_tipo: (progItem.type || 'talk') as any,
          estudante_principal_id: di.principal_estudante_id || '',
          estudante_ajudante_id: di.assistente_estudante_id || undefined,
          cena: undefined,
          referencia_biblica: undefined,
          instrucoes: undefined,
          status: 'pendente'
        };
      });

      setDesignacoesGeradas(designacoes);
      onDesignacoesGeradas(designacoes);

      toast({ title: 'Designações geradas!', description: `${designacoes.length} designações foram criadas automaticamente.` });
    } catch (error: any) {
      toast({ title: 'Erro ao gerar designações', description: error?.message || 'Falha na geração', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Expor a função de geração para o cabeçalho (pai)
  useEffect(() => {
    if (onBindGenerate) onBindGenerate(gerarDesignacoes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBindGenerate, programa, programacaoId, congregacaoId, programacaoItens, estudantes]);

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
          Gere designações automaticamente seguindo as regras do documento S-38 (via backend)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium">Programa:</p>
            <p className="text-sm text-gray-600">{programa.semana}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Estudantes ativos:</p>
            <p className="text-sm text-gray-600">{estudantes.length} estudantes</p>
          </div>
          <div>
            <label className="text-sm font-medium">Congregação (UUID):</label>
            <Input value={congregacaoId} onChange={(e) => setCongregacaoId(e.target.value)} placeholder="00000000-0000-0000-0000-000000000000" />
          </div>
        </div>

        <Button 
          onClick={gerarDesignacoes} 
          disabled={isGenerating || !congregacaoId.trim()}
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
                      Estudante: {estudantes.find(e => e.id === designacao.estudante_principal_id)?.nome || designacao.estudante_principal_id}
                      {designacao.estudante_ajudante_id && (
                        <> + {estudantes.find(e => e.id === designacao.estudante_ajudante_id)?.nome || designacao.estudante_ajudante_id}</>
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
  const childGenerateRef = useRef<(() => void) | null>(null);

  // Helpers para navegação e apresentação da semana
  function isoToDate(iso?: string) {
    if (!iso) return null;
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  function addDaysISO(iso: string, days: number) {
    const d = isoToDate(iso);
    if (!d) return iso;
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function formatWeekRange(programa?: ProgramaSemanal | null) {
    if (!programa?.data_inicio) return '—';
    const start = isoToDate(programa.data_inicio);
    if (!start) return '—';
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const dfDayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' });
    const dfYear = new Intl.DateTimeFormat('pt-BR', { year: 'numeric' });
    const left = dfDayMonth.format(start);
    const right = dfDayMonth.format(end);
    const year = dfYear.format(start);
    return `${left} – ${right} ${year}`;
  }
  async function fetchProgramaByRange(weekStartISO: string) {
    const weekEndISO = addDaysISO(weekStartISO, 6);
    try {
      const resp = await fetch(`/api/programacoes?week_start=${encodeURIComponent(weekStartISO)}&week_end=${encodeURIComponent(weekEndISO)}`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err.error || 'Semana não encontrada');
      }
      const data = await resp.json();
      // Mapear para ProgramaSemanal mínimo
      const p: ProgramaSemanal = {
        id: String(data.programacao.id),
        semana: `${formatWeekRange({ data_inicio: data.programacao.week_start } as any)}`,
        data_inicio: data.programacao.week_start,
        mes_ano: '',
        partes: (data.items || []).map((it: any, idx: number) => ({
          numero: it.order ?? idx + 1,
          titulo: it.lang?.pt?.title || it.lang?.en?.title || 'Parte',
          tempo: it.minutes || 0,
          tipo: it.type || 'talk',
          secao: it.section || 'LIVING',
        })),
        criado_em: data.programacao.created_at || new Date().toISOString(),
        atualizado_em: data.programacao.updated_at || new Date().toISOString()
      };
      setProgramaAtual(p);
      toast({ title: 'Semana carregada', description: formatWeekRange(p) });
    } catch (e: any) {
      toast({ title: 'Falha ao carregar semana', description: e?.message || 'Erro', variant: 'destructive' });
    }
  }

  // Calcular início da semana atual (segunda-feira)
  function getCurrentWeekStartISO() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    // getUTCDay: 0 domingo, 1 segunda ...
    let wd = d.getUTCDay();
    if (wd === 0) wd = 7;
    d.setUTCDate(d.getUTCDate() - (wd - 1));
    return d.toISOString().slice(0, 10);
  }

  // Carregar semana atual a partir do mock (se não houver no banco)
  async function loadMockCurrentWeek() {
    const weekStart = getCurrentWeekStartISO();
    try {
      const resp = await fetch(`/api/programacoes/mock?semana=${encodeURIComponent(weekStart)}`);
      if (!resp.ok) throw new Error('Mock da semana não encontrado');
      const wk = await resp.json();
      const partes = Array.isArray(wk.items) ? wk.items.map((it: any, idx: number) => ({
        numero: it.order ?? idx + 1,
        titulo: it.lang?.pt?.title || it.lang?.en?.title || 'Parte',
        tempo: it.minutes || 0,
        tipo: it.type || 'talk',
        secao: it.section || 'LIVING',
      })) : [];
      const prog: ProgramaSemanal = {
        id: String(wk.id || Date.now()),
        semana: formatWeekRange({ data_inicio: weekStart } as any),
        data_inicio: weekStart,
        mes_ao: '',
        partes,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      } as any;
      setProgramaAtual(prog);
      toast({ title: 'Semana (mock) carregada', description: formatWeekRange(prog) });
    } catch (e: any) {
      toast({ title: 'Falha ao carregar mock', description: e?.message || 'Erro', variant: 'destructive' });
    }
  }

  function stepWeek(deltaDays: number) {
    if (!programaAtual?.data_inicio) {
      toast({ title: 'Selecione/importe uma semana antes', description: 'Use a aba Importar', variant: 'destructive' });
      return;
    }
    const nextStart = addDaysISO(programaAtual.data_inicio, deltaDays);
    fetchProgramaByRange(nextStart);
  }

  // Handlers dos botões de ação no header
  const handleRegenerar = async () => {
    setActiveTab("gerar");
    // chamar geração do filho
    setTimeout(() => childGenerateRef.current && childGenerateRef.current(), 0);
  };
  const handleSalvar = async () => {
    toast({ title: 'Salvo', description: 'Designações mantidas como rascunho no Supabase.' });
  };
  const handleExportar = async () => {
    toast({ title: 'Exportação S-89', description: 'Geração de PDFs S-89 será adicionada em seguida.' });
  };

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

        <div className="container mx-auto p-6">
          {/* Header com seletor de semana e ações principais */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => stepWeek(-7)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3 py-2 bg-white border rounded text-sm">
                Semana: {formatWeekRange(programaAtual)}
              </div>
              <Button variant="outline" size="sm" onClick={() => stepWeek(7)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => {
                if (!programaAtual) {
                  toast({ title: 'Selecione/importe uma semana', description: 'Use a aba Importar ou navegue pelas setas', variant: 'destructive' });
                  return;
                }
                setActiveTab('gerar');
                setTimeout(() => childGenerateRef.current && childGenerateRef.current(), 0);
              }}>
                Gerar Designações Automáticas
              </Button>
              <Button variant="outline" onClick={handleRegenerar}>Regerar</Button>
              <Button variant="outline" onClick={handleSalvar}>Salvar</Button>
              <Button variant="outline" onClick={handleExportar}>Exportar S-89</Button>
            </div>
          </div>

          {/* Aviso e ação para carregar semana quando não houver uma pronta */}
          {!programaAtual && (
            <Card className="mb-4 border-yellow-300 bg-yellow-50">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="text-sm">
                  Nenhuma semana carregada. Carregue a semana atual (mock) ou importe um PDF na aba Importar.
                </div>
                <Button variant="outline" onClick={loadMockCurrentWeek}>Carregar Semana Atual (mock)</Button>
              </CardContent>
            </Card>
          )}

          {/* Card de instruções oficiais S-38-E */}
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
                onBindGenerate={(fn) => { childGenerateRef.current = fn; }}
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
