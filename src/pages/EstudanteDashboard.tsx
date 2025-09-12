import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, Download, Clock, CheckCircle } from "lucide-react";

const EstudanteDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portal do Estudante</h1>
            <p className="text-muted-foreground">Acompanhe seus materiais e designações</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Designações</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 próximas semanas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materiais</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Disponíveis para download
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participação</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Nos últimos 3 meses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximas Designações */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Designações</CardTitle>
              <CardDescription>
                Suas designações confirmadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    tipo: "Leitura da Bíblia", 
                    data: "12 de Setembro", 
                    material: "Gênesis 1:1-25",
                    status: "Confirmado"
                  },
                  { 
                    tipo: "Demonstração", 
                    data: "19 de Setembro", 
                    material: "Como iniciar conversas",
                    status: "Pendente"
                  },
                  { 
                    tipo: "Discurso", 
                    data: "26 de Setembro", 
                    material: "A importância da oração",
                    status: "Confirmado"
                  },
                ].map((designacao, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{designacao.tipo}</p>
                      <p className="text-sm text-muted-foreground">{designacao.material}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {designacao.data}
                      </p>
                    </div>
                    <Badge variant={designacao.status === "Confirmado" ? "default" : "outline"}>
                      {designacao.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Materiais Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais Disponíveis</CardTitle>
              <CardDescription>
                Baixe os materiais para suas designações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { nome: "Vida e Ministério - Setembro 2024", formato: "PDF", tamanho: "2.4 MB" },
                  { nome: "Livro de Cânticos", formato: "PDF", tamanho: "15.2 MB" },
                  { nome: "Guia para Reunião Vida e Ministério", formato: "PDF", tamanho: "1.8 MB" },
                  { nome: "Estudo Bíblico de Congregação", formato: "PDF", tamanho: "3.1 MB" },
                ].map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{material.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.formato} • {material.tamanho}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico Recente */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>
              Suas participações nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { tipo: "Leitura da Bíblia", data: "5 de Setembro", nota: "Excelente apresentação" },
                { tipo: "Demonstração", data: "29 de Agosto", nota: "Boa aplicação prática" },
                { tipo: "Discurso", data: "22 de Agosto", nota: "Preparação adequada" },
                { tipo: "Leitura da Bíblia", data: "15 de Agosto", nota: "Boa dicção e fluência" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{item.tipo}</p>
                    <p className="text-sm text-muted-foreground">{item.nota}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.data}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstudanteDashboard;