import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, FileDown, ListChecks, Upload, Zap, Eye } from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const steps: Step[] = [
  { icon: <Upload className="w-4 h-4" />, title: '1) Importar PDF', desc: 'Selecione a apostila (mwb_*.pdf)' },
  { icon: <ListChecks className="w-4 h-4" />, title: '2) Verificar duplicado', desc: 'Detecta mês/semana repetidos' },
  { icon: <CheckCircle2 className="w-4 h-4" />, title: '3) Salvar programa', desc: 'Cria/atualiza no Supabase' },
  { icon: <Zap className="w-4 h-4" />, title: '4) Gerar designações', desc: 'Aplica regras S-38' },
  { icon: <Eye className="w-4 h-4" />, title: '5) Revisar e aprovar', desc: 'Ajuste e confirme' },
  { icon: <FileDown className="w-4 h-4" />, title: '6) Exportar/compartilhar', desc: 'Baixe PDF ou compartilhe' },
];

export default function ProgramFlowGuide() {
  return (
    <Card className="border border-jw-blue/20">
      <CardContent className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-gray-50">
              <div className="text-jw-blue mt-0.5">{s.icon}</div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-jw-navy">{s.title}</div>
                <div className="text-[11px] text-gray-600">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

