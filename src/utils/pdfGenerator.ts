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

    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('PROGRAMA DA REUNIAO', 105, 20, { align: 'center' });
    doc.text('VIDA E MINISTERIO CRISTAO', 105, 30, { align: 'center' });
    
    // Add program information
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const dataFormatada = new Date(programa.data_inicio_semana).toLocaleDateString('pt-BR');
    doc.text(`Semana de ${dataFormatada}`, 105, 45, { align: 'center' });
    doc.text(`${programa.mes_apostila || programa.semana}`, 105, 55, { align: 'center' });
    
    // Add line separator
    doc.line(20, 65, 190, 65);
    
    // Add program parts header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PARTES DO PROGRAMA', 20, 75);
    
    // Add program parts
    let yPosition = 85;
    doc.setFontSize(11);
    
    if (programa.partes && Array.isArray(programa.partes)) {
      programa.partes.forEach((parte: string, index: number) => {
        // Check if we need a new page
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}.`, 20, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(parte, 30, yPosition);
        yPosition += 12;
      });
    }
    
    // Add status information
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('STATUS DO PROGRAMA', 20, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Status: ${programa.status}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Data de Importacao: ${new Date(programa.dataImportacao).toLocaleDateString('pt-BR')}`, 20, yPosition);
    
    if (programa.assignment_status === 'approved') {
      yPosition += 8;
      doc.text('Programa aprovado e designacoes confirmadas', 20, yPosition);
    } else if (programa.assignment_status === 'generated') {
      yPosition += 8;
      doc.text('Designacoes geradas - aguardando aprovacao', 20, yPosition);
    } else {
      yPosition += 8;
      doc.text('Aguardando geracao de designacoes', 20, yPosition);
    }
    
    // Add footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Gerado pelo Sistema Ministerial', 105, 285, { align: 'center' });
    doc.text(new Date().toLocaleDateString('pt-BR'), 105, 290, { align: 'center' });

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

    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('PROGRAMA DA REUNIAO', 105, 20, { align: 'center' });
    doc.text('VIDA E MINISTERIO CRISTAO', 105, 30, { align: 'center' });
    
    // Add program information
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const dataFormatada = new Date(programa?.data_inicio_semana || '').toLocaleDateString('pt-BR');
    doc.text(`Semana de ${dataFormatada}`, 105, 45, { align: 'center' });
    doc.text(`${programa?.mes_apostila || 'Mes nao especificado'}`, 105, 55, { align: 'center' });
    
    // Add line separator
    doc.line(20, 65, 190, 65);
    
    // Add assignments header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('DESIGNACOES DA REUNIAO', 20, 75);
    
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
    
    // Add assignments
    let yPosition = 85;
    doc.setFontSize(10);
    
    assignments.forEach((assignment, index) => {
      // Check if we need a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add assignment header with number and section
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      const numeroFormatado = assignment.numero_parte.toString().padStart(2, '0');
      const sectionInfo = getSectionInfo(assignment.numero_parte);
      
      doc.text(`${numeroFormatado} - ${sectionInfo.section}`, 20, yPosition);
      doc.text(`${assignment.tempo_minutos} min`, 160, yPosition);
      yPosition += 8;
      
      // Add assignment title
      doc.setFontSize(11);
      const titulo = assignment.titulo_parte || getAssignmentTypeLabel(assignment.tipo_parte);
      doc.text(titulo, 20, yPosition);
      yPosition += 6;
      
      // Add assignment details if different from title
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const detalhes = getAssignmentTypeLabel(assignment.tipo_parte);
      if (titulo !== detalhes) {
        doc.text(detalhes, 20, yPosition);
        yPosition += 6;
      }
      
      // Add student information - THIS IS THE KEY PART
      if (assignment.estudante?.nome) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text(`ESTUDANTE: ${assignment.estudante.nome}`, 20, yPosition);
        yPosition += 6;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.text(`Cargo: ${assignment.estudante.cargo}`, 25, yPosition);
        
        // Add gender restriction info
        const genderInfo = getGenderRestrictionInfo(assignment.tipo_parte);
        doc.text(`Restricao: ${genderInfo.restriction}`, 120, yPosition);
        yPosition += 6;
        
        // Add helper if exists
        if (assignment.ajudante?.nome) {
          doc.setFont(undefined, 'bold');
          doc.text(`AJUDANTE: ${assignment.ajudante.nome}`, 20, yPosition);
          yPosition += 6;
          
          doc.setFont(undefined, 'normal');
          doc.text(`Cargo: ${assignment.ajudante.cargo}`, 25, yPosition);
          yPosition += 6;
        }
        
        // Add confirmation status
        if (assignment.confirmado) {
          doc.setFont(undefined, 'bold');
          doc.text('STATUS: Confirmado', 20, yPosition);
          yPosition += 6;
        }
      }
      
      yPosition += 8;
      
      // Add separator line
      if (index < assignments.length - 1) {
        doc.line(20, yPosition - 2, 190, yPosition - 2);
        yPosition += 4;
      }
    });
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Pagina ${i} de ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('Gerado pelo Sistema Ministerial', 105, 290, { align: 'center' });
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