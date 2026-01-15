import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { EstudanteWithParent } from "@/types/estudantes";
import { Database } from "@/integrations/supabase/types";

type EstadoCivil = Database["public"]["Enums"]["estado_civil_type"];
type PapelFamiliar = Database["public"]["Enums"]["papel_familiar_type"];

interface FamiliaData {
  familia: string;
  family_id: string;
  estado_civil: EstadoCivil | null;
  papel_familiar: PapelFamiliar | null;
  id_pai_mae: string;
  id_mae: string;
  id_conjuge: string;
  coabitacao: boolean;
  menor: boolean;
  responsavel_primario: string;
  responsavel_secundario: string;
  data_nascimento: string;
}

interface FamiliaSectionProps {
  data: FamiliaData;
  onChange: (field: keyof FamiliaData, value: string | boolean | null) => void;
  potentialParents: EstudanteWithParent[];
  potentialSpouses: EstudanteWithParent[];
  idade: number;
  genero: 'masculino' | 'feminino';
  disabled?: boolean;
}

const ESTADO_CIVIL_OPTIONS: { value: EstadoCivil; label: string }[] = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'separado', label: 'Separado(a)' },
];

const PAPEL_FAMILIAR_OPTIONS: { value: PapelFamiliar; label: string; icon: string }[] = [
  { value: 'pai', label: 'Pai', icon: '👨' },
  { value: 'mae', label: 'Mãe', icon: '👩' },
  { value: 'filho', label: 'Filho', icon: '👦' },
  { value: 'filha', label: 'Filha', icon: '👧' },
  { value: 'avo', label: 'Avô', icon: '👴' },
  { value: 'avo_f', label: 'Avó', icon: '👵' },
  { value: 'tio', label: 'Tio', icon: '👨' },
  { value: 'tia', label: 'Tia', icon: '👩' },
  { value: 'sobrinho', label: 'Sobrinho', icon: '👦' },
  { value: 'sobrinha', label: 'Sobrinha', icon: '👧' },
  { value: 'primo', label: 'Primo', icon: '👦' },
  { value: 'prima', label: 'Prima', icon: '👧' },
  { value: 'outro', label: 'Outro', icon: '👤' },
];

const FamiliaSection = ({ 
  data, 
  onChange, 
  potentialParents, 
  potentialSpouses,
  idade,
  genero,
  disabled = false 
}: FamiliaSectionProps) => {
  const { t } = useTranslation();
  const isMinor = idade < 18;
  const isCasado = data.estado_civil === 'casado';

  // Filter potential spouses by opposite gender
  const filteredSpouses = potentialSpouses.filter(s => s.genero !== genero);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          👨‍👩‍👧‍👦 Informações Familiares
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure os vínculos familiares e responsáveis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data de Nascimento */}
        <div className="space-y-2">
          <Label htmlFor="data_nascimento">Data de Nascimento</Label>
          <Input
            id="data_nascimento"
            type="date"
            value={data.data_nascimento || ''}
            onChange={(e) => onChange('data_nascimento', e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Estado Civil e Papel Familiar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estado_civil">Estado Civil</Label>
            <Select 
              value={data.estado_civil || ''} 
              onValueChange={(value) => onChange('estado_civil', value as EstadoCivil)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_CIVIL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="papel_familiar">Papel na Família</Label>
            <Select 
              value={data.papel_familiar || ''} 
              onValueChange={(value) => onChange('papel_familiar', value as PapelFamiliar)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {PAPEL_FAMILIAR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nome da Família e ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="familia">Nome da Família</Label>
            <Input
              id="familia"
              value={data.familia || ''}
              onChange={(e) => onChange('familia', e.target.value)}
              placeholder="Ex: Família Silva"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Usado para agrupar membros da mesma família
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="family_id">ID da Família</Label>
            <Input
              id="family_id"
              value={data.family_id || ''}
              onChange={(e) => onChange('family_id', e.target.value)}
              placeholder="familia-silva-001"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Identificador único para vincular familiares
            </p>
          </div>
        </div>

        {/* Cônjuge - só aparece se casado */}
        {isCasado && (
          <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
            <Label htmlFor="id_conjuge" className="flex items-center gap-2">
              💍 Cônjuge
              <Badge variant="outline" className="text-xs">Casado(a)</Badge>
            </Label>
            <Select 
              value={data.id_conjuge || ''} 
              onValueChange={(value) => onChange('id_conjuge', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cônjuge..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum selecionado</SelectItem>
                {filteredSpouses.map((spouse) => (
                  <SelectItem key={spouse.id} value={spouse.id}>
                    {spouse.nome} ({spouse.idade} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_pai_mae">Pai</Label>
            <Select 
              value={data.id_pai_mae || ''} 
              onValueChange={(value) => onChange('id_pai_mae', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o pai..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum selecionado</SelectItem>
                {potentialParents.filter(p => p.genero === 'masculino').map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.nome} ({parent.idade} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_mae">Mãe</Label>
            <Select 
              value={data.id_mae || ''} 
              onValueChange={(value) => onChange('id_mae', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a mãe..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum selecionado</SelectItem>
                {potentialParents.filter(p => p.genero === 'feminino').map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.nome} ({parent.idade} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responsáveis - aparece para menores */}
        {isMinor && (
          <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                👶 Menor de Idade
              </Badge>
              <span className="text-sm text-muted-foreground">
                Responsáveis obrigatórios
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel_primario">Responsável Primário *</Label>
                <Select 
                  value={data.responsavel_primario || ''} 
                  onValueChange={(value) => onChange('responsavel_primario', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Obrigatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum selecionado</SelectItem>
                    {potentialParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.nome} ({parent.idade} anos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel_secundario">Responsável Secundário</Label>
                <Select 
                  value={data.responsavel_secundario || ''} 
                  onValueChange={(value) => onChange('responsavel_secundario', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum selecionado</SelectItem>
                    {potentialParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.nome} ({parent.idade} anos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Coabitação e Menor */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="coabitacao"
              checked={data.coabitacao}
              onCheckedChange={(checked) => onChange('coabitacao', checked)}
              disabled={disabled}
            />
            <Label htmlFor="coabitacao" className="flex items-center gap-2">
              🏠 Coabitação
              <span className="text-xs text-muted-foreground">
                (mora com a família)
              </span>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="menor"
              checked={data.menor}
              onCheckedChange={(checked) => onChange('menor', checked)}
              disabled={disabled}
            />
            <Label htmlFor="menor" className="flex items-center gap-2">
              👶 Menor de idade
              <span className="text-xs text-muted-foreground">
                (menos de 18 anos)
              </span>
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamiliaSection;
