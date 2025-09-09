import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from './dashboards/AdminDashboard';
import InstructorDashboard from './dashboards/InstructorDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

const WorkingDashboard = () => {
  const { user, profile, loading } = useAuth();

  // Show loading state while authentication is being resolved
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando Sistema Ministerial...</p>
        </div>
      </div>
    );
  }

  // Show loading state while profile is being resolved
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil do usuário...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'instrutor':
      return <InstructorDashboard />;
    case 'estudante':
      return <StudentDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Role Não Reconhecido</h1>
            <p className="text-muted-foreground mb-4">
              Seu perfil possui um role que não é suportado pelo sistema: {profile.role}
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador para resolver este problema.
            </p>
          </div>
        </div>
      );
  }
};

export default WorkingDashboard;