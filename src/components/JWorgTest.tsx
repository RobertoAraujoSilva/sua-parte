import React from 'react';
import { useJWorgIntegration } from '../hooks/useJWorgIntegration';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, AlertCircle, Download, Database, Loader2 } from 'lucide-react';

export const JWorgTest: React.FC = () => {
  const jworg = useJWorgIntegration();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">🧪 Teste JW.org Integration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Estado do Hook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Idioma: {jworg.currentLanguage}</div>
              <div>Carregando: {jworg.isLoading ? 'Sim' : 'Não'}</div>
              <div>Erro: {jworg.error || 'Nenhum'}</div>
              <div>Semana atual: {jworg.currentWeek ? 'Carregada' : 'Não carregada'}</div>
              <div>Próximas semanas: {jworg.nextWeeks.length}</div>
              <div>Apostilas: {jworg.availableWorkbooks.join(', ')}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => jworg.fetchCurrentWeek()}
                disabled={jworg.isLoading}
                className="w-full"
              >
                {jworg.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Recarregar Semana Atual
              </Button>
              
              <Button 
                onClick={() => jworg.fetchNextWeeks()}
                disabled={jworg.isLoading}
                variant="outline"
                className="w-full"
              >
                {jworg.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Recarregar Próximas Semanas
              </Button>
              
              <Button 
                onClick={() => jworg.downloadWorkbook('pt', '07', '2025')}
                disabled={jworg.isLoading}
                variant="outline"
                className="w-full"
              >
                {jworg.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Testar Download PT
              </Button>

              <div className="border-t pt-2 mt-4">
                <Button 
                  onClick={() => jworg.saveToDatabase()}
                  disabled={jworg.isLoading || jworg.isSaving || !jworg.currentWeek}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {jworg.isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                  Salvar no Banco de Dados
                </Button>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Salva os programas buscados para acesso offline
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {jworg.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Erro: {jworg.error}
            </div>
          </CardContent>
        </Card>
      )}

      {jworg.currentWeek && (
        <Card>
          <CardHeader>
            <CardTitle>Semana Atual: {jworg.currentWeek.week}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>Livro: {jworg.currentWeek.book}</div>
              <div>Capítulo: {jworg.currentWeek.chapter}</div>
              <div>Partes: {jworg.currentWeek.parts.length}</div>
              <div className="mt-2">
                {jworg.currentWeek.parts.map(part => (
                  <div key={part.id} className="ml-4">
                    {part.id}. {part.title} ({part.duration} min) - {part.type}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
