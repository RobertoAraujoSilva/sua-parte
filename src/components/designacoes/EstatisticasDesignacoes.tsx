import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Heart, 
  BarChart3,
  CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EstatisticasDesignacao } from "@/types/designacoes";

interface EstatisticasDesignacoesProps {
  estatisticas: EstatisticasDesignacao;
}

export const EstatisticasDesignacoes: React.FC<EstatisticasDesignacoesProps> = ({
  estatisticas
}) => {
  const { t } = useTranslation();
  
  const total = estatisticas.distribuicaoPorGenero.masculino + estatisticas.distribuicaoPorGenero.feminino;
  const malePercentage = total > 0 ? (estatisticas.distribuicaoPorGenero.masculino / total) * 100 : 50;

  const stats = [
    {
      label: 'Total de Designações',
      value: estatisticas.totalDesignacoes,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      label: 'Estudantes Masculinos',
      value: estatisticas.distribuicaoPorGenero.masculino,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      label: 'Estudantes Femininas',
      value: estatisticas.distribuicaoPorGenero.feminino,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950'
    },
    {
      label: 'Com Ajudante',
      value: estatisticas.estudantesComAjudante,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      label: 'Pares Formados',
      value: estatisticas.paresFormados,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      label: 'Pares Familiares',
      value: estatisticas.paresFamiliares,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className={stat.bgColor}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <div className="min-w-0">
                  <p className={`text-xs ${stat.color} font-medium truncate`}>
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gender distribution bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              ♂ Masculino ({estatisticas.distribuicaoPorGenero.masculino})
            </span>
            <span className="flex items-center gap-1 text-pink-600 font-medium">
              ♀ Feminino ({estatisticas.distribuicaoPorGenero.feminino})
            </span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden bg-pink-200 dark:bg-pink-900">
            <div 
              className="absolute inset-y-0 left-0 bg-indigo-500 transition-all"
              style={{ width: `${malePercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Distribuição de gênero nas designações
          </p>
        </CardContent>
      </Card>

      {/* Cargo distribution if available */}
      {Object.keys(estatisticas.distribuicaoPorCargo).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Distribuição por Cargo
            </h4>
            <div className="space-y-2">
              {Object.entries(estatisticas.distribuicaoPorCargo).map(([cargo, count]) => {
                const cargoLabels: Record<string, string> = {
                  anciao: 'Ancião',
                  servo_ministerial: 'Servo Ministerial',
                  pioneiro_regular: 'Pioneiro Regular',
                  publicador_batizado: 'Publicador Batizado',
                  publicador_nao_batizado: 'Publicador Não Batizado',
                  estudante_novo: 'Estudante Novo'
                };
                const percentage = estatisticas.totalDesignacoes > 0 
                  ? (count / estatisticas.totalDesignacoes) * 100 
                  : 0;

                return (
                  <div key={cargo} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{cargoLabels[cargo] || cargo}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
