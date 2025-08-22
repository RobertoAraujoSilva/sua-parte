// Utility for PDF generation with proper error handling
import { toast } from "@/hooks/use-toast";
import { jsPDF } from 'jspdf';

export interface ProgramData {
  id: string;
  semana: string;
  mes_apostila: string;
  data_inicio_semana: string;
  status: string;
  assignment_status: string;
  partes: string[];
  dataImportacao: string;
}

export interface AssignmentData {
  id: string;
  numero_parte: number;
  titulo_parte: string;
  tipo_parte: string;
  tempo_minutos: number;
  estudante: {
    id: string;
    nome: string;
    cargo: string;
    genero: string;
  };
  ajudante?: {
    id: string;
    nome: string;
    cargo: string;
    genero: string;
  } | null;
  confirmado: boolean;
}

export const generateProgramPDF = async (programa: ProgramData): Promise<void> => {
  try {
    // Create jsPDF instance
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: `${programa.semana}`,
      subject: 'Programa da Reuniao - Vida e Ministerio Cristao',
      author: 'Sistema Ministerial',
      keywords: 'jw, programa, reuniao, ministerio',
      creator: 'Sistema Ministerial'
    });

    // Add title with official JW formatting
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('PROGRAMA DA REUNIÃO', 105, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('VIDA E MINISTÉRIO CRISTÃO', 105, 26, { align: 'center' });

    // Add program information
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const dataFormatada = new Date(programa.data_inicio_semana).toLocaleDateString('pt-BR');
    doc.text(`Semana de ${dataFormatada}`, 105, 36, { align: 'center' });
    doc.text(`${programa.mes_apostila || programa.semana}`, 105, 42, { align: 'center' });

    // Add official meeting structure header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('DURAÇÃO TOTAL: 1h45min (incluindo cânticos e orações)', 105, 50, { align: 'center' });

    // Add line separator
    doc.line(20, 55, 190, 55);

    // Add official meeting structure
    let yPos = 65;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('ESTRUTURA DA REUNIÃO', 20, yPos);
    yPos += 8;

    // Opening section
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('ABERTURA (5 min)', 20, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('• Cântico de Abertura', 25, yPos);
    yPos += 4;
    doc.text('• Oração de Abertura', 25, yPos);
    yPos += 4;
    doc.text('• Comentários Iniciais (3 min)', 25, yPos);
    yPos += 8;

    // Add program parts header
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('PARTES DO PROGRAMA', 20, yPos);
    yPos += 8;

    // Add program parts with sections and times
    let yPosition = yPos;
    doc.setFontSize(10);

    if (programa.partes && Array.isArray(programa.partes) && programa.partes.length > 0) {
      // Organize parts by sections
      const sections = [
        { name: 'TESOUROS DA PALAVRA DE DEUS (10 min)', start: 0, end: 3 },
        { name: 'FAÇA SEU MELHOR NO MINISTÉRIO (15 min)', start: 3, end: 6 },
        { name: 'NOSSA VIDA CRISTÃ (15 min)', start: 6, end: 9 }
      ];

      sections.forEach(section => {
        // Check if we need a new page
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        // Section header
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(section.name, 20, yPosition);
        yPosition += 6;

        // Section parts
        const sectionParts = programa.partes.slice(section.start, section.end);
        if (sectionParts.length > 0) {
          sectionParts.forEach((parte: string, index: number) => {
            if (yPosition > 240) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text(`  ${section.start + index + 1}. ${parte}`, 25, yPosition);
            yPosition += 5;
          });
        } else {
          // Fallback for missing parts
          doc.setFontSize(8);
          doc.setFont(undefined, 'italic');
          doc.text('  (Partes não disponíveis para esta seção)', 25, yPosition);
          yPosition += 5;
        }

        yPosition += 4; // Space between sections
      });

      // Add any remaining parts
      if (programa.partes.length > 9) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('PARTES ADICIONAIS', 20, yPosition);
        yPosition += 6;

        programa.partes.slice(9).forEach((parte: string, index: number) => {
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.text(`  ${index + 10}. ${parte}`, 25, yPosition);
          yPosition += 5;
        });
      }
    } else {
      // Fallback when no parts available
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.text('Programa não disponível. Aguardando processamento dos dados.', 25, yPosition);
      yPosition += 8;

      // Show default structure
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('ESTRUTURA PADRÃO DA REUNIÃO:', 20, yPosition);
      yPosition += 6;

      const defaultStructure = [
        'TESOUROS DA PALAVRA DE DEUS (10 min)',
        '• Tesouros da Palavra de Deus',
        '• Joias Espirituais',
        '• Leitura da Bíblia',
        '',
        'FAÇA SEU MELHOR NO MINISTÉRIO (15 min)',
        '• Apresentação Inicial',
        '• Revisita',
        '• Estudo Bíblico',
        '',
        'NOSSA VIDA CRISTÃ (15 min)',
        '• Parte 1',
        '• Parte 2',
        '• Estudo Bíblico da Congregação'
      ];

      defaultStructure.forEach(item => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        if (item.startsWith('•')) {
          doc.text(`  ${item}`, 25, yPosition);
        } else if (item === '') {
          yPosition += 2;
          return;
        } else {
          doc.setFont(undefined, 'bold');
          doc.text(item, 25, yPosition);
        }
        yPosition += 4;
      });
    }

    // Add closing section
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('ENCERRAMENTO (5 min)', 20, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('• Comentários Finais (3 min)', 25, yPosition);
    yPosition += 4;
    doc.text('• Cântico Final', 25, yPosition);
    yPosition += 4;
    doc.text('• Oração de Encerramento', 25, yPosition);

    // Add status information
    yPosition += 15;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Status: ${programa.status} | Data: ${new Date(programa.dataImportacao).toLocaleDateString('pt-BR')}`, 20, yPosition);

    // Add official footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');

      // Official JW footer style
      doc.text(`Página ${i} de ${pageCount}`, 20, 285);
      doc.text('Sistema Ministerial', 105, 285, { align: 'center' });
      doc.text(new Date().toLocaleDateString('pt-BR'), 190, 285, { align: 'right' });

      // Add subtle line above footer
      doc.line(20, 280, 190, 280);
    }

    // Save the PDF
    const fileName = `${programa.semana.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Gerado com Sucesso!",
      description: `Arquivo ${fileName} foi baixado para seu computador.`,
    });

  } catch (error) {
    console.error('Error generating program PDF:', error);
    toast({
      title: "Erro na Geracao",
      description: "Nao foi possivel gerar o arquivo do programa.",
      variant: "destructive"
    });
    throw error;
  }
};

export const generateAssignmentsPDF = async (
  programa: ProgramData,
  assignments: AssignmentData[]
): Promise<void> => {
  try {
    // Create jsPDF instance
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: `Programa - ${programa?.mes_apostila || 'Desconhecido'}`,
      subject: 'Programa da Reuniao - Vida e Ministerio Cristao',
      author: 'Sistema Ministerial',
      keywords: 'jw, programa, reuniao, ministerio',
      creator: 'Sistema Ministerial'
    });

    // Add title with official JW formatting
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('PROGRAMA DA REUNIÃO', 105, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('VIDA E MINISTÉRIO CRISTÃO', 105, 26, { align: 'center' });

    // Add program information
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const dataFormatada = new Date(programa?.data_inicio_semana || '').toLocaleDateString('pt-BR');
    doc.text(`Semana de ${dataFormatada}`, 105, 36, { align: 'center' });
    doc.text(`${programa?.mes_apostila || 'Mês não especificado'}`, 105, 42, { align: 'center' });

    // Add official meeting structure header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('DURAÇÃO TOTAL: 1h45min (incluindo cânticos e orações)', 105, 50, { align: 'center' });

    // Add line separator
    doc.line(20, 55, 190, 55);
    
    // Add official meeting structure with cânticos
    let yPos = 62;

    // Opening section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('ABERTURA (5 min)', 20, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('• Cântico de Abertura', 25, yPos);
    yPos += 4;
    doc.text('• Oração de Abertura', 25, yPos);
    yPos += 4;
    doc.text('• Comentários Iniciais (3 min)', 25, yPos);
    yPos += 8;

    // Add assignments header
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DESIGNAÇÕES DA REUNIÃO', 20, yPos);
    yPos += 8;

    // Official table header matching JW format
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('HORÁRIO', 20, yPos);
    doc.text('PARTE/SEÇÃO', 45, yPos);
    doc.text('TÍTULO', 90, yPos);
    doc.text('TEMPO', 160, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 6;
    
    // Helper functions
    const getSectionInfo = (numeroParte: number) => {
      if (numeroParte <= 2) return { section: 'Abertura', color: 'bg-purple-100 text-purple-800' };
      if (numeroParte <= 5) return { section: 'Tesouros da Palavra', color: 'bg-blue-100 text-blue-800' };
      if (numeroParte <= 8) return { section: 'Ministerio', color: 'bg-orange-100 text-orange-800' };
      if (numeroParte <= 10) return { section: 'Vida Crista', color: 'bg-red-100 text-red-800' };
      return { section: 'Encerramento', color: 'bg-gray-100 text-gray-800' };
    };

    const getAssignmentTypeLabel = (tipo: string): string => {
      const labels: Record<string, string> = {
        'oracao_abertura': 'Oracao de Abertura',
        'comentarios_iniciais': 'Comentarios Iniciais',
        'tesouros_palavra': 'Tesouros da Palavra de Deus',
        'joias_espirituais': 'Joias Espirituais',
        'leitura_biblica': 'Leitura da Biblia',
        'parte_ministerio': 'Parte do Ministerio',
        'vida_crista': 'Nossa Vida Crista',
        'estudo_biblico_congregacao': 'Estudo Biblico da Congregacao',
        'comentarios_finais': 'Comentarios Finais',
        'oracao_encerramento': 'Oracao de Encerramento'
      };
      return labels[tipo] || tipo;
    };

    const getGenderRestrictionInfo = (tipo: string) => {
      const maleOnly = [
        'oracao_abertura', 'comentarios_iniciais', 'tesouros_palavra',
        'joias_espirituais', 'leitura_biblica', 'vida_crista',
        'estudo_biblico_congregacao', 'comentarios_finais', 'oracao_encerramento'
      ];
      
      return maleOnly.includes(tipo) 
        ? { restriction: 'Apenas Homens', icon: 'M', color: 'text-blue-600' }
        : { restriction: 'Ambos os Generos', icon: 'M/F', color: 'text-green-600' };
    };
    
    // Compute official JW timeline format (7.00–7.05)
    const computeTimeline = (items: AssignmentData[], start: string = '19:00') => {
      const [hStr, mStr] = start.split(':');
      let minutes = (parseInt(hStr || '19', 10) * 60) + (parseInt(mStr || '0', 10));
      const timeline = new Map<string, string>();
      const sorted = [...items].sort((a, b) => (a.numero_parte || 0) - (b.numero_parte || 0));

      for (const it of sorted) {
        const startH = Math.floor(minutes / 60);
        const startM = minutes % 60;
        const endMin = minutes + (it.tempo_minutos || 0);
        const endH = Math.floor(endMin / 60);
        const endM = endMin % 60;

        // Official JW format: 7.00–7.05 (with en dash)
        const fmt = (h: number, m: number) => `${h}.${m.toString().padStart(2,'0')}`;
        timeline.set(it.id, `${fmt(startH, startM)}–${fmt(endH, endM)}`);
        minutes = endMin;
      }
      return timeline;
    };

    const timeline = computeTimeline(assignments, '19:00');

    // Add assignments with official formatting
    let yPosition = yPos;
    doc.setFontSize(9);

    let lastSection = '';

    assignments.forEach((assignment, index) => {
      const sectionInfo = getSectionInfo(assignment.numero_parte);

      // Add section header if changed
      if (sectionInfo.section !== lastSection) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        // Section header with official styling
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(sectionInfo.section.toUpperCase(), 20, yPosition);
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 10;
        lastSection = sectionInfo.section;
      }

      // Check if we need a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      // Official assignment row format
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      const timeLabel = timeline.get(assignment.id) || '';
      const titulo = assignment.titulo_parte || getAssignmentTypeLabel(assignment.tipo_parte);

      // Time column (official format: 7.00–7.05)
      doc.text(timeLabel, 20, yPosition);

      // Part number and section
      const numeroFormatado = assignment.numero_parte.toString().padStart(2, '0');
      doc.text(`${numeroFormatado}.`, 45, yPosition);

      // Title
      doc.text(titulo, 50, yPosition);

      // Duration
      doc.text(`(${assignment.tempo_minutos} min)`, 160, yPosition);

      yPosition += 4;

      // Add student assignment information (indented)
      if (assignment.estudante?.nome) {
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');

        // Student name with confirmation status
        const confirmStatus = assignment.confirmado ? ' ✓' : ' (pendente)';
        doc.text(`    Estudante: ${assignment.estudante.nome}${confirmStatus}`, 50, yPosition);
        yPosition += 4;

        // Helper if exists
        if (assignment.ajudante?.nome) {
          doc.text(`    Ajudante: ${assignment.ajudante.nome}`, 50, yPosition);
          yPosition += 4;
        }
      } else {
        // Show unassigned
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.text('    (Não designado)', 50, yPosition);
        yPosition += 4;
      }

      yPosition += 2;
    });

    // Add closing section
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('ENCERRAMENTO (5 min)', 20, yPosition);
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('• Comentários Finais (3 min)', 25, yPosition);
    yPosition += 4;
    doc.text('• Cântico Final', 25, yPosition);
    yPosition += 4;
    doc.text('• Oração de Encerramento', 25, yPosition);
    
    // Add official footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');

      // Official JW footer style
      doc.text(`Página ${i} de ${pageCount}`, 20, 285);
      doc.text('Sistema Ministerial', 105, 285, { align: 'center' });
      doc.text(new Date().toLocaleDateString('pt-BR'), 190, 285, { align: 'right' });

      // Add subtle line above footer
      doc.line(20, 280, 190, 280);
    }

    // Save the PDF
    const fileName = `${programa?.mes_apostila?.replace(/[^a-zA-Z0-9]/g, '_') || 'programa'}.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Gerado com Sucesso!",
      description: "O arquivo PDF foi baixado para seu computador.",
    });

  } catch (error) {
    console.error('Error exporting assignments PDF:', error);
    toast({
      title: "Erro na Exportacao",
      description: "Nao foi possivel gerar o PDF. Tente novamente.",
      variant: "destructive"
    });
    throw error;
  }
};