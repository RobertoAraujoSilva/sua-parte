import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext"; 
import { TutorialProvider } from "@/contexts/TutorialContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TutorialOverlay } from "@/components/tutorial";
// Debug tools will be loaded conditionally in development only
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { LanguageDebug } from "@/components/LanguageDebug";
import Demo from "./pages/Demo";
import ProgramasTest from "./pages/ProgramasTest";
import Programas from "./pages/Programas";
import Relatorios from "./pages/Relatorios";
import Reunioes from "./pages/Reunioes";
import Designacoes from "./pages/Designacoes";
import FamiliaPage from "./pages/estudante/[id]/familia";
import Funcionalidades from "./pages/Funcionalidades";
import Congregacoes from "./pages/Congregacoes";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import Doar from "./pages/Doar";
import BemVindo from "./pages/BemVindo";
import ConfiguracaoInicial from "./pages/ConfiguracaoInicial";

import NotFound from "./pages/NotFound";
import ConviteAceitar from "./pages/convite/aceitar";
import PortalFamiliar from "./pages/PortalFamiliar";
import UnifiedDashboard from "./components/UnifiedDashboard";
import InstrutorDashboard from "./pages/InstrutorDashboard";
import { EstudantePortal } from "./pages/EstudantePortal";
import { ImportarProgramacao } from "./pages/ImportarProgramacao";
import Estudantes from "./pages/Estudantes";

import ProtectedRoute from "./components/ProtectedRoute";
import SequentialFlow from "./components/SequentialFlow";

import AuthRecoveryButton from "./components/AuthRecoveryButton";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

// Conditional debug tools loading - only in development
if (import.meta.env.DEV) {
  console.log('🔧 Loading debug tools for development environment...');

  // Load debug tools asynchronously to avoid blocking startup
  Promise.all([
    import("@/utils/forceLogout"),
    import("@/utils/supabaseHealthCheck"),
    import("@/utils/logoutDiagnostics"),
    import("@/utils/emergencyLogout"),
    import("@/utils/familyMemberDebug"),
    import("@/utils/quickSync")
  ]).then(() => {
    console.log('✅ Debug tools loaded successfully');
  }).catch(error => {
    console.warn('⚠️ Some debug tools failed to load:', error);
  });
}

// Conditional Debug Panel Component - Temporarily disabled to fix hooks issue
const ConditionalDebugPanel: React.FC = () => {
  // Temporarily disabled to fix React hooks issue
  return null;
};

// Floating navigation between onboarding steps
// Shows a "Continuar" button based on onboarding progress
const FlowNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const onboardingSteps = ["/bem-vindo", "/configuracao-inicial", "/estudantes", "/programas", "/designacoes"] as const;
  const postOnboardingSteps = ["/dashboard", "/estudantes", "/programas", "/designacoes"] as const;
  
  const labels: Record<string, string> = {
    "/bem-vindo": "Configuração",
    "/configuracao-inicial": "Estudantes", 
    "/estudantes": "Programas",
    "/programas": "Designações",
    "/dashboard": "Estudantes",
  };

  // Check onboarding steps first
  const onboardingIdx = onboardingSteps.indexOf(location.pathname as typeof onboardingSteps[number]);
  if (onboardingIdx !== -1 && onboardingIdx < onboardingSteps.length - 1) {
    const nextPath = onboardingSteps[onboardingIdx + 1];
    const nextLabel = labels[location.pathname] || "Próximo";
    
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" className="shadow-lg" onClick={() => navigate(nextPath)}>
          Continuar para {nextLabel}
        </Button>
      </div>
    );
  }
  
  // Check post-onboarding steps
  const postIdx = postOnboardingSteps.indexOf(location.pathname as typeof postOnboardingSteps[number]);
  if (postIdx === -1 || postIdx === postOnboardingSteps.length - 1) return null;

  const nextPath = postOnboardingSteps[postIdx + 1];
  const nextLabel = labels[location.pathname] || "Próximo";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button size="lg" className="shadow-lg" onClick={() => navigate(nextPath)}>
        Continuar para {nextLabel}
      </Button>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <OnboardingProvider>
          <TutorialProvider>
          <TooltipProvider>
            <Sonner />
            <TutorialOverlay />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <SequentialFlow>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/funcionalidades" element={<Funcionalidades />} />
                <Route path="/congregacoes" element={<Congregacoes />} />
                <Route path="/suporte" element={<Suporte />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/doar" element={<Doar />} />

                {/* Onboarding Routes */}
                <Route
                  path="/bem-vindo"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <BemVindo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracao-inicial"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <ConfiguracaoInicial />
                    </ProtectedRoute>
                  }
                />


                {/* Debug Routes - Only in development */}
                {import.meta.env.DEV && (
                  <>
                    {/* Debug routes removed */}
                  </>
                )}

                {/* Dashboard Principal - Rota única consolidada */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <InstrutorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/instrutor" 
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <InstrutorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/portal" 
                  element={
                    <ProtectedRoute allowedRoles={['estudante']}>
                      <EstudantePortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/importar-programacao" 
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <ImportarProgramacao />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/estudantes" 
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <Estudantes />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/programas"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <Programas />
                    </ProtectedRoute>
                  }
                />
                {/* Test Routes - Only in development */}
                {import.meta.env.DEV && (
                  <>
                    <Route
                      path="/programas-test"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <ProgramasTest />
                        </ProtectedRoute>
                      }
                    />
                  </>
                )}
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <Relatorios />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reunioes"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <Reunioes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designacoes"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <Designacoes />
                    </ProtectedRoute>
                  }
                />
                {/* Rotas consolidadas no Dashboard */}
                {/* Admin routes removed - system simplified */}

                {/* Estudante Only Routes */}
                <Route
                  path="/estudante/:id"
                  element={
                    <ProtectedRoute allowedRoles={['estudante']}>
                      <UnifiedDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/estudante/:id/familia"
                  element={
                    <ProtectedRoute allowedRoles={['estudante', 'instrutor']}>
                      <FamiliaPage />
                    </ProtectedRoute>
                  }
                />

                {/* Family Invitation Routes */}
                <Route path="/convite/aceitar" element={<ConviteAceitar />} />
                <Route
                  path="/portal-familiar"
                  element={
                    <ProtectedRoute allowedRoles={['family_member']}>
                      <PortalFamiliar />
                    </ProtectedRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
                <FlowNav />
              </SequentialFlow>
            </BrowserRouter>
          </TooltipProvider>

          {/* Auth Recovery Button - Shows when there are auth errors */}
          <div className="fixed top-4 right-4 z-50">
            <AuthRecoveryButton />
          </div>

          {/* Debug Panel - Only shows in development */}
          <ConditionalDebugPanel />
                    

          </TutorialProvider>
        </OnboardingProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
