import { useState, useCallback } from 'react';

// URL base da API - detecta automaticamente se está em desenvolvimento ou produção
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    // Em desenvolvimento, tentar detectar a porta do backend
    // O backend usa porta dinâmica, então vamos tentar algumas portas comuns
    const possiblePorts = [59033, 57808, 3000, 5000, 8000];
    
    // Por enquanto, usar a porta atual conhecida
    // TODO: Implementar detecção automática de porta
    return 'http://localhost:59033';
  }
  // Em produção, usar URL relativa
  return '';
};

// Tipos para PDF e programação
export interface PDFFile {
  fileName: string;
  filePath: string;
  size: number;
  lastModified: Date | string;
  language: 'pt' | 'en';
  year: number;
  month: number;
  isValid: boolean;
  reason?: string;
  dateCode?: string;
}

export interface PartDetails {
  title: string;
  type: string;
  duration: number;
  requirements: Record<string, boolean>;
  notes: string;
  order: number;
}

export interface WeekStructure {
  weekNumber: number;
  startDate: string;
  endDate: string;
  title: string;
  sections: {
    opening: PartDetails[];
    treasures: PartDetails[];
    ministry: PartDetails[];
    living: PartDetails[];
    closing: PartDetails[];
  };
}

export interface ProgrammingData {
  weeks: WeekStructure[];
  metadata: {
    sourceFile: string;
    language: string;
    extractedAt: Date;
    version: string;
    totalWeeks: number;
  };
}

export interface LoadingState {
  scanning: boolean;
  parsing: boolean;
  saving: boolean;
}

/**
 * Hook para gerenciar PDFs de programação no Admin Dashboard
 */
export function usePDFProgramming() {
  const [availablePDFs, setAvailablePDFs] = useState<PDFFile[]>([]);
  const [extractedProgramming, setExtractedProgramming] = useState<ProgrammingData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    scanning: false,
    parsing: false,
    saving: false
  });
  const [error, setError] = useState<string | null>(null);

  /**
   * Escaneia a pasta oficial em busca de PDFs MWB
   */
  const scanPDFs = useCallback(async () => {
    setLoading(prev => ({ ...prev, scanning: true }));
    setError(null);
    
    try {
      console.log('🔍 Escaneando PDFs na pasta oficial...');
      
      const response = await fetch(`${getApiBaseUrl()}/api/admin/scan-pdfs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test' // TODO: Implementar autenticação real
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAvailablePDFs(data.pdfs);
        console.log(`✅ ${data.total} PDFs encontrados`);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao escanear PDFs:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(prev => ({ ...prev, scanning: false }));
    }
  }, []);

  /**
   * Extrai programação de um PDF específico
   */
  const parsePDF = useCallback(async (pdf: PDFFile) => {
    setLoading(prev => ({ ...prev, parsing: true }));
    setError(null);
    
    try {
      console.log('📖 Extraindo programação do PDF:', pdf.fileName);
      
      const response = await fetch(`${getApiBaseUrl()}/api/admin/parse-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test' // TODO: Implementar autenticação real
        },
        body: JSON.stringify({ filePath: pdf.filePath })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setExtractedProgramming(data.programming);
        console.log(`✅ Programação extraída: ${data.programming.weeks.length} semanas`);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao extrair programação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(prev => ({ ...prev, parsing: false }));
    }
  }, []);

  /**
   * Valida um PDF específico
   */
  const validatePDF = useCallback(async (pdf: PDFFile) => {
    try {
      console.log('✅ Validando PDF:', pdf.fileName);
      
      const response = await fetch(`${getApiBaseUrl()}/api/admin/validate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test' // TODO: Implementar autenticação real
        },
        body: JSON.stringify({ filePath: pdf.filePath })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ PDF validado: ${data.isValid}`);
        return data.isValid;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao validar PDF:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    }
  }, []);

  /**
   * Salva programação extraída
   */
  const saveProgramming = useCallback(async (programming: ProgrammingData) => {
    setLoading(prev => ({ ...prev, saving: true }));
    setError(null);
    
    try {
      console.log('💾 Salvando programação extraída...');
      
      const response = await fetch(`${getApiBaseUrl()}/api/admin/save-programming`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test' // TODO: Implementar autenticação real
        },
        body: JSON.stringify({ programming })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Programação salva com sucesso');
        return data.programming;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar programação:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, []);

  /**
   * Lista programações salvas
   */
  const listProgrammings = useCallback(async (status?: string) => {
    try {
      console.log('📋 Listando programações salvas...');
      
      const url = status ? `${getApiBaseUrl()}/api/admin/programmings?status=${status}` : `${getApiBaseUrl()}/api/admin/programmings`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test' // TODO: Implementar autenticação real
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${data.total} programações encontradas`);
        return data.programmings;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao listar programações:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return [];
    }
  }, []);

  /**
   * Limpa dados extraídos
   */
  const clearExtractedData = useCallback(() => {
    setExtractedProgramming(null);
    setError(null);
  }, []);

  /**
   * Formata tamanho do arquivo
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * Formata data
   */
  const formatDate = useCallback((date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  }, []);

  /**
   * Obtém ícone do idioma
   */
  const getLanguageIcon = useCallback((language: string): string => {
    return language === 'pt' ? '🇧🇷' : '🇺🇸';
  }, []);

  /**
   * Obtém nome do idioma
   */
  const getLanguageName = useCallback((language: string): string => {
    return language === 'pt' ? 'Português' : 'English';
  }, []);

  return {
    // Estados
    availablePDFs,
    extractedProgramming,
    loading,
    error,
    
    // Ações
    scanPDFs,
    parsePDF,
    validatePDF,
    saveProgramming,
    listProgrammings,
    clearExtractedData,
    
    // Utilitários
    formatFileSize,
    formatDate,
    getLanguageIcon,
    getLanguageName
  };
}
