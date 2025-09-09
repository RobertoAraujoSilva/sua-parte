import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useSupabaseMaterials } from '@/hooks/useSupabaseMaterials';
import { parseMWBContent, MWBProgram } from '@/utils/mwbParser';
import { Calendar, FileText, Eye, Upload } from 'lucide-react';

const ProgramManager: React.FC = () => {
  const { materials, loadMaterials } = useSupabaseMaterials();
  const [programs, setPrograms] = useState<MWBProgram[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    if (materials.length > 0) {
      const allPrograms: MWBProgram[] = [];
      
      materials
        .filter(m => m.name.includes('mwb_'))
        .forEach(material => {
          const parsed = parseMWBContent(material.name);
          allPrograms.push(...parsed);
        });
      
      setPrograms(allPrograms);
    }
  }, [materials]);

  const publishProgram = async (program: MWBProgram) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('programas')
        .insert({
          week: program.week,
          date: program.date,
          theme: program.theme,
          status: 'ativo',
          published_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error publishing program:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Programação</h2>
        <Button onClick={loadMaterials} variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Atualizar Materiais
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program, index) => (
          <Card key={`${program.week}-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Semana {program.week}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{program.date}</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-3">{program.theme}</h4>
              
              <div className="space-y-2 text-sm">
                <div>
                  <Badge variant="outline" className="mb-1">Tesouros</Badge>
                  {program.parts.treasures.map((part, i) => (
                    <p key={i} className="text-xs">{part.title} ({part.time})</p>
                  ))}
                </div>
                
                <div>
                  <Badge variant="outline" className="mb-1">Ministério</Badge>
                  {program.parts.ministry.map((part, i) => (
                    <p key={i} className="text-xs">{part.title} ({part.time})</p>
                  ))}
                </div>
                
                <div>
                  <Badge variant="outline" className="mb-1">Vida Cristã</Badge>
                  {program.parts.christianLife.map((part, i) => (
                    <p key={i} className="text-xs">{part.title} ({part.time})</p>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  onClick={() => publishProgram(program)}
                  disabled={loading}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Publicar
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma programação encontrada. Faça upload dos arquivos MWB no Supabase Storage.</p>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;