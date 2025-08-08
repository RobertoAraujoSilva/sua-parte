import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { createTemplate } from '@/utils/spreadsheetProcessor';
import { toast } from '@/hooks/use-toast';

interface TemplateDownloadProps {
  variant?: 'default' | 'outline' | 'hero';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const TemplateDownload: React.FC<TemplateDownloadProps> = ({
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const handleDownload = () => {
    try {
      const blob = createTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = 'modelo_estudantes.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download iniciado',
        description: 'O modelo da planilha está sendo baixado',
      });
    } catch (error) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o modelo da planilha',
        variant: 'destructive'
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Baixar Modelo
    </Button>
  );
};

export default TemplateDownload;
