import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Designacoes() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Designações</CardTitle>
          <CardDescription>Gestão de designações da reunião (em construção)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Use a página de Programas para importar a apostila MWB e gerar as designações conforme as regras S-38.
          </p>
          <Button asChild>
            <Link to="/programas">Ir para Programas</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


