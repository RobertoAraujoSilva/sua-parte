import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial";
import "@/utils/forceLogout"; // Initialize emergency logout tools
import "@/utils/supabaseHealthCheck"; // Initialize health check tools
import "@/utils/logoutDiagnostics"; // Initialize logout diagnostics
import "@/utils/emergencyLogout"; // Initialize critical emergency logout
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Estudantes from "./pages/Estudantes";
import Programas from "./pages/Programas";
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
import NotFound from "./pages/NotFound";
import ConviteAceitar from "./pages/convite/aceitar";
import PortalFamiliar from "./pages/PortalFamiliar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
// Import debug utilities for development
import '@/utils/familyMemberDebug';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
      </TutorialProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
