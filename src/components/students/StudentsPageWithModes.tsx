/**
 * Students Page with Multiple View Modes
 * 
 * Main component that integrates List, Grid, and Stats views with toggle
 */

import React from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { StudentsViewToggle } from './StudentsViewToggle';
import { StudentsGrid } from './StudentsGrid';
import { useEnhancedEstudantes } from '@/hooks/useEnhancedEstudantes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Users } from 'lucide-react';

// Placeholder components - replace with your existing components
function StudentsListView() {
  const { students, isLoading } = useEnhancedEstudantes();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Estudantes</CardTitle>
        <CardDescription>Visualização em cards (componente existente)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {students.slice(0, 5).map(student => (
            <div key={student.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{student.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {student.idade} anos • {student.cargo} • {student.ativo ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          ))}
          {students.length > 5 && (
            <p className="text-center text-muted-foreground">
              ... e mais {students.length - 5} estudantes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentsStatsView() {
  const { statistics, isLoading } = useEnhancedEstudantes();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total}</div>
          <p className="text-xs text-muted-foreground">estudantes</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{statistics.ativos}</div>
          <p className="text-xs text-muted-foreground">
            {((statistics.ativos / statistics.total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Famílias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.families}</div>
          <p className="text-xs text-muted-foreground">grupos familiares</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Menores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{statistics.menores}</div>
          <p className="text-xs text-muted-foreground">
            {((statistics.menores / statistics.total) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>
      
      {/* Add more detailed stats cards here */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(statistics.cargoStats).map(([cargo, count]) => (
              <div key={cargo} className="flex justify-between text-sm">
                <span className="capitalize">{cargo.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">S-38-T Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Podem ler a Bíblia</span>
              <span className="font-medium">{statistics.s38t_compliance.can_read_bible}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Podem dar discursos</span>
              <span className="font-medium">{statistics.s38t_compliance.can_give_talks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Podem fazer demonstrações</span>
              <span className="font-medium">{statistics.s38t_compliance.can_do_demonstrations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Podem ser pareados (gênero misto)</span>
              <span className="font-medium">{statistics.s38t_compliance.can_be_paired_mixed_gender}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StudentsPageWithModesProps {
  onBack?: () => void;
  onImport?: () => void;
}

export function StudentsPageWithModes({ onBack, onImport }: StudentsPageWithModesProps) {
  const { viewMode, setViewMode } = useViewMode({ defaultView: 'list' });
  const { statistics } = useEnhancedEstudantes();

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'grid':
        return <StudentsGrid />;
      case 'stats':
        return <StudentsStatsView />;
      case 'list':
      default:
        return <StudentsListView />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          )}
          
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Estudantes
            </h1>
            <p className="text-muted-foreground">
              Gerencie os estudantes da congregação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Planilha
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <StudentsViewToggle
          currentView={viewMode}
          onViewChange={setViewMode}
          totalCount={statistics.total}
        />
        
        {/* Quick filters or actions can go here */}
      </div>

      {/* Current View */}
      {renderCurrentView()}
    </div>
  );
}

// Export individual components for flexibility
export { StudentsGrid, StudentsViewToggle };