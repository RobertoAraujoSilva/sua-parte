import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm opacity-80">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
