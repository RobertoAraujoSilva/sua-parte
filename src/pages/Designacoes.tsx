import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Zap, Calendar, FileText, ArrowLeft, Download, Eye, Send, RefreshCw } from "lucide-react";

const Designacoes = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const designacoes = [
    {
      id: 1,
      semana: "12-18 de Agosto de 2024",
      status: "Enviadas",
      dataGeracao: "2024-08-05",
      dataEnvio: "2024-08-05",
      totalPartes: 12,
      partesDesignadas: 12,
      estudantesNotificados: 8,
      confirmacoes: 6
    },
    {
      id: 2,
      semana: "19-25 de Agosto de 2024",
      status: "Geradas",
      dataGeracao: "2024-08-12",
      dataEnvio: null,
      totalPartes: 12,
      partesDesignadas: 12,
      estudantesNotificados: 0,
      confirmacoes: 0
    },
    {
      id: 3,
      semana: "26 de Agosto - 1 de Setembro de 2024",
      status: "Pendente",
      dataGeracao: null,
      dataEnvio: null,
      totalPartes: 12,
      partesDesignadas: 0,
      estudantesNotificados: 0,
      confirmacoes: 0
    }
  ];

  const partes = [
    {
      id: 1,
      tipo: "Tesouros da Palavra de Deus",
      titulo: "Leitura da Bíblia",
      estudante: "João Silva",
      auxiliar: null,
      tempo: "4 min",
      sala: "Principal"
    },
    {
      id: 2,
      tipo: "Faça Seu Melhor no Ministério",
      titulo: "Primeira Conversa",
      estudante: "Maria Santos",
      auxiliar: "Ana Costa",
      tempo: "3 min",
      sala: "Principal"
    },
    {
      id: 3,
      tipo: "Faça Seu Melhor no Ministério",
      titulo: "Revisita",
      estudante: "Pedro Costa",
      auxiliar: "Carlos Lima",
      tempo: "4 min",
      sala: "Auxiliar"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enviadas":
        return "bg-green-100 text-green-800";
      case "Geradas":
        return "bg-blue-100 text-blue-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
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
                Gestão de <span className="text-jw-gold">Designações</span>
              </h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Gere e gerencie designações automáticas com algoritmo inteligente que 
                respeita todas as regras da Escola do Ministério Teocrático.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-jw-navy mb-2">Ações Rápidas</h2>
                <p className="text-gray-600">Gerencie designações de forma eficiente</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="hero" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Gerar Designações Automáticas
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar Semana
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Designations Overview */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-jw-navy">Designações por Semana</h2>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="enviadas">Enviadas</SelectItem>
                    <SelectItem value="geradas">Geradas</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {designacoes.map((designacao) => (
                <Card key={designacao.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{designacao.semana}</CardTitle>
                        <CardDescription>
                          {designacao.dataGeracao ? 
                            `Geradas em ${new Date(designacao.dataGeracao).toLocaleDateString('pt-BR')}` :
                            'Aguardando geração'
                          }
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(designacao.status)}>
                        {designacao.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Progresso:</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Partes Designadas</span>
                            <span>{designacao.partesDesignadas}/{designacao.totalPartes}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-jw-blue h-2 rounded-full" 
                              style={{ width: `${(designacao.partesDesignadas / designacao.totalPartes) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Notificações:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Estudantes Notificados</span>
                            <span>{designacao.estudantesNotificados}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confirmações</span>
                            <span className="text-green-600">{designacao.confirmacoes}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Ações:</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          {designacao.status === "Geradas" && (
                            <Button variant="hero" size="sm">
                              <Send className="w-4 h-4 mr-1" />
                              Enviar
                            </Button>
                          )}
                          {designacao.status === "Pendente" && (
                            <Button variant="hero" size="sm">
                              <Zap className="w-4 h-4 mr-1" />
                              Gerar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Current Week Details */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Designações da Semana Atual</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {partes.map((parte) => (
                <Card key={parte.id} className="border-l-4 border-l-jw-blue">
                  <CardHeader className="pb-3">
                    <Badge variant="outline" className="w-fit mb-2">
                      {parte.tipo}
                    </Badge>
                    <CardTitle className="text-base">{parte.titulo}</CardTitle>
                    <CardDescription>{parte.tempo} • Sala {parte.sala}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Estudante:</span>
                        <p className="text-sm">{parte.estudante}</p>
                      </div>
                      {parte.auxiliar && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Auxiliar:</span>
                          <p className="text-sm">{parte.auxiliar}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-jw-blue mb-2">36</div>
                  <div className="text-sm text-gray-600">Total de Partes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">24</div>
                  <div className="text-sm text-gray-600">Partes Designadas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">8</div>
                  <div className="text-sm text-gray-600">Estudantes Notificados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">75%</div>
                  <div className="text-sm text-gray-600">Taxa de Confirmação</div>
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

export default Designacoes;
