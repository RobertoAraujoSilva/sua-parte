import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Play, 
  SkipForward, 
  X,
  HelpCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';
import { TutorialPage, Tutorial } from '@/types/tutorial';

interface TutorialManagerProps {
  page: TutorialPage;
  autoStart?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({
  page,
  autoStart = false,
  showProgress = true,
  className = ''
}) => {
  const {
    state,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    getAvailableTutorials,
    getTutorialProgress,
    isTutorialCompleted
  } = useTutorial();

  const { currentTutorial, currentStep, isActive } = state;

  const [availableTutorials, setAvailableTutorials] = useState<Tutorial[]>([]);
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const tutorials = getAvailableTutorials(page);
    setAvailableTutorials(tutorials);

    // Auto-start first tutorial if requested and no tutorial is completed
    if (autoStart && tutorials.length > 0 && !isActive) {
      const firstTutorial = tutorials.find(t => !isTutorialCompleted(t.id));
      if (firstTutorial) {
        startTutorial(firstTutorial.id);
      }
    }
  }, [page, autoStart, getAvailableTutorials, isTutorialCompleted, startTutorial, isActive]);

  const handleStartTutorial = useCallback((tutorialId: string) => {
    startTutorial(tutorialId);
    setShowTutorialMenu(false);
  }, [startTutorial]);

  const handleSkipTutorial = useCallback(() => {
    skipTutorial();
    setShowTutorialMenu(false);
  }, [skipTutorial]);

  const getProgressPercentage = useCallback((tutorialId: string) => {
    return getTutorialProgress(tutorialId);
  }, [getTutorialProgress]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return <BookOpen className="w-4 h-4" />;
      case 'workflow': return <Target className="w-4 h-4" />;
      case 'advanced': return <Lightbulb className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'workflow': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTutorials = availableTutorials.filter(tutorial => 
    selectedCategory === 'all' || tutorial.category === selectedCategory
  );

  const categories = ['all', ...new Set(availableTutorials.map(t => t.category))];

  if (availableTutorials.length === 0) {
    return null;
  }

  return (
    <div className={`tutorial-manager ${className}`}>
      {/* Tutorial Menu Button */}
      {!isActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTutorialMenu(!showTutorialMenu)}
          className="fixed bottom-4 right-4 z-50 shadow-lg"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Tutoriais
        </Button>
      )}

      {/* Tutorial Menu */}
      {showTutorialMenu && !isActive && (
        <Card className="fixed bottom-16 right-4 z-50 w-96 max-h-96 overflow-y-auto shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tutoriais Disponíveis</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorialMenu(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              Escolha um tutorial para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category === 'all' ? 'Todos' : 
                   category === 'basic' ? 'Básico' :
                   category === 'workflow' ? 'Fluxo' : 'Avançado'}
                </Button>
              ))}
            </div>

            {/* Tutorial List */}
            <div className="space-y-3">
              {filteredTutorials.map(tutorial => {
                const progress = getProgressPercentage(tutorial.id);
                const isCompleted = isTutorialCompleted(tutorial.id);

                return (
                  <div
                    key={tutorial.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{tutorial.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {tutorial.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
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
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {tutorial.estimatedTime} min
                        <span>•</span>
                        {tutorial.steps.length} passos
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => handleStartTutorial(tutorial.id)}
                        className="text-xs"
                      >
                        {isCompleted ? (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Revisar
                          </>
                        ) : progress > 0 ? (
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

                    {/* Progress Bar */}
                    {showProgress && progress > 0 && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(progress)}% concluído
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredTutorials.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum tutorial encontrado nesta categoria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Tutorial Progress */}
      {isActive && currentTutorial && showProgress && (() => {
        const tutorial = getAvailableTutorials().find(t => t.id === currentTutorial);
        return tutorial && (
        <Card className="fixed top-4 right-4 z-50 w-80 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">{tutorial.title}</CardTitle>
                <CardDescription className="text-xs">
                  Passo {currentStep + 1} de {tutorial.steps.length}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipTutorial}
                title="Pular tutorial"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(currentStep + 1) / tutorial.steps.length * 100} 
              className="h-2"
            />
            <div className="flex justify-between items-center mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              <span className="text-xs text-gray-500">
                {Math.round((currentStep + 1) / tutorial.steps.length * 100)}%
              </span>
              <Button
                size="sm"
                onClick={currentStep === tutorial.steps.length - 1 ? completeTutorial : nextStep}
              >
                {currentStep === tutorial.steps.length - 1 ? 'Concluir' : 'Próximo'}
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })()}

      {/* Tutorial Completion Alert */}
      {isActive && currentTutorial && (() => {
        const tutorial = getAvailableTutorials().find(t => t.id === currentTutorial);
        return tutorial && currentStep === tutorial.steps.length - 1 && (
        <Alert className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Parabéns!</strong> Você completou o tutorial "{tutorial.title}". 
            Clique em "Concluir" para finalizar.
          </AlertDescription>
        </Alert>
        );
      })()}
    </div>
  );
};
