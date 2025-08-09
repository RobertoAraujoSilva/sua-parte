import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTutorial } from '@/contexts/TutorialContext';
import { getTutorialById } from '@/config/tutorials';
import { TutorialTooltip } from './TutorialTooltip';
import { TutorialHighlight } from '@/types/tutorial';
import { cn } from '@/lib/utils';

interface TutorialOverlayProps {
  className?: string;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ className }) => {
  const { state, nextStep, previousStep, skipTutorial, completeTutorial } = useTutorial();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const currentTutorial = state.currentTutorial ? getTutorialById(state.currentTutorial) : null;
  const currentStep = currentTutorial?.steps[state.currentStep];

  // Function to find element by selector
  const findElement = useCallback((selector: string): HTMLElement | null => {
    try {
      // Handle special selectors
      if (selector.includes(':contains(')) {
        const match = selector.match(/(.+):contains\("(.+)"\)/);
        if (match) {
          const [, baseSelector, text] = match;
          const elements = document.querySelectorAll(baseSelector);
          for (const element of elements) {
            if (element.textContent?.includes(text)) {
              return element as HTMLElement;
            }
          }
        }
        return null;
      }

      // Handle data-tutorial attributes
      if (selector.startsWith('[data-tutorial=')) {
        return document.querySelector(selector) as HTMLElement;
      }

      // Regular CSS selector
      return document.querySelector(selector) as HTMLElement;
    } catch (error) {
      console.error('Error finding element:', selector, error);
      return null;
    }
  }, []);

  // Function to calculate tooltip position
  const calculateTooltipPosition = useCallback((element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    
    const tooltipWidth = 320; // Approximate tooltip width
    const tooltipHeight = 200; // Approximate tooltip height
    const offset = 20;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
        y = rect.top + scrollY - tooltipHeight - offset;
        break;
      case 'bottom':
        x = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2);
        y = rect.bottom + scrollY + offset;
        break;
      case 'left':
        x = rect.left + scrollX - tooltipWidth - offset;
        y = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
        break;
      case 'right':
        x = rect.right + scrollX + offset;
        y = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2);
        break;
      case 'center':
      default:
        x = window.innerWidth / 2 - tooltipWidth / 2 + scrollX;
        y = window.innerHeight / 2 - tooltipHeight / 2 + scrollY;
        break;
    }

    // Ensure tooltip stays within viewport
    x = Math.max(10, Math.min(x, window.innerWidth - tooltipWidth - 10));
    y = Math.max(10, Math.min(y, window.innerHeight - tooltipHeight - 10));

    return { x, y };
  }, []);

  // Function to highlight element
  const highlightElement = useCallback((element: HTMLElement) => {
    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Add highlight to current element
    element.classList.add('tutorial-highlight');
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });

    setHighlightedElement(element);
  }, []);

  // Effect to handle step changes
  useEffect(() => {
    if (!state.isActive || !currentStep) {
      setIsVisible(false);
      setHighlightedElement(null);
      // Remove all highlights
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
      return;
    }

    const setupStep = async () => {
      // Execute beforeShow callback
      if (currentStep.beforeShow) {
        await currentStep.beforeShow();
      }

      // Find and highlight target element
      const targetElement = findElement(currentStep.target);
      if (targetElement) {
        highlightElement(targetElement);
        
        // Calculate tooltip position
        const position = calculateTooltipPosition(targetElement, currentStep.position);
        setTooltipPosition(position);
        
        setIsVisible(true);
      } else {
        console.warn(`Tutorial target element not found: ${currentStep.target}`);
        // Skip to next step if element not found
        setTimeout(() => nextStep(), 1000);
      }

      // Execute afterShow callback
      if (currentStep.afterShow) {
        await currentStep.afterShow();
      }
    };

    setupStep();
  }, [state.isActive, state.currentStep, currentStep, findElement, highlightElement, calculateTooltipPosition, nextStep]);

  // Handle overlay click (skip tutorial)
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      skipTutorial();
    }
  }, [skipTutorial]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skipTutorial();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousStep();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isActive, nextStep, previousStep, skipTutorial]);

  // Don't render if tutorial is not active
  if (!state.isActive || !currentTutorial || !currentStep) {
    return null;
  }

  const overlayContent = (
    <>
      {/* Dark overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
          className
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Tutorial tooltip */}
      {isVisible && (
        <TutorialTooltip
          step={currentStep}
          currentStepIndex={state.currentStep}
          totalSteps={currentTutorial.steps.length}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTutorial}
          onComplete={completeTutorial}
          position={tooltipPosition}
          isVisible={isVisible}
        />
      )}

      {/* CSS for highlighting */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative !important;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 
                      0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .tutorial-highlight::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: transparent;
          border: 2px solid hsl(var(--jw-blue));
          border-radius: 8px;
          pointer-events: none;
          animation: tutorial-pulse 2s infinite;
        }
        
        @keyframes tutorial-pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        /* Ensure highlighted element is clickable */
        .tutorial-highlight {
          pointer-events: auto !important;
        }
        
        /* Smooth scrolling for tutorial navigation */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );

  // Render overlay in portal
  return createPortal(overlayContent, document.body);
};

export default TutorialOverlay;
