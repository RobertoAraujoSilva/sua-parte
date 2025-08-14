import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button className="order-1">Gerar Designações Automáticas</Button>
      <Button variant="secondary" className="order-2">Regenerar Semana</Button>
      <Button variant="outline" className="order-3">Exportar PDF</Button>
    </div>
  );
}
