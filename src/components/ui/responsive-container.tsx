import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "modal" | "form" | "grid";
}

export const ResponsiveContainer = ({ 
  children, 
  className = "", 
  variant = "default" 
}: ResponsiveContainerProps) => {
  const baseClasses = "w-full";
  
  const variantClasses = {
    default: "responsive-container",
    modal: "modal-content max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl max-h-[90vh] overflow-y-auto",
    form: "responsive-form space-y-4",
    grid: "responsive-grid"
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
};