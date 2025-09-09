import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Users, Calendar, ArrowLeft, Download, Filter, Eye } from "lucide-react";

const Relatorios = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const relatorios = [
    {
      id: 1,
      titulo: "Participação por Estudante",
      descricao: "Relatório detalhado de participação individual dos estudantes",
      tipo: "Participação",
      periodo: "Últimos 3 meses",
      dataGeracao: "2024-08-15",
      status: "Atualizado"
    },
    {
      id: 2,
      titulo: "Distribuição de Designações",
      descricao: "Análise da distribuição equilibrada de partes entre estudantes",
      tipo: "Distribuição",
      periodo: "Últimos 6 meses",
      dataGeracao: "2024-08-14",
      status: "Atualizado"
    },
    {
      id: 3,
      titulo: "Taxa de Confirmação",
      descricao: "Métricas de confirmação de participação por semana",
      tipo: "Confirmação",
      periodo: "Último mês",
      dataGeracao: "2024-08-13",
      status: "Pendente"
    }
  ];

  const metricas = [
    {
      titulo: "Taxa de Participação",
      valor: "92%",
      variacao: "+5%",
      tendencia: "up",
      descricao: "Comparado ao mês anterior"
    },
    {
      titulo: "Estudantes Ativos",
      valor: "24",
      variacao: "+2",
      tendencia: "up",
      descricao: "Novos estudantes este mês"
    },
    {
      titulo: "Designações Geradas",
      valor: "156",
      variacao: "+12",
      tendencia: "up",
      descricao: "Nos últimos 30 dias"
    },
    {
      titulo: "Taxa de Confirmação",
      valor: "87%",
      variacao: "-3%",
      tendencia: "down",
      descricao: "Comparado ao mês anterior"
    }
  ];

  const participacaoEstudantes = [
    { nome: "João Silva", participacoes: 8, percentual: 95, cargo: "Ancião" },
    { nome: "Maria Santos", participacoes: 6, percentual: 85, cargo: "Pioneira" },
    { nome: "Pedro Costa", participacoes: 7, percentual: 90, cargo: "Servo Ministerial" },
    { nome: "Ana Lima", participacoes: 5, percentual: 75, cargo: "Publicadora" },
    { nome: "Carlos Silva", participacoes: 4, percentual: 65, cargo: "Publicador" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Atualizado":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    return tendencia === "up" ? "text-green-600" : "text-red-600";
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
                Relatórios e <span className="text-jw-gold">Análises</span>
              </h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Dashboard completo com métricas de participação, análises de engajamento 
                e relatórios detalhados para coordenadores.
              </p>
            </div>
          </div>
        </section>

        {/* Metrics Overview */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Métricas Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricas.map((metrica, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">{metrica.titulo}</h3>
                      <TrendingUp className={`w-4 h-4 ${getTendenciaColor(metrica.tendencia)}`} />
                    </div>
                    <div className="text-3xl font-bold text-jw-navy mb-1">{metrica.valor}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getTendenciaColor(metrica.tendencia)}`}>
                        {metrica.variacao}
                      </span>
                      <span className="text-sm text-gray-500">{metrica.descricao}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Reports List */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-jw-navy">Relatórios Disponíveis</h2>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="participacao">Participação</SelectItem>
                    <SelectItem value="distribuicao">Distribuição</SelectItem>
                    <SelectItem value="confirmacao">Confirmação</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="hero" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {relatorios.map((relatorio) => (
                <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                        <CardDescription>{relatorio.descricao}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(relatorio.status)}>
                        {relatorio.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{relatorio.tipo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Período:</span>
                        <span className="font-medium">{relatorio.periodo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Última atualização:</span>
                        <span className="font-medium">
                          {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Participation Analysis */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Análise de Participação</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Participação por Estudante (Últimos 3 meses)</CardTitle>
                <CardDescription>
                  Ranking de participação baseado no número de designações cumpridas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participacaoEstudantes.map((estudante, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-jw-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{estudante.nome}</h4>
                          <p className="text-sm text-gray-600">{estudante.cargo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{estudante.participacoes} participações</div>
                          <div className="text-sm text-gray-600">{estudante.percentual}% de presença</div>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-jw-blue h-2 rounded-full" 
                            style={{ width: `${estudante.percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Chart Placeholder */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Gráficos e Tendências</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participação ao Longo do Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-jw-blue/10 to-jw-blue/5 rounded-lg flex items-center justify-center border-2 border-dashed border-jw-blue/20">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-jw-blue/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Gráfico de Participação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Parte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-jw-gold/10 to-jw-gold/5 rounded-lg flex items-center justify-center border-2 border-dashed border-jw-gold/20">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-jw-gold/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Gráfico de Distribuição</p>
                    </div>
                  </div>
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

export default Relatorios;
