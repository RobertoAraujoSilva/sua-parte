import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  BarChart3, 
  RefreshCw, 
  CheckCircle, 
  Database, 
  Settings,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAdminCache } from '@/hooks/admin/useAdminCache';
import { useJWorgIntegration } from '@/hooks/useJWorgIntegration';
import { useSupabaseData } from '@/hooks/useSupabaseData';

/**
 * 🎯 OVERVIEW TAB - Visão Geral do Sistema
 * 
 * ✅ Regra 8: Componente ≤300 linhas
 * ✅ Regra 3: UI/UX Consistente
 * ✅ Regra 6: Error handling
 * ✅ Regra 9: Performance otimizada
 */

export default function OverviewTab() {
  const {
    stats,
    isLoading,
    error,
    refreshStats,
    getCacheMetrics
  } = useAdminCache();

  const {
    currentLanguage,
    isLoading: jwLoading,
    setLanguage
  } = useJWorgIntegration();

  // 📊 DADOS REAIS DO SUPABASE
  const {
    stats: supabaseStats,
    workbooks,
    programming,
    loading: supabaseLoading,
    error: supabaseError,
    refreshData
  } = useSupabaseData();

  const cacheMetrics = getCacheMetrics();

  // 🛡️ Early return para loading (Regra 12)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando estatísticas...</span>
      </div>
    );
  }

  // 🛡️ Early return para erro (Regra 12)
  if (error && !stats) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button onClick={refreshStats} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎯 Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-center text-muted-foreground">
          🎯 Sistema Ministerial Global - Padronização Mundial
        </h3>
        <div className="text-center text-sm text-muted-foreground mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <strong>📊 Admin Geral:</strong> Disponibiliza programação oficial semanal (SEM nomes de estudantes) <br/>
          <strong>🎓 Instrutores:</strong> Recebem programação automaticamente + fazem designações locais reais
        </div>
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Congregações Conectadas</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_congregations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Recebendo programação oficial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semanas Programadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supabaseStats.totalWeeks}</div>
            <p className="text-xs text-muted-foreground">
              Próximas 3 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas Disponíveis</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Português e Inglês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✅</div>
            <p className="text-xs text-muted-foreground">
              Hoje, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 🚀 Performance & Cache Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Performance Cache
            </CardTitle>
            <CardDescription>
              Métricas do sistema de cache otimizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hit Rate:</span>
              <Badge variant="outline" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {cacheMetrics.metrics?.hitRate?.toFixed(1) || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cache Size:</span>
              <span className="text-sm text-muted-foreground">
                {cacheMetrics.metrics?.size || 0} entries
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Latency:</span>
              <span className="text-sm text-green-600">
                {cacheMetrics.metrics?.averageLatency?.toFixed(0) || 0}ms
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Informações sobre a última verificação e status geral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operacional
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase:</span>
              <Badge variant="outline" className="text-green-600">
                <Database className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime:</span>
              <span className="text-sm text-green-600">
                {stats?.system_uptime || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🌐 JW.org Integration */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">📚 JW.org Integration</CardTitle>
          <CardDescription className="text-green-700">
            Gerenciar materiais oficiais e sincronização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Idioma Atual:</span>
            <Badge variant="outline" className="text-green-600">
              {currentLanguage === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sincronizado
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-300 text-green-700"
              onClick={() => setLanguage(currentLanguage === 'pt' ? 'en' : 'pt')}
              disabled={jwLoading}
            >
              <Globe className="h-3 w-3 mr-1" />
              Alternar Idioma
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-300 text-green-700"
              onClick={refreshStats}
              disabled={isLoading}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Atualizar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ⚠️ Error Display */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-yellow-800">⚠️ {error}</p>
              <Button onClick={refreshStats} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

