import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onExportPDF?: () => void;
  loading?: boolean;
  className?: string;
}

export function QuickActions({ 
  onGenerate, 
  onRegenerate, 
  onExportPDF, 
  loading,
  className 
}: QuickActionsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className || ''}`}>
      {onGenerate && (
        <Button 
          className="order-1" 
          onClick={onGenerate}
          disabled={loading}
        >
          Gerar Designações Automáticas
        </Button>
      )}
      {onRegenerate && (
        <Button 
          variant="secondary" 
          className="order-2"
          onClick={onRegenerate}
          disabled={loading}
        >
          Regenerar Semana
        </Button>
      )}
      {onExportPDF && (
        <Button 
          variant="outline" 
          className="order-3"
          onClick={onExportPDF}
          disabled={loading}
        >
          Exportar PDF
        </Button>
      )}
    </div>
  );
}