import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, Calendar, Home, Church, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { signIn, signUp, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [congregacao, setCongregacao] = useState("");
  const [cargo, setCargo] = useState("");
  const [role, setRole] = useState<'instrutor' | 'estudante' | 'admin'>('instrutor');
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (!user) return;
    // Evita loop de navegação: só redireciona se ainda estiver em /auth
    if (location.pathname === '/auth') {
      navigate('/dashboard', { replace: true });
    }
  }, [user?.id, location.pathname, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.emailRequired'),
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.emailInvalid'),
        variant: "destructive"
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.passwordRequired'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: t('auth.error'),
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t('auth.success'),
          description: t('auth.loginSuccess'),
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: t('forms.error'),
        description: 'Erro ao fazer login',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim and sanitize all inputs
    const trimmedNomeCompleto = nomeCompleto.trim();
    const trimmedEmail = signUpEmail.trim();
    const trimmedCongregacao = congregacao.trim();
    const trimmedCargo = cargo.trim();

    if (!trimmedNomeCompleto) {
      toast({
        title: t('forms.error'),
        description: 'Nome completo é obrigatório',
        variant: "destructive"
      });
      return;
    }

    if (!trimmedEmail) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.emailRequired'),
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.emailInvalid'),
        variant: "destructive"
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.passwordMismatch'),
        variant: "destructive"
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.passwordMinLength'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Use AuthContext's signUp instead of direct Supabase call
      const { error } = await signUp(
        trimmedEmail,
        signUpPassword,
        {
          nome_completo: trimmedNomeCompleto,
          congregacao: trimmedCongregacao,
          cargo: trimmedCargo,
          role: role,
          date_of_birth: dateOfBirth,
        }
      );

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast({
            title: t('forms.error'),
            description: 'Este email já está cadastrado. Tente fazer login.',
            variant: "destructive"
          });
        } else {
          toast({
            title: t('forms.error'),
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: t('auth.success'),
          description: 'Conta criada com sucesso! Você pode fazer login agora.',
        });
        // Auto-redirect to dashboard if user is logged in
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: t('forms.error'),
        description: 'Erro ao criar conta. Tente novamente.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecionando...</h2>
          <p>Você já está logado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Church className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Sistema Ministerial</h1>
              <p className="text-sm text-gray-600">Gestão da Escola do Ministério Teocrático</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitch />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              {t('navigation.home')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center pb-4">
            <CardTitle className="text-2xl font-bold">
              {activeTab === "login" ? t('auth.login') : t('auth.signup')}
            </CardTitle>
            <CardDescription>
              {activeTab === "login" 
                ? t('auth.loginDescription')
                : t('auth.signupDescription')
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t('auth.login')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('auth.signup')}
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10 transition-all duration-200"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        {t('auth.signingIn')}
                      </div>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('auth.login')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Informações Pessoais</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nome-completo">Nome Completo</Label>
                      <Input
                        id="nome-completo"
                        type="text"
                        placeholder="João da Silva"
                        value={nomeCompleto}
                        onChange={(e) => setNomeCompleto(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date-of-birth">Data de Nascimento</Label>
                      <Input
                        id="date-of-birth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Congregation Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Church className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Informações da Congregação</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="congregacao">Congregação</Label>
                      <Input
                        id="congregacao"
                        type="text"
                        placeholder="Congregação Central"
                        value={congregacao}
                        onChange={(e) => setCongregacao(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo/Privilégio</Label>
                      <Input
                        id="cargo"
                        type="text"
                        placeholder="Ancião, Servo Ministerial, Pioneiro, etc."
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Função no Sistema</Label>
                      <Select value={role} onValueChange={(value: 'instrutor' | 'estudante' | 'admin') => setRole(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instrutor">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              <span>Instrutor da Escola</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="estudante">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              <span>Estudante</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Login Credentials */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <LogIn className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Credenciais de Acesso</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu-email@exemplo.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Criando conta...
                      </div>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('auth.signup')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <Badge variant="outline" className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Instrutores
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                Estudantes
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Programação
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Church className="h-3 w-3" />
                Designações
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Sistema Ministerial - Gestão da Escola do Ministério Teocrático
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;