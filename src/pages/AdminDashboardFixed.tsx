import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  BarChart3, 
  RefreshCw, 
  CheckCircle, 
  Database, 
  Settings, 
  Users, 
  Activity, 
  AlertCircle, 
  FileText,
  Package
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useJWorgIntegration } from '@/hooks/useJWorgIntegration';
import { supabase } from '@/lib/supabase';

// 🎯 LAZY LOADING DOS COMPONENTES PESADOS (Regra 8)
const OverviewTab = lazy(() => import('@/components/admin/OverviewTab'));
const UsersTab = lazy(() => import('@/components/admin/UsersTab'));
const CongregationsTab = lazy(() => import('@/components/admin/CongregationsTab'));
const SystemTab = lazy(() => import('@/components/admin/SystemTab'));
const MonitoringTab = lazy(() => import('@/components/admin/MonitoringTab'));

// 🚨 COMPONENTE TEMPORÁRIO LIMPO (≤100 linhas - Regra 8)
export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Sistema Ministerial Global - Gestão e Monitoramento
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="congregations">Congregações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        {/* 🎯 LAZY LOADING COM SUSPENSE (Regra 8) */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando...</span>
          </div>
        }>
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          
          <TabsContent value="congregations">
            <CongregationsTab />
          </TabsContent>
          
          <TabsContent value="system">
            <SystemTab />
          </TabsContent>
          
          <TabsContent value="monitoring">
            <MonitoringTab />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}

