import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Calendar, BookOpen, Users, Award, ArrowLeft, User, LogOut } from 'lucide-react';

const EstudantePortal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, loading, isEstudante, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Check if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if the user is accessing their own portal
    if (user.id !== id) {
      navigate('/auth');
      return;
    }

    // Check if user is a student (use profile if available, otherwise metadata)
    const userRole = profile?.role || user.user_metadata?.role;
    if (userRole !== 'estudante') {
      navigate('/auth');
      return;
    }

    setIsAuthorized(true);
  }, [user, profile, isEstudante, loading, id, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao sair. Tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sessão encerrada",
          description: "Você foi desconectado com sucesso.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao sair. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando portal do estudante...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Get profile data or fallback to user metadata
  const displayProfile = profile || {
    nome_completo: user?.user_metadata?.nome_completo || 'Estudante',
    congregacao: user?.user_metadata?.congregacao || 'Congregação',
    cargo: user?.user_metadata?.cargo || 'publicador_nao_batizado',
    role: 'estudante' as const,
    date_of_birth: user?.user_metadata?.date_of_birth || null
  };

  // Function to calculate age from birth date
  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Function to format birth date for display
  const formatBirthDate = (birthDate: string | null): string => {
    if (!birthDate) return 'Não informado';

    const date = new Date(birthDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleDisplayName = (cargo: string | null) => {
    const roleMap: { [key: string]: string } = {
      'anciao': 'Ancião',
      'servo_ministerial': 'Servo Ministerial',
      'pioneiro_regular': 'Pioneiro Regular',
      'publicador_batizado': 'Publicador Batizado',
      'publicador_nao_batizado': 'Publicador Não Batizado',
      'estudante_novo': 'Estudante Novo'
    };
    return roleMap[cargo || ''] || cargo || 'Não especificado';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-navy via-jw-navy to-jw-blue">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-jw-navy hover:text-jw-blue"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-jw-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <h1 className="text-xl font-semibold text-jw-navy">Portal do Estudante</h1>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-jw-navy font-medium">
                {displayProfile.nome_completo}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-jw-navy hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-jw-blue rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-jw-navy">
                    Bem-vindo, {displayProfile.nome_completo}!
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {displayProfile.congregacao} • {getRoleDisplayName(displayProfile.cargo)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-jw-blue/10 text-jw-blue">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Escola do Ministério Teocrático
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Award className="h-3 w-3 mr-1" />
                    Estudante Ativo
                  </Badge>
                </div>

                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-700 mb-2">Informações Pessoais</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Data de Nascimento:</span>
                      <span className="ml-2 font-medium">{formatBirthDate(displayProfile.date_of_birth)}</span>
                    </div>
                    {displayProfile.date_of_birth && (
                      <div>
                        <span className="text-gray-600">Idade:</span>
                        <span className="ml-2 font-medium">{calculateAge(displayProfile.date_of_birth)} anos</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Congregação:</span>
                      <span className="ml-2 font-medium">{displayProfile.congregacao}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cargo:</span>
                      <span className="ml-2 font-medium">{getRoleDisplayName(displayProfile.cargo)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Meeting Information */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-jw-navy">
                <BookOpen className="h-5 w-5 mr-2" />
                Nossa Vida e Ministério Cristão
              </CardTitle>
              <CardDescription>
                Informações sobre a reunião da Escola do Ministério Teocrático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Tesouros da Palavra de Deus</span>
                  <Badge variant="outline">10 min</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Faça Seu Melhor no Ministério</span>
                  <Badge variant="outline">15 min</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Nossa Vida Cristã</span>
                  <Badge variant="outline">30 min</Badge>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-gray-600">
                As designações são distribuídas de acordo com as diretrizes da organização
                e seu progresso espiritual.
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-jw-navy">
                <Calendar className="h-5 w-5 mr-2" />
                Próximas Designações
              </CardTitle>
              <CardDescription>
                Suas designações programadas para as próximas reuniões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhuma designação programada</p>
                  <p className="text-sm text-gray-400">
                    As designações aparecerão aqui quando forem programadas pelo instrutor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Assignment History */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-jw-navy">
                <Award className="h-5 w-5 mr-2" />
                Histórico de Designações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Award className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Seu histórico de designações será exibido aqui
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-jw-navy">
                <Users className="h-5 w-5 mr-2" />
                Progresso Ministerial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Acompanhe seu progresso na escola ministerial
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Family Management */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-jw-navy">
                <Users className="h-5 w-5 mr-2" />
                Gerenciar Família
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">
                  Cadastre seus familiares para melhorar as designações
                </p>
                <Button
                  onClick={() => navigate(`/estudante/${id}/familia`)}
                  className="bg-jw-blue hover:bg-jw-blue/90 text-white"
                  size="sm"
                >
                  Gerenciar Família
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-jw-navy">
                <BookOpen className="h-5 w-5 mr-2" />
                Recursos de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Materiais e recursos para suas designações
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Footer */}
        <div className="mt-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-jw-navy mb-2">
                  Sistema Ministerial - Portal do Estudante
                </h3>
                <p className="text-sm text-gray-600">
                  Este portal permite que você acompanhe suas designações na Escola do Ministério Teocrático.
                  Entre em contato com seu instrutor para mais informações sobre suas designações.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EstudantePortal;
