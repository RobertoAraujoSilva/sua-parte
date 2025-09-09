import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export default function QuickActions() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button className="order-1">{t('assignments.generateNew')}</Button>
      <Button variant="secondary" className="order-2">{t('assignments.regenerate')}</Button>
      <Button variant="outline" className="order-3">{t('assignments.exportPdf')}</Button>
    </div>
  );
}
