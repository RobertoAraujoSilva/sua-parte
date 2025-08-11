import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JWContentParserProps {
  onParseComplete?: (result: any) => void;
  className?: string;
}

interface ParsedMeetingPart {
  numero: number;
  titulo: string;
  tempo: number;
  tipo: string;
  secao: string;
  referencia?: string;
}

export const JWContentParser: React.FC<JWContentParserProps> = ({
  onParseComplete,
  className = ''
}) => {
  const [content, setContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedParts, setParsedParts] = useState<ParsedMeetingPart[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse JW.org meeting content into structured format
  const parseJWContent = (text: string): ParsedMeetingPart[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const parts: ParsedMeetingPart[] = [];
    let currentSection = '';
    let partNumber = 1;

    for (const line of lines) {
      // Detect section headers
      if (line.toUpperCase().includes('TESOUROS DA PALAVRA')) {
        currentSection = 'TESOUROS';
        continue;
      } else if (line.toUpperCase().includes('FAÇA SEU MELHOR') || line.toUpperCase().includes('MINISTÉRIO')) {
        currentSection = 'MINISTERIO';
        continue;
      } else if (line.toUpperCase().includes('NOSSA VIDA CRISTÃ') || line.toUpperCase().includes('VIDA CRISTÃ')) {
        currentSection = 'VIDA_CRISTA';
        continue;
      }

      // Parse individual parts with timing
      const timeMatch = line.match(/\((\d+)\s*min\)/i);
      const numberMatch = line.match(/^(\d+)\.\s*/);
      
      if (timeMatch && currentSection) {
        const tempo = parseInt(timeMatch[1]);
        let titulo = line.replace(/^\d+\.\s*/, '').replace(/\(\d+\s*min\)/i, '').trim();
        
        // Extract Bible references
        const bibleRefMatch = titulo.match(/\b(Pro\.|Prov\.|Provérbios|Mat\.|Mateus|João|1 Cor\.|2 Cor\.|Gál\.|Efé\.|Fil\.|Col\.|1 Tes\.|2 Tes\.|1 Tim\.|2 Tim\.|Tit\.|Heb\.|Tia\.|1 Ped\.|2 Ped\.|1 João|2 João|3 João|Judas|Apo\.|Apocalipse)\s*\d+[:\d\-,\s]*\b/i);
        const referencia = bibleRefMatch ? bibleRefMatch[0] : undefined;
        
        if (referencia) {
          titulo = titulo.replace(bibleRefMatch[0], '').trim();
        }

        // Determine assignment type based on section and content
        let tipo = 'demonstracao'; // default
        
        if (currentSection === 'TESOUROS') {
          if (titulo.toLowerCase().includes('leitura') || referencia) {
            tipo = 'leitura_biblica';
          } else if (titulo.toLowerCase().includes('joias') || titulo.toLowerCase().includes('espirituais')) {
            tipo = 'joias_espirituais';
          } else {
            tipo = 'tesouros_palavra';
          }
        } else if (currentSection === 'MINISTERIO') {
          tipo = 'parte_ministerio';
        } else if (currentSection === 'VIDA_CRISTA') {
          if (titulo.toLowerCase().includes('estudo') && titulo.toLowerCase().includes('congregação')) {
            tipo = 'estudo_biblico_congregacao';
          } else {
            tipo = 'vida_crista';
          }
        }

        parts.push({
          numero: partNumber++,
          titulo,
          tempo,
          tipo,
          secao: currentSection,
          referencia
        });
      }
    }

    return parts;
  };

  // Map parsed parts to complete 12-part meeting structure
  const mapToCompleteStructure = (parsedParts: ParsedMeetingPart[]) => {
    // Fixed 12-part structure - no dynamic addition
    const completeStructure = [
      // Opening section (2 parts)
      { numero: 1, titulo: 'Oração de Abertura', tempo: 1, tipo: 'oracao_abertura' },
      { numero: 2, titulo: 'Comentários Iniciais', tempo: 1, tipo: 'comentarios_iniciais' },

      // Treasures from God's Word section (3 parts)
      { numero: 3, titulo: 'Tesouros da Palavra de Deus', tempo: 10, tipo: 'tesouros_palavra' },
      { numero: 4, titulo: 'Joias Espirituais', tempo: 10, tipo: 'joias_espirituais' },
      { numero: 5, titulo: 'Leitura da Bíblia', tempo: 4, tipo: 'leitura_biblica' },

      // Apply Yourself to Ministry section (3 parts)
      { numero: 6, titulo: 'Primeira Conversa', tempo: 3, tipo: 'parte_ministerio' },
      { numero: 7, titulo: 'Revisita', tempo: 4, tipo: 'parte_ministerio' },
      { numero: 8, titulo: 'Estudo Bíblico', tempo: 5, tipo: 'parte_ministerio' },

      // Our Christian Life section (2 parts)
      { numero: 9, titulo: 'Nossa Vida Cristã', tempo: 15, tipo: 'vida_crista' },
      { numero: 10, titulo: 'Estudo Bíblico da Congregação', tempo: 30, tipo: 'estudo_biblico_congregacao' },

      // Closing section (2 parts)
      { numero: 11, titulo: 'Comentários Finais', tempo: 3, tipo: 'comentarios_finais' },
      { numero: 12, titulo: 'Oração de Encerramento', tempo: 1, tipo: 'oracao_encerramento' }
    ];

    // Map parsed content to appropriate parts
    parsedParts.forEach(parsed => {
      const matchingPart = completeStructure.find(part => {
        if (parsed.tipo === part.tipo) return true;

        // Special mapping for content analysis
        if (parsed.titulo.toLowerCase().includes('tesouros') && part.tipo === 'tesouros_palavra') return true;
        if (parsed.titulo.toLowerCase().includes('joias') && part.tipo === 'joias_espirituais') return true;
        if (parsed.titulo.toLowerCase().includes('leitura') && part.tipo === 'leitura_biblica') return true;
        if (parsed.titulo.toLowerCase().includes('estudo') && parsed.titulo.toLowerCase().includes('congregação') && part.tipo === 'estudo_biblico_congregacao') return true;

        return false;
      });

      if (matchingPart) {
        matchingPart.titulo = parsed.titulo;
        matchingPart.tempo = parsed.tempo;
      }
    });

    return completeStructure;
  };

  const handleParse = async () => {
    if (!content.trim()) {
      setParseError('Por favor, cole o conteúdo da reunião do JW.org');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      // Parse the content
      const parsed = parseJWContent(content);
      
      if (parsed.length === 0) {
        throw new Error('Não foi possível identificar partes da reunião no conteúdo fornecido');
      }

      // Map to complete structure
      const completeStructure = mapToCompleteStructure(parsed);
      setParsedParts(completeStructure);

      // Create program data in the expected format
      const programData = {
        extractedData: {
          semana: `Semana de ${new Date().toLocaleDateString('pt-BR')}`,
          data_inicio: new Date().toISOString().split('T')[0],
          mes_ano: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          partes: completeStructure.map(part => part.titulo)
        }
      };

      toast({
        title: 'Conteúdo Analisado!',
        description: `${completeStructure.length} partes da reunião foram identificadas.`,
      });

      onParseComplete?.(programData);

    } catch (error) {
      console.error('Parse error:', error);
      setParseError(error instanceof Error ? error.message : 'Erro ao analisar o conteúdo');
    } finally {
      setIsParsing(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setParsedParts([]);
    setParseError(null);
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'oracao_abertura':
      case 'oracao_encerramento':
        return 'bg-purple-100 text-purple-800';
      case 'tesouros_palavra':
      case 'joias_espirituais':
        return 'bg-blue-100 text-blue-800';
      case 'leitura_biblica':
        return 'bg-green-100 text-green-800';
      case 'parte_ministerio':
        return 'bg-orange-100 text-orange-800';
      case 'vida_crista':
      case 'estudo_biblico_congregacao':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-jw-blue" />
          Importar do JW.org
        </CardTitle>
        <CardDescription>
          Cole o conteúdo da reunião diretamente do site JW.org para criar automaticamente o programa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Cole o conteúdo da reunião do JW.org:
          </label>
          <Textarea
            placeholder={`Exemplo:
TESOUROS DA PALAVRA DE DEUS
1. Sábios princípios para usar a fala da melhor maneira (10 min)
2. Joias espirituais (10 min)
3. Leitura da Bíblia (4 min) Pro. 25:1-17

FAÇA SEU MELHOR NO MINISTÉRIO
4. Iniciando conversas (3 min)
5. Cultivando o interesse (4 min)
6. Discurso (5 min)

NOSSA VIDA CRISTÃ
7. Necessidades locais (15 min)
8. Estudo bíblico de congregação (30 min)`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            disabled={isParsing}
          />
        </div>

        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleParse} 
            disabled={isParsing || !content.trim()}
            className="flex items-center gap-2"
          >
            {isParsing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analisar Conteúdo
              </>
            )}
          </Button>
          
          {(content || parsedParts.length > 0) && (
            <Button variant="outline" onClick={handleClear}>
              Limpar
            </Button>
          )}
        </div>

        {parsedParts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Estrutura da Reunião Identificada:</span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parsedParts.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500">
                      {part.numero.toString().padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium">{part.titulo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {part.tempo} min
                    </Badge>
                    <Badge className={`text-xs ${getTypeColor(part.tipo)}`}>
                      {part.tipo.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
