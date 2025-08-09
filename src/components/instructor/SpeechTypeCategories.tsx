import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Mic, 
  UserCheck,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  EstudanteWithProgress, 
  SpeechType,
  SPEECH_TYPE_LABELS,
  SPEECH_TYPE_ICONS,
  CARGO_LABELS,
  GENERO_LABELS
} from '@/types/estudantes';
import { cn } from '@/lib/utils';

interface SpeechTypeCategoriesProps {
  studentsBySpeechType: Record<SpeechType, EstudanteWithProgress[]>;
  onUpdateQualifications: (studentId: string, qualifications: any) => Promise<void>;
  onUpdateProgress: (studentId: string, progressLevel: string, notes?: string) => Promise<void>;
  className?: string;
}

const SPEECH_TYPE_DESCRIPTIONS = {
  bible_reading: 'Leitura da Bíblia (Parte 3) - Apenas homens qualificados',
  initial_call: 'Primeira Conversa - Todos os estudantes podem participar',
  return_visit: 'Revisita - Estudantes com experiência básica',
  bible_study: 'Estudo Bíblico - Estudantes mais experientes',
  talk: 'Discurso - Apenas homens qualificados para ensinar',
  demonstration: 'Demonstração - Todos os estudantes podem participar'
};

const SPEECH_TYPE_COLORS = {
  bible_reading: 'bg-purple-50 border-purple-200 text-purple-800',
  initial_call: 'bg-green-50 border-green-200 text-green-800',
  return_visit: 'bg-blue-50 border-blue-200 text-blue-800',
  bible_study: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  talk: 'bg-red-50 border-red-200 text-red-800',
  demonstration: 'bg-yellow-50 border-yellow-200 text-yellow-800'
};

export const SpeechTypeCategories: React.FC<SpeechTypeCategoriesProps> = ({
  studentsBySpeechType,
  onUpdateQualifications,
  onUpdateProgress,
  className
}) => {
  const [selectedSpeechType, setSelectedSpeechType] = useState<SpeechType>('bible_reading');
  const [showOnlyQualified, setShowOnlyQualified] = useState(false);

  const getStudentsForSpeechType = (speechType: SpeechType) => {
    const allStudents = studentsBySpeechType[speechType] || [];
    
    if (showOnlyQualified) {
      return allStudents.filter(student => 
        student.qualifications?.[speechType] === true
      );
    }
    
    return allStudents;
  };

  const getQualificationStats = (speechType: SpeechType) => {
    const students = studentsBySpeechType[speechType] || [];
    const qualified = students.filter(student => 
      student.qualifications?.[speechType] === true
    ).length;
    
    return {
      total: students.length,
      qualified,
      percentage: students.length > 0 ? Math.round((qualified / students.length) * 100) : 0
    };
  };

  const getSpeechTypeIcon = (speechType: SpeechType) => {
    const iconMap = {
      bible_reading: BookOpen,
      initial_call: MessageCircle,
      return_visit: Users,
      bible_study: BookOpen,
      talk: Mic,
      demonstration: UserCheck
    };
    return iconMap[speechType] || Users;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Categorização por Tipo de Designação
          </h3>
          <p className="text-gray-600 mt-1">
            Visualize estudantes organizados por tipos de designação S-38-T
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyQualified ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyQualified(!showOnlyQualified)}
            className="flex items-center gap-2"
          >
            {showOnlyQualified ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showOnlyQualified ? "Apenas Qualificados" : "Todos os Estudantes"}
          </Button>
        </div>
      </div>

      {/* Speech Type Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(SPEECH_TYPE_LABELS).map(([speechType, label]) => {
          const stats = getQualificationStats(speechType as SpeechType);
          const Icon = getSpeechTypeIcon(speechType as SpeechType);
          const colors = SPEECH_TYPE_COLORS[speechType as SpeechType];
          
          return (
            <Card 
              key={speechType}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedSpeechType === speechType && "ring-2 ring-jw-blue"
              )}
              onClick={() => setSelectedSpeechType(speechType as SpeechType)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-jw-blue" />
                  <span className="text-lg">{SPEECH_TYPE_ICONS[speechType as SpeechType]}</span>
                </div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {label}
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Qualificados:</span>
                    <Badge className={cn("text-xs", colors)}>
                      {stats.qualified} ({stats.percentage}%)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", SPEECH_TYPE_COLORS[selectedSpeechType])}>
                {React.createElement(getSpeechTypeIcon(selectedSpeechType), { 
                  className: "w-5 h-5" 
                })}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {SPEECH_TYPE_LABELS[selectedSpeechType]}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {SPEECH_TYPE_DESCRIPTIONS[selectedSpeechType]}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {getStudentsForSpeechType(selectedSpeechType).length}
              </div>
              <div className="text-sm text-gray-600">
                {showOnlyQualified ? "qualificados" : "estudantes"}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getStudentsForSpeechType(selectedSpeechType).map((student) => {
              const isQualified = student.qualifications?.[selectedSpeechType] === true;
              const progressLevel = student.progress?.progress_level || 'beginning';
              
              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.nome}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {CARGO_LABELS[student.cargo]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {GENERO_LABELS[student.genero]}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {isQualified ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Qualificado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Não Qualificado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Idade:</span>
                        <span>{student.idade} anos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Nível:</span>
                        <Badge variant="outline" className="text-xs">
                          {progressLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Designações:</span>
                        <span>{student.progress?.total_assignments || 0}</span>
                      </div>
                    </div>

                    {/* Quick qualification toggle */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        variant={isQualified ? "outline" : "default"}
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          const newQualifications = {
                            ...student.qualifications,
                            [selectedSpeechType]: !isQualified
                          };
                          onUpdateQualifications(student.id, newQualifications);
                        }}
                      >
                        {isQualified ? "Remover Qualificação" : "Marcar como Qualificado"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {getStudentsForSpeechType(selectedSpeechType).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">
                {showOnlyQualified 
                  ? "Nenhum estudante qualificado para este tipo de designação"
                  : "Nenhum estudante disponível para este tipo de designação"
                }
              </p>
              <p className="text-xs mt-1">
                {showOnlyQualified 
                  ? "Qualifique estudantes para vê-los aqui"
                  : "Adicione estudantes ao sistema"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechTypeCategories;
