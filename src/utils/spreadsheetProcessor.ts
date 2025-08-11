import * as XLSX from 'xlsx';
import { format, parse, isValid } from 'date-fns';
import {
  SpreadsheetRow,
  ProcessedStudentData,
  ValidationResult,
  GENDER_MAPPING,
  CARGO_MAPPING,
  STATUS_MAPPING,
  TEMPLATE_COLUMNS,
  TEMPLATE_SAMPLE_DATA
} from '@/types/spreadsheet';

/**
 * Reads Excel file and returns raw data
 */
export const readExcelFile = (file: File): Promise<SpreadsheetRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        }) as any[][];

        if (jsonData.length < 2) {
          throw new Error('Planilha deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Convert to objects
        const processedData: SpreadsheetRow[] = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        resolve(processedData);
      } catch (error) {
        reject(new Error(`Erro ao ler arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Validates and processes a single row
 */
export const processRow = (row: SpreadsheetRow, index: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields validation
  if (!row["Nome Completo"] || typeof row["Nome Completo"] !== 'string' || row["Nome Completo"].trim().length < 2) {
    errors.push('Nome completo é obrigatório e deve ter pelo menos 2 caracteres');
  }
  
  if (!row["Idade"] || typeof row["Idade"] !== 'number' || row["Idade"] < 1 || row["Idade"] > 120) {
    errors.push('Idade deve ser um número entre 1 e 120');
  }
  
  if (!row["Gênero (M/F)"] || !GENDER_MAPPING[row["Gênero (M/F)"]]) {
    errors.push('Gênero deve ser M ou F');
  }
  
  if (!row["Família / Agrupamento"] || typeof row["Família / Agrupamento"] !== 'string') {
    errors.push('Família/Agrupamento é obrigatório');
  }
  
  if (!row["Cargo Congregacional"] || !CARGO_MAPPING[row["Cargo Congregacional"]]) {
    errors.push(`Cargo congregacional inválido: ${row["Cargo Congregacional"]}`);
  }
  
  if (!row["Status (Ativo/Inativo)"] || STATUS_MAPPING[row["Status (Ativo/Inativo)"]] === undefined) {
    errors.push('Status deve ser Ativo ou Inativo');
  }
  
  // Email validation
  if (row["E-mail"] && typeof row["E-mail"] === 'string' && row["E-mail"].trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row["E-mail"].trim())) {
      errors.push('E-mail inválido');
    }
  }
  
  // Phone validation
  if (row["Telefone"] && typeof row["Telefone"] === 'string' && row["Telefone"].trim()) {
    const phoneRegex = /^[\d\s\-()]+$/;
    if (!phoneRegex.test(row["Telefone"].trim()) || row["Telefone"].trim().length < 8) {
      errors.push('Telefone inválido');
    }
  }
  
  // Date validations
  let dataBatismo: string | undefined;
  if (row["Data de Batismo"] && typeof row["Data de Batismo"] === 'string' && row["Data de Batismo"].trim()) {
    try {
      const parsedDate = parseBrazilianDate(row["Data de Batismo"]);
      if (parsedDate) {
        dataBatismo = format(parsedDate, 'yyyy-MM-dd');
      } else {
        warnings.push('Data de batismo inválida - será ignorada');
      }
    } catch {
      warnings.push('Data de batismo inválida - será ignorada');
    }
  }
  
  // Age vs birth date consistency
  if (row["Data de Nascimento"] && typeof row["Data de Nascimento"] === 'string' && row["Data de Nascimento"].trim()) {
    try {
      const birthDate = parseBrazilianDate(row["Data de Nascimento"]);
      if (birthDate) {
        const calculatedAge = new Date().getFullYear() - birthDate.getFullYear();
        const ageDiff = Math.abs(calculatedAge - (row["Idade"] as number));
        if (ageDiff > 1) {
          warnings.push(`Idade informada (${row["Idade"]}) não confere com data de nascimento`);
        }
      }
    } catch {
      warnings.push('Data de nascimento inválida');
    }
  }
  
  // Minor validation
  const isMinor = (row["Idade"] as number) < 18;
  if (isMinor && (!row["Parente Responsável"] || !row["Parentesco"])) {
    warnings.push('Menor de idade sem responsável definido');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      rowIndex: index
    };
  }
  
  // Process valid data
  const processedData: ProcessedStudentData = {
    nome: (row["Nome Completo"] as string).trim(),
    idade: row["Idade"] as number,
    genero: GENDER_MAPPING[row["Gênero (M/F)"]],
    email: row["E-mail"] && typeof row["E-mail"] === 'string' ? row["E-mail"].trim() || undefined : undefined,
    telefone: row["Telefone"] && typeof row["Telefone"] === 'string' ? row["Telefone"].trim() || undefined : undefined,
    data_batismo: dataBatismo,
    cargo: CARGO_MAPPING[row["Cargo Congregacional"]],
    ativo: STATUS_MAPPING[row["Status (Ativo/Inativo)"]],
    observacoes: row["Observações"] && typeof row["Observações"] === 'string' ? row["Observações"].trim() || undefined : undefined,
    familia: (row["Família / Agrupamento"] as string).trim(),
    parentesco: row["Parentesco"] && typeof row["Parentesco"] === 'string' ? row["Parentesco"].trim() || undefined : undefined,
    parente_responsavel: row["Parente Responsável"] && typeof row["Parente Responsável"] === 'string' ? row["Parente Responsável"].trim() || undefined : undefined
  };
  
  return {
    isValid: true,
    errors: [],
    warnings,
    data: processedData,
    rowIndex: index
  };
};

/**
 * Parses Brazilian date format (DD/MM/YYYY) to Date object
 */
export const parseBrazilianDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  const cleanDate = dateString.trim();
  if (!cleanDate) return null;
  
  try {
    // Try DD/MM/YYYY format
    const parsed = parse(cleanDate, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Try other common formats
    const formats = ['dd/MM/yy', 'dd-MM-yyyy', 'dd-MM-yy'];
    for (const format of formats) {
      const parsed = parse(cleanDate, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Creates Excel template file
 */
export const createTemplate = (): Blob => {
  const workbook = XLSX.utils.book_new();

  // Create worksheet with headers and sample data
  const headers = [...TEMPLATE_COLUMNS] as (string | number)[];
  const data = [
    headers,
    ...TEMPLATE_SAMPLE_DATA.map(sample =>
      headers.map(col => (sample as any)[col as keyof typeof sample] || '')
    )
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = headers.map(col => ({ wch: Math.max((col as string).length, 15) }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudantes');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Creates CSV error report for download
 */
export const createErrorReport = (validationResults: ValidationResult[]): Blob => {
  const errorResults = validationResults.filter(result => !result.isValid || result.warnings.length > 0);

  if (errorResults.length === 0) {
    // Create empty report
    const csvContent = 'Linha Excel,Tipo,Mensagem\n"Nenhum erro encontrado","Info","Todos os registros são válidos"';
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // Create CSV header
  const headers = ['Linha Excel', 'Tipo', 'Mensagem'];
  let csvContent = headers.join(',') + '\n';

  // Add error rows
  errorResults.forEach(result => {
    const excelRow = result.rowIndex;

    // Add errors
    result.errors.forEach(error => {
      const row = [
        excelRow.toString(),
        'Erro',
        `"${error.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    // Add warnings
    result.warnings.forEach(warning => {
      const row = [
        excelRow.toString(),
        'Aviso',
        `"${warning.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  });

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Creates enhanced error report with detailed information and statistics
 */
export const createEnhancedErrorReport = (
  validationResults: ValidationResult[],
  fileName: string = 'planilha'
): Blob => {
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');

  let csvContent = '\uFEFF'; // BOM for UTF-8

  // Header with metadata
  csvContent += `Relatório de Erros - Importação de Estudantes\n`;
  csvContent += `Arquivo: ${fileName}\n`;
  csvContent += `Data/Hora: ${timestamp}\n`;
  csvContent += `Total de registros analisados: ${validationResults.length}\n`;

  const errorsCount = validationResults.filter(r => !r.isValid).length;
  const warningsCount = validationResults.filter(r => r.warnings.length > 0).length;

  csvContent += `Registros com erros: ${errorsCount}\n`;
  csvContent += `Registros com avisos: ${warningsCount}\n`;
  csvContent += `\n`;

  // Column headers
  csvContent += 'Linha,Tipo,Campo,Valor Original,Problema,Sugestão,Dados Completos\n';

  validationResults.forEach((result, index) => {
    const excelRow = index + 2; // Excel rows start at 1, plus header

    // Add errors
    result.errors.forEach(error => {
      const parts = error.split(':');
      const field = parts[0]?.trim() || 'Geral';
      const problem = parts.slice(1).join(':').trim() || error;

      // Get original value for the field
      const originalValue = getOriginalFieldValue(result.data, field);
      const suggestion = getSuggestionForError(field, problem);
      const completeData = formatCompleteData(result.data);

      const row = [
        excelRow.toString(),
        'Erro',
        `"${field.replace(/"/g, '""')}"`,
        `"${originalValue.replace(/"/g, '""')}"`,
        `"${problem.replace(/"/g, '""')}"`,
        `"${suggestion.replace(/"/g, '""')}"`,
        `"${completeData.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    // Add warnings
    result.warnings.forEach(warning => {
      const parts = warning.split(':');
      const field = parts[0]?.trim() || 'Geral';
      const problem = parts.slice(1).join(':').trim() || warning;

      const originalValue = getOriginalFieldValue(result.data, field);
      const suggestion = getSuggestionForWarning(field, problem);
      const completeData = formatCompleteData(result.data);

      const row = [
        excelRow.toString(),
        'Aviso',
        `"${field.replace(/"/g, '""')}"`,
        `"${originalValue.replace(/"/g, '""')}"`,
        `"${problem.replace(/"/g, '""')}"`,
        `"${suggestion.replace(/"/g, '""')}"`,
        `"${completeData.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
  });

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Gets original field value from processed data
 */
const getOriginalFieldValue = (data: ProcessedStudentData, field: string): string => {
  const fieldMap: Record<string, keyof ProcessedStudentData> = {
    'Nome': 'nome',
    'Gênero': 'genero',
    'Cargo': 'cargo',
    'Email': 'email',
    'Telefone': 'telefone',
    'Status': 'ativo'
  };

  const key = fieldMap[field];
  if (key && data[key] !== undefined) {
    return String(data[key]);
  }

  return 'N/A';
};

/**
 * Provides suggestions for common errors
 */
const getSuggestionForError = (field: string, problem: string): string => {
  const suggestions: Record<string, string> = {
    'Nome': 'Verifique se o nome está completo e sem caracteres especiais',
    'Data de Nascimento': 'Use formato DD/MM/AAAA (ex: 15/03/1990)',
    'Gênero': 'Use "Masculino" ou "Feminino"',
    'Cargo': 'Use: Ancião, Servo Ministerial, Pioneiro Regular, Publicador Batizado, Publicador Não Batizado, Estudante Novo',
    'Email': 'Verifique se o email está no formato correto (ex: nome@dominio.com)',
    'Telefone': 'Use formato (XX) XXXXX-XXXX',
    'Status': 'Use "Ativo" ou "Inativo"'
  };

  if (problem.toLowerCase().includes('obrigatório')) {
    return 'Campo obrigatório - preencha com informação válida';
  }

  if (problem.toLowerCase().includes('formato')) {
    return suggestions[field] || 'Verifique o formato do campo';
  }

  if (problem.toLowerCase().includes('duplicado')) {
    return 'Nome já existe - verifique se é a mesma pessoa ou use nome completo';
  }

  return suggestions[field] || 'Verifique e corrija o valor';
};

/**
 * Provides suggestions for warnings
 */
const getSuggestionForWarning = (field: string, problem: string): string => {
  if (problem.toLowerCase().includes('duplicado')) {
    return 'Possível duplicata - verifique se é a mesma pessoa';
  }

  if (problem.toLowerCase().includes('responsável')) {
    return 'Verifique se o responsável está cadastrado ou será importado';
  }

  return 'Revisar informação';
};

/**
 * Formats complete data for debugging
 */
const formatCompleteData = (data: ProcessedStudentData): string => {
  return `Nome: ${data.nome || 'N/A'} | Batismo: ${data.data_batismo || 'N/A'} | Gênero: ${data.genero || 'N/A'} | Cargo: ${data.cargo || 'N/A'}`;
};
