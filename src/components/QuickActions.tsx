import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { useState } from "react";

export default function QuickActions() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // TODO: Implementar geração real de designações
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Designações geradas com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar designações");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      // TODO: Implementar regeneração de designações
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success("Designações regeneradas com sucesso!");
    } catch (error) {
      toast.error("Erro ao regenerar designações");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setLoading(true);
    try {
      // TODO: Implementar exportação real de PDF
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button 
        onClick={handleGenerate}
        disabled={loading}
        className="order-1"
      >
        {loading ? "Gerando..." : t('assignments.generateNew')}
        <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
      </Button>
      <Button 
        variant="secondary" 
        onClick={handleRegenerate}
        disabled={loading}
        className="order-2"
      >
        {loading ? "Regenerando..." : t('assignments.regenerate')}
        <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
      </Button>
      <Button 
        variant="outline" 
        onClick={handleExportPdf}
        disabled={loading}
        className="order-3"
      >
        {loading ? "Exportando..." : t('assignments.exportPdf')}
        <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
      </Button>
    </div>
  );
}
