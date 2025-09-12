import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Eye, Calendar, CheckCircle } from 'lucide-react';

interface ProgramPublisherProps {
  programs: any[];
  onPublish?: () => void;
}

const ProgramPublisher: React.FC<ProgramPublisherProps> = ({ programs, onPublish }) => {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const publishSelected = async () => {
    if (selectedPrograms.length === 0) return;
    
    setPublishing(true);
    try {
      const { error } = await supabase
        .from('programas')
        .update({ status: 'ativo', published_at: new Date().toISOString() })
        .in('id', selectedPrograms);

      if (!error) {
        setSelectedPrograms([]);
        onPublish?.();
      }
    } catch (error) {
      console.error('Error publishing programs');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Publicar Programação</h3>
        <Button 
          onClick={publishSelected}
          disabled={selectedPrograms.length === 0 || publishing}
        >
          <Eye className="mr-2 h-4 w-4" />
          Publicar {selectedPrograms.length > 0 && `(${selectedPrograms.length})`}
        </Button>
      </div>

      <div className="space-y-3">
        {programs.map((program) => (
          <Card key={program.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedPrograms.includes(program.id)}
                    onCheckedChange={() => toggleProgramSelection(program.id)}
                  />
                  <div>
                    <h4 className="font-semibold">{program.week}</h4>
                    <p className="text-sm text-muted-foreground">{program.date}</p>
                    <p className="text-sm mt-1">{program.theme}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={program.status === 'published' ? 'default' : 'secondary'}
                  >
                    {program.status === 'published' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Publicado
                      </>
                    ) : (
                      'Rascunho'
                    )}
                  </Badge>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma programação disponível para publicação</p>
        </div>
      )}
    </div>
  );
};

export default ProgramPublisher;