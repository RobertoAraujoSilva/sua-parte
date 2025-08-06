import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Upload, Calendar, FileText, ArrowLeft, Download, Eye, Trash2 } from "lucide-react";

const Programas = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const programas = [
    {
      id: 1,
      semana: "12-18 de Agosto de 2024",
      arquivo: "programa-12-18-agosto-2024.pdf",
      status: "Processado",
      dataImportacao: "2024-08-05",
      designacoesGeradas: true,
      partes: [
        "Tesouros da Palavra de Deus",
        "Faça Seu Melhor no Ministério",
        "Nossa Vida Cristã"
      ]
    },
    {
      id: 2,
      semana: "19-25 de Agosto de 2024",
      arquivo: "programa-19-25-agosto-2024.pdf",
      status: "Pendente",
      dataImportacao: "2024-08-12",
      designacoesGeradas: false,
      partes: [
        "Tesouros da Palavra de Deus",
        "Faça Seu Melhor no Ministério",
        "Nossa Vida Cristã"
      ]
    },
    {
      id: 3,
      semana: "26 de Agosto - 1 de Setembro de 2024",
      arquivo: "programa-26-agosto-01-setembro-2024.pdf",
      status: "Rascunho",
      dataImportacao: "2024-08-19",
      designacoesGeradas: false,
      partes: [
        "Tesouros da Palavra de Deus",
        "Faça Seu Melhor no Ministério",
        "Nossa Vida Cristã"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processado":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Rascunho":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
            
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">
                Gestão de <span className="text-jw-gold">Programas</span>
              </h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Importe e gerencie programas semanais da apostila Vida e Ministério Cristão 
                com parsing automático e validação inteligente.
              </p>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-dashed border-jw-blue/30 hover:border-jw-blue/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Upload className="w-16 h-16 text-jw-blue/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-jw-navy mb-2">
                  Importar Novo Programa
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Faça upload do PDF oficial da apostila Vida e Ministério Cristão. 
                  O sistema extrairá automaticamente todas as informações necessárias.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg">
                    <Upload className="w-5 h-5 mr-2" />
                    Selecionar Arquivo PDF
                  </Button>
                  <Button variant="outline" size="lg">
                    <FileText className="w-5 h-5 mr-2" />
                    Criar Manualmente
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Formatos aceitos: PDF • Tamanho máximo: 10MB
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Programs List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-jw-navy">Programas Importados</h2>
              <div className="flex gap-2">
                <Input 
                  placeholder="Buscar programas..." 
                  className="w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {programas.map((programa) => (
                <Card key={programa.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{programa.semana}</CardTitle>
                        <CardDescription>
                          Importado em {new Date(programa.dataImportacao).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(programa.status)}>
                        {programa.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Arquivo:</h4>
                        <p className="text-sm text-gray-600 mb-3">{programa.arquivo}</p>
                        
                        <h4 className="font-medium text-gray-700 mb-2">Partes do Programa:</h4>
                        <ul className="space-y-1">
                          {programa.partes.map((parte, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <div className="w-2 h-2 bg-jw-blue rounded-full mr-2"></div>
                              {parte}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Status das Designações:</h4>
                        <div className="flex items-center gap-2 mb-4">
                          {programa.designacoesGeradas ? (
                            <Badge className="bg-green-100 text-green-800">
                              Designações Geradas
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Aguardando Designações
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          {!programa.designacoesGeradas && (
                            <Button variant="hero" size="sm">
                              <Calendar className="w-4 h-4 mr-1" />
                              Gerar Designações
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {programas.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhum programa importado
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece importando seu primeiro programa semanal
                </p>
                <Button variant="hero">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Primeiro Programa
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-jw-blue mb-2">3</div>
                  <div className="text-sm text-gray-600">Programas Importados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1</div>
                  <div className="text-sm text-gray-600">Programas Processados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">1</div>
                  <div className="text-sm text-gray-600">Aguardando Processamento</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">9</div>
                  <div className="text-sm text-gray-600">Partes Identificadas</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Programas;
