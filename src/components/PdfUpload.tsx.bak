import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { usePdfUpload } from '@/hooks/usePdfUpload';

interface PdfUploadProps {
  onUploadComplete?: (result: any) => void;
  onUploadStart?: () => void;
  className?: string;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({
  onUploadComplete,
  onUploadStart,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { isUploading, progress, result, uploadPdf, resetUpload } = usePdfUpload();

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
    onUploadStart?.();
    
    const result = await uploadPdf(file);
    
    if (result.success) {
      onUploadComplete?.(result.data);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-jw-blue/30 hover:border-jw-blue/50 transition-colors">
        <CardContent className="p-8 text-center">
          {!isUploading && !result && (
            <>
              <div
                className={`transition-colors ${
                  dragActive ? 'bg-jw-blue/5' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-16 h-16 text-jw-blue/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-jw-navy mb-2">
                  Importar Novo Programa
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Faça upload do PDF oficial da apostila Vida e Ministério Cristão. 
                  O sistema extrairá automaticamente todas as informações necessárias.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={handleButtonClick}
                    data-testid="pdf-upload-button"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Selecionar Arquivo PDF
                  </Button>
                  <Button variant="outline" size="lg">
                    <FileText className="w-5 h-5 mr-2" />
                    Criar Manualmente
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Formatos aceitos: PDF • Tamanho máximo: 10MB
                </p>
              </div>
            </>
          )}

          {isUploading && (
            <div className="space-y-4">
              <Upload className="w-16 h-16 text-jw-blue mx-auto animate-pulse" />
              <div>
                <h3 className="text-xl font-semibold text-jw-navy mb-2">
                  Processando PDF...
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                </p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-gray-500 mt-2">
                  {progress < 50 ? 'Fazendo upload...' : 'Extraindo informações do programa...'}
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                      PDF Importado com Sucesso!
                    </h3>
                    <Alert className="max-w-md mx-auto">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Programa:</strong> {result.data?.extractedData?.semana}<br />
                        <strong>Arquivo:</strong> {result.data?.filename}<br />
                        <strong>Partes identificadas:</strong> {result.data?.extractedData?.partes.length || 0}
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-red-700 mb-2">
                      Erro ao Processar PDF
                    </h3>
                    <Alert variant="destructive" className="max-w-md mx-auto">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.error}
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button onClick={handleReset} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Importar Outro PDF
                </Button>
                {result.success && (
                  <Button variant="hero">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Designações
                  </Button>
                )}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
            data-testid="pdf-file-input"
          />
        </CardContent>
      </Card>
    </div>
  );
};
