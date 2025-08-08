import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react";
import DonationCard from "@/components/DonationCard";

const StudentDashboard: React.FC = () => {
  const { id } = useParams();

  // Mock data - TODO: Buscar dados do estudante e designações via Supabase
  const estudante = {
    id: id,
    nome: "João Silva",
    congregacao: "Congregação Central",
    cargo: "Servo Ministerial"
  };

  const designacoes = [
    {
      id: 1,
      semana: "12-18 de Agosto de 2024",
      tipo: "Leitura da Bíblia",
      titulo: "Gênesis 1:1-31",
      data: "2024-08-15",
      horario: "19:30",
      sala: "Principal",
      tempo: "4 min",
      status: "Confirmada",
      observacoes: "Preparar com ênfase na criação"
    },
    {
      id: 2,
      semana: "19-25 de Agosto de 2024",
      tipo: "Primeira Conversa",
      titulo: "Como a Bíblia pode ajudar?",
      data: "2024-08-22",
      horario: "20:15",
      sala: "Principal",
      tempo: "3 min",
      status: "Pendente",
      observacoes: "Usar publicação 'Boas Notícias'"
    }
  ];



  const handleConfirmarParticipacao = (designacaoId: number) => {
    // TODO: Implementar confirmação no backend
    console.log(`Confirmando participação para designação ${designacaoId}`);
    toast({
      title: "Participação confirmada!",
      description: "Sua confirmação foi registrada com sucesso.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-jw-navy text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Portal do Estudante</h1>
            <p className="text-xl opacity-90">Bem-vindo, {estudante.nome}</p>
            <p className="text-sm opacity-75">{estudante.congregacao} • {estudante.cargo}</p>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Minhas Designações */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Minhas Designações</h2>
            <div className="space-y-4">
              {designacoes.map((designacao) => (
                <Card key={designacao.id} className="border-l-4 border-l-jw-blue">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{designacao.tipo}</CardTitle>
                        <CardDescription>{designacao.titulo}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(designacao.status)}>
                        {designacao.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-jw-blue" />
                          <span>{new Date(designacao.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-jw-blue" />
                          <span>{designacao.horario} • {designacao.tempo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-jw-blue" />
                          <span>Sala {designacao.sala}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Observações:</h4>
                        <p className="text-sm text-gray-600">{designacao.observacoes}</p>
                      </div>
                    </div>

                    {designacao.status === "Pendente" && (
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleConfirmarParticipacao(designacao.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Participação
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Doações */}
          <section className="mb-12">
            <DonationCard />
          </section>

          {/* Histórico */}
          <section>
            <h2 className="text-2xl font-bold text-jw-navy mb-6">Histórico de Participação</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-jw-blue mb-2">12</div>
                    <div className="text-sm text-gray-600">Designações Cumpridas</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                    <div className="text-sm text-gray-600">Taxa de Participação</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-jw-gold mb-2">6</div>
                    <div className="text-sm text-gray-600">Meses Ativo</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
