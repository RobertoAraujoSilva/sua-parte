import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { materialProcessor } from '@/services/materialProcessor';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

interface MaterialUploaderProps {
  onUploadComplete?: (results: any[]) => void;
  onClose?: () => void;
}

export default function MaterialUploader({ onUploadComplete, onClose }: MaterialUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Tipos de arquivo suportados
  const supportedTypes = {
    'application/pdf': { ext: '.pdf', icon: FileText, label: 'PDF' },
    'application/zip': { ext: '.zip', icon: FileText, label: 'ZIP' },
    'application/x-zip-compressed': { ext: '.zip', icon: FileText, label: 'ZIP' }
  };

  const validateFile = (file: File): boolean => {
    // Verificar tipo de arquivo
    if (!supportedTypes[file.type as keyof typeof supportedTypes]) {
      // Verificar extensão para arquivos .jwpub e .daisy.zip
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.jwpub') && !fileName.endsWith('.daisy.zip') && !fileName.endsWith('.pdf')) {
        return false;
      }
    }

    // Verificar tamanho (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return false;
    }

    return true;
  };

  const processFile = async (uploadedFile: UploadedFile): Promise<void> => {
    try {
      setUploadedFiles(prev => prev.map(f =>
        f.id === uploadedFile.id
          ? { ...f, status: 'processing', progress: 0 }
          : f
      ));

      // Usar o serviço de processamento real
      const result = await materialProcessor.processFile(
        uploadedFile.file,
        (progress) => {
          setUploadedFiles(prev => prev.map(f =>
            f.id === uploadedFile.id
              ? { ...f, progress }
              : f
          ));
        }
      );

      setUploadedFiles(prev => prev.map(f =>
        f.id === uploadedFile.id
          ? { ...f, status: 'completed', progress: 100, result }
          : f
      ));

    } catch (error) {
      console.error('Erro no processamento:', error);
      setUploadedFiles(prev => prev.map(f =>
        f.id === uploadedFile.id
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' }
          : f
      ));
    }
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(validateFile);
    
    if (validFiles.length === 0) {
      alert('Nenhum arquivo válido selecionado. Formatos suportados: PDF, JWPUB, DAISY.ZIP');
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      status: 'pending',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Processar arquivos sequencialmente
    for (const uploadedFile of newFiles) {
      await processFile(uploadedFile);
    }

    setIsProcessing(false);

    // Notificar conclusão
    const results = newFiles.map(f => f.result).filter(Boolean);
    if (onUploadComplete && results.length > 0) {
      onUploadComplete(results);
    }
  }, [onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <Upload className="h-4 w-4 text-gray-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Aguardando';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'error':
        return 'Erro';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Importar Programação Oficial
            </CardTitle>
            <CardDescription>
              Faça upload de materiais oficiais do JW.org (PDF, JWPUB, DAISY.ZIP)
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Formatos suportados: PDF, JWPUB, DAISY.ZIP (máx. 50MB cada)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jwpub,.zip"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={handleFileButtonClick}
            disabled={isProcessing}
          >
            Selecionar Arquivos
          </Button>
        </div>

        {/* Lista de Arquivos */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Arquivos ({uploadedFiles.length})</h3>
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(uploadedFile.status)}
                    <div>
                      <p className="font-medium text-sm">{uploadedFile.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      uploadedFile.status === 'completed' ? 'default' :
                      uploadedFile.status === 'error' ? 'destructive' :
                      uploadedFile.status === 'processing' ? 'secondary' : 'outline'
                    }>
                      {getStatusLabel(uploadedFile.status)}
                    </Badge>
                    {uploadedFile.status !== 'processing' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {uploadedFile.status === 'processing' && (
                  <Progress value={uploadedFile.progress} className="mb-2" />
                )}
                
                {uploadedFile.error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadedFile.error}</AlertDescription>
                  </Alert>
                )}
                
                {uploadedFile.result && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <p className="font-medium text-green-800">✅ Processado com sucesso!</p>
                    <p className="text-green-600">
                      {uploadedFile.result.title} - {uploadedFile.result.language === 'pt' ? 'Português' : 'Inglês'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Informações de Ajuda */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica:</strong> Baixe os materiais oficiais do JW.org e faça upload aqui. 
            O sistema extrairá automaticamente a programação, cânticos e partes para uso nas congregações.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
