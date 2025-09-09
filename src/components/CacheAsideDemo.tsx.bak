/**
 * 🎯 DEMONSTRAÇÃO PRÁTICA DO CACHE-ASIDE PATTERN
 * 
 * Este componente mostra lado a lado a diferença entre:
 * ❌ Operações SEM cache (lentas, custosas)
 * ✅ Operações COM cache-aside (rápidas, eficientes)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useCacheAsideEstudantes, CacheAsideComparison } from '../hooks/useCacheAsideEstudantes';
import { useAuth } from '../contexts/AuthContext';

interface PerformanceMetrics {
  withoutCache?: {
    total: number;
    average: number;
    dbCalls: number;
  };
  withCache?: {
    total: number;
    average: number;
    dbCalls: number;
    cacheHits: number;
    hitRatio: number;
  };
}

export default function CacheAsideDemo() {
  const { user } = useAuth();
  const {
    estudantes,
    isLoading,
    metrics,
    fetchEstudantes,
    refresh,
    invalidateCache,
    getCacheDebugInfo,
    performanceGain,
    timeSavedFormatted
  } = useCacheAsideEstudantes();

  const [performanceTest, setPerformanceTest] = useState<PerformanceMetrics>({});
  const [isRunningTest, setIsRunningTest] = useState(false);

  /**
   * 🧪 EXECUTAR TESTE DE PERFORMANCE COMPARATIVO
   */
  const runPerformanceComparison = async () => {
    if (!user?.id) return;

    setIsRunningTest(true);
    try {
      console.log('🧪 Iniciando teste de performance...');
      
      // Teste sem cache
      const withoutCache = await CacheAsideComparison.withoutCache(user.id);
      
      // Pequena pausa para separar os testes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Teste com cache
      const withCache = await CacheAsideComparison.withCache(user.id);
      
      setPerformanceTest({ withoutCache, withCache });
      
    } catch (error) {
      console.error('💥 Erro no teste de performance:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  /**
   * 🎨 RENDERIZAR MÉTRICAS DE PERFORMANCE
   */
  const renderPerformanceMetrics = () => {
    if (!performanceTest.withoutCache || !performanceTest.withCache) {
      return (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">🧪 Teste de Performance</CardTitle>
            <CardDescription>
              Execute o teste para ver a diferença dramática entre com e sem cache
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runPerformanceComparison}
              disabled={isRunningTest || !user?.id}
              className="w-full"
            >
              {isRunningTest ? '⏳ Executando teste...' : '🚀 Executar Teste Comparativo'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    const { withoutCache, withCache } = performanceTest;
    const improvement = ((withoutCache.total - withCache.total) / withoutCache.total * 100);
    const dbCallsReduction = ((withoutCache.dbCalls - withCache.dbCalls) / withoutCache.dbCalls * 100);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sem Cache */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">❌ SEM Cache-Aside</CardTitle>
            <CardDescription className="text-red-700">
              Todas as consultas vão direto ao banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tempo Total:</span>
              <Badge variant="destructive">{withoutCache.total}ms</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tempo Médio:</span>
              <Badge variant="outline">{withoutCache.average.toFixed(0)}ms</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Chamadas ao DB:</span>
              <Badge variant="destructive">{withoutCache.dbCalls}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Cache Hits:</span>
              <Badge variant="outline">0</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Com Cache */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ COM Cache-Aside</CardTitle>
            <CardDescription className="text-green-700">
              Apenas a primeira consulta vai ao banco
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tempo Total:</span>
              <Badge variant="default" className="bg-green-600">{withCache.total}ms</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tempo Médio:</span>
              <Badge variant="outline">{withCache.average.toFixed(0)}ms</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Chamadas ao DB:</span>
              <Badge variant="default" className="bg-green-600">{withCache.dbCalls}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Cache Hits:</span>
              <Badge variant="default" className="bg-blue-600">{withCache.cacheHits}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Resumo da Melhoria */}
        <Card className="md:col-span-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">📊 Resultado da Otimização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {improvement.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Melhoria no Tempo</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {dbCallsReduction.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Redução em DB Calls</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(withCache.hitRatio * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Hit Ratio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">
            🚀 Cache-Aside Pattern - Demonstração Prática
          </CardTitle>
          <CardDescription className="text-blue-700">
            Veja como o Cache-Aside intercepta consultas repetidas e acelera drasticamente a aplicação
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Como o Cache-Aside Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-red-700">❌ Problema (Sem Cache):</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <span>Usuário solicita lista de estudantes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <span>Query vai direto ao banco (500-1500ms)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <span>TODA consulta repetida = nova query</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <span>Banco sobrecarregado, latência alta</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-green-700">✅ Solução (Com Cache-Aside):</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <span>Verificar cache primeiro (10-50ms)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <span>Se não existe: buscar no banco</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <span>Armazenar no cache para próximas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <span>Consultas seguintes = cache hit!</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas em Tempo Real */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">📊 Métricas em Tempo Real</CardTitle>
          <CardDescription>
            Dados reais do cache-aside funcionando no hook de estudantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalRequests}</div>
              <div className="text-xs text-gray-600">Total Requests</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.cacheHits}</div>
              <div className="text-xs text-gray-600">Cache Hits</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-600">{metrics.databaseCalls}</div>
              <div className="text-xs text-gray-600">DB Calls</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(metrics.hitRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Hit Ratio</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              ⚡ {performanceGain}
            </Badge>
            <Badge variant="outline">
              ⏱️ {timeSavedFormatted}
            </Badge>
            <Badge variant="outline">
              👥 {estudantes.length} estudantes cached
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Performance */}
      {renderPerformanceMetrics()}

      {/* Controles de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>🛠️ Controles de Teste</CardTitle>
          <CardDescription>
            Use estes botões para testar o comportamento do cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => fetchEstudantes()} 
              disabled={isLoading}
              variant="outline"
            >
              📊 Fetch (Cache)
            </Button>
            <Button 
              onClick={refresh} 
              disabled={isLoading}
              variant="outline"
            >
              🔄 Refresh (Force)
            </Button>
            <Button 
              onClick={invalidateCache}
              variant="outline"
            >
              🗑️ Clear Cache
            </Button>
            <Button 
              onClick={() => console.log('🧐 Cache Debug:', getCacheDebugInfo())}
              variant="outline"
            >
              🧐 Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quando Usar/Não Usar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ Quando Usar Cache-Aside</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✅ Dados lidos frequentemente (profiles, listas)</li>
              <li>✅ Dados que mudam pouco (configurações)</li>
              <li>✅ Queries caras computacionalmente</li>
              <li>✅ APIs com rate limiting</li>
              <li>✅ Dados de referência (códigos, países)</li>
              <li>✅ Operações read-heavy</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">❌ Quando NÃO Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>❌ Dados real-time (chat, trading)</li>
              <li>❌ Dados financeiros críticos</li>
              <li>❌ Dados únicos que não se repetem</li>
              <li>❌ Operações write-heavy</li>
              <li>❌ Dados grandes demais para memória</li>
              <li>❌ Dados que mudam constantemente</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Cuidados e Problemas */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">⚠️ Cuidados com Cache-Aside</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h5 className="font-semibold text-orange-700 mb-2">🔄 Inconsistência</h5>
              <p className="text-sm">Cache pode ter dados antigos. Solução: TTL baixo + invalidação após writes.</p>
            </div>
            <div>
              <h5 className="font-semibold text-orange-700 mb-2">⚡ Cache Stampede</h5>
              <p className="text-sm">Múltiplas requests simultâneas no cache miss. Solução: lock/semáforo.</p>
            </div>
            <div>
              <h5 className="font-semibold text-orange-700 mb-2">💾 Memory Leaks</h5>
              <p className="text-sm">Cache crescendo indefinidamente. Solução: maxSize + eviction strategy.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

