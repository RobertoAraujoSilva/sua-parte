import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Estudantes from "./pages/Estudantes";
import Programas from "./pages/Programas";
import Designacoes from "./pages/Designacoes";
import Relatorios from "./pages/Relatorios";
import Reunioes from "./pages/Reunioes";
import StudentDashboard from "./pages/StudentDashboard";
import Funcionalidades from "./pages/Funcionalidades";
import Congregacoes from "./pages/Congregacoes";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/congregacoes" element={<Congregacoes />} />
            <Route path="/suporte" element={<Suporte />} />
            <Route path="/sobre" element={<Sobre />} />

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
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
