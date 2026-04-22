import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Save, Home, BookOpen, Download, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProgramacaoViewer, type DesignacaoLocal, type Parte, type Semana } from '@/components/ProgramacaoViewer';
import { useEstudantes } from '@/hooks/useEstudantes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchJWorgContent } from '@/lib/api/firecrawl-jworg';
import programacaoData from '@/data/programacoes-completas-2025.json';

// Approximate Monday date for each "periodo" string in the JSON.
// Used to populate `data_designacao` so portals can sort/filter by date.
const PERIODO_TO_DATE: Record<string, string> = {
  '8-14 de setembro 2025': '2025-09-08',
  '15-21 de setembro 2025': '2025-09-15',
  '22-28 de setembro 2025': '2025-09-22',
  '29 de setembro – 5 de outubro 2025': '2025-09-29',
  '6-12 de outubro 2025': '2025-10-06',
  '13-19 de outubro 2025': '2025-10-13',
  '20-26 de outubro 2025': '2025-10-20',
  '27 de outubro – 2 de novembro 2025': '2025-10-27',
  '3-9 de novembro 2025': '2025-11-03',
};

const dataParaSemana = (periodo: string): string =>
  PERIODO_TO_DATE[periodo] ?? new Date().toISOString().split('T')[0];

// Group flat parts list returned by Firecrawl into the secao-based structure used by ProgramacaoViewer
function agruparPartesPorSecao(parts: any[]): Semana['programacao'] {
  const secoes: Record<string, Parte[]> = {
    'Tesouros da Palavra de Deus': [],
    'Faça Seu Melhor no Ministério': [],
    'Nossa Vida Cristã': [],
  };

  parts.forEach((p, idx) => {
    const parte: Parte = {
      id: `jw_${idx}_${p.id ?? idx}`,
      titulo: p.title || 'Sem título',
      duracao: Number(p.duration) || 0,
      tipo: p.type || 'consideracao',
      referencias: Array.isArray(p.references) ? p.references : [],
    };

    const sec = (p.section || '').toLowerCase();
    if (sec.includes('tesouro') || sec.includes('treasure')) {
      secoes['Tesouros da Palavra de Deus'].push(parte);
    } else if (sec.includes('ministério') || sec.includes('ministry') || sec.includes('ministerio')) {
      secoes['Faça Seu Melhor no Ministério'].push(parte);
    } else {
      secoes['Nossa Vida Cristã'].push(parte);
    }
  });

  return Object.entries(secoes)
    .filter(([, partes]) => partes.length > 0)
    .map(([secao, partes]) => ({ secao, partes }));
}

export default function InstrutorDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { estudantes, isLoading: estudantesLoading } = useEstudantes();

  const semanasIniciais = (programacaoData as { semanas: Semana[] }).semanas;
  const [semanas, setSemanas] = useState<Semana[]>(semanasIniciais);
  const [designacoes, setDesignacoes] = useState<DesignacaoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const carregarDesignacoes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('designacoes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const mapped: DesignacaoLocal[] = (data ?? []).map((d) => ({
        id: d.id,
        parte_id: d.cena ?? '',
        semana_periodo: (d as any).observacoes_semana ?? '',
        id_estudante: d.id_estudante,
        id_ajudante: d.id_ajudante,
        titulo_parte: d.titulo_parte,
        tipo_parte: d.tipo_parte,
        tempo_minutos: d.tempo_minutos,
      }));

      // We store `parte_id` in the `cena` column and `semana_periodo`
      // is encoded into `data_designacao` via PERIODO_TO_DATE lookup.
      const semanaPorData = new Map<string, string>();
      Object.entries(PERIODO_TO_DATE).forEach(([periodo, date]) => semanaPorData.set(date, periodo));

      const enriched = mapped.map((d, i) => {
        const raw = data![i];
        return {
          ...d,
          semana_periodo: raw.data_designacao ? semanaPorData.get(raw.data_designacao) ?? '' : '',
        };
      });

      setDesignacoes(enriched);
    } catch (err) {
      console.error('Erro ao carregar designações:', err);
      toast({
        title: 'Erro ao carregar designações',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    carregarDesignacoes();
  }, [carregarDesignacoes]);

  const handleDesignar = async (parte: Parte, semana: Semana, estudanteId: string, ajudanteId?: string) => {
    if (!user?.id) {
      toast({ title: 'Sessão expirada', description: 'Faça login novamente.', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('designacoes')
        .insert({
          user_id: user.id,
          id_estudante: estudanteId,
          id_ajudante: ajudanteId ?? null,
          titulo_parte: parte.titulo,
          tipo_parte: parte.tipo ?? null,
          tempo_minutos: parte.duracao,
          data_designacao: dataParaSemana(semana.periodo),
          cena: parte.id,
        })
        .select()
        .single();

      if (error) throw error;

      setDesignacoes((prev) => [
        ...prev,
        {
          id: data.id,
          parte_id: parte.id,
          semana_periodo: semana.periodo,
          id_estudante: estudanteId,
          id_ajudante: ajudanteId ?? null,
          titulo_parte: parte.titulo,
          tipo_parte: parte.tipo ?? null,
          tempo_minutos: parte.duracao,
        },
      ]);

      toast({ title: 'Designação realizada', description: 'Estudante designado com sucesso.' });
    } catch (err) {
      console.error('Erro ao designar:', err);
      toast({
        title: 'Erro ao designar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleRemover = async (designacaoId: string) => {
    try {
      const { error } = await supabase.from('designacoes').delete().eq('id', designacaoId);
      if (error) throw error;
      setDesignacoes((prev) => prev.filter((d) => d.id !== designacaoId));
      toast({ title: 'Designação removida' });
    } catch (err) {
      console.error('Erro ao remover:', err);
      toast({
        title: 'Erro ao remover',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const atualizarDoJWorg = async () => {
    setRefreshing(true);
    try {
      const result = await fetchJWorgContent('pt');
      if (!result.success || !result.weeks?.length) {
        throw new Error(result.error || 'Nenhuma semana retornada do JW.org');
      }

      // Map Firecrawl weeks to our Semana shape
      const semanasJWorg: Semana[] = result.weeks.map((w: any, idx: number) => ({
        periodo: w.dateRange || w.week || `Semana ${idx + 1}`,
        tema: w.week || w.bibleReading || '',
        cantico_abertura: String(w.songs?.opening ?? ''),
        cantico_meio: String(w.songs?.middle ?? ''),
        cantico_encerramento: String(w.songs?.closing ?? ''),
        programacao: agruparPartesPorSecao(w.parts || []),
      }));

      // Merge: JW.org weeks first, fallback static weeks for the rest
      const periodosJW = new Set(semanasJWorg.map((s) => s.periodo));
      const estaticasFiltradas = semanasIniciais.filter((s) => !periodosJW.has(s.periodo));
      setSemanas([...semanasJWorg, ...estaticasFiltradas]);
      setLastSync(new Date().toLocaleString('pt-BR'));

      toast({
        title: 'Programação atualizada',
        description: `${semanasJWorg.length} semana(s) carregada(s) do JW.org via ${result.source ?? 'Firecrawl'}.`,
      });
    } catch (err) {
      console.error('Erro ao atualizar do JW.org:', err);
      toast({
        title: 'Falha ao atualizar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const exportarDesignacoes = () => {
    const blob = new Blob([JSON.stringify(designacoes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `designacoes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalDesignacoes = designacoes.length;
  const designacoesPrimeiraSemana = designacoes.filter(
    (d) => d.semana_periodo === semanas[0]?.periodo
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sistema Ministerial</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/estudantes')}>
              <Users className="h-4 w-4 mr-2" />
              Estudantes ({estudantes.length})
            </Button>
            <Button variant="outline" size="sm" onClick={exportarDesignacoes} disabled={!designacoes.length}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard do Instrutor</h1>
          <p className="text-muted-foreground">
            Visualize a programação oficial e designe estudantes para cada parte da reunião.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Calendar className="h-7 w-7 text-primary" />} label="Semanas" value={semanas.length} />
          <StatCard icon={<Users className="h-7 w-7 text-primary" />} label="Estudantes" value={estudantes.length} />
          <StatCard icon={<Save className="h-7 w-7 text-primary" />} label="Designações" value={totalDesignacoes} />
          <StatCard
            icon={<Clock className="h-7 w-7 text-primary" />}
            label="Próxima semana"
            value={designacoesPrimeiraSemana}
          />
        </div>

        <Tabs defaultValue="programacao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programacao">
              <BookOpen className="h-4 w-4 mr-2" />
              Programação
            </TabsTrigger>
            <TabsTrigger value="designacoes">
              <Calendar className="h-4 w-4 mr-2" />
              Designações
            </TabsTrigger>
            <TabsTrigger value="estudantes">
              <Users className="h-4 w-4 mr-2" />
              Estudantes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programacao">
            <ProgramacaoViewer
              semanas={semanas}
              estudantes={estudantes}
              designacoes={designacoes}
              onDesignar={handleDesignar}
              onRemover={handleRemover}
            />
          </TabsContent>

          <TabsContent value="designacoes">
            <Card>
              <CardHeader>
                <CardTitle>Todas as designações</CardTitle>
              </CardHeader>
              <CardContent>
                {designacoes.length ? (
                  <div className="space-y-3">
                    {designacoes.map((d) => {
                      const estudante = estudantes.find((e) => e.id === d.id_estudante);
                      return (
                        <div key={d.id} className="border rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{d.titulo_parte}</h4>
                            <p className="text-sm text-muted-foreground">
                              {d.semana_periodo || '—'} • {d.tempo_minutos ?? 0} min
                            </p>
                          </div>
                          <Badge>{estudante?.nome ?? 'N/A'}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhuma designação ainda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estudantes">
            <Card>
              <CardHeader>
                <CardTitle>Estudantes cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {estudantesLoading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando...</p>
                ) : estudantes.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estudantes.map((e) => (
                      <div key={e.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{e.nome}</h4>
                          <Badge variant={e.genero === 'masculino' ? 'default' : 'secondary'}>
                            {e.genero === 'masculino' ? 'M' : 'F'}
                          </Badge>
                        </div>
                        {e.cargo && <p className="text-sm text-muted-foreground">{e.cargo}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="mb-4">Nenhum estudante cadastrado ainda.</p>
                    <Button onClick={() => navigate('/estudantes')}>Cadastrar estudantes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
