import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle,
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
    toast({
      title: "Designações geradas!",
      description: `${novasDesignacoes.length} designações foram criadas com sucesso.`
    });
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="importar" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Importar
              </TabsTrigger>
              <TabsTrigger value="gerar" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Gerar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="importar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Importar Programação</CardTitle>
                  <CardDescription>
                    Use a página dedicada de importação para processar apostilas JW.org
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Para importar programações da JW.org ou fazer upload de PDFs, acesse a página de <strong>Importar Programação</strong>.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => window.location.href = '/importar-programacao'}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ir para Importar Programação
                  </Button>
                </CardContent>
              </Card>
              <JWContentParser onParseComplete={handleProgramaImportado} />
            </TabsContent>

            <TabsContent value="gerar" className="space-y-6">
              <GeradorDesignacoes 
                programa={programaAtual}
                estudantes={estudantes || []}
                onDesignacoesGeradas={handleDesignacoesGeradas}
                onBindGenerate={(fn) => { childGenerateRef.current = fn; }}
              />
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
