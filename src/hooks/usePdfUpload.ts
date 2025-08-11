import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { JWPdfParser, type ParsedPdfData } from '@/utils/pdfParser';

export interface PdfUploadResult {
  success: boolean;
  data?: {
    filename: string;
    size: number;
    extractedData?: {
      semana: string;
      partes: string[];
      data_inicio: string;
    };
  };
  error?: string;
}

export interface PdfUploadState {
  isUploading: boolean;
  progress: number;
  result: PdfUploadResult | null;
}

export const usePdfUpload = () => {
  const [state, setState] = useState<PdfUploadState>({
    isUploading: false,
    progress: 0,
    result: null,
  });

  const validatePdfFile = useCallback((file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Arquivo deve ser do tipo PDF';
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Limite máximo: 10MB';
    }

    // Check file name for basic validation
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return 'Arquivo deve ter extensão .pdf';
    }

    return null;
  }, []);

  const simulatePdfParsing = useCallback(async (file: File): Promise<ParsedPdfData> => {
    // Simulate PDF parsing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Use the enhanced PDF parser
      const extractedData = await JWPdfParser.parsePdf(file);

      console.log('📄 PDF Parsing Results:', {
        filename: file.name,
        extractedData,
        fileSize: file.size,
        fileType: file.type
      });

      return extractedData;
    } catch (error) {
      console.error('❌ Error parsing PDF:', error);

      // Fallback to basic filename parsing
      return {
        semana: `Programa Importado - ${file.name}`,
        mes_ano: '',
        tipo_documento: 'programa_semanal',
        partes: [
          'Tesouros da Palavra de Deus',
          'Faça Seu Melhor no Ministério',
          'Nossa Vida Cristã'
        ],
        data_inicio: new Date().toISOString().split('T')[0],
        detalhes_extras: {}
      };
    }
  }, []);



  const uploadPdf = useCallback(async (file: File): Promise<PdfUploadResult> => {
    // Validate file
    const validationError = validatePdfFile(file);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      result: null
    }));

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulate PDF parsing
      setState(prev => ({ ...prev, progress: 50 }));
      const extractedData = await simulatePdfParsing(file);
      
      setState(prev => ({ ...prev, progress: 100 }));

      const result: PdfUploadResult = {
        success: true,
        data: {
          filename: file.name,
          size: file.size,
          extractedData
        }
      };

      setState(prev => ({
        ...prev,
        isUploading: false,
        result
      }));

      toast({
        title: 'PDF importado com sucesso!',
        description: `Programa "${extractedData.semana}" foi processado e está pronto para gerar designações.`,
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar PDF';
      
      const result: PdfUploadResult = {
        success: false,
        error: errorMessage
      };

      setState(prev => ({
        ...prev,
        isUploading: false,
        result
      }));

      toast({
        title: 'Erro ao importar PDF',
        description: errorMessage,
        variant: 'destructive'
      });

      return result;
    }
  }, [validatePdfFile, simulatePdfParsing]);

  const resetUpload = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      result: null
    });
  }, []);

  return {
    ...state,
    uploadPdf,
    resetUpload,
    validatePdfFile
  };
};
