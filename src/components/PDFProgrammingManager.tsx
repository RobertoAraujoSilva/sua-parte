import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Calendar,
  Globe,
  Clock
} from 'lucide-react';
import { usePDFProgramming, PDFFile, ProgrammingData } from '@/hooks/usePDFProgramming';

/**
 * Componente para gerenciar PDFs de programação no Admin Dashboard
 */
export function PDFProgrammingManager() {
  const {
    availablePDFs,
    extractedProgramming,
    loading,
    error,
    scanPDFs,
    parsePDF,
    saveProgramming,
    clearExtractedData,
    formatFileSize,
    formatDate,
    getLanguageIcon,
    getLanguageName
  } = usePDFProgramming();

  return (
    <div className="space-y-6">
      {/* Seção de Gestão de PDFs */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            📚 Gestão de PDFs Oficiais
          </CardTitle>
          <CardDescription className="text-blue-700">
            Extrair programações dos PDFs da pasta docs/Oficial/
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Botão de scan */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">PDFs Disponíveis</p>
              <p className="text-xs text-muted-foreground">
                {availablePDFs.length} arquivos encontrados
              </p>
            </div>
            <Button 
              onClick={scanPDFs}
              disabled={loading.scanning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading.scanning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Escanear Pasta docs/Oficial/
            </Button>
          </div>

          {/* Lista de PDFs */}
          {availablePDFs.length > 0 ? (
            <div className="space-y-2">
              {availablePDFs.map((pdf) => (
                <PDFFileCard 
                  key={pdf.fileName} 
                  pdf={pdf} 
                  onParse={() => parsePDF(pdf)}
                  loading={loading.parsing}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                  getLanguageIcon={getLanguageIcon}
                  getLanguageName={getLanguageName}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum PDF encontrado.</p>
              <p className="text-sm">Clique em "Escanear" para buscar PDFs na pasta oficial.</p>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Seção de Programação Extraída */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            📅 Programação Extraída
          </CardTitle>
          <CardDescription className="text-green-700">
            Visualizar e editar programação extraída dos PDFs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {extractedProgramming ? (
            <ProgrammingView 
              programming={extractedProgramming}
              onSave={() => saveProgramming(extractedProgramming)}
              onClear={clearExtractedData}
              loading={loading.saving}
              formatDate={formatDate}
              getLanguageIcon={getLanguageIcon}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma programação extraída ainda.</p>
              <p className="text-sm">Selecione um PDF e clique em "Extrair" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Card individual para cada PDF
 */
interface PDFFileCardProps {
  pdf: PDFFile;
  onParse: () => void;
  loading: boolean;
  formatFileSize: (bytes: number) => string;
  formatDate: (date: Date) => string;
  getLanguageIcon: (language: string) => string;
  getLanguageName: (language: string) => string;
}

function PDFFileCard({ 
  pdf, 
  onParse, 
  loading, 
  formatFileSize, 
  formatDate, 
  getLanguageIcon, 
  getLanguageName 
}: PDFFileCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">{pdf.fileName}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {getLanguageIcon(pdf.language)} {getLanguageName(pdf.language)}
            </span>
            <span>•</span>
            <span>{pdf.month}/{pdf.year}</span>
            <span>•</span>
            <span>{formatFileSize(pdf.size)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(pdf.lastModified)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {pdf.isValid ? (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Válido
          </Badge>
        ) : (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inválido
          </Badge>
        )}
        <Button 
          size="sm" 
          onClick={onParse}
          disabled={loading || !pdf.isValid}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Extrair
        </Button>
      </div>
    </div>
  );
}

/**
 * Visualização da programação extraída
 */
interface ProgrammingViewProps {
  programming: ProgrammingData;
  onSave: () => void;
  onClear: () => void;
  loading: boolean;
  formatDate: (date: Date) => string;
  getLanguageIcon: (language: string) => string;
}

function ProgrammingView({ 
  programming, 
  onSave, 
  onClear, 
  loading, 
  formatDate, 
  getLanguageIcon 
}: ProgrammingViewProps) {
  return (
    <div className="space-y-4">
      {/* Metadados */}
      <div className="p-3 bg-white rounded-lg border">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Informações da Extração
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Arquivo:</strong> {programming.metadata.sourceFile}</div>
          <div><strong>Idioma:</strong> {getLanguageIcon(programming.metadata.language)} {programming.metadata.language}</div>
          <div><strong>Extraído em:</strong> {formatDate(programming.metadata.extractedAt)}</div>
          <div><strong>Semanas:</strong> {programming.metadata.totalWeeks}</div>
        </div>
      </div>
      
      {/* Lista de semanas */}
      <div className="space-y-2">
        <h4 className="font-medium">Semanas Extraídas</h4>
        {programming.weeks.map((week) => (
          <div key={week.weekNumber} className="p-3 border rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">{week.title}</h5>
                <p className="text-sm text-muted-foreground">
                  {week.startDate} - {week.endDate}
                </p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {week.sections.opening.length} Abertura
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {week.sections.treasures.length} Tesouros
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {week.sections.ministry.length} Ministério
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {week.sections.living.length} Vida Cristã
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {week.sections.closing.length} Encerramento
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onClear}>
          Limpar Dados
        </Button>
        <Button 
          onClick={onSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Salvar Programação
        </Button>
      </div>
    </div>
  );
}
