import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  PlayCircle, 
  SkipForward, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  X,
  BookOpen,
  Lightbulb,
  Target
} from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';
import { cn } from '@/lib/utils';

interface TutorialManagerProps {
  page?: string;
  autoStart?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({
  page = '',
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
    getAvailableTutorials
  } = useTutorial();

  // Get the actual tutorial object from the ID
  const currentTutorial = useMemo(() => {
    if (!state.currentTutorial) return null;
    const allTutorials = getAvailableTutorials();
    return allTutorials.find(t => t.id === state.currentTutorial) || null;
  }, [state.currentTutorial, getAvailableTutorials]);

  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Auto-start tutorial if specified
  useEffect(() => {
    if (autoStart && page) {
      const tutorials = getAvailableTutorials(page);
      if (tutorials.length > 0 && !state.isActive) {
        startTutorial(tutorials[0].id);
      }
    }
  }, [autoStart, page, startTutorial, getAvailableTutorials, state.isActive]);

  // Handle tutorial visibility
  useEffect(() => {
    setIsVisible(state.isActive && currentTutorial !== null);
  }, [state.isActive, currentTutorial]);

  // Handle element highlighting
  useEffect(() => {
    if (!currentTutorial || !state.isActive) {
      setHighlightedElement(null);
      return;
    }

    const currentStepData = currentTutorial.steps[state.currentStep];
    if (!currentStepData?.target) return;

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      
      // Scroll into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [currentTutorial, state.currentStep, state.isActive]);

  // Handle tutorial events
  const handleNext = () => {
    if (!currentTutorial) return;
    
    if (state.currentStep === currentTutorial.steps.length - 1) {
      completeTutorial();
    } else {
      nextStep();
    }
  };

  const handleSkipTutorial = () => {
    skipTutorial();
    setIsVisible(false);
  };

  if (!isVisible || !currentTutorial) {
    return null;
  }

  const currentStepData = currentTutorial.steps[state.currentStep];
  const progress = ((state.currentStep + 1) / currentTutorial.steps.length) * 100;

  return (
    <div className={cn('tutorial-manager', className)}>
      {/* Tutorial Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={handleSkipTutorial}
      />

      {/* Highlighted Element Spotlight */}
      {highlightedElement && (
        <div 
          className="fixed pointer-events-none z-45"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            boxShadow: '0 0 0 4px hsl(var(--primary)), 0 0 0 8px hsl(var(--primary) / 0.3)',
            borderRadius: '8px',
            background: 'transparent'
          }}
        />
      )}

      {/* Tutorial Progress Card */}
      <Card className="fixed top-4 right-4 z-50 w-80 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <div>
                <CardTitle className="text-sm">{currentTutorial.title}</CardTitle>
                <CardDescription className="text-xs">
                  Passo {state.currentStep + 1} de {currentTutorial.steps.length}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipTutorial}
              title="Pular tutorial"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showProgress && (
            <Progress 
              value={progress} 
              className="h-2 mb-4"
            />
          )}
          
          {/* Step Content */}
          <div className="mb-4">
            <div className="flex items-start gap-2 mb-2">
              {currentStepData.action === 'click' ? (
                <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-medium text-sm">{currentStepData.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentStepData.content}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={previousStep}
              disabled={state.currentStep === 0}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Anterior
            </Button>
            
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
            
            <Button
              size="sm"
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              {state.currentStep === currentTutorial.steps.length - 1 ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Completion Alert */}
      {state.isActive && currentTutorial && state.currentStep === currentTutorial.steps.length - 1 && (
        <Alert className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Quase lá! 🎉</AlertTitle>
          <AlertDescription>
            Você está no último passo deste tutorial. Clique em "Concluir" para finalizar.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Start Tutorials List */}
      {!state.isActive && page && (
        <Card className="fixed bottom-4 right-4 z-50 w-64 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Tutoriais Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAvailableTutorials(page).slice(0, 3).map((tutorial) => (
                <Button
                  key={tutorial.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => startTutorial(tutorial.id)}
                >
                  <div>
                    <div className="font-medium text-xs">{tutorial.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {tutorial.estimatedTime} min • {tutorial.steps.length} passos
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TutorialManager;