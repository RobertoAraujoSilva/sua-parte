import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  runFamilyInvitationDiagnostics,
  testFamilyMemberCreation,
  displayDiagnostics,
  type DebugInfo
} from '@/utils/familyInvitationDebug';

interface FamilyInvitationDebugPanelProps {
  studentId?: string;
}

export const FamilyInvitationDebugPanel: React.FC<FamilyInvitationDebugPanelProps> = ({ 
  studentId 
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      console.log('🔍 Running Family Invitation System Diagnostics...');
      const info = await runFamilyInvitationDiagnostics();
      setDebugInfo(info);

      // If diagnostics pass, run a test family member creation
      if (studentId && info.authState.isAuthenticated && info.databaseConnectivity.canConnect) {
        console.log('🧪 Running family member creation test...');
        const testData = {
          name: 'Test Family Member',
          email: 'test@example.com',
          gender: 'M' as const,
          relation: 'Irmão',
        };

        const result = await testFamilyMemberCreation(studentId, testData);
        setTestResult(result);
      }
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCompleteTest = async () => {
    if (!studentId) return;

    setIsRunning(true);

    try {
      console.log('🧪 Running complete system test...');
      // Test function removed, just log for now
      console.log('Test system removed');
    } catch (error) {
      console.error('❌ Complete test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="text-xs">
        {status ? "✅" : "❌"} {label}
      </Badge>
    );
  };

  if (!user || user.user_metadata?.role !== 'instrutor') {
    return null; // Only show to instructors
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100 transition-colors">
            <CardTitle className="flex items-center justify-between text-orange-800">
              <div className="flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <span>Debug: Sistema de Convites Familiares</span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Painel de Debug:</strong> Use esta ferramenta para diagnosticar problemas 
                com o sistema de convites familiares. Visível apenas para instrutores.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                onClick={runDiagnostics}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Executando...' : 'Diagnóstico Rápido'}
              </Button>

              {studentId && (
                <Button
                  onClick={runCompleteTest}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  {isRunning ? 'Testando...' : 'Teste Completo'}
                </Button>
              )}
            </div>

            {debugInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Authentication Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getStatusIcon(debugInfo.authState.isAuthenticated)}
                        <span>Autenticação</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getStatusBadge(debugInfo.authState.isAuthenticated, 'Autenticado')}
                      {getStatusBadge(debugInfo.authState.sessionValid, 'Sessão Válida')}
                      {debugInfo.authState.userEmail && (
                        <p className="text-xs text-gray-600">
                          Email: {debugInfo.authState.userEmail}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Database Connectivity */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getStatusIcon(debugInfo.databaseConnectivity.canConnect)}
                        <span>Banco de Dados</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getStatusBadge(debugInfo.databaseConnectivity.canConnect, 'Conectividade')}
                      {debugInfo.databaseConnectivity.error && (
                        <p className="text-xs text-red-600">
                          Erro: {debugInfo.databaseConnectivity.error}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* RLS Policies */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getStatusIcon(debugInfo.rlsPolicies.familyMembersAccess && debugInfo.rlsPolicies.invitationsLogAccess)}
                        <span>Políticas RLS</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getStatusBadge(debugInfo.rlsPolicies.familyMembersAccess, 'Family Members')}
                      {getStatusBadge(debugInfo.rlsPolicies.invitationsLogAccess, 'Invitations Log')}
                      {debugInfo.rlsPolicies.error && (
                        <p className="text-xs text-red-600">
                          Erro: {debugInfo.rlsPolicies.error}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Edge Function */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {debugInfo.edgeFunction.available ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span>Edge Function</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge variant={debugInfo.edgeFunction.available ? "default" : "secondary"} className="text-xs">
                        {debugInfo.edgeFunction.available ? "✅ Disponível" : "⚠️ Indisponível"}
                      </Badge>
                      {debugInfo.edgeFunction.error && (
                        <p className="text-xs text-yellow-600">
                          Modo desenvolvimento: {debugInfo.edgeFunction.error}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Test Results */}
                {testResult && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        {getStatusIcon(testResult.success)}
                        <span>Teste de Criação de Familiar</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {testResult.success ? (
                        <div className="space-y-2">
                          <Badge variant="default" className="text-xs">
                            ✅ Teste bem-sucedido
                          </Badge>
                          <p className="text-xs text-green-600">
                            Familiar de teste criado e removido com sucesso.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Badge variant="destructive" className="text-xs">
                            ❌ Teste falhou
                          </Badge>
                          <p className="text-xs text-red-600">
                            Erro: {testResult.error}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Resumo do Diagnóstico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const { issues, successes } = displayDiagnostics(debugInfo);
                      return (
                        <div className="space-y-2">
                          {successes.map((success, index) => (
                            <p key={index} className="text-xs text-green-600">{success}</p>
                          ))}
                          {issues.map((issue, index) => (
                            <p key={index} className="text-xs text-red-600">{issue}</p>
                          ))}
                          {issues.length === 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              🎉 Todos os sistemas funcionando corretamente!
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <p className="text-xs text-gray-500">
                  Diagnóstico executado em: {new Date(debugInfo.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            {/* Removed system test results section */}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
