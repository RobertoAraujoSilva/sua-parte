import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Users,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

const ImportHelp: React.FC = () => {
  const requiredFields = [
    { name: 'Nome Completo', description: 'Nome completo do estudante', example: 'João Silva' },
    { name: 'Idade', description: 'Idade em anos (número)', example: '25' },
    { name: 'Gênero (M/F)', description: 'M para Masculino, F para Feminino', example: 'M' },
    { name: 'Família / Agrupamento', description: 'Nome da família ou agrupamento', example: 'Família Silva' },
    { name: 'Cargo Congregacional', description: 'Cargo na congregação', example: 'Publicador Batizado' },
    { name: 'Status (Ativo/Inativo)', description: 'Status do estudante', example: 'Ativo' }
  ];

  const optionalFields = [
    { name: 'Data de Nascimento', description: 'Formato DD/MM/AAAA', example: '15/03/1999' },
    { name: 'Parente Responsável', description: 'Nome do responsável (obrigatório para menores)', example: 'Maria Silva' },
    { name: 'Parentesco', description: 'Relação familiar', example: 'Pai' },
    { name: 'Data de Batismo', description: 'Formato DD/MM/AAAA', example: '20/06/2020' },
    { name: 'Telefone', description: 'Número de telefone', example: '(11) 99999-9999' },
    { name: 'E-mail', description: 'Endereço de e-mail', example: 'joao@email.com' },
    { name: 'Observações', description: 'Observações adicionais', example: 'Disponível para designações' }
  ];

  const cargoOptions = [
    'Ancião',
    'Servo Ministerial', 
    'Pioneiro Regular',
    'Publicador Batizado',
    'Publicador Não Batizado',
    'Estudante Novo'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Como Importar Estudantes
          </CardTitle>
          <CardDescription>
            Guia completo para importação de estudantes via planilha Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <div className="text-sm font-medium">Baixar Modelo</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <div className="text-sm font-medium">Preencher Dados</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <div className="text-sm font-medium">Fazer Upload</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
              <div className="text-sm font-medium">Confirmar Importação</div>
            </div>
          </div>

          {/* Required Fields */}
          <div>
            <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Campos Obrigatórios
            </h4>
            <div className="space-y-2">
              {requiredFields.map((field, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                    {field.name}
                  </Badge>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">{field.description}</div>
                    <div className="text-xs text-gray-500 mt-1">Exemplo: {field.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Campos Opcionais
            </h4>
            <div className="space-y-2">
              {optionalFields.map((field, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Badge variant="outline" className="shrink-0">
                    {field.name}
                  </Badge>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700">{field.description}</div>
                    <div className="text-xs text-gray-500 mt-1">Exemplo: {field.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cargo Options */}
          <div>
            <h4 className="font-medium text-purple-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Opções de Cargo Congregacional
            </h4>
            <div className="flex flex-wrap gap-2">
              {cargoOptions.map((cargo, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                  {cargo}
                </Badge>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Para menores de 18 anos, é obrigatório informar o "Parente Responsável" e o "Parentesco". 
              Verifique se as datas estão no formato DD/MM/AAAA e se os e-mails são válidos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportHelp;
