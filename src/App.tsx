import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TutorialOverlay } from "@/components/tutorial";
// Debug tools will be loaded conditionally in development only
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { LanguageDebug } from "@/components/LanguageDebug";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Estudantes from "./pages/Estudantes";
import EstudantesResponsive from "./pages/EstudantesResponsive";
import ProgramasOptimized from "./pages/ProgramasOptimized";
import ProgramaPreview from "./pages/ProgramaPreview";
import ProgramasTest from "./pages/ProgramasTest";
import PdfParsingTest from "./pages/PdfParsingTest";
import DesignacoesOptimized from "./pages/DesignacoesOptimized";
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
import Equidade from "./pages/Equidade";
import AdminDashboard from "./pages/AdminDashboard";
import InstrutorDashboard from "./pages/InstrutorDashboard";
import EstudanteDashboard from "./pages/EstudanteDashboard";
import DensityToggleTestPage from "./pages/DensityToggleTest";
import ZoomResponsivenessTestPage from "./pages/ZoomResponsivenessTest";
import ProtectedRoute from "./components/ProtectedRoute";
import DebugFab from "./components/DebugFab";
import Header from '@/components/Header';
import { ConnectionStatusBanner } from '@/components/ConnectionStatusBanner';
import { SyncButton } from '@/components/SyncButton';

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
    import("@/utils/reviewDatabase"),
    import("@/utils/executeMigration"),
    import("@/utils/syncStudentsToInstructors"),
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TutorialProvider>
          <TooltipProvider>
            <Sonner />
            <TutorialOverlay />
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
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

                {/* Debug Routes - Only in development */}
                {import.meta.env.DEV && (
                  <>
                    <Route path="/debug-dashboard" element={<Dashboard />} />
                    <Route 
                      path="/estudantes-responsive" 
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <EstudantesResponsive />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/density-toggle-test" 
                      element={<DensityToggleTestPage />} 
                    />
                    <Route 
                      path="/zoom-responsiveness-test" 
                      element={<ZoomResponsivenessTestPage />} 
                    />
                  </>
                )}

                {/* Role-specific Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor', 'admin']}>
                      <InstrutorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Estudante Dashboard Route */}
                <Route
                  path="/estudante/:id"
                  element={
                    <ProtectedRoute allowedRoles={['estudante', 'instrutor', 'admin']}>
                      <EstudanteDashboard />
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
                      <ProgramasOptimized />
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
                      <DesignacoesOptimized />
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
                <Route
                  path="/equidade"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor', 'admin']}>
                      <Equidade />
                    </ProtectedRoute>
                  }
                />

                {/* Student Portal - Override with new dashboard */}
                <Route
                  path="/estudante-portal/:id"
                  element={
                    <ProtectedRoute allowedRoles={['estudante', 'instrutor', 'admin']}>
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
            </Router>
          </TooltipProvider>

          {/* Debug Panel - Only shows in development */}
          <ConditionalDebugPanel />
          {import.meta.env.DEV && <DebugFab />}
          {import.meta.env.DEV && <LanguageDebug />}
        </TutorialProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
