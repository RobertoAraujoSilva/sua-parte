/**
 * Designações da semana — o instrutor vê as partes da semana selecionada
 * e marca como concluídas as que foram apresentadas na reunião.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  titulo_parte: string;
  tempo_minutos: number | null;
  data_designacao: string | null;
  numero_parte: number | null;
  confirmado: boolean | null;
  concluido: boolean;
  estudante: { nome: string } | null;
  ajudante: { nome: string } | null;
}

const toISO = (d: Date) => format(d, "yyyy-MM-dd");

export default function Designacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inicio, setInicio] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<"pendentes" | "concluidas">("pendentes");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const fim = addDays(inicio, 6);

  const carregar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("designacoes")
      .select(
        "id, titulo_parte, tempo_minutos, data_designacao, numero_parte, confirmado, concluido, estudante:estudantes!designacoes_id_estudante_fkey(nome), ajudante:estudantes!designacoes_id_ajudante_fkey(nome)"
      )
      .eq("user_id", user.id)
      .gte("data_designacao", toISO(inicio))
      .lte("data_designacao", toISO(fim))
      .order("data_designacao")
      .order("numero_parte");
    if (error) {
      toast({ title: "Não foi possível carregar as designações", description: error.message, variant: "destructive" });
      setItens([]);
    } else {
      setItens((data ?? []) as unknown as Item[]);
    }
    setSelecionados(new Set());
    setLoading(false);
  }, [user, inicio]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { carregar(); }, [carregar]);

  const visiveis = useMemo(
    () => itens.filter((i) => (aba === "pendentes" ? !i.concluido : i.concluido)),
    [itens, aba]
  );
  const pendentes = itens.filter((i) => !i.concluido).length;

  const marcar = async (ids: string[], concluido: boolean) => {
    if (!ids.length) return;
    const { error } = await supabase
      .from("designacoes")
      .update({ concluido, concluido_em: concluido ? new Date().toISOString() : null })
      .in("id", ids);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setItens((prev) => prev.map((i) => (ids.includes(i.id) ? { ...i, concluido } : i)));
    setSelecionados(new Set());
    toast({ title: concluido ? `${ids.length} designação(ões) finalizada(s)` : "Designação reaberta" });
  };

  const alternar = (id: string) =>
    setSelecionados((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-6 pt-20 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Designações da semana</h1>
            <p className="text-sm text-muted-foreground">
              {format(inicio, "d 'de' MMM", { locale: ptBR })} – {format(fim, "d 'de' MMM yyyy", { locale: ptBR })} · {pendentes} pendente(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Semana anterior" onClick={() => setInicio(addDays(inicio, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setInicio(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Hoje</Button>
            <Button variant="outline" size="icon" aria-label="Próxima semana" onClick={() => setInicio(addDays(inicio, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={aba} onValueChange={(v) => setAba(v as typeof aba)}>
            <TabsList>
              <TabsTrigger value="pendentes">Pendentes ({pendentes})</TabsTrigger>
              <TabsTrigger value="concluidas">Concluídas ({itens.length - pendentes})</TabsTrigger>
            </TabsList>
          </Tabs>
          {aba === "pendentes" && visiveis.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => marcar([...selecionados], true)} disabled={!selecionados.size}>
                Finalizar selecionadas ({selecionados.size})
              </Button>
              <Button size="sm" onClick={() => marcar(visiveis.map((i) => i.id), true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar todas
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{aba === "pendentes" ? "Aguardando a reunião" : "Já apresentadas"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Carregando…</p>
            ) : visiveis.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {aba === "pendentes" ? "Nenhuma designação pendente nesta semana." : "Nenhuma designação concluída nesta semana."}
              </p>
            ) : (
              visiveis.map((i) => (
                <div key={i.id} className="flex items-center gap-3 rounded-md border p-3">
                  {aba === "pendentes" && (
                    <Checkbox checked={selecionados.has(i.id)} onCheckedChange={() => alternar(i.id)} aria-label={`Selecionar ${i.titulo_parte}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {i.numero_parte ? `${i.numero_parte}. ` : ""}{i.titulo_parte}
                      {i.tempo_minutos ? <span className="text-muted-foreground font-normal"> · {i.tempo_minutos} min</span> : null}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {i.estudante?.nome ?? "Sem estudante"}{i.ajudante?.nome ? ` + ${i.ajudante.nome}` : ""}
                      {i.data_designacao ? ` · ${format(new Date(i.data_designacao + "T12:00:00"), "EEE dd/MM", { locale: ptBR })}` : ""}
                    </p>
                  </div>
                  {i.confirmado && <Badge variant="secondary">Confirmada</Badge>}
                  {aba === "pendentes" ? (
                    <Button size="sm" onClick={() => marcar([i.id], true)}>
                      <CheckCircle2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Finalizar</span>
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => marcar([i.id], false)}>
                      <Undo2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Reabrir</span>
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
