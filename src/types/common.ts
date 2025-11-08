/**
 * Common Base Types
 * Reduces redundancy in component prop interfaces
 */

export interface BaseComponentProps {
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export interface WithError {
  error?: string | null;
  errorType?: 'error' | 'warning' | 'info';
}

export interface WithCallbacks<T = any> {
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface ModalBaseProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface FormBaseProps<T = any> extends BaseComponentProps, WithError, WithCallbacks<T> {
  defaultValues?: Partial<T>;
  isSubmitting?: boolean;
}

export interface TableBaseProps extends BaseComponentProps {
  data: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export interface FilterProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

// Common database row structure
export interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Common CRUD operations return types
export interface CRUDResult<T> {
  data: T | null;
  error: Error | null;
}
