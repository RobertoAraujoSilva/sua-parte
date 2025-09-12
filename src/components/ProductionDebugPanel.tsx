import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ProductionDebugPanel: React.FC = () => {
  const { user, profile } = useAuth();

  // Só renderizar em desenvolvimento
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-4 text-xs max-w-md">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div>User: {user ? 'Logged In' : 'Not Logged'}</div>
        <div>Email: {user?.email || 'N/A'}</div>
        <div>Role: {profile?.role || 'N/A'}</div>
        <div>Profile: {profile ? 'Loaded' : 'Not Loaded'}</div>
      </div>
    </div>
  );
};

export default ProductionDebugPanel;