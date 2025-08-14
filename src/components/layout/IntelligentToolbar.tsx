import { PropsWithChildren } from "react";
import clsx from "clsx";

interface IntelligentToolbarProps {
  /**
   * Filters, tabs, or other left-aligned content
   */
  filters?: React.ReactNode;
  
  /**
   * Primary action buttons (right-aligned)
   */
  primaryActions?: React.ReactNode;
  
  /**
   * Secondary action buttons (right-aligned, after primary)
   */
  secondaryActions?: React.ReactNode;
  
  /**
   * Tertiary actions or overflow menu (rightmost)
   */
  tertiaryActions?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * ID for height calculations
   */
  id?: string;
}

/**
 * Intelligent toolbar component with CSS Grid layout
 * Uses "1fr auto auto auto" columns to position content:
 * - Column 1 (1fr): Filters/tabs on the left (takes remaining space)
 * - Column 2 (auto): Primary action buttons
 * - Column 3 (auto): Secondary action buttons  
 * - Column 4 (auto): Tertiary actions/overflow menu
 */
export default function IntelligentToolbar({
  filters,
  primaryActions,
  secondaryActions,
  tertiaryActions,
  className,
  id = "intelligent-toolbar",
  children
}: PropsWithChildren<IntelligentToolbarProps>) {
  return (
    <div
      id={id}
      className={clsx(
        "intelligent-toolbar",
        "page-shell__toolbar",
        className
      )}
    >
      <div className="intelligent-toolbar__grid">
        {/* Left column: Filters/tabs (takes remaining space) */}
        <div className="intelligent-toolbar__filters">
          {filters}
          {children}
        </div>
        
        {/* Right columns: Action buttons (auto-sized) */}
        {primaryActions && (
          <div className="intelligent-toolbar__primary-actions">
            {primaryActions}
          </div>
        )}
        
        {secondaryActions && (
          <div className="intelligent-toolbar__secondary-actions">
            {secondaryActions}
          </div>
        )}
        
        {tertiaryActions && (
          <div className="intelligent-toolbar__tertiary-actions">
            {tertiaryActions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Toolbar section components for better organization
 */
export const ToolbarFilters = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={clsx("toolbar-filters", className)}>
    {children}
  </div>
);

export const ToolbarActions = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={clsx("toolbar-actions", className)}>
    {children}
  </div>
);

export const ToolbarTabs = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={clsx("toolbar-tabs", className)}>
    {children}
  </div>
);

/**
 * Button group component for organizing related actions
 */
export const ToolbarButtonGroup = ({ 
  children, 
  className,
  variant = "default"
}: PropsWithChildren<{ 
  className?: string;
  variant?: "default" | "compact" | "spaced";
}>) => (
  <div className={clsx(
    "toolbar-button-group",
    `toolbar-button-group--${variant}`,
    className
  )}>
    {children}
  </div>
);