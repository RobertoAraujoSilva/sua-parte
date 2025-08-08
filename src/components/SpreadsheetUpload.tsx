import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Users
} from 'lucide-react';
import { useSpreadsheetImport } from '@/hooks/useSpreadsheetImport';
import { ValidationResult } from '@/types/spreadsheet';
import { createErrorReport } from '@/utils/spreadsheetProcessor';
import TemplateDownload from './TemplateDownload';
import ImportHelp from './ImportHelp';

interface SpreadsheetUploadProps {
  onImportComplete?: () => void;
  onViewList?: () => void;
}

const SpreadsheetUpload: React.FC<SpreadsheetUploadProps> = ({ onImportComplete, onViewList }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'validate' | 'preview' | 'import' | 'complete'>('upload');
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  const {
    loading,
    validationResults,
    importSummary,
    importProgress,
    validateFile,
    importStudents,
    getImportStats,
    resetImport,
    checkDuplicates
  } = useSpreadsheetImport();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setStep('validate');
    
    try {
      await validateFile(file);
      setStep('preview');
    } catch (error) {
      setStep('upload');
      setSelectedFile(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (validationResults.length === 0) return;

    // Check for duplicates first
    const validStudents = validationResults
      .filter(result => result.isValid && result.data)
      .map(result => result.data!);

    try {
      const duplicates = await checkDuplicates(validStudents);
      if (duplicates.length > 0) {
        setDuplicateNames(duplicates);
        setShowDuplicateModal(true);
        return;
      }

      // No duplicates, proceed with import
      await proceedWithImport();
    } catch (error) {
      console.error('Error checking duplicates:', error);
      // If duplicate check fails, proceed anyway
      await proceedWithImport();
    }
  };

  const proceedWithImport = async () => {
    setStep('import');
    try {
      await importStudents(validationResults);
      setStep('complete');
      onImportComplete?.();
    } catch (error) {
      setStep('preview');
    }
  };

  const handleImportWithoutDuplicates = async () => {
    setShowDuplicateModal(false);

    // Filter out duplicates from validation results
    const filteredResults = validationResults.filter(result => {
      if (!result.isValid || !result.data) return false;
      return !duplicateNames.includes(result.data.nome);
    });

    setStep('import');
    try {
      await importStudents(filteredResults);
      setStep('complete');
      onImportComplete?.();
    } catch (error) {
      setStep('preview');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStep('upload');
    resetImport();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadErrorReport = () => {
    if (validationResults.length === 0) return;

    const errorBlob = createErrorReport(validationResults);
    const url = URL.createObjectURL(errorBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-erros-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = validationResults.length > 0 ? getImportStats(validationResults) : null;

  if (step === 'upload') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Estudantes via Planilha
          </CardTitle>
          <CardDescription>
            Faça upload de uma planilha Excel com os dados dos estudantes para importação em massa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-blue-900">Primeiro, baixe o modelo</h4>
              <p className="text-sm text-blue-700">
                Use nosso modelo para garantir que os dados estejam no formato correto
              </p>
            </div>
            <TemplateDownload variant="hero" />
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-jw-blue bg-jw-blue/5' 
                : 'border-gray-300 hover:border-jw-blue/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste o arquivo aqui ou clique para selecionar
            </h3>
            <p className="text-gray-600 mb-4">
              Formatos aceitos: .xlsx, .xls • Tamanho máximo: 10MB
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Selecionar Arquivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Help Documentation */}
          <ImportHelp />
        </CardContent>
      </Card>
    );
  }

  if (step === 'validate') {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-jw-blue border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Validando planilha...</h3>
          <p className="text-gray-600">Verificando dados e formato do arquivo</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'preview' && stats) {
    return (
      <>
        <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Prévia da Importação
          </CardTitle>
          <CardDescription>
            Arquivo: {selectedFile?.name} • {stats.total} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
              <div className="text-sm text-green-700">Válidos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
              <div className="text-sm text-red-700">Com Erros</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
              <div className="text-sm text-yellow-700">Com Avisos</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.validPercentage}%</div>
              <div className="text-sm text-blue-700">Taxa de Sucesso</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Registros válidos</span>
              <span>{stats.valid} de {stats.total}</span>
            </div>
            <Progress value={stats.validPercentage} className="h-2" />
          </div>

          {/* Errors and Warnings */}
          {stats.invalid > 0 && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {stats.invalid} registros contêm erros e não serão importados. 
                Verifique os dados e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {stats.warnings > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {stats.warnings} registros contêm avisos mas serão importados.
                Revise os dados após a importação.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Details Table */}
          {(stats.invalid > 0 || stats.warnings > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Detalhes dos Problemas</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadErrorReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Linha Excel</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Tipo</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Problema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {validationResults
                      .filter(result => !result.isValid || result.warnings.length > 0)
                      .map((result, index) => (
                        <React.Fragment key={index}>
                          {result.errors.map((error, errorIndex) => (
                            <tr key={`error-${index}-${errorIndex}`} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900">{result.rowIndex}</td>
                              <td className="px-3 py-2">
                                <Badge variant="destructive" className="text-xs">Erro</Badge>
                              </td>
                              <td className="px-3 py-2 text-gray-700">{error}</td>
                            </tr>
                          ))}
                          {result.warnings.map((warning, warningIndex) => (
                            <tr key={`warning-${index}-${warningIndex}`} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900">{result.rowIndex}</td>
                              <td className="px-3 py-2">
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Aviso</Badge>
                              </td>
                              <td className="px-3 py-2 text-gray-700">{warning}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={handleImport} 
              disabled={stats.valid === 0}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Importar {stats.valid} Estudantes
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Detection Modal */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Estudantes Duplicados Encontrados
            </DialogTitle>
            <DialogDescription>
              Os seguintes estudantes já existem no sistema:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              {duplicateNames.map((name, index) => (
                <div key={index} className="text-sm text-gray-700 py-1">
                  • {name}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {duplicateNames.length} de {validationResults.filter(r => r.isValid).length} estudantes já existem.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDuplicateModal(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImportWithoutDuplicates}
              className="w-full sm:w-auto"
            >
              Importar Apenas Novos ({validationResults.filter(r => r.isValid && r.data && !duplicateNames.includes(r.data.nome)).length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  if (step === 'import') {
    const progressPercentage = importProgress.total > 0
      ? Math.round((importProgress.current / importProgress.total) * 100)
      : 0;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin w-5 h-5 border-2 border-jw-blue border-t-transparent rounded-full" />
            {importProgress.phase === 'importing' && 'Importando Estudantes'}
            {importProgress.phase === 'linking' && 'Vinculando Relacionamentos'}
            {importProgress.phase === 'complete' && 'Finalizando'}
          </CardTitle>
          <CardDescription>
            {importProgress.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{importProgress.current} de {importProgress.total}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-center text-sm text-gray-600">
              {progressPercentage}% concluído
            </div>
          </div>

          {importProgress.phase === 'linking' && (
            <div className="text-center text-sm text-blue-600">
              Processando relacionamentos familiares...
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete' && importSummary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Importação Concluída
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importSummary.imported}</div>
              <div className="text-sm text-green-700">Importados</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importSummary.totalRows}</div>
              <div className="text-sm text-blue-700">Total Processados</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importSummary.errors.length}</div>
              <div className="text-sm text-red-700">Erros</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{importSummary.warnings.length}</div>
              <div className="text-sm text-yellow-700">Avisos</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taxa de Sucesso</span>
              <span>{importSummary.imported} de {importSummary.validRows} válidos</span>
            </div>
            <Progress
              value={importSummary.validRows > 0 ? (importSummary.imported / importSummary.validRows) * 100 : 0}
              className="h-2"
            />
          </div>

          {/* Additional Information */}
          {importSummary.imported > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Importação realizada com sucesso! Os relacionamentos familiares foram processados automaticamente.
                {importSummary.warnings.length > 0 && ` ${importSummary.warnings.length} avisos foram registrados para revisão.`}
              </AlertDescription>
            </Alert>
          )}

          {importSummary.errors.length > 0 && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {importSummary.errors.length} registros não puderam ser importados devido a erros de validação.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button onClick={onViewList} variant="hero" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Ver Lista de Estudantes
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Importar Nova Planilha
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default SpreadsheetUpload;
