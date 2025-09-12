import { useState, useCallback } from 'react';

// URL base da API: usa variável de ambiente quando válida
export const getApiBaseUrl = () => {
  const forceMock = (import.meta.env.VITE_FORCE_MOCK as string | undefined) === '1' || (import.meta.env.VITE_FORCE_MOCK as string | undefined) === 'true';
  if (forceMock) {
    console.log('⚠️ Modo mock forçado ativado, retornando URL vazia');
    return '';
  }
  
  // Prefer VITE_API_BASE (new). Keep a fallback for VITE_API_BASE_URL (legacy)
  const raw = (import.meta.env.VITE_API_BASE as string | undefined)
    || (import.meta.env.VITE_API_BASE_URL as string | undefined);
  const envUrl = raw ? raw.replace(/\/$/, '') : '';

  if (!envUrl) {
    console.log('⚠️ VITE_API_BASE não definida (nem VITE_API_BASE_URL legado), retornando URL vazia');
    return '';
  }

  console.log('✅ Usando API base URL:', envUrl);
  return envUrl;
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
      console.log('🔗 URL da API:', getApiBaseUrl());
      
      // Em dev, use caminho relativo e deixe o Vite proxy encaminhar
      const baseUrl = getApiBaseUrl();
      if (!import.meta.env.DEV && !baseUrl) {
        throw new Error('URL da API não configurada. Defina VITE_API_BASE.');
      }
      const apiUrl = import.meta.env.DEV
        ? `/api/admin/scan-pdfs`
        : `${baseUrl}/api/admin/scan-pdfs`;
      console.log('🔗 Endpoint completo:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer test' // TODO: Implementar autenticação real
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const hint = text.includes('/@vite/client') || text.includes('<!DOCTYPE html')
          ? 'Parece que o frontend devolveu o index.html. Verifique se o backend está rodando e se VITE_API_BASE aponta para ele (ou remova para usar mocks em dev).'
          : 'O servidor não retornou JSON.';
        throw new Error(`Resposta não-JSON do servidor: ${text.slice(0, 120)}... Dica: ${hint}`);
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
      console.log('🔗 URL da API:', getApiBaseUrl());
      
      const parseBase = getApiBaseUrl();
      if (!import.meta.env.DEV && !parseBase) {
        throw new Error('URL da API não configurada. Defina VITE_API_BASE.');
      }
      const apiUrl = import.meta.env.DEV
        ? `/api/admin/parse-pdf`
        : `${parseBase}/api/admin/parse-pdf`;
      console.log('🔗 Endpoint completo:', apiUrl);
      
      const response = await fetch(apiUrl, {
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

      const contentTypeCheck = response.headers.get('content-type') || '';
      if (!contentTypeCheck.includes('application/json')) {
        const text = await response.text();
        const hint = text.includes('/@vite/client') || text.includes('<!DOCTYPE html')
          ? 'Parece que o frontend devolveu o index.html. Verifique se o backend está rodando e se VITE_API_BASE aponta para ele (ou remova para usar mocks em dev).'
          : 'O servidor não retornou JSON.';
        throw new Error(`Resposta não-JSON do servidor: ${text.slice(0, 120)}... Dica: ${hint}`);
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
      
      const validateBase = getApiBaseUrl();
      if (!import.meta.env.DEV && !validateBase) {
        throw new Error('URL da API não configurada. Defina VITE_API_BASE.');
      }
      const validateUrl = import.meta.env.DEV
        ? `/api/admin/validate-pdf`
        : `${validateBase}/api/admin/validate-pdf`;
      const response = await fetch(validateUrl, {
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

      const contentTypeCheck = response.headers.get('content-type') || '';
      if (!contentTypeCheck.includes('application/json')) {
        const text = await response.text();
        const hint = text.includes('/@vite/client') || text.includes('<!DOCTYPE html')
          ? 'Parece que o frontend devolveu o index.html. Verifique se o backend está rodando e se VITE_API_BASE aponta para ele (ou remova para usar mocks em dev).'
          : 'O servidor não retornou JSON.';
        throw new Error(`Resposta não-JSON do servidor: ${text.slice(0, 120)}... Dica: ${hint}`);
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
      
      const saveBase = getApiBaseUrl();
      if (!import.meta.env.DEV && !saveBase) {
        throw new Error('URL da API não configurada. Defina VITE_API_BASE.');
      }
      const saveUrl = import.meta.env.DEV
        ? `/api/admin/save-programming`
        : `${saveBase}/api/admin/save-programming`;
      const response = await fetch(saveUrl, {
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

      const contentTypeCheck = response.headers.get('content-type') || '';
      if (!contentTypeCheck.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta não-JSON do servidor: ${text.slice(0, 120)}...`);
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
      
      const listBase = getApiBaseUrl();
      const url = import.meta.env.DEV
        ? (status ? `/api/admin/programmings?status=${status}` : `/api/admin/programmings`)
        : (status ? `${listBase}/api/admin/programmings?status=${status}` : `${listBase}/api/admin/programmings`);
      
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

      const contentTypeCheck = response.headers.get('content-type') || '';
      if (!contentTypeCheck.includes('application/json')) {
        const text = await response.text();
        const hint = text.includes('/@vite/client') || text.includes('<!DOCTYPE html')
          ? 'Parece que o frontend devolveu o index.html. Verifique se o backend está rodando e se VITE_API_BASE_URL aponta para ele (ou remova para usar mocks em dev).'
          : 'O servidor não retornou JSON.';
        throw new Error(`Resposta não-JSON do servidor: ${text.slice(0, 120)}... Dica: ${hint}`);
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
