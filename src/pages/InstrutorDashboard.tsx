import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, ClipboardList, BarChart3, Settings } from "lucide-react";

const InstrutorDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard do Instrutor</h1>
            <p className="text-muted-foreground">Gerencie sua congregação e estudantes</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudantes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 aguardando designações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Próxima: Quinta-feira
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Designações</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                18 pendentes de confirmação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estudantes Recentes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Estudantes Recentes</CardTitle>
              <CardDescription>
                Estudantes cadastrados recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nome: "João Silva", cargo: "Publicador", status: "Ativo" },
                  { nome: "Maria Santos", cargo: "Pioneiro Auxiliar", status: "Ativo" },
                  { nome: "Pedro Costa", cargo: "Servo Ministerial", status: "Pendente" },
                ].map((estudante, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{estudante.nome}</p>
                      <p className="text-sm text-muted-foreground">{estudante.cargo}</p>
                    </div>
                    <Badge variant={estudante.status === "Ativo" ? "default" : "secondary"}>
                      {estudante.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/estudantes')}>
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Estudantes
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/programas')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Programas
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/programas')}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Gerar Designações
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/designacoes')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </CardContent>
          </Card>

          {/* Guia Rápido (Instrutor) */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Guia Rápido (Instrutor)</CardTitle>
              <CardDescription>
                Sequência recomendada (clique para navegar)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  <button className="underline text-blue-700" onClick={() => navigate('/programas')}>
                    B1: Ir para Programas (upload PDF)
                  </button>
                </li>
                <li>
                  <button className="underline text-blue-700" onClick={() => navigate('/programas')}>
                    B2: Gerar 12 Designações
                  </button>
                </li>
                <li>
                  <button className="underline text-blue-700" onClick={() => navigate('/designacoes')}>
                    B3: Revisar / Ajustar Designações
                  </button>
                </li>
                <li>
                  <button className="underline text-blue-700" onClick={() => navigate('/estudantes')}>
                    B4: Conferir Estudantes / Qualificações
                  </button>
                </li>
                <li>
                  <a href="/docs/GUIA_DEFINITIVO.md" target="_blank" rel="noreferrer" className="underline text-blue-700">
                    Abrir Guia Definitivo
                  </a>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Programas em Andamento */}
        <Card>
          <CardHeader>
            <CardTitle>Programas em Andamento</CardTitle>
            <CardDescription>
              Programas ministeriais disponíveis para designação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { titulo: "Vida e Ministério - Setembro 2024", status: "Aguardando Designações", data: "9-15 Set" },
                { titulo: "Vida e Ministério - Outubro 2024", status: "Completo", data: "7-13 Out" },
                { titulo: "Reunião Meio da Semana - Nov 2024", status: "Em Progresso", data: "4-10 Nov" },
              ].map((programa, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{programa.titulo}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{programa.data}</p>
                  <Badge variant={
                    programa.status === "Completo" ? "default" :
                    programa.status === "Em Progresso" ? "secondary" : "outline"
                  }>
                    {programa.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstrutorDashboard;
