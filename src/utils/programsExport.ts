/**
 * Export utilities for programs data
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ProgramExportData {
  id: string;
  titulo: string;
  semana?: string;
  data_inicio_semana?: string;
  mes_apostila?: string;
  status?: string;
  assignment_status?: string;
  created_at?: string;
}

/**
 * Export programs to Excel file
 */
export function exportProgramsToExcel(programs: ProgramExportData[], filename?: string) {
  // Prepare data for export
  const exportData = programs.map(p => ({
    'Semana': p.semana || '-',
    'Título': p.titulo,
    'Data Início': p.data_inicio_semana ? new Date(p.data_inicio_semana).toLocaleDateString('pt-BR') : '-',
    'Mês': p.mes_apostila || '-',
    'Status': p.status || '-',
    'Status Designação': p.assignment_status || '-',
    'Criado em': p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-',
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Semana
    { wch: 30 }, // Título
    { wch: 12 }, // Data Início
    { wch: 15 }, // Mês
    { wch: 10 }, // Status
    { wch: 18 }, // Status Designação
    { wch: 12 }, // Criado em
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Programas');

  // Create statistics sheet
  const stats = {
    'Total de Programas': programs.length,
    'Draft': programs.filter(p => p.status === 'draft').length,
    'Active': programs.filter(p => p.status === 'active').length,
    'Publicada': programs.filter(p => p.status === 'publicada').length,
    'Designações Pendentes': programs.filter(p => p.assignment_status === 'pending').length,
    'Exportado em': new Date().toLocaleString('pt-BR'),
  };

  const statsWs = XLSX.utils.json_to_sheet([stats]);
  XLSX.utils.book_append_sheet(wb, statsWs, 'Estatísticas');

  // Generate filename
  const exportFilename = filename || `programas_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save file
  XLSX.writeFile(wb, exportFilename);
}

/**
 * Export programs to PDF file
 */
export function exportProgramsToPDF(programs: ProgramExportData[], filename?: string) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Relatório de Programas', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Exportado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

  // Prepare table data
  const tableData = programs.map(p => [
    p.semana || '-',
    p.titulo,
    p.data_inicio_semana ? new Date(p.data_inicio_semana).toLocaleDateString('pt-BR') : '-',
    p.mes_apostila || '-',
    p.status || '-',
    p.assignment_status || '-',
  ]);

  // Add table using autoTable
  (doc as any).autoTable({
    head: [['Semana', 'Título', 'Data', 'Mês', 'Status', 'Designação']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
  });

  // Add footer with statistics
  const finalY = (doc as any).lastAutoTable.finalY || 35;
  doc.setFontSize(10);
  doc.text(`Total de Programas: ${programs.length}`, 14, finalY + 10);

  // Generate filename
  const exportFilename = filename || `programas_${new Date().toISOString().split('T')[0]}.pdf`;

  // Save file
  doc.save(exportFilename);
}
