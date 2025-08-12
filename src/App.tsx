import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TutorialOverlay } from "@/components/tutorial";
// Debug tools will be loaded conditionally in development only
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Estudantes from "./pages/Estudantes";
import Programas from "./pages/Programas";
import ProgramaPreview from "./pages/ProgramaPreview";
import ProgramasTest from "./pages/ProgramasTest";
import PdfParsingTest from "./pages/PdfParsingTest";
import Designacoes from "./pages/Designacoes";
import Relatorios from "./pages/Relatorios";
import Reunioes from "./pages/Reunioes";
import EstudantePortal from "./pages/EstudantePortal";
import FamiliaPage from "./pages/estudante/[id]/familia";
import Funcionalidades from "./pages/Funcionalidades";
import Congregacoes from "./pages/Congregacoes";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import Doar from "./pages/Doar";
import BemVindo from "./pages/BemVindo";
import ConfiguracaoInicial from "./pages/ConfiguracaoInicial";
import PrimeiroPrograma from "./pages/PrimeiroPrograma";
import DeveloperPanel from "./pages/DeveloperPanel";
import NotFound from "./pages/NotFound";
import ConviteAceitar from "./pages/convite/aceitar";
import PortalFamiliar from "./pages/PortalFamiliar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

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
    import("@/utils/familyMemberDebug")
  ]).then(() => {
    console.log('✅ Debug tools loaded successfully');
  }).catch(error => {
    console.warn('⚠️ Some debug tools failed to load:', error);
  });
}

// Conditional Debug Panel Component - Only renders in development
const ConditionalDebugPanel: React.FC = () => {
  const [DebugPanel, setDebugPanel] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      // Dynamically import ProductionDebugPanel only in development
      import("@/components/ProductionDebugPanel").then(module => {
        setDebugPanel(() => module.ProductionDebugPanel);
      }).catch(error => {
        console.warn('⚠️ Debug panel failed to load:', error);
      });
    }
  }, []);

  // Only render in development and if component is loaded
  if (!import.meta.env.DEV || !DebugPanel) {
    return null;
  }

  return <DebugPanel />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TutorialProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <TutorialOverlay />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <ErrorBoundary>
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
                  <Route
                    path="/primeiro-programa"
                    element={
                      <ProtectedRoute allowedRoles={['instrutor']}>
                        <PrimeiroPrograma />
                      </ProtectedRoute>
                    }
                  />

                  {/* Developer Panel Route */}
                  <Route
                    path="/admin/developer"
                    element={
                      <ProtectedRoute allowedRoles={['developer']}>
                        <DeveloperPanel />
                      </ProtectedRoute>
                    }
                  />

                  {/* Debug Route - Only in development */}
                  {import.meta.env.DEV && (
                    <Route path="/debug-dashboard" element={<Dashboard />} />
                  )}

                  {/* Instrutor Only Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['instrutor']}>
                        <Dashboard />
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
                  <Route
                    path="/programa/:id"
                    element={
                      <ProtectedRoute allowedRoles={['instrutor']}>
                        <ProgramaPreview />
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
                      <Route
                        path="/pdf-parsing-test"
                        element={
                          <ProtectedRoute allowedRoles={['instrutor']}>
                            <PdfParsingTest />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}
                  <Route
                    path="/designacoes"
                    element={
                      <ProtectedRoute allowedRoles={['instrutor']}>
                        <Designacoes />
                      </ProtectedRoute>
                    }
                  />
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

                  {/* Estudante Only Routes */}
                  <Route
                    path="/estudante/:id"
                    element={
                      <ProtectedRoute allowedRoles={['estudante']}>
                        <EstudantePortal />
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
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>

          {/* Debug Panel - Only shows in development */}
          <ConditionalDebugPanel />
        </TutorialProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
