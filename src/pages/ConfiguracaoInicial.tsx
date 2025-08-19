import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Building, 
  Settings,
  Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ConfiguracaoInicial = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    nome_completo: profile?.nome_completo || '',
    congregacao: profile?.congregacao || '',
    cargo: profile?.cargo || 'instrutor',
    email: profile?.email || '',
    preferences: {
      autoGenerateAssignments: true,
      emailNotifications: true,
      showTutorials: true
    }
  });

  const steps = [
    { id: 1, title: t('initialSetup.steps.personalInfo'), icon: User },
    { id: 2, title: t('initialSetup.steps.congregation'), icon: Building },
    { id: 3, title: t('initialSetup.steps.preferences'), icon: Settings }
  ];

  const cargos = [
    { value: 'anciao', label: t('initialSetup.roles.anciao') },
    { value: 'servo_ministerial', label: t('initialSetup.roles.servo_ministerial') },
    { value: 'instrutor', label: t('initialSetup.roles.instrutor') },
    { value: 'pioneiro_regular', label: t('initialSetup.roles.pioneiro_regular') },
    { value: 'publicador_batizado', label: t('initialSetup.roles.publicador_batizado') }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: checked
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    try {
      setSaving(true);

      // Update profile
      const { error } = await updateProfile({
        nome_completo: formData.nome_completo,
        congregacao: formData.congregacao,
        cargo: formData.cargo
      });

      if (error) throw error;

      // Save preferences (you might want to create a preferences table)
      // For now, we'll store in localStorage
      localStorage.setItem('user_preferences', JSON.stringify(formData.preferences));

      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');

      toast({
        title: t('configuracaoInicial.toast.success.title'),
        description: t('configuracaoInicial.toast.success.description'),
      });

      navigate('/primeiro-programa');

    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: t('configuracaoInicial.toast.error.title'),
        description: t('configuracaoInicial.toast.error.description'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.nome_completo.trim().length > 0;
      case 2:
        return formData.congregacao.trim().length > 0;
      case 3:
        return true; // Preferences are optional
      default:
        return false;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-blue/5 to-jw-gold/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-jw-navy mb-2">
              {t('initialSetup.title')}
            </h1>
            <p className="text-gray-600">
              {t('initialSetup.subtitle')}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isActive ? 'bg-jw-blue text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${
                      isActive ? 'text-jw-blue font-medium' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && t('initialSetup.stepDescriptions.personalInfo')}
                {currentStep === 2 && t('initialSetup.stepDescriptions.congregation')}
                {currentStep === 3 && t('initialSetup.stepDescriptions.preferences')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">{t('initialSetup.fields.fullName')} *</Label>
                    <Input
                      id="nome"
                      value={formData.nome_completo}
                      onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                      placeholder={t('initialSetup.fields.fullNamePlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t('initialSetup.fields.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('initialSetup.fields.emailPlaceholder')}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('initialSetup.fields.emailNote')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="cargo">{t('initialSetup.fields.role')}</Label>
                    <Select
                      value={formData.cargo}
                      onValueChange={(value) => handleInputChange('cargo', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('initialSetup.fields.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo.value} value={cargo.value}>
                            {cargo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Congregation */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="congregacao">{t('initialSetup.fields.congregationName')} *</Label>
                    <Input
                      id="congregacao"
                      value={formData.congregacao}
                      onChange={(e) => handleInputChange('congregacao', e.target.value)}
                      placeholder={t('initialSetup.fields.congregationPlaceholder')}
                      required
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t('initialSetup.fields.congregationNote')}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoGenerate"
                        checked={formData.preferences.autoGenerateAssignments}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('autoGenerateAssignments', checked as boolean)
                        }
                      />
                      <Label htmlFor="autoGenerate" className="text-sm">
                        {t('initialSetup.preferences.autoGenerate')}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={formData.preferences.emailNotifications}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('emailNotifications', checked as boolean)
                        }
                      />
                      <Label htmlFor="emailNotifications" className="text-sm">
                        {t('initialSetup.preferences.emailNotifications')}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showTutorials"
                        checked={formData.preferences.showTutorials}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('showTutorials', checked as boolean)
                        }
                      />
                      <Label htmlFor="showTutorials" className="text-sm">
                        {t('initialSetup.preferences.showTutorials')}
                      </Label>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t('initialSetup.preferences.note')}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('initialSetup.navigation.previous')}
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {t('initialSetup.navigation.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!isStepValid() || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {t('initialSetup.navigation.saving')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('initialSetup.navigation.finish')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ConfiguracaoInicial;
