import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Target,
  BookOpen,
  MessageCircle,
  Mic,
  UserCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  InstructorDashboardData,
  ProgressLevel,
  SpeechType,
  PROGRESS_LEVEL_LABELS,
  SPEECH_TYPE_LABELS,
  PROGRESS_LEVEL_COLORS
} from '@/types/estudantes';
import { cn } from '@/lib/utils';

interface InstructorDashboardStatsProps {
  data: InstructorDashboardData;
  className?: string;
}

const PROGRESS_LEVEL_ICONS = {
  beginning: Target,
  developing: TrendingUp,
  qualified: CheckCircle,
  advanced: Award
};

const SPEECH_TYPE_ICONS = {
  bible_reading: BookOpen,
  initial_call: MessageCircle,
  return_visit: Users,
  bible_study: BookOpen,
  talk: Mic,
  demonstration: UserCheck
};

export const InstructorDashboardStats: React.FC<InstructorDashboardStatsProps> = ({
  data,
  className
}) => {
  const { statistics } = data;

  const getProgressPercentage = (level: ProgressLevel): number => {
    if (statistics.total_students === 0) return 0;
    return Math.round((statistics.by_progress_level[level] / statistics.total_students) * 100);
  };

  const getSpeechTypePercentage = (speechType: SpeechType): number => {
    if (statistics.total_students === 0) return 0;
    return Math.round((statistics.by_speech_type[speechType] / statistics.total_students) * 100);
  };

  const getOverallQualificationRate = (): number => {
    const totalPossibleQualifications = Object.values(statistics.by_speech_type).reduce((sum, count) => sum + count, 0);
    const totalStudents = statistics.total_students;
    
    if (totalStudents === 0) return 0;
    
    // Estimate based on average qualifications per student
    const avgQualifications = totalPossibleQualifications / (totalStudents * 6); // 6 main speech types
    return Math.round(avgQualifications * 100);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Estudantes
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statistics.total_students}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={statistics.active_students === statistics.total_students ? "text-green-600" : "text-yellow-600"}
              >
                {statistics.active_students} ativos
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Qualification Rate */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Qualificação
              </CardTitle>
              <Award className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {getOverallQualificationRate()}%
            </div>
            <Progress value={getOverallQualificationRate()} className="mt-2" />
          </CardContent>
        </Card>

        {/* Students Needing Attention */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Precisam de Atenção
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statistics.needs_attention}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Estudantes com poucas qualificações
            </div>
          </CardContent>
        </Card>

        {/* Advanced Students */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Estudantes Avançados
              </CardTitle>
              <Award className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {statistics.by_progress_level.advanced || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Podem ensinar outros
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-jw-blue" />
            Distribuição por Nível de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(PROGRESS_LEVEL_LABELS).map(([level, label]) => {
              const count = statistics.by_progress_level[level as ProgressLevel] || 0;
              const percentage = getProgressPercentage(level as ProgressLevel);
              const Icon = PROGRESS_LEVEL_ICONS[level as ProgressLevel];
              const colors = PROGRESS_LEVEL_COLORS[level as ProgressLevel];

              return (
                <div key={level} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", colors)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{label}</div>
                      <div className="text-sm text-gray-600">{count} estudantes</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Porcentagem</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Speech Type Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-jw-blue" />
            Qualificações por Tipo de Designação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SPEECH_TYPE_LABELS).map(([speechType, label]) => {
              const count = statistics.by_speech_type[speechType as SpeechType] || 0;
              const percentage = getSpeechTypePercentage(speechType as SpeechType);
              const Icon = SPEECH_TYPE_ICONS[speechType as SpeechType];

              return (
                <div key={speechType} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-jw-blue/10 rounded-lg">
                      <Icon className="w-4 h-4 text-jw-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{label}</div>
                      <div className="text-xs text-gray-600">{count} qualificados</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Taxa</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-jw-blue" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_updates.length > 0 ? (
            <div className="space-y-3">
              {data.recent_updates.slice(0, 5).map((update, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-jw-blue/10 rounded">
                      <TrendingUp className="w-3 h-3 text-jw-blue" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Estudante atualizado para {PROGRESS_LEVEL_LABELS[update.progress_level]}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(update.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {update.progress_level}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Summary */}
      <Card className="bg-gradient-to-r from-jw-blue/5 to-jw-navy/5 border-jw-blue/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resumo da Escola Ministerial
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-2 font-medium">{statistics.total_students} estudantes</span>
                </div>
                <div>
                  <span className="text-gray-600">Ativos:</span>
                  <span className="ml-2 font-medium">{statistics.active_students} estudantes</span>
                </div>
                <div>
                  <span className="text-gray-600">Qualificação:</span>
                  <span className="ml-2 font-medium">{getOverallQualificationRate()}% média</span>
                </div>
                <div>
                  <span className="text-gray-600">Atenção:</span>
                  <span className="ml-2 font-medium">{statistics.needs_attention} estudantes</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-3 bg-jw-blue/10 rounded-lg">
                <Users className="w-8 h-8 text-jw-blue" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboardStats;
