import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, User, Users, ClipboardList } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  EstudanteFormData,
  EstudanteWithParent,
  Cargo,
  Genero,
  CARGO_LABELS,
  validateEstudante,
  isMinor,
} from "@/types/estudantes";
import { S38QualificacoesSection } from "@/components/estudantes";
import FamiliaSection from "@/components/estudantes/FamiliaSection";

interface EstudanteFormProps {
  estudante?: EstudanteWithParent;
  potentialParents: EstudanteWithParent[];
  onSubmit: (data: EstudanteFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const EstudanteForm = ({ estudante, potentialParents, onSubmit, onCancel, loading = false }: EstudanteFormProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("basico");
  const [formData, setFormData] = useState<EstudanteFormData>({
    // Basic Info
    nome: "",
    idade: 18,
    genero: "masculino",
    email: "",
    telefone: "",
    data_batismo: "",
    cargo: "publicador_batizado",
    ativo: true,
    observacoes: "",
    // Family Info
    familia: "",
    family_id: "",
    estado_civil: null,
    papel_familiar: null,
    id_pai_mae: "",
    id_mae: "",
    id_conjuge: "",
    coabitacao: true,
    menor: false,
    responsavel_primario: "",
    responsavel_secundario: "",
    data_nascimento: "",
    // S-38 Qualifications
    q_chairman: false,
    q_pray: false,
    q_treasures: false,
    q_gems: false,
    q_reading: false,
    q_starting: false,
    q_following: false,
    q_making: false,
    q_explaining: false,
    q_talk: false,
    q_living: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        ativo: estudante.ativo ?? true,
        observacoes: estudante.observacoes || "",
        // Family Info
        familia: estudante.familia || "",
        family_id: estudante.family_id || "",
        estado_civil: estudante.estado_civil as EstudanteFormData['estado_civil'] || null,
        papel_familiar: estudante.papel_familiar as EstudanteFormData['papel_familiar'] || null,
        id_pai_mae: estudante.id_pai_mae || "",
        id_mae: estudante.id_mae || "",
        id_conjuge: estudante.id_conjuge || "",
        coabitacao: estudante.coabitacao ?? true,
        menor: estudante.menor ?? false,
        responsavel_primario: estudante.responsavel_primario || "",
        responsavel_secundario: estudante.responsavel_secundario || "",
        data_nascimento: estudante.data_nascimento || "",
        // S-38 Qualifications
        q_chairman: estudante.q_chairman ?? false,
        q_pray: estudante.q_pray ?? false,
        q_treasures: estudante.q_treasures ?? false,
        q_gems: estudante.q_gems ?? false,
        q_reading: estudante.q_reading ?? false,
        q_starting: estudante.q_starting ?? false,
        q_following: estudante.q_following ?? false,
        q_making: estudante.q_making ?? false,
        q_explaining: estudante.q_explaining ?? false,
        q_talk: estudante.q_talk ?? false,
        q_living: estudante.q_living ?? false,
      });
    }
  }, [estudante]);

  // Auto-update menor status based on age
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      menor: prev.idade < 18
    }));
  }, [formData.idade]);

  const handleInputChange = (field: keyof EstudanteFormData, value: string | number | boolean | null) => {
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
      // Switch to tab with errors
      if (validationErrors.nome || validationErrors.idade || validationErrors.genero || validationErrors.cargo) {
        setActiveTab("basico");
      } else if (validationErrors.id_pai_mae || validationErrors.responsavel_primario) {
        setActiveTab("familia");
      }
      return;
    }

    // Submit form
    const success = await onSubmit(formData);
    if (success && !estudante) {
      // Reset form if creating new student
      setFormData({
        nome: "",
        idade: 18,
        genero: "masculino",
        email: "",
        telefone: "",
        data_batismo: "",
        cargo: "publicador_batizado",
        ativo: true,
        observacoes: "",
        familia: "",
        family_id: "",
        estado_civil: null,
        papel_familiar: null,
        id_pai_mae: "",
        id_mae: "",
        id_conjuge: "",
        coabitacao: true,
        menor: false,
        responsavel_primario: "",
        responsavel_secundario: "",
        data_nascimento: "",
        q_chairman: false,
        q_pray: false,
        q_treasures: false,
        q_gems: false,
        q_reading: false,
        q_starting: false,
        q_following: false,
        q_making: false,
        q_explaining: false,
        q_talk: false,
        q_living: false,
      });
      setActiveTab("basico");
    }
  };

  const isEditing = !!estudante;

  return (
    <Card className="w-full max-w-4xl mx-auto">
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados Básicos
              </TabsTrigger>
              <TabsTrigger value="familia" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Família
              </TabsTrigger>
              <TabsTrigger value="qualificacoes" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Qualificações S-38
              </TabsTrigger>
            </TabsList>

            {/* Tab: Dados Básicos */}
            <TabsContent value="basico" className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">{t('auth.fullName')} *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
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
                    className={errors.idade ? "border-destructive" : ""}
                  />
                  {errors.idade && <p className="text-sm text-destructive">{errors.idade}</p>}
                </div>
              </div>

              {/* Gender and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genero">{t('common.gender')} *</Label>
                  <Select value={formData.genero} onValueChange={(value: Genero) => handleInputChange("genero", value)}>
                    <SelectTrigger className={errors.genero ? "border-destructive" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">{t('students.genders.male')}</SelectItem>
                      <SelectItem value="feminino">{t('students.genders.female')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.genero && <p className="text-sm text-destructive">{errors.genero}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">{t('common.role')} *</Label>
                  <Select value={formData.cargo} onValueChange={(value: Cargo) => handleInputChange("cargo", value)}>
                    <SelectTrigger className={errors.cargo ? "border-destructive" : ""}>
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
                  {errors.cargo && <p className="text-sm text-destructive">{errors.cargo}</p>}
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
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">{t('common.phone')}</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={errors.telefone ? "border-destructive" : ""}
                  />
                  {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
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

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleInputChange("ativo", checked)}
                />
                <Label htmlFor="ativo">{t('common.active')}</Label>
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
            </TabsContent>

            {/* Tab: Família */}
            <TabsContent value="familia" className="mt-6">
              <FamiliaSection
                data={{
                  familia: formData.familia || "",
                  family_id: formData.family_id || "",
                  estado_civil: formData.estado_civil || null,
                  papel_familiar: formData.papel_familiar || null,
                  id_pai_mae: formData.id_pai_mae || "",
                  id_mae: formData.id_mae || "",
                  id_conjuge: formData.id_conjuge || "",
                  coabitacao: formData.coabitacao ?? true,
                  menor: formData.menor ?? false,
                  responsavel_primario: formData.responsavel_primario || "",
                  responsavel_secundario: formData.responsavel_secundario || "",
                  data_nascimento: formData.data_nascimento || "",
                }}
                onChange={(field, value) => handleInputChange(field, value)}
                potentialParents={potentialParents}
                potentialSpouses={potentialParents}
                idade={formData.idade}
                genero={formData.genero}
                disabled={loading}
              />
              {errors.id_pai_mae && (
                <p className="text-sm text-destructive mt-2">{errors.id_pai_mae}</p>
              )}
              {errors.responsavel_primario && (
                <p className="text-sm text-destructive mt-2">{errors.responsavel_primario}</p>
              )}
            </TabsContent>

            {/* Tab: Qualificações S-38 */}
            <TabsContent value="qualificacoes" className="mt-6">
              <S38QualificacoesSection
                qualificacoes={{
                  q_chairman: formData.q_chairman ?? false,
                  q_pray: formData.q_pray ?? false,
                  q_treasures: formData.q_treasures ?? false,
                  q_gems: formData.q_gems ?? false,
                  q_reading: formData.q_reading ?? false,
                  q_starting: formData.q_starting ?? false,
                  q_following: formData.q_following ?? false,
                  q_making: formData.q_making ?? false,
                  q_explaining: formData.q_explaining ?? false,
                  q_talk: formData.q_talk ?? false,
                  q_living: formData.q_living ?? false,
                }}
                onChange={(field, value) => handleInputChange(field, value)}
                genero={formData.genero}
                cargo={formData.cargo}
                disabled={loading}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
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
