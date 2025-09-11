import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Plus, Users, Settings } from 'lucide-react';

interface Congregation {
  id: string;
  nome: string; // Changed from name to nome to match table
  instructors: number;
  students: number;
  status: 'active' | 'inactive';
}

const CongregationManager: React.FC = () => {
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [newCongregationName, setNewCongregationName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCongregations();
  }, []);

  const loadCongregations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('congregacoes')
        .select('id, nome');

      if (error) throw error;

      const loadedCongregations = data.map(c => ({
        id: c.id as string,
        nome: c.nome as string,
        instructors: 0, // Placeholder
        students: 0, // Placeholder
        status: 'active' as const
      }));

      setCongregations(loadedCongregations);
    } catch (error) {
      console.error('Error loading congregations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCongregation = async () => {
    if (!newCongregationName.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('congregacoes')
        .insert({ nome: newCongregationName })
        .select();

      if (error) throw error;
      
      if (data) {
        // Add the new congregation to the state
        const newCongregation: Congregation = {
            ...(data[0] as any),
            instructors: 0,
            students: 0,
            status: 'active'
        };
        setCongregations([...congregations, newCongregation]);
        setNewCongregationName('');
      }

    } catch (error) {
      console.error('Error creating congregation:', error);
      alert('Erro ao criar congregação. Verifique se o nome já existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Congregação</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Nome da congregação"
            value={newCongregationName}
            onChange={(e) => setNewCongregationName(e.target.value)}
          />
          <Button onClick={createCongregation} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Criar
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {congregations.map((congregation) => (
          <Card key={congregation.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">{congregation.nome}</h3>
                <Badge variant={congregation.status === 'active' ? 'default' : 'secondary'}>
                  {congregation.status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{congregation.instructors} instrutores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{congregation.students} estudantes</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-3">
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CongregationManager;