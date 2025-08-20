import React, { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Demo = lazy(() => import("./pages/Demo"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Estudantes = lazy(() => import("./pages/Estudantes"));
const EstudantesResponsive = lazy(() => import("./pages/EstudantesResponsive"));
const ProgramasOptimized = lazy(() => import("./pages/ProgramasOptimized"));
const ProgramaPreview = lazy(() => import("./pages/ProgramaPreview"));
const ProgramasTest = lazy(() => import("./pages/ProgramasTest"));
const PdfParsingTest = lazy(() => import("./pages/PdfParsingTest"));
const DesignacoesOptimized = lazy(() => import("./pages/DesignacoesOptimized"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Reunioes = lazy(() => import("./pages/Reunioes"));
const EstudantePortal = lazy(() => import("./pages/EstudantePortal"));
const FamiliaPage = lazy(() => import("./pages/estudante/[id]/familia"));
const Funcionalidades = lazy(() => import("./pages/Funcionalidades"));
const Congregacoes = lazy(() => import("./pages/Congregacoes"));
const Suporte = lazy(() => import("./pages/Suporte"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Doar = lazy(() => import("./pages/Doar"));
const BemVindo = lazy(() => import("./pages/BemVindo"));
const ConfiguracaoInicial = lazy(() => import("./pages/ConfiguracaoInicial"));
const PrimeiroPrograma = lazy(() => import("./pages/PrimeiroPrograma"));
const DeveloperPanel = lazy(() => import("./pages/DeveloperPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ConviteAceitar = lazy(() => import("./pages/convite/aceitar"));
const PortalFamiliar = lazy(() => import("./pages/PortalFamiliar"));
const Equidade = lazy(() => import("./pages/Equidade"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DensityToggleTestPage = lazy(() => import("./pages/DensityToggleTest"));
const ZoomResponsivenessTestPage = lazy(() => import("./pages/ZoomResponsivenessTest"));

// Lazy load components
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const TutorialOverlay = lazy(() => import("@/components/tutorial").then(m => ({ default: m.TutorialOverlay })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-background p-4">
    <Skeleton className="h-16 w-full mb-4" />
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
);


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
    {import.meta.env.DEV && <PerformanceMonitor />}
    <LanguageProvider>
      <AuthProvider>
        <TutorialProvider>
          <TooltipProvider>
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <TutorialOverlay />
            </Suspense>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Suspense fallback={<PageLoader />}>
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
                    <ProtectedRoute allowedRoles={['instrutor']}>
                      <Equidade />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>

          {/* Debug Panel - Only shows in development */}
          <ConditionalDebugPanel />
          {import.meta.env.DEV && (
            <Suspense fallback={null}>
              {React.createElement(lazy(() => import("@/components/DebugFab")))}
              {React.createElement(lazy(() => import("@/components/LanguageDebug")))}
            </Suspense>
          )}
        </TutorialProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
