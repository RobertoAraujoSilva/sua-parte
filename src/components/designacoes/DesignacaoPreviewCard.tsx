import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  UserCheck, 
  Clock, 
  Edit2, 
  Check, 
  X, 
  BookOpen, 
  Users, 
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DesignacaoGerada } from "@/types/designacoes";
import type { EstudanteWithParent } from "@/types/estudantes";

interface DesignacaoPreviewCardProps {
  designacao: DesignacaoGerada;
  estudantes: EstudanteWithParent[];
  onUpdate: (designacao: DesignacaoGerada) => void;
  editable?: boolean;
}

export const DesignacaoPreviewCard: React.FC<DesignacaoPreviewCardProps> = ({
  designacao,
  estudantes,
  onUpdate,
  editable = true
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDesignacao, setEditedDesignacao] = useState<DesignacaoGerada>(designacao);

  const getEstudanteNome = (id: string) => {
    const estudante = estudantes.find(e => e.id === id);
    return estudante?.nome || `ID: ${id.slice(0, 8)}...`;
  };

  const getEstudante = (id: string) => {
    return estudantes.find(e => e.id === id);
  };

  const getPartTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'leitura_biblica':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'demonstracao':
      case 'parte_ministerio':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'discurso':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPartTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      leitura_biblica: 'Leitura da Bíblia',
      demonstracao: 'Demonstração',
      discurso: 'Discurso',
      parte_ministerio: 'Parte do Ministério',
      oracao_abertura: 'Oração de Abertura',
      comentarios_iniciais: 'Comentários Iniciais',
      tesouros_palavra: 'Tesouros da Palavra',
      joias_espirituais: 'Joias Espirituais',
      vida_crista: 'Vida Cristã',
      estudo_biblico_congregacao: 'Estudo Bíblico',
      oracao_encerramento: 'Oração de Encerramento',
      comentarios_finais: 'Comentários Finais'
    };
    return labels[tipo] || tipo;
  };

  const getPartTypeBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'leitura_biblica':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'demonstracao':
      case 'parte_ministerio':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'discurso':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const isMaleOnlyPart = (tipo: string) => {
    return ['leitura_biblica', 'discurso', 'tesouros_palavra', 'joias_espirituais', 
            'estudo_biblico_congregacao', 'oracao_abertura', 'oracao_encerramento',
            'comentarios_iniciais', 'comentarios_finais', 'vida_crista'].includes(tipo);
  };

  const getFilteredStudents = (forHelper: boolean = false) => {
    const estudantesAtivos = estudantes.filter(e => e.ativo !== false);
    
    // Apply gender restrictions for male-only parts
    if (isMaleOnlyPart(designacao.tipo_parte) && !forHelper) {
      return estudantesAtivos.filter(e => e.genero === 'masculino');
    }
    
    // For helpers, filter out the main student
    if (forHelper) {
      return estudantesAtivos.filter(e => e.id !== editedDesignacao.id_estudante);
    }
    
    return estudantesAtivos;
  };

  const handleSaveEdit = () => {
    onUpdate(editedDesignacao);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedDesignacao(designacao);
    setIsEditing(false);
  };

  const requiresHelper = ['demonstracao', 'parte_ministerio'].includes(designacao.tipo_parte);

  if (isEditing) {
    return (
      <Card className="border-2 border-primary/50 bg-primary/5">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Parte {designacao.numero_parte}
              </Badge>
              <Badge className={getPartTypeBadgeColor(designacao.tipo_parte)}>
                {getPartTypeLabel(designacao.tipo_parte)}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estudante Principal</label>
              <Select
                value={editedDesignacao.id_estudante}
                onValueChange={(value) => setEditedDesignacao(prev => ({ ...prev, id_estudante: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredStudents(false).map((estudante) => (
                    <SelectItem key={estudante.id} value={estudante.id}>
                      <div className="flex items-center gap-2">
                        <span>{estudante.nome}</span>
                        <Badge variant="outline" className="text-xs">
                          {estudante.genero === 'masculino' ? '♂' : '♀'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {requiresHelper && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Ajudante</label>
                <Select
                  value={editedDesignacao.id_ajudante || ''}
                  onValueChange={(value) => setEditedDesignacao(prev => ({ 
                    ...prev, 
                    id_ajudante: value || undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ajudante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {getFilteredStudents(true).map((estudante) => (
                      <SelectItem key={estudante.id} value={estudante.id}>
                        <div className="flex items-center gap-2">
                          <span>{estudante.nome}</span>
                          <Badge variant="outline" className="text-xs">
                            {estudante.genero === 'masculino' ? '♂' : '♀'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 p-2 rounded-full bg-muted">
              {getPartTypeIcon(designacao.tipo_parte)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="font-mono text-xs">
                  Parte {designacao.numero_parte}
                </Badge>
                <Badge className={`${getPartTypeBadgeColor(designacao.tipo_parte)} text-xs`}>
                  {getPartTypeLabel(designacao.tipo_parte)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {designacao.tempo_minutos} min
                </div>
              </div>

              {designacao.titulo_parte && (
                <p className="text-sm font-medium text-foreground mb-2 truncate">
                  {designacao.titulo_parte}
                </p>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950">
                  <User className="w-4 h-4 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-blue-600 font-medium">Estudante</p>
                    <p className="text-sm truncate">{getEstudanteNome(designacao.id_estudante)}</p>
                  </div>
                </div>

                {designacao.id_ajudante ? (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-green-600 font-medium">Ajudante</p>
                      <p className="text-sm truncate">{getEstudanteNome(designacao.id_ajudante)}</p>
                    </div>
                  </div>
                ) : requiresHelper ? (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-950">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-orange-600 font-medium">Ajudante</p>
                      <p className="text-sm text-orange-600">Não atribuído</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {designacao.cena && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                  <strong>Cenário:</strong> {designacao.cena}
                </p>
              )}
            </div>
          </div>

          {editable && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
              className="flex-shrink-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
