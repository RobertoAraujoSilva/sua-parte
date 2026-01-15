import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { Cargo, Genero } from "@/types/estudantes";

interface S38Qualificacoes {
  q_chairman: boolean;
  q_pray: boolean;
  q_treasures: boolean;
  q_gems: boolean;
  q_reading: boolean;
  q_starting: boolean;
  q_following: boolean;
  q_making: boolean;
  q_explaining: boolean;
  q_talk: boolean;
  q_living: boolean;
}

interface S38QualificacoesSectionProps {
  qualificacoes: S38Qualificacoes;
  onChange: (field: keyof S38Qualificacoes, value: boolean) => void;
  genero: Genero;
  cargo: Cargo;
  disabled?: boolean;
}

// S-38 qualification definitions with restrictions
const QUALIFICACOES_CONFIG = [
  { 
    key: 'q_chairman' as const, 
    label: 'Presidente', 
    description: 'Presidir reuniões',
    restrictedTo: ['anciao', 'servo_ministerial'] as Cargo[],
    genderRestriction: 'masculino' as Genero | null
  },
  { 
    key: 'q_pray' as const, 
    label: 'Oração', 
    description: 'Fazer orações públicas',
    restrictedTo: null,
    genderRestriction: 'masculino' as Genero | null
  },
  { 
    key: 'q_treasures' as const, 
    label: 'Tesouros da Palavra', 
    description: 'Apresentar Tesouros da Palavra de Deus',
    restrictedTo: ['anciao', 'servo_ministerial'] as Cargo[],
    genderRestriction: 'masculino' as Genero | null
  },
  { 
    key: 'q_gems' as const, 
    label: 'Joias Espirituais', 
    description: 'Conduzir Joias Espirituais',
    restrictedTo: ['anciao', 'servo_ministerial'] as Cargo[],
    genderRestriction: 'masculino' as Genero | null
  },
  { 
    key: 'q_reading' as const, 
    label: 'Leitura da Bíblia', 
    description: 'Fazer leitura bíblica pública',
    restrictedTo: null,
    genderRestriction: 'masculino' as Genero | null
  },
  { 
    key: 'q_starting' as const, 
    label: 'Iniciando Conversas', 
    description: 'Participar em Iniciando Conversas',
    restrictedTo: null,
    genderRestriction: null
  },
  { 
    key: 'q_following' as const, 
    label: 'Cultivando o Interesse', 
    description: 'Participar em Cultivando o Interesse',
    restrictedTo: null,
    genderRestriction: null
  },
  { 
    key: 'q_making' as const, 
    label: 'Fazendo Discípulos', 
    description: 'Participar em Fazendo Discípulos',
    restrictedTo: null,
    genderRestriction: null
  },
  { 
    key: 'q_explaining' as const, 
    label: 'Explicando Suas Crenças', 
    description: 'Apresentar Explicando Suas Crenças',
    restrictedTo: null,
    genderRestriction: null
  },
  { 
    key: 'q_talk' as const, 
    label: 'Discurso', 
    description: 'Proferir discursos',
    restrictedTo: null,
    genderRestriction: 'masculino' as Genero | null
  },
  { 
    key: 'q_living' as const, 
    label: 'Nossa Vida Cristã', 
    description: 'Partes de Nossa Vida Cristã',
    restrictedTo: ['anciao', 'servo_ministerial'] as Cargo[],
    genderRestriction: 'masculino' as Genero | null
  },
];

const S38QualificacoesSection = ({ 
  qualificacoes, 
  onChange, 
  genero, 
  cargo,
  disabled = false 
}: S38QualificacoesSectionProps) => {
  const { t } = useTranslation();

  const isQualificationAllowed = (config: typeof QUALIFICACOES_CONFIG[0]) => {
    // Check gender restriction
    if (config.genderRestriction && genero !== config.genderRestriction) {
      return false;
    }
    // Check cargo restriction
    if (config.restrictedTo && !config.restrictedTo.includes(cargo)) {
      return false;
    }
    return true;
  };

  // Group qualifications by section
  const sections = [
    {
      title: 'Reunião - Partes Principais',
      icon: '🎤',
      items: QUALIFICACOES_CONFIG.filter(q => 
        ['q_chairman', 'q_pray', 'q_treasures', 'q_gems'].includes(q.key)
      )
    },
    {
      title: 'Ministério - Faça Seu Melhor',
      icon: '📖',
      items: QUALIFICACOES_CONFIG.filter(q => 
        ['q_reading', 'q_starting', 'q_following', 'q_making', 'q_explaining', 'q_talk'].includes(q.key)
      )
    },
    {
      title: 'Vida Cristã',
      icon: '💡',
      items: QUALIFICACOES_CONFIG.filter(q => 
        ['q_living'].includes(q.key)
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📋 Qualificações S-38
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Marque as partes que este estudante está qualificado a realizar
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <span>{section.icon}</span>
              {section.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map((config) => {
                const isAllowed = isQualificationAllowed(config);
                const isChecked = qualificacoes[config.key];
                
                return (
                  <div 
                    key={config.key}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                      !isAllowed 
                        ? 'bg-muted/50 opacity-60' 
                        : isChecked 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'hover:bg-accent'
                    }`}
                  >
                    <Checkbox
                      id={config.key}
                      checked={isChecked}
                      onCheckedChange={(checked) => onChange(config.key, checked as boolean)}
                      disabled={disabled || !isAllowed}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <Label 
                        htmlFor={config.key} 
                        className={`text-sm font-medium cursor-pointer ${!isAllowed ? 'cursor-not-allowed' : ''}`}
                      >
                        {config.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                      {!isAllowed && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {config.genderRestriction === 'masculino' && genero === 'feminino' 
                            ? 'Apenas homens' 
                            : config.restrictedTo 
                              ? `Requer: ${config.restrictedTo.map(c => t(`terms.${c}`)).join(' ou ')}`
                              : 'Não permitido'
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Dica:</strong> As qualificações são baseadas nas regras do documento S-38. 
            Algumas opções ficam desabilitadas com base no gênero e cargo do estudante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default S38QualificacoesSection;
