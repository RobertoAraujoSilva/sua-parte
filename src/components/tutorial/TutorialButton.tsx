import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Play, 
  BookOpen, 
  Zap, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { useTutorial } from '@/contexts/TutorialContext';
import { getTutorialsForPage } from '@/config/tutorials';
import { TutorialButtonProps, TutorialPage } from '@/types/tutorial';
import { cn } from '@/lib/utils';

export const TutorialButton: React.FC<TutorialButtonProps> = ({
  page,
  variant = 'secondary',
  size = 'md',
  className
}) => {
  const { startTutorial, isTutorialCompleted, getTutorialProgress } = useTutorial();
  const [isOpen, setIsOpen] = useState(false);
  
  const tutorials = getTutorialsForPage(page);
  const basicTutorials = tutorials.filter(t => t.category === 'basic');
  const advancedTutorials = tutorials.filter(t => t.category === 'advanced');
  const workflowTutorials = tutorials.filter(t => t.category === 'workflow');

  const handleStartTutorial = (tutorialId: string) => {
    startTutorial(tutorialId);
    setIsOpen(false);
  };

  const getTutorialIcon = (category: string) => {
    switch (category) {
      case 'basic':
        return <BookOpen className="h-4 w-4" />;
      case 'advanced':
        return <Zap className="h-4 w-4" />;
      case 'workflow':
        return <Users className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getTutorialStatusBadge = (tutorialId: string) => {
    const isCompleted = isTutorialCompleted(tutorialId);
    const progress = getTutorialProgress(tutorialId);

    if (isCompleted) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Concluído
        </Badge>
      );
    }

    if (progress > 0) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          {progress}%
        </Badge>
      );
    }

    return null;
  };

  const getPageTitle = (page: TutorialPage): string => {
    const titles: Record<TutorialPage, string> = {
      dashboard: 'Dashboard',
      estudantes: 'Estudantes',
      programas: 'Programas',
      designacoes: 'Designações',
      reunioes: 'Reuniões',
      relatorios: 'Relatórios'
    };
    return titles[page] || page;
  };

  if (tutorials.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={(variant === 'primary' ? 'hero' : variant === 'secondary' ? 'secondary' : 'ghost') as any}
          size={(size === 'md' ? 'default' : size) as any}
          className={cn(
            "flex items-center gap-2",
            variant === 'minimal' && "h-8 px-2 text-xs",
            className
          )}
        >
          <HelpCircle className="h-4 w-4" />
          {variant !== 'minimal' && 'Tutorial'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-jw-blue" />
          Tutoriais - {getPageTitle(page)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Basic Tutorials */}
        {basicTutorials.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              Básico
            </DropdownMenuLabel>
            {basicTutorials.map((tutorial) => (
              <DropdownMenuItem
                key={tutorial.id}
                onClick={() => handleStartTutorial(tutorial.id)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getTutorialIcon(tutorial.category)}
                    <span className="font-medium">{tutorial.title}</span>
                  </div>
                  {getTutorialStatusBadge(tutorial.id)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {tutorial.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tutorial.estimatedTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {tutorial.steps.length} passos
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {(advancedTutorials.length > 0 || workflowTutorials.length > 0) && (
              <DropdownMenuSeparator />
            )}
          </>
        )}

        {/* Workflow Tutorials */}
        {workflowTutorials.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Fluxo de Trabalho
            </DropdownMenuLabel>
            {workflowTutorials.map((tutorial) => (
              <DropdownMenuItem
                key={tutorial.id}
                onClick={() => handleStartTutorial(tutorial.id)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getTutorialIcon(tutorial.category)}
                    <span className="font-medium">{tutorial.title}</span>
                  </div>
                  {getTutorialStatusBadge(tutorial.id)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {tutorial.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tutorial.estimatedTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {tutorial.steps.length} passos
                  </div>
                  {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                    <div className="text-amber-600">
                      Requer pré-requisitos
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {advancedTutorials.length > 0 && <DropdownMenuSeparator />}
          </>
        )}

        {/* Advanced Tutorials */}
        {advancedTutorials.length > 0 && (
          <>
            <DropdownMenuLabel className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-3 w-3" />
              Avançado
            </DropdownMenuLabel>
            {advancedTutorials.map((tutorial) => (
              <DropdownMenuItem
                key={tutorial.id}
                onClick={() => handleStartTutorial(tutorial.id)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getTutorialIcon(tutorial.category)}
                    <span className="font-medium">{tutorial.title}</span>
                  </div>
                  {getTutorialStatusBadge(tutorial.id)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {tutorial.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tutorial.estimatedTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {tutorial.steps.length} passos
                  </div>
                  {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                    <div className="text-amber-600">
                      Requer pré-requisitos
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-gray-500 text-center">
          Use ESC para sair • ← → para navegar
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TutorialButton;
