
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/dashboards/AdminDashboard';
import InstructorDashboard from './components/dashboards/InstructorDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import Auth from './pages/Auth';
import { setupGlobalAuthErrorHandler } from './utils/authErrorHandler';

// Setup global error handler
setupGlobalAuthErrorHandler();

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['instrutor']}>
              <InstructorDashboard />
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
    </AuthProvider>
  );
}

export default App;