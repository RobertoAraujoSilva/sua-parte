import React from "react";
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
import { LanguageDebug } from "@/components/LanguageDebug";
import Demo from "./pages/Demo";
import ProgramasTest from "./pages/ProgramasTest";
import Relatorios from "./pages/Relatorios";
import Reunioes from "./pages/Reunioes";
import EstudantesResponsive from "./pages/EstudantesResponsive";
import FamiliaPage from "./pages/estudante/[id]/familia";
import Funcionalidades from "./pages/Funcionalidades";
import Congregacoes from "./pages/Congregacoes";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import Doar from "./pages/Doar";
import BemVindo from "./pages/BemVindo";
import ConfiguracaoInicial from "./pages/ConfiguracaoInicial";
import PrimeiroPrograma from "./pages/PrimeiroPrograma";
import NotFound from "./pages/NotFound";
import ConviteAceitar from "./pages/convite/aceitar";
import PortalFamiliar from "./pages/PortalFamiliar";
import UnifiedDashboard from "./components/UnifiedDashboard";
import AdminDashboardConnected from "./components/admin/AdminDashboardConnected";
import DensityToggleTestPage from "./pages/DensityToggleTest";
import ZoomResponsivenessTestPage from "./pages/ZoomResponsivenessTest";
import ProtectedRoute from "./components/ProtectedRoute";
import DebugFab from "./components/DebugFab";
import AuthRecoveryButton from "./components/AuthRecoveryButton";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
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

                {/* Debug Routes - Only in development */}
                {import.meta.env.DEV && (
                  <>
                    {/* Removed legacy route */}
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

                {/* Instrutor Only Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <UnifiedDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Removed legacy route */}
                <Route
                  path="/programas-test"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <ProgramasTest />
                    </ProtectedRoute>
                  }
                />
                {/* Removed legacy route */}
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
                {/* Removed legacy route */}
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
                {/* Instrutor routes re-enabled */}
                <Route
                  path="/estudantes"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <EstudantesResponsive />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/programas"
                  element={
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <ProgramasTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardConnected />
                    </ProtectedRoute>
                  }
                />

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
            </BrowserRouter>
          </TooltipProvider>

          {/* Auth Recovery Button - Shows when there are auth errors */}
          <div className="fixed top-4 right-4 z-50">
            <AuthRecoveryButton />
          </div>

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
