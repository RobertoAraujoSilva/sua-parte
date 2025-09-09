import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { 
  EstudanteWithProgress, 
  ProgressLevel,
  DragDropResult,
  PROGRESS_LEVEL_LABELS,
  PROGRESS_LEVEL_COLORS
} from '@/types/estudantes';
import { StudentQualificationCard } from './StudentQualificationCard';
import { cn } from '@/lib/utils';

interface ProgressBoardProps {
  studentsByProgress: Record<ProgressLevel, EstudanteWithProgress[]>;
  onMoveStudent: (result: DragDropResult) => Promise<void>;
  onUpdateQualifications: (studentId: string, qualifications: any) => Promise<void>;
  onUpdateProgress: (studentId: string, progressLevel: string, notes?: string) => Promise<void>;
  isLoading?: boolean;
}

const PROGRESS_LEVELS: ProgressLevel[] = ['beginning', 'developing', 'qualified', 'advanced'];

const PROGRESS_LEVEL_ICONS = {
  beginning: Target,
  developing: TrendingUp,
  qualified: CheckCircle,
  advanced: Award
};

const PROGRESS_LEVEL_DESCRIPTIONS = {
  beginning: 'Estudantes novos que estão aprendendo o básico',
  developing: 'Estudantes em desenvolvimento com designações regulares',
  qualified: 'Estudantes competentes que podem receber todas as designações',
  advanced: 'Estudantes experientes que podem ensinar outros'
};

export const ProgressBoard: React.FC<ProgressBoardProps> = ({
  studentsByProgress,
  onMoveStudent,
  onUpdateQualifications,
  onUpdateProgress,
  isLoading = false
}) => {
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

  const handleDragStart = useCallback((start: any) => {
    setDraggedStudentId(start.draggableId);
  }, []);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    setDraggedStudentId(null);

    if (!result.destination) {
      return;
    }

    const { draggableId, source, destination } = result;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const fromLevel = source.droppableId as ProgressLevel;
    const toLevel = destination.droppableId as ProgressLevel;

    if (fromLevel !== toLevel) {
      const dragDropResult: DragDropResult = {
        student_id: draggableId,
        from_level: fromLevel,
        to_level: toLevel,
        timestamp: new Date().toISOString()
      };

      try {
        await onMoveStudent(dragDropResult);
      } catch (error) {
        console.error('Error moving student:', error);
      }
    }
  }, [onMoveStudent]);

  const getColumnStats = (level: ProgressLevel) => {
    const students = studentsByProgress[level] || [];
    const totalQualifications = students.reduce((sum, student) => {
      const qualifications = student.qualifications || {};
      return sum + Object.values(qualifications).filter(Boolean).length;
    }, 0);

    return {
      count: students.length,
      avgQualifications: students.length > 0 ? Math.round(totalQualifications / students.length) : 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Quadro de Progresso dos Estudantes
          </h3>
          <p className="text-gray-600 mt-1">
            Arraste os estudantes entre as colunas para atualizar seu nível de progresso
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowRight className="w-4 h-4" />
          <span>Arraste para mover</span>
        </div>
      </div>

      {/* Progress Board */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {PROGRESS_LEVELS.map((level) => {
            const students = studentsByProgress[level] || [];
            const stats = getColumnStats(level);
            const Icon = PROGRESS_LEVEL_ICONS[level];
            const colors = PROGRESS_LEVEL_COLORS[level];

            return (
              <div key={level} className="space-y-4">
                {/* Column Header */}
                <Card className={cn("border-2", colors.replace('bg-', 'border-').replace('-50', '-200'))}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", colors)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          {PROGRESS_LEVEL_LABELS[level]}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {PROGRESS_LEVEL_DESCRIPTIONS[level]}
                        </p>
                      </div>
                    </div>
                    
                    {/* Column Stats */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{stats.count} estudantes</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ~{stats.avgQualifications} qualificações
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Droppable Area */}
                <Droppable droppableId={level}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[400px] p-4 rounded-lg border-2 border-dashed transition-colors",
                        snapshot.isDraggingOver
                          ? "border-jw-blue bg-jw-blue/5"
                          : "border-gray-200 bg-gray-50/50"
                      )}
                      data-tutorial="drag-drop-area"
                    >
                      <div className="space-y-4">
                        {students.map((student, index) => (
                          <Draggable
                            key={student.id}
                            draggableId={student.id}
                            index={index}
                            isDragDisabled={isLoading}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-all duration-200",
                                  snapshot.isDragging && "rotate-2 scale-105 shadow-lg"
                                )}
                              >
                                <StudentQualificationCard
                                  student={student}
                                  onUpdateQualifications={onUpdateQualifications}
                                  onUpdateProgress={onUpdateProgress}
                                  isDragging={snapshot.isDragging || draggedStudentId === student.id}
                                  className={cn(
                                    "cursor-grab active:cursor-grabbing",
                                    snapshot.isDragging && "shadow-2xl"
                                  )}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Empty State */}
                        {students.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Users className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium">Nenhum estudante</p>
                            <p className="text-xs">Arraste estudantes para cá</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Board Footer with Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Dicas para Uso do Quadro:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Iniciante:</strong> Estudantes novos, designações básicas</li>
                <li>• <strong>Em Desenvolvimento:</strong> Estudantes regulares, várias designações</li>
                <li>• <strong>Qualificado:</strong> Estudantes competentes, todas as designações</li>
                <li>• <strong>Avançado:</strong> Estudantes experientes, podem ensinar outros</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressBoard;
