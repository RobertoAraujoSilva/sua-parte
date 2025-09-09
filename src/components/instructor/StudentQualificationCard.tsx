import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Save, 
  X,
  MessageSquare
} from 'lucide-react';
import { 
  EstudanteWithProgress, 
  StudentQualifications, 
  SpeechType,
  SPEECH_TYPE_LABELS,
  SPEECH_TYPE_ICONS,
  PROGRESS_LEVEL_LABELS,
  PROGRESS_LEVEL_COLORS,
  CARGO_LABELS,
  GENERO_LABELS
} from '@/types/estudantes';
import { cn } from '@/lib/utils';

interface StudentQualificationCardProps {
  student: EstudanteWithProgress;
  onUpdateQualifications: (studentId: string, qualifications: StudentQualifications) => Promise<void>;
  onUpdateProgress: (studentId: string, progressLevel: string, notes?: string) => Promise<void>;
  isDragging?: boolean;
  className?: string;
}

export const StudentQualificationCard: React.FC<StudentQualificationCardProps> = ({
  student,
  onUpdateQualifications,
  onUpdateProgress,
  isDragging = false,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localQualifications, setLocalQualifications] = useState<StudentQualifications>(
    student.qualifications || {
      bible_reading: false,
      initial_call: false,
      return_visit: false,
      bible_study: false,
      talk: false,
      demonstration: false,
      can_be_helper: false,
      can_teach_others: false
    }
  );
  const [notes, setNotes] = useState(student.progress?.instructor_feedback || '');

  // Determine available speech types based on S-38-T rules
  const getAvailableSpeechTypes = (): SpeechType[] => {
    const types: SpeechType[] = [];
    
    // Part 3 - Bible Reading (Men only)
    if (student.genero === 'masculino') {
      types.push('bible_reading');
    }
    
    // Parts 4-7 - All students can do demonstrations and initial calls
    types.push('initial_call', 'return_visit', 'bible_study', 'demonstration');
    
    // Talks only for qualified men (Ancião, Servo Ministerial, Pioneiro Regular, Publicador Batizado)
    if (student.genero === 'masculino' && 
        ['anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado'].includes(student.cargo)) {
      types.push('talk');
    }
    
    return types;
  };

  const availableSpeechTypes = getAvailableSpeechTypes();

  const handleQualificationChange = (speechType: SpeechType, enabled: boolean) => {
    setLocalQualifications(prev => ({
      ...prev,
      [speechType]: enabled
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdateQualifications(student.id, localQualifications);
      if (notes !== (student.progress?.instructor_feedback || '')) {
        await onUpdateProgress(student.id, student.progress?.progress_level || 'beginning', notes);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating student qualifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setLocalQualifications(student.qualifications || {
      bible_reading: false,
      initial_call: false,
      return_visit: false,
      bible_study: false,
      talk: false,
      demonstration: false,
      can_be_helper: false,
      can_teach_others: false
    });
    setNotes(student.progress?.instructor_feedback || '');
    setIsEditing(false);
  };

  const getQualificationCount = () => {
    return Object.values(localQualifications).filter(Boolean).length;
  };

  const progressLevel = student.progress?.progress_level || 'beginning';
  const progressColors = PROGRESS_LEVEL_COLORS[progressLevel];

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg",
        isDragging && "opacity-50 rotate-2 scale-105",
        className
      )}
      data-student-id={student.id}
      data-tutorial="qualification-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-jw-blue/10 rounded-lg">
              <User className="w-5 h-5 text-jw-blue" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {student.nome}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {CARGO_LABELS[student.cargo]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {GENERO_LABELS[student.genero]}
                </Badge>
                <Badge className={cn("text-xs", progressColors)}>
                  {PROGRESS_LEVEL_LABELS[progressLevel]}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Student Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{student.idade} anos</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{student.progress?.total_assignments || 0} designações</span>
          </div>
        </div>

        {/* Speech Type Qualifications */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 text-sm">Qualificações S-38-T:</h4>
          <div className="grid grid-cols-1 gap-2">
            {availableSpeechTypes.map((speechType) => (
              <div key={speechType} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{SPEECH_TYPE_ICONS[speechType]}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {SPEECH_TYPE_LABELS[speechType]}
                  </span>
                </div>
                {isEditing ? (
                  <Switch
                    checked={localQualifications[speechType]}
                    onCheckedChange={(checked) => handleQualificationChange(speechType, checked)}
                    disabled={isLoading}
                  />
                ) : (
                  <div className="flex items-center">
                    {localQualifications[speechType] ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Capabilities */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 text-sm">Capacidades Adicionais:</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Pode ser ajudante</span>
              {isEditing ? (
                <Switch
                  checked={localQualifications.can_be_helper}
                  onCheckedChange={(checked) => handleQualificationChange('can_be_helper' as SpeechType, checked)}
                  disabled={isLoading}
                />
              ) : (
                localQualifications.can_be_helper ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )
              )}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Pode ensinar outros</span>
              {isEditing ? (
                <Switch
                  checked={localQualifications.can_teach_others}
                  onCheckedChange={(checked) => handleQualificationChange('can_teach_others' as SpeechType, checked)}
                  disabled={isLoading}
                />
              ) : (
                localQualifications.can_teach_others ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-300" />
                )
              )}
            </div>
          </div>
        </div>

        {/* Instructor Notes */}
        {isEditing && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 text-sm">Observações do Instrutor:</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o progresso do estudante..."
              className="min-h-[80px] text-sm"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {getQualificationCount()} de {availableSpeechTypes.length + 2} qualificações
            </span>
            <Badge variant="outline" className="text-xs">
              {Math.round((getQualificationCount() / (availableSpeechTypes.length + 2)) * 100)}% completo
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentQualificationCard;
