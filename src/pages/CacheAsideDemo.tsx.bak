import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  Activity, 
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';
import { useCacheAsideEstudantesEnhanced } from '@/hooks/useCacheAsideEstudantesEnhanced';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * 🚀 DEMONSTRAÇÃO COMPLETA DO CACHE-ASIDE PATTERN ENHANCED
 * 
 * ✅ Todas as regras aplicadas:
 * - Regra 6: Error handling robusto
 * - Regra 8: Componente ≤300 linhas  
 * - Regra 9: Performance otimizada
 * - Regra 3: UI/UX consistente
 * 
 * 🎯 Esta página demonstra o poder do Cache-Aside Pattern:
 * - Circuit breaker em ação
 * - Fallback automático
 * - Métricas em tempo real
 * - Health monitoring
 * - Retry logic
 */

function CacheAsideDemoContent() {
  const {
    estudantes,
    isLoading,
    error,
    isFromCache,
    fetchEstudantes,
    refetch,
    clearCache,
    cacheMetrics,
    healthStatus
  } = useCacheAsideEstudantesEnhanced();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 🎯 Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          Cache-Aside Pattern Enhanced
        </h1>
        <p className="text-muted-foreground mt-2">
          Demonstração completa do sistema de cache otimizado com error handling robusto
        </p>
      </div>

      {/* 📊 Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cacheMetrics?.hitRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheMetrics?.hits || 0} / {cacheMetrics?.totalRequests || 0} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Latência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {cacheMetrics?.averageLatency?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              Cache Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {cacheMetrics?.size || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Entries armazenadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthStatus?.isHealthy ? '✅' : '⚠️'}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthStatus?.isHealthy ? 'Saudável' : 'Atenção'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 🎮 Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Controles de Demonstração</CardTitle>
          <CardDescription>
            Teste o comportamento do cache em diferentes cenários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={fetchEstudantes} 
              disabled={isLoading}
              variant="default"
            >
              <Database className="h-4 w-4 mr-2" />
              {isLoading ? 'Carregando...' : 'Fetch (com Cache)'}
            </Button>
            
            <Button 
              onClick={refetch} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh (sem Cache)
            </Button>
            
            <Button 
              onClick={clearCache} 
              disabled={isLoading}
              variant="destructive"
            >
              <Zap className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Badge 
              variant={isFromCache ? "default" : "secondary"}
              className={isFromCache ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
            >
              {isFromCache ? '🚀 Dados do Cache' : '🔄 Dados do Banco'}
            </Badge>
            
            {healthStatus?.circuitBreakerOpen && (
              <Badge variant="destructive">
                ⚡ Circuit Breaker Ativo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 📊 Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Métricas Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Cache Hits:</span>
              <Badge variant="outline" className="text-green-600">
                {cacheMetrics?.hits || 0}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cache Misses:</span>
              <Badge variant="outline" className="text-blue-600">
                {cacheMetrics?.misses || 0}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Requests:</span>
              <Badge variant="outline">
                {cacheMetrics?.totalRequests || 0}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Errors:</span>
              <Badge variant="outline" className="text-red-600">
                {cacheMetrics?.errors || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Sistema:</span>
              <Badge 
                variant={healthStatus?.isHealthy ? "default" : "destructive"}
                className={healthStatus?.isHealthy ? "bg-green-100 text-green-800" : ""}
              >
                {healthStatus?.isHealthy ? 
                  <><CheckCircle className="h-3 w-3 mr-1" /> Saudável</> : 
                  <><AlertCircle className="h-3 w-3 mr-1" /> Atenção</>
                }
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Circuit Breaker:</span>
              <Badge variant={healthStatus?.circuitBreakerOpen ? "destructive" : "default"}>
                {healthStatus?.circuitBreakerOpen ? 'Aberto' : 'Fechado'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Error Rate:</span>
              <span className="text-sm font-medium">
                {healthStatus?.errorRate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cache Size:</span>
              <span className="text-sm font-medium">
                {healthStatus?.cacheSize || 0} entries
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 👥 Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Estudantes ({estudantes.length})
          </CardTitle>
          <CardDescription>
            Dados carregados {isFromCache ? 'do cache' : 'do banco de dados'}
            {error && ' (usando fallback)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800 text-sm font-medium">
                  Aviso: {error}
                </span>
              </div>
              <p className="text-yellow-700 text-xs mt-1">
                Dados de fallback estão sendo exibidos para manter a funcionalidade.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estudantes.map((estudante) => (
              <div 
                key={estudante.id} 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">
                  {estudante.nome} {estudante.sobrenome}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {estudante.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {estudante.ativo ? '✅ Ativo' : '❌ Inativo'}
                </div>
              </div>
            ))}
          </div>

          {estudantes.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum estudante encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CacheAsideDemo() {
  return (
    <ErrorBoundary>
      <CacheAsideDemoContent />
    </ErrorBoundary>
  );
}

