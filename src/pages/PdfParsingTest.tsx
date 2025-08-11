import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PdfParsingDemo } from '@/components/PdfParsingDemo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TestTube } from 'lucide-react';

const PdfParsingTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:text-jw-gold"
                onClick={() => navigate('/programas')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Programas
              </Button>
            </div>
            
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="w-10 h-10 text-jw-gold" />
                <h1 className="text-4xl font-bold">
                  Teste do Parser de <span className="text-jw-gold">PDF Aprimorado</span>
                </h1>
              </div>
              <p className="text-xl opacity-90 max-w-3xl">
                Demonstração das capacidades aprimoradas de análise de arquivos PDF 
                da "Vida e Ministério Cristão" com reconhecimento inteligente de padrões.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <PdfParsingDemo />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Recursos Aprimorados</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reconhecimento de Padrões</h3>
                <p className="text-gray-600">
                  Identifica automaticamente apostilas mensais (mwb_T_YYYYMM.pdf), 
                  programas semanais e formulários de designação.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowLeft className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Extração Inteligente</h3>
                <p className="text-gray-600">
                  Extrai informações de data, mês, ano e tipo de documento 
                  diretamente do nome do arquivo com alta precisão.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Geração de Semanas</h3>
                <p className="text-gray-600">
                  Gera automaticamente todas as semanas incluídas em apostilas mensais 
                  com datas precisas e formatação correta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Formats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Formatos Suportados</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Apostilas Mensais</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-mono bg-gray-100 p-2 rounded">mwb_T_202507.pdf</div>
                  <div className="font-mono bg-gray-100 p-2 rounded">mwb_T_202509.pdf</div>
                  <div className="font-mono bg-gray-100 p-2 rounded">mwb_T_202511.pdf</div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Arquivos oficiais da JW.org com padrão mwb_T_YYYYMM.pdf
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-green-600">Programas Semanais</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-mono bg-gray-100 p-2 rounded">programa-12-18-agosto-2024.pdf</div>
                  <div className="font-mono bg-gray-100 p-2 rounded">19-25-setembro-2024.pdf</div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Programas com datas específicas e informações de semana
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Formulários</h3>
                <div className="space-y-2 text-sm">
                  <div className="font-mono bg-gray-100 p-2 rounded">S-38_T.pdf</div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Formulários de designação e outros documentos oficiais
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PdfParsingTest;
