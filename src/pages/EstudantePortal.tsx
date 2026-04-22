import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, BookOpen, Home, LogOut, Bell, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Designacao {
  id: string;
  titulo_parte: string;
  tipo_parte: string | null;
  tempo_minutos: number | null;
  data_designacao: string | null;
  confirmado: boolean | null;
  cena: string | null;
}

const getColorForTipo = (tipo: string | null) => {
  switch (tipo) {
    case 'leitura':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'consideracao':
    case 'video+consideracao':
      return 'bg-secondary text-secondary-foreground border-border';
    case 'discurso':
      return 'bg-accent text-accent-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export function EstudantePortal() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!user?.id) return;
      try {
        // Find the estudante record linked to this user (by email).
        const email = user.email;
        const { data: estudante } = await supabase
          .from('estudantes')
          .select('id')
          .eq('email', email ?? '')
          .maybeSingle();

        if (!estudante) {
          setDesignacoes([]);
          return;
        }

        const { data, error } = await supabase
          .from('designacoes')
          .select('id, titulo_parte, tipo_parte, tempo_minutos, data_designacao, confirmado, cena')
          .or(`id_estudante.eq.${estudante.id},id_ajudante.eq.${estudante.id}`)
          .order('data_designacao', { ascending: true });

        if (error) throw error;
        setDesignacoes(data ?? []);
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
    };

    carregar();
  }, [user?.id, user?.email, toast]);

  const confirmar = async (id: string) => {
    const { error } = await supabase.from('designacoes').update({ confirmado: true }).eq('id', id);
    if (error) {
      toast({ title: 'Erro ao confirmar', description: error.message, variant: 'destructive' });
      return;
    }
    setDesignacoes((prev) => prev.map((d) => (d.id === id ? { ...d, confirmado: true } : d)));
    toast({ title: 'Designação confirmada' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const hoje = new Date().toISOString().split('T')[0];
  const proximas = designacoes.filter((d) => (d.data_designacao ?? '') >= hoje);
  const passadas = designacoes.filter((d) => (d.data_designacao ?? '') < hoje);
  const totalMin = designacoes.reduce((acc, d) => acc + (d.tempo_minutos ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando portal...</p>
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
              <User className="h-5 w-5 text-primary" />
              <span className="font-semibold">Portal do Estudante</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{user?.email}</Badge>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Olá!</h1>
          <p className="text-muted-foreground">Acompanhe suas designações da Escola do Ministério.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Stat icon={<Bell className="h-7 w-7 text-primary" />} label="Próximas" value={proximas.length} />
          <Stat icon={<Calendar className="h-7 w-7 text-primary" />} label="Total" value={designacoes.length} />
          <Stat
            icon={<Clock className="h-7 w-7 text-primary" />}
            label="Horas designadas"
            value={Number((totalMin / 60).toFixed(1))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Próximas Designações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proximas.length ? (
                <div className="space-y-3">
                  {proximas.map((d) => (
                    <DesignacaoItem key={d.id} d={d} onConfirmar={confirmar} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma designação futura.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passadas.length ? (
                <div className="space-y-3">
                  {passadas.map((d) => (
                    <DesignacaoItem key={d.id} d={d} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem histórico ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
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

function DesignacaoItem({
  d,
  onConfirmar,
}: {
  d: Designacao;
  onConfirmar?: (id: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h4 className="font-medium">{d.titulo_parte}</h4>
          {d.data_designacao && (
            <p className="text-sm text-muted-foreground">
              {new Date(d.data_designacao).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <Badge className={getColorForTipo(d.tipo_parte)}>
          <BookOpen className="h-3 w-3 mr-1" />
          {d.tipo_parte ?? 'parte'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {d.tempo_minutos ?? 0} min
        </span>
        {onConfirmar && (
          d.confirmado ? (
            <Badge variant="secondary">
              <Check className="h-3 w-3 mr-1" />
              Confirmado
            </Badge>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onConfirmar(d.id)}>
              <Check className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          )
        )}
      </div>
    </div>
  );
}
