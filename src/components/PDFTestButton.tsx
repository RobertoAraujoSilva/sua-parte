import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const PDFTestButton = () => {
  const testPDFGeneration = async () => {
    try {
      console.log('Testing PDF generation...');
      
      // Dynamically import jsPDF
      const jsPDF = (await import('jspdf')).jsPDF;
      console.log('jsPDF imported successfully');
      
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      
      // Add some test content
      doc.setFontSize(16);
      doc.text('Teste de Geração de PDF', 20, 20);
      doc.text('Sistema Ministerial', 20, 40);
      doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 20, 60);
      
      // Save the PDF
      doc.save('teste-pdf.pdf');
      console.log('PDF saved successfully');
      
      toast({
        title: "Teste de PDF Bem-sucedido!",
        description: "O arquivo teste-pdf.pdf foi gerado e baixado.",
      });
      
    } catch (error) {
      console.error('PDF test failed:', error);
      toast({
        title: "Erro no Teste de PDF",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={testPDFGeneration}
      variant="outline"
      size="sm"
    >
      🧪 Testar PDF
    </Button>
  );
};

export default PDFTestButton;