import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Lightbulb,
  Target,
  Users
} from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';
import { TutorialPage } from '@/types/tutorial';

interface TutorialIntegrationProps {
  page: TutorialPage;
  showOnboarding?: boolean;
  onboardingCompleted?: boolean;
  className?: string;
}

export const TutorialIntegration: React.FC<TutorialIntegrationProps> = ({
  page,
  showOnboarding = false,
  onboardingCompleted = false,
  className = ''
}) => {
  const {
    getAvailableTutorials,
    isTutorialCompleted,
    startTutorial,
    getTutorialProgress
  } = useTutorial();

  const [recommendedTutorials, setRecommendedTutorials] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    // Get tutorials for current page
    const tutorials = getAvailableTutorials(page);
    
    // Filter to show only incomplete basic tutorials for new users
    const recommended = tutorials.filter(tutorial => {
      if (onboardingCompleted) {
        // For experienced users, show workflow and advanced tutorials
        return tutorial.category !== 'basic' && !isTutorialCompleted(tutorial.id);
      } else {
        // For new users, prioritize basic tutorials
        return tutorial.category === 'basic' && !isTutorialCompleted(tutorial.id);
      }
    }).slice(0, 3); // Limit to 3 recommendations

    setRecommendedTutorials(recommended);
    
    // Show recommendations if there are incomplete tutorials and user just completed onboarding
    if (recommended.length > 0 && showOnboarding) {
      setShowRecommendations(true);
    }
  }, [page, onboardingCompleted, showOnboarding, getAvailableTutorials, isTutorialCompleted]);

  const handleStartTutorial = (tutorialId: string) => {
    startTutorial(tutorialId);
    setShowRecommendations(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <BookOpen className="w-4 h-4" />;
      case 'workflow': return <Target className="w-4 h-4" />;
      case 'advanced': return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workflow': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPageTitle = (page: TutorialPage) => {
    const titles: Record<TutorialPage, string> = {
      'dashboard': 'Dashboard',
      'estudantes': 'Gestão de Estudantes',
      'programas': 'Programas',
      'designacoes': 'Designações',
      'reunioes': 'Reuniões',
      'relatorios': 'Relatórios',
      'developer-panel': 'Painel de Desenvolvedor',
      'template-library': 'Biblioteca de Templates',
      'program-preview': 'Revisão de Programa'
    };
    return titles[page] || page;
  };

  if (!showRecommendations || recommendedTutorials.length === 0) {
    return null;
  }

  return (
    <div className={`tutorial-integration ${className}`}>
      {/* Onboarding Completion Alert */}
      {showOnboarding && !onboardingCompleted && (
        <Alert className="mb-6 border-jw-blue bg-jw-blue/5">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Bem-vindo ao {getPageTitle(page)}!</strong> 
            {' '}Recomendamos começar com os tutoriais básicos para se familiarizar com as funcionalidades.
          </AlertDescription>
        </Alert>
      )}

      {/* Tutorial Recommendations Card */}
      <Card className="mb-6 border-jw-gold/20 bg-gradient-to-r from-jw-gold/5 to-jw-blue/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-jw-blue" />
              <CardTitle className="text-lg text-jw-navy">
                Tutoriais Recomendados
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecommendations(false)}
            >
              ×
            </Button>
          </div>
          <CardDescription>
            {onboardingCompleted 
              ? 'Aprimore suas habilidades com estes tutoriais avançados'
              : 'Comece com estes tutoriais para dominar as funcionalidades básicas'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {recommendedTutorials.map((tutorial, index) => {
              const progress = getTutorialProgress(tutorial.id);
              
              return (
                <div
                  key={tutorial.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-white/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(tutorial.category)}`}
                      >
                        {getCategoryIcon(tutorial.category)}
                        <span className="ml-1">
                          {tutorial.category === 'basic' ? 'Básico' :
                           tutorial.category === 'workflow' ? 'Fluxo' : 'Avançado'}
                        </span>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {tutorial.estimatedTime} min
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-jw-navy mb-1">
                      {tutorial.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {tutorial.description}
                    </p>
                    {progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-jw-blue h-1 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(progress)}% concluído
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartTutorial(tutorial.id)}
                    className="ml-3"
                  >
                    {progress > 0 ? (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Iniciar
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Quick Start Guide */}
          <div className="mt-4 p-3 bg-jw-blue/10 rounded-lg border border-jw-blue/20">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-jw-blue mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-jw-navy">Dica de Navegação:</strong>
                <p className="text-gray-700 mt-1">
                  {page === 'developer-panel' && 
                    'Use as abas para navegar entre processamento, templates e estatísticas. Comece colando conteúdo JW.org na aba "Processar Conteúdo".'
                  }
                  {page === 'template-library' && 
                    'Baixe templates Excel, preencha apenas as colunas de estudantes e faça upload. O sistema gera as designações automaticamente.'
                  }
                  {page === 'program-preview' && 
                    'Revise todas as designações antes de aprovar. Use o botão de edição para ajustar designações específicas.'
                  }
                  {page === 'reunioes' && 
                    'Gerencie reuniões regulares, visitas do CO e eventos especiais. Configure designações administrativas e salas auxiliares.'
                  }
                  {!['developer-panel', 'template-library', 'program-preview', 'reunioes'].includes(page) &&
                    'Explore as funcionalidades disponíveis e use os tutoriais para aprender as melhores práticas.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecommendations(false)}
            >
              Pular por Agora
            </Button>
            <Button
              size="sm"
              onClick={() => handleStartTutorial(recommendedTutorials[0]?.id)}
              disabled={recommendedTutorials.length === 0}
            >
              Começar Primeiro Tutorial
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
