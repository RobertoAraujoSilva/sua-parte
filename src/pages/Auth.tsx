import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Users, GraduationCap, Shield, BookOpen } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { CARGO_LABELS } from '@/types/estudantes';

type UserRole = Database['public']['Enums']['user_role'];

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [congregacao, setCongregacao] = useState('');
  const [cargo, setCargo] = useState('');
  const [role, setRole] = useState<UserRole>('instrutor');

  const { signUp, signIn, user, profile, isInstrutor, isEstudante } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && profile) {
      if (isInstrutor) {
        navigate('/dashboard');
      } else if (isEstudante) {
        navigate(`/estudante/${user.id}`);
      }
    }
  }, [user, profile, isInstrutor, isEstudante, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInEmail || !signInPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(signInEmail, signInPassword);

      if (error) {
        let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";

        if (error.message === 'Invalid login credentials') {
          errorMessage = "E-mail ou senha incorretos.";
        } else if (error.message === 'Email not confirmed') {
          errorMessage = "E-mail não confirmado. Entre em contato com o administrador do sistema.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "E-mail não confirmado. Entre em contato com o administrador do sistema.";
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao Sistema Ministerial.",
        });
        // Navigation will be handled by useEffect
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signUpEmail || !signUpPassword || !nomeCompleto || !congregacao) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validate cargo for students
    if (role === 'estudante' && !cargo) {
      toast({
        title: "Erro",
        description: "Por favor, selecione seu cargo na congregação.",
        variant: "destructive"
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp({
        email: signUpEmail,
        password: signUpPassword,
        nome_completo: nomeCompleto,
        congregacao: congregacao,
        cargo: cargo,
        role: role,
      });

      if (error) {
        let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";

        if (error.message === 'User already registered') {
          errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
        } else if (error.message.includes('already registered')) {
          errorMessage = "Este e-mail já está cadastrado. Tente fazer login.";
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Sua conta foi criada com sucesso. Você já pode fazer login.",
        });
        setActiveTab('signin');
        // Clear form
        setSignUpEmail('');
        setSignUpPassword('');
        setConfirmPassword('');
        setNomeCompleto('');
        setCongregacao('');
        setCargo('');
        setRole('instrutor');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role: UserRole) => {
    if (role === 'instrutor') {
      return {
        icon: Shield,
        title: 'Instrutor/Designador',
        description: 'Acesso completo para gerenciar estudantes, programas e designações',
        features: ['Gerenciar estudantes', 'Importar programas', 'Gerar designações', 'Relatórios e análises']
      };
    } else {
      return {
        icon: BookOpen,
        title: 'Estudante',
        description: 'Acesso ao portal pessoal para visualizar suas designações',
        features: ['Ver suas designações', 'Confirmar participação', 'Histórico pessoal', 'Contribuições']
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-navy via-jw-navy to-jw-blue flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-jw-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-jw-navy">
            Sistema Ministerial
          </CardTitle>
          <CardDescription>
            Plataforma para gestão de designações da Escola do Ministério Teocrático
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-mail</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>Tipo de Conta *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {(['instrutor', 'estudante'] as UserRole[]).map((roleOption) => {
                      const roleInfo = getRoleInfo(roleOption);
                      const IconComponent = roleInfo.icon;
                      return (
                        <div
                          key={roleOption}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            role === roleOption
                              ? 'border-jw-blue bg-jw-blue/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setRole(roleOption)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              role === roleOption ? 'bg-jw-blue text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{roleInfo.title}</h3>
                                {role === roleOption && (
                                  <Badge variant="default" className="text-xs">Selecionado</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{roleInfo.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome Completo *</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-congregacao">Congregação *</Label>
                    <Input
                      id="signup-congregacao"
                      type="text"
                      value={congregacao}
                      onChange={(e) => setCongregacao(e.target.value)}
                      placeholder="Nome da congregação"
                      required
                    />
                  </div>

                  {role === 'instrutor' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-cargo">Cargo (Opcional)</Label>
                      <Select value={cargo} onValueChange={setCargo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="superintendente_escola">Superintendente da Escola</SelectItem>
                          <SelectItem value="conselheiro_assistente">Conselheiro Assistente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {role === 'estudante' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-cargo-estudante">Cargo na Congregação *</Label>
                      <Select value={cargo} onValueChange={setCargo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CARGO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha *</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;