import { Button } from "@/components/ui/button";

interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    active?: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function MobileTabs({ tabs, className }: MobileTabsProps) {
  return (
    <nav className={`flex gap-2 overflow-x-auto scrollbar-none snap-x px-4 ${className || ''}`}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={tab.active ? "default" : "ghost"}
          className="shrink-0 snap-start flex items-center gap-2"
          onClick={tab.onClick}
        >
          {tab.icon}
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}