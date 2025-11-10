/**
 * Filters panel for programs dashboard
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ProgramFilters } from '@/hooks/useProgramasAdmin';

interface ProgramsFiltersProps {
  filters: ProgramFilters;
  onFiltersChange: (filters: ProgramFilters) => void;
  onClearFilters: () => void;
}

export function ProgramsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProgramsFiltersProps) {
  const hasActiveFilters = 
    filters.dateFrom || 
    filters.dateTo || 
    filters.month || 
    filters.status.length > 0 || 
    filters.assignmentStatus.length > 0 || 
    filters.searchTerm;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Search Input */}
      <Input
        placeholder="Buscar por título ou semana..."
        value={filters.searchTerm}
        onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
        className="w-full sm:w-64"
      />

      {/* Date From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(!filters.dateFrom && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom ? format(new Date(filters.dateFrom), 'P', { locale: ptBR }) : 'Data Início'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date ? format(date, 'yyyy-MM-dd') : null })}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(!filters.dateTo && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo ? format(new Date(filters.dateTo), 'P', { locale: ptBR }) : 'Data Fim'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
            onSelect={(date) => onFiltersChange({ ...filters, dateTo: date ? format(date, 'yyyy-MM-dd') : null })}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Status Filter */}
      <Select
        value={filters.status.length === 1 ? filters.status[0] : 'all'}
        onValueChange={(value) => {
          const newStatus = value === 'all' ? [] : [value];
          onFiltersChange({ ...filters, status: newStatus });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="publicada">Publicada</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignment Status Filter */}
      <Select
        value={filters.assignmentStatus.length === 1 ? filters.assignmentStatus[0] : 'all'}
        onValueChange={(value) => {
          const newAssignmentStatus = value === 'all' ? [] : [value];
          onFiltersChange({ ...filters, assignmentStatus: newAssignmentStatus });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Designação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="completed">Concluída</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
