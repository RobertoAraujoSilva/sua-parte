import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface SequentialFlowProps {
  children: React.ReactNode;
}

/**
 * Componente que garante o fluxo sequencial do onboarding
 * Redireciona usuários para o próximo passo não concluído
 */
export const SequentialFlow: React.FC<SequentialFlowProps> = ({ children }) => {
  const { profile, loading: authLoading } = useAuth();
  const { steps, isComplete, loading: onboardingLoading } = useOnboarding();
  const location = useLocation();

  // Rotas públicas que não precisam de validação
  const publicRoutes = ['/', '/auth', '/demo', '/funcionalidades', '/congregacoes', '/suporte', '/sobre', '/doar', '/convite/aceitar'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Aguardar carregamento
  if (authLoading || onboardingLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  // Permitir acesso a rotas públicas
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Apenas para instrutores logados
  if (!profile || profile.role !== 'instrutor') {
    return <>{children}</>;
  }

  // Se onboarding está completo, permitir acesso livre
  if (isComplete) {
    return <>{children}</>;
  }

  // Encontrar próximo passo não concluído
  const nextIncompleteStep = steps.find(step => step.required && !step.completed);
  
  if (nextIncompleteStep) {
    const currentPath = location.pathname;
    const requiredPath = nextIncompleteStep.route;
    
    // Permitir acesso a rotas de onboarding já concluídas ou atual
    const onboardingRoutes = steps.map(step => step.route);
    const currentStepIndex = steps.findIndex(step => step.route === currentPath);
    const requiredStepIndex = steps.findIndex(step => step.route === requiredPath);
    
    // Se está em uma rota de onboarding válida (atual ou anterior), permitir
    if (onboardingRoutes.includes(currentPath) && currentStepIndex <= requiredStepIndex) {
      return <>{children}</>;
    }
    
    // Se não está na rota correta, redirecionar
    if (currentPath !== requiredPath) {
      console.log(`🔄 Redirecionando para próximo passo: ${requiredPath}`);
      return <Navigate to={requiredPath} replace />;
    }
  }

  return <>{children}</>;
};

export default SequentialFlow;