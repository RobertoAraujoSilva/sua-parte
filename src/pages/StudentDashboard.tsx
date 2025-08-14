import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import DonationCard from "@/components/DonationCard";
import { StudentAssignmentView } from "@/components/StudentAssignmentView";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

const StudentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  // State for real student data
  const [estudante, setEstudante] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Load student data from database
  const loadStudent = async () => {
    if (!id) {
      setStudentError(t('ID do estudante não fornecido'));
      setLoadingStudent(false);
      return;
    }

    try {
      setLoadingStudent(true);
      setStudentError(null);

      console.log('👤 Loading student data for ID:', id);

      const { data, error } = await supabase
        .from('estudantes')
        .select(`
          id,
          nome,
          email,
          telefone,
          data_nascimento,
          genero,
          cargo,
          batizado,
          ativo,
          qualificacoes,
          created_at
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error loading student:', error);
        setStudentError(`${t('Erro ao carregar dados do estudante:')} ${error.message}`);
        return;
      }

      if (!data) {
        setStudentError(t('Estudante não encontrado'));
        return;
      }

      console.log('✅ Student loaded:', data);
      setEstudante(data);

    } catch (error) {
      console.error('❌ Exception loading student:', error);
      setStudentError(t('Erro inesperado ao carregar dados do estudante'));
    } finally {
      setLoadingStudent(false);
    }
  };

  // Load student data when component mounts
  useEffect(() => {
    loadStudent();
  }, [id]);

  const handleConfirmarParticipacao = async (designacaoId: string) => {
    try {
      const { error } = await supabase
        .from('designacoes')
        .update({ confirmado: true })
        .eq('id', designacaoId);

      if (error) {
        console.error('Error confirming assignment:', error);
        toast({
          title: t('Erro ao confirmar participação'),
          description: t('Ocorreu um erro ao registrar sua confirmação. Tente novamente.'),
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('Participação confirmada!'),
        description: t('Sua confirmação foi registrada com sucesso.'),
      });

      // Reload assignments to reflect the change
      // The StudentAssignmentView component will automatically update
      // since it's using real-time subscriptions
    } catch (error) {
      console.error('Exception confirming assignment:', error);
      toast({
        title: t('Erro inesperado'),
        description: t('Ocorreu um erro inesperado. Tente novamente.'),
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loadingStudent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Carregando dados do estudante...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (studentError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-700 mb-2">{t('Erro ao Carregar Dados')}</h2>
              <p className="text-red-600 mb-4">{studentError}</p>
              <Button
                variant="outline"
                onClick={loadStudent}
                className="mr-2"
              >
                {t('Tentar Novamente')}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                {t('Voltar')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Student not found
  if (!estudante) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-gray-400 mb-4">👤</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('Estudante Não Encontrado')}</h2>
              <p className="text-gray-600 mb-4">
                {t('Não foi possível encontrar os dados do estudante com ID:')} {id}
              </p>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                {t('Voltar')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-jw-navy text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{t('Portal do Estudante Title')}</h1>
            <p className="text-xl opacity-90">{t('Bem-vindo')}, {estudante.nome}</p>
            <p className="text-sm opacity-75">
              {estudante.cargo ? `${estudante.cargo}` : t('Estudante')}
              {estudante.batizado ? ` • ${t('Batizado')}` : ` • ${t('Não Batizado')}`}
            </p>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Minhas Designações */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-jw-navy mb-6">{t('Minhas Designações')}</h2>
            <StudentAssignmentView studentId={id || ''} showAllAssignments={false} />
          </section>

          {/* Doações */}
          <section className="mb-12">
            <DonationCard />
          </section>

          {/* Histórico */}
          <section>
            <h2 className="text-2xl font-bold text-jw-navy mb-6">{t('Histórico de Participação')}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-jw-blue mb-2">12</div>
                    <div className="text-sm text-gray-600">{t('Designações Cumpridas')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                    <div className="text-sm text-gray-600">{t('Taxa de Participação')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-jw-gold mb-2">6</div>
                    <div className="text-sm text-gray-600">{t('Meses Ativo')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
