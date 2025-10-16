import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Plus, Edit, Trash2, Download, Users, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { EstudanteRow } from '@/types/estudantes';

export function EstudantesManager() {
  const { user } = useAuth();
  const [estudantes, setEstudantes] = useState<EstudanteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEstudante, setEditingEstudante] = useState<EstudanteRow | null>(null);
  const [formData, setFormData] = useState<Partial<EstudanteRow>>({
    nome: '',
    idade: 0,
    genero: 'masculino',
    email: '',
    telefone: '',
    cargo: 'publicador_batizado',
    ativo: true,
    observacoes: ''
  });

  // Carregar estudantes do Supabase
  useEffect(() => {
    loadEstudantes();
  }, []);

  const loadEstudantes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      setEstudantes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  };

  // Importar dados do Excel
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Converter dados do Excel para formato do banco
      const estudantesImportados = jsonData.map((row: any) => ({
        user_id: user?.id,
        nome: row.nome || '',
        idade: parseInt(row.idade) || 0,
        genero: row.genero || 'masculino',
        email: row.email || '',
        telefone: row.telefone || '',
        data_batismo: row.data_batismo || null,
        cargo: row.cargo || 'publicador_batizado',
        ativo: row.ativo !== false,
        observacoes: row.observacoes || ''
      }));

      // Inserir no Supabase
      const { error } = await supabase
        .from('estudantes')
        .insert(estudantesImportados);

      if (error) throw error;

      setSuccess(`${estudantesImportados.length} estudantes importados com sucesso!`);
      await loadEstudantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar arquivo');
    } finally {
      setLoading(false);
      // Limpar input
      event.target.value = '';
    }
  };

  // Salvar estudante (criar ou editar)
  const handleSave = async () => {
    if (!formData.nome) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      if (editingEstudante) {
        // Editar
        const { error } = await supabase
          .from('estudantes')
          .update(formData)
          .eq('id', editingEstudante.id);

        if (error) throw error;
        setSuccess('Estudante atualizado com sucesso!');
      } else {
        // Criar novo - garantir campos obrigatórios
        const dataToInsert = {
          user_id: user?.id!,
          nome: formData.nome || '',
          genero: formData.genero || 'masculino',
          cargo: formData.cargo || 'publicador_batizado',
          idade: formData.idade,
          ativo: formData.ativo ?? true,
          email: formData.email,
          telefone: formData.telefone,
          data_batismo: formData.data_batismo,
          observacoes: formData.observacoes
        };
        const { error } = await supabase
          .from('estudantes')
          .insert([dataToInsert]);

        if (error) throw error;
        setSuccess('Estudante criado com sucesso!');
      }

      resetForm();
      await loadEstudantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar estudante');
    } finally {
      setLoading(false);
    }
  };

  // Excluir estudante
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este estudante?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('estudantes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Estudante excluído com sucesso!');
      await loadEstudantes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir estudante');
    } finally {
      setLoading(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      idade: 0,
      genero: 'masculino',
      email: '',
      telefone: '',
      cargo: 'publicador_batizado',
      ativo: true,
      observacoes: ''
    });
    setEditingEstudante(null);
    setShowForm(false);
  };

  // Editar estudante
  const handleEdit = (estudante: EstudanteRow) => {
    setFormData(estudante);
    setEditingEstudante(estudante);
    setShowForm(true);
  };

  // Exportar para Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(estudantes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudantes');
    XLSX.writeFile(workbook, 'estudantes_export.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gerenciar Estudantes</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Estudante
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estudantes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estudantes.filter(e => e.ativo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Masculino</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estudantes.filter(e => e.genero === 'masculino').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feminino</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estudantes.filter(e => e.genero === 'feminino').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Importar Excel */}
      <Card>
        <CardHeader>
          <CardTitle>Importar Estudantes do Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="max-w-sm"
            />
            <Button variant="outline" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Importar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Importe o arquivo estudantes_ficticios.xlsx ou qualquer arquivo Excel com dados de estudantes.
          </p>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEstudante ? 'Editar Estudante' : 'Novo Estudante'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="idade">Idade</Label>
                <Input
                  id="idade"
                  type="number"
                  value={formData.idade}
                  onChange={(e) => setFormData({...formData, idade: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="genero">Gênero</Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value: 'masculino' | 'feminino') => setFormData({...formData, genero: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) => setFormData({...formData, cargo: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publicador_batizado">Publicador Batizado</SelectItem>
                    <SelectItem value="publicador_nao_batizado">Publicador Não Batizado</SelectItem>
                    <SelectItem value="pioneiro_regular">Pioneiro Regular</SelectItem>
                    <SelectItem value="servo_ministerial">Servo Ministerial</SelectItem>
                  <SelectItem value="anciao">Ancião</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Observações sobre o estudante"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Estudantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudantes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Gênero</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudantes.map((estudante) => (
                  <TableRow key={estudante.id}>
                    <TableCell className="font-medium">{estudante.nome}</TableCell>
                    <TableCell>{estudante.idade}</TableCell>
                    <TableCell>
                      <Badge variant={estudante.genero === 'masculino' ? 'default' : 'secondary'}>
                        {estudante.genero}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {estudante.cargo.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={estudante.ativo ? 'default' : 'secondary'}>
                        {estudante.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(estudante)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(estudante.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
