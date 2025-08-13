/**
 * Family Migration Panel Component
 * 
 * This component provides a user interface for managing the migration to the
 * enhanced family relationship system, including progress tracking and controls.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Users, 
  Database, 
  RefreshCw, 
  Play, 
  Eye,
  AlertTriangle,
  Undo2
} from 'lucide-react';
import { useEnhancedFamilyMigration } from '@/hooks/useEnhancedFamilyMigration';
import type { MigrationResult } from '@/utils/dataMigrationHelper';

interface FamilyMigrationPanelProps {
  className?: string;
}

export function FamilyMigrationPanel({ className }: FamilyMigrationPanelProps) {
  const {
    isLoading,
    isChecking,
    isMigrated,
    migrationProgress,
    studentsCount,
    enhancedStudentsCount,
    familyLinksCount,
    lastResult,
    error,
    checkMigrationStatus,
    runMigration,
    runDryRun,
    rollbackMigration,
    clearError
  } = useEnhancedFamilyMigration();

  const [showDetails, setShowDetails] = useState(false);
  const [lastDryRunResult, setLastDryRunResult] = useState<MigrationResult | null>(null);

  const handleDryRun = async () => {
    try {
      const result = await runDryRun();
      setLastDryRunResult(result);
      setShowDetails(true);
    } catch (error) {
      console.error('Dry run failed:', error);
    }
  };

  const handleMigration = async () => {
    try {
      await runMigration({
        preserveExistingData: true,
        autoInferRelationships: true,
        validateAfterMigration: true
      });
      setShowDetails(true);
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  const handleRollback = async () => {
    if (window.confirm('⚠️ ATENÇÃO: Esta ação removerá todos os dados de relacionamento familiar e não pode ser desfeita. Deseja continuar?')) {
      try {
        await rollbackMigration();
        setShowDetails(true);
      } catch (error) {
        console.error('Rollback failed:', error);
      }
    }
  };

  const getMigrationStatusColor = () => {
    if (isMigrated) return 'text-green-600';
    if (migrationProgress > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMigrationStatusIcon = () => {
    if (isMigrated) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (migrationProgress > 0) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <Info className="w-5 h-5 text-gray-600" />;
  };

  const getMigrationStatusText = () => {
    if (isMigrated) return 'Sistema migrado com sucesso';
    if (migrationProgress > 0) return 'Migração parcial detectada';
    return 'Sistema não migrado';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Migração do Sistema de Relacionamentos Familiares
          </CardTitle>
          <CardDescription>
            Migre para o novo sistema aprimorado de relacionamentos familiares com suporte completo às regras S-38-T
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro na Migração</AlertTitle>
              <AlertDescription className="mt-2">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearError}
                  className="ml-2"
                >
                  Limpar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMigrationStatusIcon()}
                <span className={`font-medium ${getMigrationStatusColor()}`}>
                  {getMigrationStatusText()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkMigrationStatus}
                disabled={isChecking}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso da Migração</span>
                <span>{Math.round(migrationProgress)}%</span>
              </div>
              <Progress value={migrationProgress} className="w-full" />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-jw-navy">{studentsCount}</div>
                <div className="text-sm text-muted-foreground">Total de Estudantes</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-jw-blue">{enhancedStudentsCount}</div>
                <div className="text-sm text-muted-foreground">Com Dados Aprimorados</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-jw-green">{familyLinksCount}</div>
                <div className="text-sm text-muted-foreground">Relacionamentos</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Migration Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ações de Migração</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleDryRun}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Simular Migração
              </Button>
              
              <Button
                variant="default"
                onClick={handleMigration}
                disabled={isLoading || isMigrated}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isLoading ? 'Migrando...' : 'Executar Migração'}
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleRollback}
                disabled={isLoading || !isMigrated}
                className="flex items-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                Reverter Migração
              </Button>
            </div>

            {/* Migration Info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informações Importantes</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p><strong>Simular Migração:</strong> Executa uma simulação sem alterar dados para mostrar o que seria migrado.</p>
                <p><strong>Executar Migração:</strong> Migra os dados para o novo sistema de relacionamentos familiares.</p>
                <p><strong>Reverter Migração:</strong> Remove todos os dados de relacionamento familiar (use apenas em emergência).</p>
              </AlertDescription>
            </Alert>
          </div>

          {/* Migration Results */}
          {(lastResult || lastDryRunResult) && showDetails && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resultados da Migração</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                  >
                    Ocultar
                  </Button>
                </div>

                {/* Display results for the most recent operation */}
                {(() => {
                  const result = lastResult || lastDryRunResult;
                  if (!result) return null;

                  return (
                    <div className="space-y-4">
                      {/* Success/Failure Status */}
                      <Alert variant={result.success ? "default" : "destructive"}>
                        {result.success ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                          {result.success ? 'Migração Concluída' : 'Migração Falhou'}
                        </AlertTitle>
                        <AlertDescription>{result.message}</AlertDescription>
                      </Alert>

                      {/* Migration Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Estatísticas</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Estudantes processados:</span>
                              <Badge variant="secondary">{result.details.studentsProcessed}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Relacionamentos criados:</span>
                              <Badge variant="secondary">{result.details.relationshipsCreated}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Status</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Erros:</span>
                              <Badge variant={result.details.errors.length > 0 ? "destructive" : "secondary"}>
                                {result.details.errors.length}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Avisos:</span>
                              <Badge variant={result.details.warnings.length > 0 ? "outline" : "secondary"}>
                                {result.details.warnings.length}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Errors */}
                      {result.details.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-600">Erros</h4>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <ul className="text-sm space-y-1">
                              {result.details.errors.map((error, index) => (
                                <li key={index} className="text-red-700">• {error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {result.details.warnings.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-yellow-600">Avisos</h4>
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <ul className="text-sm space-y-1">
                              {result.details.warnings.slice(0, 10).map((warning, index) => (
                                <li key={index} className="text-yellow-700">• {warning}</li>
                              ))}
                              {result.details.warnings.length > 10 && (
                                <li className="text-yellow-600 italic">
                                  ... e mais {result.details.warnings.length - 10} avisos
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* Benefits Section */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Benefícios do Sistema Aprimorado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-jw-blue" />
                  Relacionamentos Familiares
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Suporte completo a relacionamentos pai/mãe/cônjuge</li>
                  <li>• Detecção automática de famílias por sobrenome</li>
                  <li>• Validação de pares para designações S-38-T</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-jw-green" />
                  Conformidade S-38-T
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Validação automática de regras ministeriais</li>
                  <li>• Prevenção de violações de pareamento</li>
                  <li>• Relatórios de conformidade detalhados</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}