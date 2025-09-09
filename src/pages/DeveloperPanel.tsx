import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Users,
  BarChart3,
  Settings,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { JWOrgContentParser, ParsedJWContent } from "@/utils/jwOrgContentParser";
import { ExcelTemplateGenerator } from "@/utils/excelTemplateGenerator";
import { TutorialManager } from "@/components/TutorialManager";
import { JWTerminologyHelper } from "@/components/JWTerminologyHelper";
import { TutorialIntegration } from "@/components/TutorialIntegration";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProgramTemplate {
  id: string;
  semana: string;
  data_inicio_semana: string;
  template_status_enum: string;
  developer_processed_at: string | null;
  template_metadata: any;
  jw_org_content: string | null;
  parsed_meeting_parts: any[];
  processing_notes: string | null;
  created_at: string;
}

const DeveloperPanel = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("process");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  
  // Processing form state
  const [jwContent, setJwContent] = useState("");
  const [weekInfo, setWeekInfo] = useState({ start: "", end: "" });
  const [congregationName, setCongregationName] = useState("");
  const [processingNotes, setProcessingNotes] = useState("");
  const [parsedContent, setParsedContent] = useState<ParsedJWContent | null>(null);

  // Check if user has developer role
  useEffect(() => {
    if (profile && profile.role !== 'developer') {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar o painel de desenvolvedor.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Load existing templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .not('template_status_enum', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(
        (data || []).map((tpl: any) => ({
          ...tpl,
          parsed_meeting_parts: Array.isArray(tpl.parsed_meeting_parts)
            ? tpl.parsed_meeting_parts
            : (typeof tpl.parsed_meeting_parts === 'string'
                ? (() => { try { return JSON.parse(tpl.parsed_meeting_parts); } catch { return []; } })()
                : [])
        }))
      );

    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Erro ao Carregar Templates",
        description: "Não foi possível carregar os templates existentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParseContent = () => {
    if (!jwContent.trim()) {
      toast({
        title: "Conteúdo Necessário",
        description: "Cole o conteúdo da apostila JW.org para processar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsed = JWOrgContentParser.parseContent(jwContent, weekInfo);
      const validation = JWOrgContentParser.validateParsedContent(parsed);
      
      if (!validation.isValid) {
        toast({
          title: "Conteúdo Inválido",
          description: `Problemas encontrados: ${validation.errors.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      setParsedContent(parsed);
      toast({
        title: "Conteúdo Processado!",
        description: `${parsed.partes.length} partes identificadas com sucesso.`,
      });

    } catch (error) {
      console.error('Error parsing content:', error);
      toast({
        title: "Erro no Processamento",
        description: "Não foi possível processar o conteúdo. Verifique o formato.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateTemplate = async () => {
    if (!parsedContent) {
      toast({
        title: "Processamento Necessário",
        description: "Processe o conteúdo antes de gerar o template.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Generate Excel template
      const templateBuffer = ExcelTemplateGenerator.generateTemplate(parsedContent, {
        includeInstructions: true,
        includeValidation: true,
        templateVersion: '1.0',
        congregationName: congregationName || undefined
      });

      // Create blob and download URL
      const blob = new Blob([templateBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const downloadUrl = URL.createObjectURL(blob);

      // Save to database
      const { data, error } = await supabase
        .from('programas')
        .insert({
          arquivo: `template_${parsedContent.semana.replace(/\s+/g, '_')}.xlsx`,
          data_inicio_semana: parsedContent.data_inicio,
          partes: parsedContent.partes.map(p => p.titulo_parte),
          semana: parsedContent.semana,
          user_id: profile?.id || '',
          template_status_enum: 'template_ready',
          developer_processed_at: new Date().toISOString(),
          developer_user_id: profile?.id || '',
          template_download_url: downloadUrl,
          template_metadata: {
            total_partes: parsedContent.partes.length,
            tempo_total: parsedContent.metadata.tempo_total_minutos,
            canticos: parsedContent.canticos,
            leitura_biblica: parsedContent.leitura_biblica,
            template_version: '1.0',
            congregation_name: congregationName
          },
          jw_org_content: jwContent,
          parsed_meeting_parts: JSON.parse(JSON.stringify(parsedContent.partes)),
          processing_notes: processingNotes,
          assignment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Download the template
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `template_${parsedContent.semana.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Template Gerado!",
        description: "Template Excel criado e salvo com sucesso.",
      });

      // Reset form
      setJwContent("");
      setParsedContent(null);
      setProcessingNotes("");
      
      // Reload templates
      loadTemplates();

    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar o template. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('programas')
        .update({ 
          template_status_enum: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Publicado!",
        description: "Template está agora disponível para instrutores.",
      });

      loadTemplates();

    } catch (error) {
      console.error('Error publishing template:', error);
      toast({
        title: "Erro na Publicação",
        description: "Não foi possível publicar o template.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      'processing': { label: 'Processando', variant: 'default' as const, icon: RefreshCw },
      'template_ready': { label: 'Template Pronto', variant: 'outline' as const, icon: FileText },
      'published': { label: 'Publicado', variant: 'default' as const, icon: CheckCircle },
      'archived': { label: 'Arquivado', variant: 'secondary' as const, icon: Trash2 }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (profile?.role !== 'developer') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-jw-navy mb-2">
            Painel de Desenvolvedor
          </h1>
          <p className="text-muted-foreground">
            Processamento de apostilas JW.org e geração de templates para instrutores
          </p>
        </div>

        {/* Tutorial Integration */}
        <TutorialIntegration
          page="developer-panel"
          showOnboarding={true}
          onboardingCompleted={localStorage.getItem('onboarding_completed') === 'true'}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="process">Processar Conteúdo</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Process Content Tab */}
          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Processar Apostila JW.org
                </CardTitle>
                <CardDescription>
                  Cole o conteúdo da apostila "Nossa Vida e Ministério Cristão" do JW.org
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weekStart">Data de Início</Label>
                    <Input
                      id="weekStart"
                      type="date"
                      value={weekInfo.start}
                      onChange={(e) => setWeekInfo(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekEnd">Data de Fim</Label>
                    <Input
                      id="weekEnd"
                      type="date"
                      value={weekInfo.end}
                      onChange={(e) => setWeekInfo(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="congregation">Nome da Congregação (opcional)</Label>
                  <Input
                    id="congregation"
                    value={congregationName}
                    onChange={(e) => setCongregationName(e.target.value)}
                    placeholder="Ex: Congregação Central"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo da Apostila JW.org</Label>
                  <Textarea
                    id="content"
                    value={jwContent}
                    onChange={(e) => setJwContent(e.target.value)}
                    placeholder="Cole aqui o conteúdo completo da página da apostila do JW.org..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleParseContent} disabled={loading}>
                    <Eye className="w-4 h-4 mr-2" />
                    Processar Conteúdo
                  </Button>
                  
                  {parsedContent && (
                    <Button onClick={handleGenerateTemplate} disabled={loading}>
                      <Download className="w-4 h-4 mr-2" />
                      Gerar Template Excel
                    </Button>
                  )}
                </div>

                {parsedContent && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Processamento concluído!</strong><br />
                      Semana: {parsedContent.semana}<br />
                      Partes identificadas: {parsedContent.partes.length}<br />
                      Tempo total: {parsedContent.metadata.tempo_total_minutos} minutos
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="notes">Notas de Processamento (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={processingNotes}
                    onChange={(e) => setProcessingNotes(e.target.value)}
                    placeholder="Adicione notas sobre o processamento, observações especiais, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Templates Processados</h2>
              <Button onClick={loadTemplates} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.semana}</CardTitle>
                        <CardDescription>
                          Data: {new Date(template.data_inicio_semana).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(template.template_status_enum)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Partes:</span><br />
                        {template.parsed_meeting_parts?.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Tempo Total:</span><br />
                        {template.template_metadata?.tempo_total || 0} min
                      </div>
                      <div>
                        <span className="font-medium">Processado:</span><br />
                        {template.developer_processed_at 
                          ? new Date(template.developer_processed_at).toLocaleDateString('pt-BR')
                          : 'Não processado'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Ações:</span><br />
                        <div className="flex gap-1 mt-1">
                          {template.template_status_enum === 'template_ready' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePublishTemplate(template.id)}
                            >
                              Publicar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {template.processing_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm">Notas:</span>
                        <p className="text-sm text-gray-600 mt-1">{template.processing_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {templates.length === 0 && !loading && (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum template processado ainda.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates Processados</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{templates.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de templates criados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publicados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {templates.filter(t => t.template_status_enum === 'published').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Disponíveis para instrutores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {templates.filter(t => t.template_status_enum === 'template_ready').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando publicação
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Tutorial System */}
      <TutorialManager
        page="developer-panel"
        autoStart={false}
        showProgress={true}
      />

      {/* JW Terminology Helper */}
      <JWTerminologyHelper />
    </div>
  );
};

export default DeveloperPanel;
