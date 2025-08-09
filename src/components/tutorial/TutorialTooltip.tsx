import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle,
  SkipForward,
  Lightbulb
} from 'lucide-react';
import { TutorialTooltipProps } from '@/types/tutorial';
import { cn } from '@/lib/utils';

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  position,
  isVisible
}) => {
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <div
      className={cn(
        "fixed z-[9999] transition-all duration-300 transform",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
      style={{
        left: position.x,
        top: position.y,
        maxWidth: '380px',
        minWidth: '320px'
      }}
    >
      <Card className="shadow-2xl border-2 border-jw-blue/20 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-jw-blue" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                {step.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Pular tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Passo {currentStepIndex + 1} de {totalSteps}</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step content */}
          <div className="text-gray-700 leading-relaxed">
            {step.content}
          </div>

          {/* Action hint */}
          {step.action && step.action !== 'none' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  {step.action === 'click' && 'Clique no elemento destacado'}
                  {step.action === 'hover' && 'Passe o mouse sobre o elemento'}
                  {step.action === 'focus' && 'Foque no elemento destacado'}
                </span>
              </div>
            </div>
          )}

          {/* Optional step indicator */}
          {step.optional && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <SkipForward className="h-4 w-4" />
                <span>Este passo é opcional</span>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={isFirstStep}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                className="text-gray-600 hover:text-gray-800"
              >
                Pular Tutorial
              </Button>
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className="flex items-center gap-1 bg-jw-blue hover:bg-jw-blue/90"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <div className="flex items-center justify-between">
              <span>Atalhos:</span>
              <div className="flex gap-3">
                <span>← → Navegar</span>
                <span>ESC Sair</span>
                <span>ESPAÇO Próximo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip arrow */}
      <div className="absolute w-0 h-0 pointer-events-none">
        {/* Arrow pointing up (tooltip below element) */}
        {step.position === 'bottom' && (
          <div 
            className="absolute border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"
            style={{ 
              top: '-8px', 
              left: '50%', 
              transform: 'translateX(-50%)' 
            }}
          />
        )}
        
        {/* Arrow pointing down (tooltip above element) */}
        {step.position === 'top' && (
          <div 
            className="absolute border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
            style={{ 
              bottom: '-8px', 
              left: '50%', 
              transform: 'translateX(-50%)' 
            }}
          />
        )}
        
        {/* Arrow pointing right (tooltip left of element) */}
        {step.position === 'left' && (
          <div 
            className="absolute border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white"
            style={{ 
              right: '-8px', 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }}
          />
        )}
        
        {/* Arrow pointing left (tooltip right of element) */}
        {step.position === 'right' && (
          <div 
            className="absolute border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white"
            style={{ 
              left: '-8px', 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TutorialTooltip;
