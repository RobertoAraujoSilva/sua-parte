import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react';
import { parseJWOrgContent } from '@/utils/jwOrgParser';
import { useBackendApi } from '@/hooks/useBackendApi';

interface ImportarProgramacaoProps {}

export function ImportarProgramacao({}: ImportarProgramacaoProps) {
  const [content, setContent] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { apiCall } = useBackendApi();

  const handleParse = async () => {
    if (!content.trim()) {
      setError('Por favor, cole o conteúdo da programação do JW.org');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = parseJWOrgContent(content);
      if (result.sucesso) {
        setParsedData(result.programacao);
        setSuccess('Programação convertida com sucesso!');
      } else {
        setError(result.erros.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar conteúdo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiCall('/api/programas', {
        method: 'POST',
        body: JSON.stringify(parsedData)
      });

      setSuccess('Programação salva no sistema com sucesso!');
      setContent('');
      setParsedData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar programação');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
      setSuccess('JSON copiado para a área de transferência!');
    }
  };

  const downloadJson = () => {
    if (parsedData) {
      const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `programacao-${parsedData.semana.replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importar Programação</h1>
          <p className="text-muted-foreground">
            Cole o conteúdo da programação do JW.org para converter em formato estruturado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo JW.org</CardTitle>
            <CardDescription>
              Cole aqui o texto copiado da programação semanal do site JW.org
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="content">Conteúdo da Programação</Label>
              <Textarea
                id="content"
                placeholder="Cole aqui o conteúdo completo da programação semanal..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>

            <Button 
              onClick={handleParse} 
              disabled={isLoading || !content.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Convertendo...
                </>
              ) : (
                'Converter para JSON'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <CardDescription>
              Dados estruturados extraídos do conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parsedData ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{parsedData.semana}</Badge>
                    <span className="font-medium">{parsedData.mesAno}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Período:</strong> {parsedData.dataInicio} a {parsedData.dataFim}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Total de partes:</strong> {parsedData.partes.length}
                  </p>
                </div>

                <Separator />

                {/* Parts Preview */}
                <div className="space-y-3">
                  <h4 className="font-medium">Partes da Programação:</h4>
                  {parsedData.partes.slice(0, 5).map((parte: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{parte.titulo}</span>
                        <Badge variant="secondary">
                          {parte.duracaoMin}min
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {parte.secao} • {parte.tipo}
                      </p>
                    </div>
                  ))}
                  {parsedData.partes.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{parsedData.partes.length - 5} partes adicionais...
                    </p>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadJson}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Salvar no Sistema'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum conteúdo processado ainda.</p>
                <p className="text-sm">Cole o conteúdo e clique em "Converter para JSON"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Copiar do JW.org</h4>
              <p className="text-sm text-muted-foreground">
                Acesse a programação semanal no site JW.org, selecione todo o texto e copie (Ctrl+C).
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Colar e Converter</h4>
              <p className="text-sm text-muted-foreground">
                Cole o conteúdo na caixa de texto e clique em "Converter para JSON".
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Revisar e Salvar</h4>
              <p className="text-sm text-muted-foreground">
                Verifique a pré-visualização e clique em "Salvar no Sistema" para importar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
