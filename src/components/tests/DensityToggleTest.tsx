import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DensityToggle, DensityToggleCompact, DensityToggleWithLabel } from '@/components/ui/density-toggle';
import { useDensity } from '@/contexts/DensityContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { testDensityToggle } from '@/utils/testDensityToggle';

const sampleData = [
  { id: 1, name: 'João Silva', cargo: 'Ancião', status: 'Ativo', lastActivity: '2024-01-15' },
  { id: 2, name: 'Maria Santos', cargo: 'Pioneira Regular', status: 'Ativo', lastActivity: '2024-01-14' },
  { id: 3, name: 'Pedro Costa', cargo: 'Servo Ministerial', status: 'Ativo', lastActivity: '2024-01-13' },
  { id: 4, name: 'Ana Oliveira', cargo: 'Publicadora', status: 'Inativo', lastActivity: '2024-01-10' },
  { id: 5, name: 'Carlos Ferreira', cargo: 'Pioneiro Auxiliar', status: 'Ativo', lastActivity: '2024-01-12' },
  { id: 6, name: 'Lucia Mendes', cargo: 'Publicadora', status: 'Ativo', lastActivity: '2024-01-11' },
  { id: 7, name: 'Roberto Lima', cargo: 'Ancião', status: 'Ativo', lastActivity: '2024-01-09' },
  { id: 8, name: 'Sandra Rocha', cargo: 'Pioneira Regular', status: 'Ativo', lastActivity: '2024-01-08' },
];

export default function DensityToggleTest() {
  const { density } = useDensity();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Teste de Densidade - Modo Atual: {density === 'compact' ? 'Compacto' : 'Confortável'}
            <div className="flex gap-2">
              <DensityToggleCompact />
              <DensityToggle showLabel />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Toggle Compacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <DensityToggleCompact />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Toggle com Label</CardTitle>
                </CardHeader>
                <CardContent>
                  <DensityToggleWithLabel />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Toggle Padrão</CardTitle>
                </CardHeader>
                <CardContent>
                  <DensityToggle />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Informações do Estado Atual</h3>
              <div className="flex gap-4 text-sm">
                <Badge variant={density === 'compact' ? 'default' : 'outline'}>
                  Compacto: {density === 'compact' ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant={density === 'comfortable' ? 'default' : 'outline'}>
                  Confortável: {density === 'comfortable' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                CSS Variables atuais: --row-h: {density === 'compact' ? '36px' : '44px'}, 
                --cell-px: {density === 'compact' ? '8px' : '12px'}
              </p>
              <Button 
                onClick={testDensityToggle} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Executar Teste de Densidade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Teste - Densidade Aplicada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="responsive-table-container" style={{ height: '400px' }}>
            <Table className="density-table" data-density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.cargo}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Ativo' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastActivity}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">Editar</Button>
                        <Button size="sm" variant="ghost">Ver</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Transições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Alterne entre os modos de densidade para testar as transições suaves.
              Observe como as alturas das linhas, padding das células e espaçamentos se ajustam.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Modo Compacto</h4>
                <ul className="text-sm space-y-1">
                  <li>• Altura da linha: 36px</li>
                  <li>• Padding horizontal: 8px</li>
                  <li>• Padding vertical: 6px</li>
                  <li>• Gap entre seções: 12px</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Modo Confortável</h4>
                <ul className="text-sm space-y-1">
                  <li>• Altura da linha: 44px</li>
                  <li>• Padding horizontal: 12px</li>
                  <li>• Padding vertical: 8px</li>
                  <li>• Gap entre seções: 16px</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}