import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from './lib/supabase';
import { handleAuthError } from './utils/authErrorHandler';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import MockAdminDashboard from './components/MockAdminDashboard';
import InstructorDashboard from './components/dashboards/InstructorDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import Auth from './pages/Auth';
import { setupGlobalAuthErrorHandler } from './utils/authErrorHandler';

// Setup global error handler
setupGlobalAuthErrorHandler();

function App() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Optional: handle sign-in logic
        } else if (event === 'TOKEN_REFRESHED' && !session) {
          // This case indicates a failed refresh
          await handleAuthError({ message: 'Invalid Refresh Token' });
        }
      }
    );

    // Check for session on initial load and handle potential errors
    const checkInitialSession = async () => {
      try {
        // This might throw if the stored token is malformed, but usually the error
        // comes from subsequent requests. The onAuthStateChange listener is more robust.
        await supabase.auth.getSession();
      } catch (error) {
        await handleAuthError(error);
      }
    };

    checkInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ErrorBoundary>
                <MockAdminDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['instrutor']}>
              <ErrorBoundary>
                <InstructorDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Auth />} />
          <Route path="/estudante/:id" element={
            <ProtectedRoute allowedRoles={['estudante']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
