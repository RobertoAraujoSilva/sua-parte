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
  const data = [
    TEMPLATE_COLUMNS,
    ...TEMPLATE_SAMPLE_DATA.map(sample =>
      TEMPLATE_COLUMNS.map(col => sample[col as keyof typeof sample] || '')
    )
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = TEMPLATE_COLUMNS.map(col => ({ wch: Math.max(col.length, 15) }));
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
