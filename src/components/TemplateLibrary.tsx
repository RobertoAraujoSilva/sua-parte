import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Calendar, 
  Clock, 
  FileText, 
  Search,
  Filter,
  CheckCircle,
  Upload
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ExcelTemplateGenerator } from "@/utils/excelTemplateGenerator";
import { TutorialManager } from "@/components/TutorialManager";
import { TutorialIntegration } from "@/components/TutorialIntegration";
import { JWTerminologyHelper } from "@/components/JWTerminologyHelper";

interface TemplateProgram {
  id: string;
  semana: string;
  data_inicio_semana: string;
  template_status_enum: string;
  template_metadata: any;
  parsed_meeting_parts: any[];
  jw_org_content: string | null;
  created_at: string;
  developer_processed_at: string | null;
}

interface TemplateLibraryProps {
  onTemplateSelect?: (template: TemplateProgram) => void;
  onUploadSpreadsheet?: (file: File, templateId: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onTemplateSelect,
  onUploadSpreadsheet
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .eq('template_status_enum', 'published')
        .order('data_inicio_semana', { ascending: false });

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
        description: "Não foi possível carregar os templates disponíveis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (template: TemplateProgram) => {
    try {
      if (!template.parsed_meeting_parts || template.parsed_meeting_parts.length === 0) {
        toast({
          title: "Template Incompleto",
          description: "Este template não possui partes processadas.",
          variant: "destructive"
        });
        return;
      }

      // Reconstruct parsed content for template generation
      const parsedContent = {
        semana: template.semana,
        data_inicio: template.data_inicio_semana,
        data_fim: template.data_inicio_semana, // Same for now
        partes: template.parsed_meeting_parts,
        canticos: template.template_metadata?.canticos || {},
        leitura_biblica: template.template_metadata?.leitura_biblica,
        metadata: {
          data_processamento: template.developer_processed_at || template.created_at,
          total_partes: template.parsed_meeting_parts.length,
          tempo_total_minutos: template.template_metadata?.tempo_total || 0
        }
      };

      // Generate Excel template
      const templateBuffer = ExcelTemplateGenerator.generateTemplate(parsedContent, {
        includeInstructions: true,
        includeValidation: true,
        templateVersion: '1.0',
        congregationName: template.template_metadata?.congregation_name
      });

      // Create download
      const blob = new Blob([templateBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_${template.semana.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Track download
      if (user) {
        await supabase
          .from('template_downloads')
          .insert({
            programa_id: template.id,
            instructor_user_id: user.id,
            template_version: '1.0',
            download_metadata: {
              template_name: template.semana,
              download_method: 'library'
            }
          });
      }

      toast({
        title: "Template Baixado!",
        description: "Preencha o Excel e faça upload quando estiver pronto.",
      });

    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar o template. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, templateId: string) => {
    const file = event.target.files?.[0];
    if (file && onUploadSpreadsheet) {
      onUploadSpreadsheet(file, templateId);
    }
    // Reset input
    event.target.value = '';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.semana.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template_metadata?.leitura_biblica?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || template.template_status_enum === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.data_inicio_semana).getTime() - new Date(b.data_inicio_semana).getTime();
      case 'date_desc':
        return new Date(b.data_inicio_semana).getTime() - new Date(a.data_inicio_semana).getTime();
      case 'name_asc':
        return a.semana.localeCompare(b.semana);
      case 'name_desc':
        return b.semana.localeCompare(a.semana);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Tutorial Integration */}
      <TutorialIntegration
        page="template-library"
        showOnboarding={true}
        onboardingCompleted={localStorage.getItem('onboarding_completed') === 'true'}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-jw-navy">Biblioteca de Templates</h2>
          <p className="text-muted-foreground">
            Templates pré-processados prontos para download e preenchimento
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {templates.length} templates disponíveis
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por semana ou leitura bíblica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Data (mais recente)</SelectItem>
            <SelectItem value="date_asc">Data (mais antiga)</SelectItem>
            <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jw-blue mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        ) : sortedTemplates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm ? 'Nenhum template encontrado para sua busca.' : 'Nenhum template disponível ainda.'}
              </p>
              <p className="text-sm text-gray-500">
                Os templates serão disponibilizados pelos desenvolvedores.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.semana}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(template.data_inicio_semana).toLocaleDateString('pt-BR')}
                      </span>
                      {template.template_metadata?.leitura_biblica && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {template.template_metadata.leitura_biblica}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Disponível
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">Partes:</span><br />
                    {template.parsed_meeting_parts?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Tempo Total:</span><br />
                    {template.template_metadata?.tempo_total || 0} min
                  </div>
                  <div>
                    <span className="font-medium">Cânticos:</span><br />
                    {template.template_metadata?.canticos?.abertura || '?'}, {template.template_metadata?.canticos?.meio || '?'}, {template.template_metadata?.canticos?.encerramento || '?'}
                  </div>
                  <div>
                    <span className="font-medium">Processado:</span><br />
                    {template.developer_processed_at 
                      ? new Date(template.developer_processed_at).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleDownloadTemplate(template)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Template Excel
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload(e, template.id)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id={`upload-${template.id}`}
                    />
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Preenchido
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tutorial System */}
      <TutorialManager
        page="template-library"
        autoStart={false}
        showProgress={true}
      />

      {/* JW Terminology Helper */}
      <JWTerminologyHelper />
    </div>
  );
};
