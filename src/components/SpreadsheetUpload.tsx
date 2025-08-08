import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download
} from 'lucide-react';
import { useSpreadsheetImport } from '@/hooks/useSpreadsheetImport';
import { ValidationResult } from '@/types/spreadsheet';
import TemplateDownload from './TemplateDownload';
import ImportHelp from './ImportHelp';

interface SpreadsheetUploadProps {
  onImportComplete?: () => void;
}

const SpreadsheetUpload: React.FC<SpreadsheetUploadProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'validate' | 'preview' | 'import' | 'complete'>('upload');
  
  const {
    loading,
    validationResults,
    importSummary,
    validateFile,
    importStudents,
    getImportStats,
    resetImport
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
    
    setStep('import');
    try {
      await importStudents(validationResults);
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
    );
  }

  if (step === 'import') {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-jw-blue border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Importando estudantes...</h3>
          <p className="text-gray-600">Salvando dados no sistema</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importSummary.imported}</div>
              <div className="text-sm text-green-700">Importados</div>
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

          <Button onClick={handleReset} className="w-full">
            Importar Nova Planilha
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default SpreadsheetUpload;
