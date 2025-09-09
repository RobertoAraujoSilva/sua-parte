import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Save, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  EstudanteFormData,
  EstudanteWithParent,
  Cargo,
  Genero,
  CARGO_LABELS,
  GENERO_LABELS,
  validateEstudante,
  getQualificacoes,
  isMinor,
} from "@/types/estudantes";

interface EstudanteFormProps {
  estudante?: EstudanteWithParent;
  potentialParents: EstudanteWithParent[];
  onSubmit: (data: EstudanteFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const EstudanteForm = ({ estudante, potentialParents, onSubmit, onCancel, loading = false }: EstudanteFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EstudanteFormData>({
    nome: "",
    idade: 18,
    genero: "masculino",
    email: "",
    telefone: "",
    data_batismo: "",
    cargo: "publicador_batizado",
    id_pai_mae: "",
    ativo: true,
    observacoes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qualificacoes, setQualificacoes] = useState<string[]>([]);

  // Initialize form with existing student data
  useEffect(() => {
    if (estudante) {
      setFormData({
        nome: estudante.nome,
        idade: estudante.idade || 18,
        genero: estudante.genero,
        email: estudante.email || "",
        telefone: estudante.telefone || "",
        data_batismo: estudante.data_batismo || "",
        cargo: estudante.cargo,
        id_pai_mae: estudante.id_pai_mae || "",
        ativo: estudante.ativo ?? true,
        observacoes: estudante.observacoes || "",
      });
    }
  }, [estudante]);

  // Update qualifications when cargo, genero, or idade changes
  useEffect(() => {
    const newQualificacoes = getQualificacoes(formData.cargo, formData.genero, formData.idade);
    setQualificacoes(newQualificacoes);
  }, [formData.cargo, formData.genero, formData.idade]);

  const handleInputChange = (field: keyof EstudanteFormData, value: string | number | boolean | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateEstudante(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit form
    const success = await onSubmit(formData);
    if (success) {
      // Reset form if creating new student
      if (!estudante) {
        setFormData({
          nome: "",
          idade: 18,
          genero: "masculino",
          email: "",
          telefone: "",
          data_batismo: "",
          cargo: "publicador_batizado",
          id_pai_mae: "",
          ativo: true,
          observacoes: "",
        });
      }
    }
  };

  const isEditing = !!estudante;
  const showParentField = isMinor(formData.idade);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          {isEditing ? `${t('common.edit')} ${t('navigation.students')}` : t('students.newStudent')}
        </CardTitle>
        <CardDescription>
          {t('students.subtitle')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">{t('auth.fullName')} *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder={t('auth.fullNamePlaceholder')}
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idade">{t('common.age')} *</Label>
              <Input
                id="idade"
                type="number"
                min="1"
                max="120"
                value={formData.idade}
                onChange={(e) => handleInputChange("idade", parseInt(e.target.value) || 0)}
                className={errors.idade ? "border-red-500" : ""}
              />
              {errors.idade && <p className="text-sm text-red-500">{errors.idade}</p>}
            </div>
          </div>

          {/* Gender and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genero">{t('common.gender')} *</Label>
              <Select value={formData.genero} onValueChange={(value: Genero) => handleInputChange("genero", value)}>
                <SelectTrigger className={errors.genero ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">{t('students.genders.male')}</SelectItem>
                  <SelectItem value="feminino">{t('students.genders.female')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && <p className="text-sm text-red-500">{errors.genero}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">{t('common.role')} *</Label>
              <Select value={formData.cargo} onValueChange={(value: Cargo) => handleInputChange("cargo", value)}>
                <SelectTrigger className={errors.cargo ? "border-red-500" : ""}>
                  <SelectValue placeholder={t('auth.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CARGO_LABELS).map(([value]) => (
                    <SelectItem key={value} value={value}>
                      {t(`terms.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cargo && <p className="text-sm text-red-500">{errors.cargo}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t('initialSetup.fields.emailPlaceholder')}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">{t('common.phone')}</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                placeholder={t('(11) 99999-9999')}
                className={errors.telefone ? "border-red-500" : ""}
              />
              {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
            </div>
          </div>

          {/* Baptism Date */}
          <div className="space-y-2">
            <Label htmlFor="data_batismo">{t('students.baptizedOn')}</Label>
            <Input
              id="data_batismo"
              type="date"
              value={formData.data_batismo}
              onChange={(e) => handleInputChange("data_batismo", e.target.value)}
            />
          </div>

          {/* Parent/Guardian for minors */}
          {showParentField && (
            <div className="space-y-2">
              <Label htmlFor="id_pai_mae">{t('students.responsible')} *</Label>
              <Select value={formData.id_pai_mae} onValueChange={(value) => handleInputChange("id_pai_mae", value)}>
                <SelectTrigger className={errors.id_pai_mae ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {potentialParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.nome} ({parent.idade} anos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_pai_mae && <p className="text-sm text-red-500">{errors.id_pai_mae}</p>}
              <p className="text-sm text-gray-500">
                {t('students.minor')}: {t('students.responsible')}
              </p>
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">{t('common.active')}</Label>
          </div>

          {/* Qualifications Display */}
          <div className="space-y-2">
            <Label>{t('students.qualifications')}</Label>
            <div className="flex flex-wrap gap-2">
              {qualificacoes.map((qual) => (
                <Badge key={qual} variant="outline">
                  {qual}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {t('forms.pleaseWait')}
            </p>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">{t('students.observations')}</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder={t('students.observations')}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('common.saving') : t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EstudanteForm;
