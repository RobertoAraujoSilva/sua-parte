import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Edit, Trash2, Download, Users, UserPlus, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { EstudanteRow } from '@/types/estudantes';
import { CARGO_LABELS } from '@/hooks/useEstudantes';
import {
  QUALIFICACOES, qualificacaoPermitida, sanearQualificacoes, normalizarCargo, normalizarGenero,
} from '@/utils/s38Qualificacoes';

type Form = Partial<EstudanteRow> & Record<string, any>;

const EMPTY: Form = {
  nome: '', idade: 0, genero: 'masculino', email: '', telefone: '', data_batismo: null,
  cargo: 'publicador_batizado', ativo: true, observacoes: '',
  ...Object.fromEntries(QUALIFICACOES.map((q) => [q.key, false])),
};

// Somente colunas editáveis (evita enviar id/user_id/created_at no update)
const EDITABLE = ['nome', 'idade', 'genero', 'email', 'telefone', 'data_batismo', 'cargo', 'ativo', 'observacoes', ...QUALIFICACOES.map((q) => q.key)];
const pick = (f: Form) => Object.fromEntries(EDITABLE.map((k) => [k, f[k] === '' && k !== 'nome' ? null : f[k] ?? null]));

export function EstudantesManager() {
  const { user } = useAuth();
  const [estudantes, setEstudantes] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('ativo');

  const notify = (type: 'error' | 'ok', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 5000);
  };

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase.from('estudantes').select('*').eq('user_id', user.id).order('nome');
    if (error) notify('error', 'Erro ao carregar estudantes: ' + error.message);
    else setEstudantes(data || []);
    setLoading(false);
  }, [user?.id]);

  // Recarrega quando o usuário fica disponível (antes rodava só uma vez, com user vazio)
  useEffect(() => { load(); }, [load]);

  const filtrados = useMemo(() => estudantes.filter((e) => {
    if (busca && !String(e.nome).toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroAtivo === 'ativo' && !e.ativo) return false;
    if (filtroAtivo === 'inativo' && e.ativo) return false;
    return true;
  }), [estudantes, busca, filtroAtivo]);

  const isDuplicate = (f: Form) => estudantes.some((e) => e.id !== editingId && (
    String(e.nome).trim().toLowerCase() === String(f.nome).trim().toLowerCase() ||
    (f.email && e.email && e.email.toLowerCase() === String(f.email).toLowerCase())
  ));

  const handleSave = async () => {
    const nome = String(form.nome || '').trim();
    if (!nome) return notify('error', 'Nome é obrigatório.');
    if (!form.idade || form.idade < 1 || form.idade > 120) return notify('error', 'Informe uma idade válida.');
    if (isDuplicate(form)) return notify('error', 'Já existe um estudante com este nome ou e-mail.');
    if (!user?.id) return;

    setSaving(true);
    const payload = sanearQualificacoes({ ...pick({ ...form, nome }) });
    const { error } = editingId
      ? await supabase.from('estudantes').update(payload as any).eq('id', editingId)
      : await supabase.from('estudantes').insert([{ ...payload, user_id: user.id } as any]);
    setSaving(false);
    if (error) return notify('error', 'Erro ao salvar: ' + error.message);
    notify('ok', editingId ? 'Estudante atualizado.' : 'Estudante criado.');
    resetForm();
    load();
  };

  const handleDelete = async (e: Form) => {
    if (!confirm(`Excluir ${e.nome}? Se tiver designações, ele será apenas desativado.`)) return;
    const { count } = await supabase.from('designacoes').select('id', { count: 'exact', head: true })
      .or(`id_estudante.eq.${e.id},id_ajudante.eq.${e.id}`);
    const { error } = count && count > 0
      ? await supabase.from('estudantes').update({ ativo: false }).eq('id', e.id)
      : await supabase.from('estudantes').delete().eq('id', e.id);
    if (error) return notify('error', 'Erro ao excluir: ' + error.message);
    notify('ok', count ? 'Estudante tem designações e foi desativado.' : 'Estudante excluído.');
    load();
  };

  const handleImport = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file || !user?.id) return;
    setLoading(true);
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]]);
      const existentes = new Set(estudantes.map((e) => String(e.nome).trim().toLowerCase()));
      let ignorados = 0;
      const novos = rows.flatMap((r) => {
        const nome = String(r.nome ?? r.Nome ?? '').trim();
        const idade = parseInt(r.idade ?? r.Idade);
        if (!nome || !idade || existentes.has(nome.toLowerCase())) { ignorados++; return []; }
        existentes.add(nome.toLowerCase());
        const base: Form = {
          ...EMPTY, nome, idade,
          genero: normalizarGenero(r.genero ?? r.Genero),
          cargo: normalizarCargo(r.cargo ?? r.Cargo),
          email: r.email || null, telefone: r.telefone ? String(r.telefone) : null,
          observacoes: r.observacoes || null, ativo: r.ativo !== false,
        };
        for (const q of QUALIFICACOES) base[q.key] = r[q.key] === true || r[q.key] === 1 || r[q.key] === 'sim';
        return [{ ...sanearQualificacoes(pick(base)), user_id: user.id }];
      });
      if (novos.length) {
        const { error } = await supabase.from('estudantes').insert(novos as any);
        if (error) throw error;
      }
      notify('ok', `${novos.length} importados${ignorados ? `, ${ignorados} ignorados (sem nome/idade ou duplicados)` : ''}.`);
      load();
    } catch (err) {
      notify('error', 'Erro ao importar: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(estudantes.map((e) => pick(e)));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estudantes');
    XLSX.writeFile(wb, 'estudantes.xlsx');
  };

  const resetForm = () => { setForm(EMPTY); setEditingId(null); setShowForm(false); };
  const handleEdit = (e: Form) => { setForm({ ...EMPTY, ...e }); setEditingId(e.id); setShowForm(true); };
  const set = (k: string, v: any) => setForm((f) => sanearQualificacoes({ ...f, [k]: v }));

  const stats = [
    ['Total', estudantes.length],
    ['Ativos', estudantes.filter((e) => e.ativo).length],
    ['Irmãos', estudantes.filter((e) => e.genero === 'masculino').length],
    ['Irmãs', estudantes.filter((e) => e.genero === 'feminino').length],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gerenciar Estudantes</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={!estudantes.length}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
          <Button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />Novo Estudante
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(([l, v]) => (
          <Card key={l as string}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{l}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{v}</div></CardContent>
          </Card>
        ))}
      </div>

      {msg && (
        <Alert variant={msg.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{msg.text}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar Estudante' : 'Novo Estudante'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="nome">Nome *</Label>
                <Input id="nome" value={form.nome ?? ''} onChange={(e) => set('nome', e.target.value)} placeholder="Nome completo" /></div>
              <div><Label htmlFor="idade">Idade *</Label>
                <Input id="idade" type="number" min={1} value={form.idade || ''} onChange={(e) => set('idade', parseInt(e.target.value) || 0)} /></div>
              <div><Label>Gênero</Label>
                <Select value={form.genero} onValueChange={(v) => set('genero', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select></div>
              <div><Label>Cargo</Label>
                <Select value={form.cargo} onValueChange={(v) => set('cargo', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CARGO_LABELS)
                      .filter(([k]) => form.genero === 'masculino' || !['anciao', 'servo_ministerial'].includes(k))
                      .map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                  </SelectContent>
                </Select></div>
              <div><Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} /></div>
              <div><Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" value={form.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} placeholder="(XX) XXXXX-XXXX" /></div>
              <div><Label htmlFor="batismo">Data de batismo</Label>
                <Input id="batismo" type="date" value={form.data_batismo ?? ''} onChange={(e) => set('data_batismo', e.target.value || null)} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="ativo" checked={!!form.ativo} onCheckedChange={(v) => set('ativo', v)} />
                <Label htmlFor="ativo">Ativo</Label>
              </div>
            </div>

            <div>
              <Label>Partes que pode fazer (S-38)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {QUALIFICACOES.map((q) => {
                  const ok = qualificacaoPermitida(q.key, form.genero, form.cargo);
                  return (
                    <label key={q.key} className={`flex items-center gap-2 text-sm ${ok ? '' : 'opacity-40'}`}>
                      <Checkbox checked={!!form[q.key]} disabled={!ok} onCheckedChange={(v) => set(q.key, !!v)} />
                      {q.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div><Label htmlFor="obs">Observações</Label>
              <Input id="obs" value={form.observacoes ?? ''} onChange={(e) => set('observacoes', e.target.value)} /></div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Importar do Excel</CardTitle></CardHeader>
        <CardContent>
          <Input type="file" accept=".xlsx,.xls" onChange={handleImport} className="max-w-sm" disabled={loading} />
          <p className="text-sm text-muted-foreground mt-2">
            Colunas: nome, idade, genero, cargo, email, telefone, observacoes. Linhas sem nome/idade ou com nome repetido são ignoradas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Lista de Estudantes</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroAtivo} onValueChange={(v: any) => setFiltroAtivo(v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum estudante encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead><TableHead>Idade</TableHead><TableHead>Cargo</TableHead>
                  <TableHead>Partes</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nome} <span className="text-muted-foreground text-xs">({e.genero === 'masculino' ? 'M' : 'F'})</span></TableCell>
                    <TableCell>{e.idade}</TableCell>
                    <TableCell><Badge variant="outline">{(CARGO_LABELS as any)[e.cargo] ?? e.cargo}</Badge></TableCell>
                    <TableCell>{QUALIFICACOES.filter((q) => e[q.key]).length}</TableCell>
                    <TableCell><Badge variant={e.ativo ? 'default' : 'secondary'}>{e.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" aria-label="Editar" onClick={() => handleEdit(e)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" aria-label="Excluir" onClick={() => handleDelete(e)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
