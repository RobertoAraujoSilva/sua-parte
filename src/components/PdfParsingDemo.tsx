import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JWPdfParser } from '@/utils/pdfParser';
import { FileText, Calendar, BookOpen, Users } from 'lucide-react';

interface ParsedResult {
  filename: string;
  result: any;
}

export const PdfParsingDemo: React.FC = () => {
  const [results, setResults] = useState<ParsedResult[]>([]);

  const testFilenames = [
    'mwb_T_202507.pdf',
    'mwb_T_202509.pdf', 
    'mwb_T_202511.pdf',
    'S-38_T.pdf',
    'programa-12-18-agosto-2024.pdf',
    'programa-19-25-setembro-2024.pdf',
    'apostila-outubro-2024.pdf'
  ];

  const testParsing = async () => {
    const newResults: ParsedResult[] = [];
    
    for (const filename of testFilenames) {
      try {
        const mockFile = new File(['mock content'], filename, { type: 'application/pdf' });
        const result = await JWPdfParser.parsePdf(mockFile);
        newResults.push({ filename, result });
      } catch (error) {
        console.error(`Error parsing ${filename}:`, error);
      }
    }
    
    setResults(newResults);
  };

  const getDocumentTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'apostila_mensal':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'programa_semanal':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'formulario_designacao':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDocumentTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'apostila_mensal':
        return 'bg-blue-100 text-blue-800';
      case 'programa_semanal':
        return 'bg-green-100 text-green-800';
      case 'formulario_designacao':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'apostila_mensal':
        return 'Apostila Mensal';
      case 'programa_semanal':
        return 'Programa Semanal';
      case 'formulario_designacao':
        return 'Formulário de Designação';
      default:
        return 'Documento';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-jw-blue" />
            Demonstração do Parser de PDF Aprimorado
          </CardTitle>
          <CardDescription>
            Teste o novo sistema de análise de arquivos PDF da "Vida e Ministério Cristão"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Arquivos de Teste:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {testFilenames.map((filename) => (
                  <Badge key={filename} variant="outline" className="text-xs">
                    {filename}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button onClick={testParsing} className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Testar Análise de Arquivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Resultados da Análise</h2>
          
          {results.map((item, index) => (
            <Card key={index} className="border-l-4 border-l-jw-blue">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getDocumentTypeIcon(item.result.tipo_documento)}
                    <div>
                      <CardTitle className="text-lg">{item.filename}</CardTitle>
                      <CardDescription>
                        Arquivo analisado com sucesso
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getDocumentTypeColor(item.result.tipo_documento)}>
                    {getDocumentTypeLabel(item.result.tipo_documento)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Semana/Período:</h4>
                    <p className="text-sm">{item.result.semana}</p>
                  </div>
                  
                  {item.result.mes_ano && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-1">Mês/Ano:</h4>
                      <p className="text-sm">{item.result.mes_ano}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Data de Início:</h4>
                    <p className="text-sm">{new Date(item.result.data_inicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  {item.result.detalhes_extras?.total_semanas && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-1">Total de Semanas:</h4>
                      <p className="text-sm">{item.result.detalhes_extras.total_semanas}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Partes do Programa:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.result.partes.map((parte: string, partIndex: number) => (
                      <Badge key={partIndex} variant="secondary" className="text-xs">
                        {parte}
                      </Badge>
                    ))}
                  </div>
                </div>

                {item.result.detalhes_extras?.semanas_incluidas && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Semanas Incluídas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                      {item.result.detalhes_extras.semanas_incluidas.map((semana: string, semanaIndex: number) => (
                        <div key={semanaIndex} className="bg-gray-50 p-2 rounded">
                          {semana}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Ver dados completos (JSON)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(item.result, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
