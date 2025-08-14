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
import { useTranslation } from '@/hooks/useTranslation';
import { Eye, EyeOff, LogIn, UserPlus, Shield, BookOpen } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { CARGO_LABELS } from '@/types/estudantes';
import { LoginFeedback, TestCredentials } from '@/components/auth/SimpleLoginFeedback';
import { handleAuthError, validateLoginForm } from '@/lib/supabase';

type UserRole = Database['public']['Enums']['user_role'];

const Auth = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Login feedback states
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginErrorType, setLoginErrorType] = useState<'error' | 'warning' | 'info' | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Sign Up Form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [congregacao, setCongregacao] = useState('');
  const [cargo, setCargo] = useState('');
  const [role, setRole] = useState<UserRole>('instrutor');

  const { signUp, signIn, user, profile, isInstrutor, isEstudante } = useAuth();
  const navigate = useNavigate();

  // Age validation function
  const validateAge = (birthDate: string): { isValid: boolean; age: number; message?: string } => {
    if (!birthDate) {
      return { isValid: false, age: 0, message: t('auth.validation.birthDateRequired') };
    }

    const today = new Date();
    const birth = new Date(birthDate);

    if (birth > today) {
      return { isValid: false, age: 0, message: t('auth.validation.birthDateFuture') };
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 6) {
      return { isValid: false, age, message: t('auth.validation.ageMinimum') };
    }

    if (age > 100) {
      return { isValid: false, age, message: t('auth.validation.ageMaximum') };
    }

    return { isValid: true, age };
  };

  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔀 Auth redirect check:', {
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      userMetadataRole: user?.user_metadata?.role,
      isInstrutor,
      isEstudante,
      userId: user?.id
    });

    if (user) {
      // Primary redirect: Use profile data if available
      if (profile) {
        console.log('✅ Both user and profile exist, checking role...');
        if (isInstrutor) {
          console.log('👨‍🏫 Redirecting instructor to dashboard');
          navigate('/dashboard');
          return;
        } else if (isEstudante) {
          console.log('👨‍🎓 Redirecting student to portal:', `/estudante/${user.id}`);
          navigate(`/estudante/${user.id}`);
          return;
        } else {
          console.log('⚠️ User has unknown role:', profile.role);
        }
      } else {
        // Fallback redirect: Use user metadata if profile is not loaded
        console.log('⚠️ Profile not loaded, checking user metadata for role...');
        const metadataRole = user.user_metadata?.role;

        if (metadataRole === 'instrutor') {
          console.log('👨‍🏫 Redirecting instructor to dashboard (via metadata)');
          navigate('/dashboard');
          return;
        } else if (metadataRole === 'estudante') {
          console.log('👨‍🎓 Redirecting student to portal (via metadata):', `/estudante/${user.id}`);
          navigate(`/estudante/${user.id}`);
          return;
        } else {
          console.log('⏳ Waiting for profile data to load... (metadata role:', metadataRole, ')');
        }
      }
    } else {
      console.log('⏳ Waiting for user authentication...');
    }
  }, [user, profile, isInstrutor, isEstudante, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar estados anteriores
    setLoginError(null);
    setLoginErrorType(null);
    setLoginSuccess(null);

    // Validação do formulário
    const validationErrors = validateLoginForm(signInEmail, signInPassword);
    if (validationErrors.length > 0) {
      setLoginError(validationErrors.join('. '));
      setLoginErrorType('error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(signInEmail, signInPassword);

      if (error) {
        const { message, type } = handleAuthError(error);
        setLoginError(message);
        setLoginErrorType(type);
      } else {
        setLoginSuccess(t('auth.loginSuccess'));
        // O redirecionamento será feito pelo useEffect que monitora o user
      }
    } catch (error) {
      const { message, type } = handleAuthError(error);
      setLoginError(message);
      setLoginErrorType(type);
    } finally {
      setLoading(false);
    }
  };

  // Função para preencher credenciais de teste
  const handleFillTestCredentials = (type: 'instructor' | 'student' | 'simple') => {
    const credentials = {
      instructor: {
        email: 'frankwebber33@hotmail.com',
        password: 'senha123'
      },
      student: {
        email: 'franklinmarceloferreiradelima@gmail.com',
        password: 'senha123'
      },
      simple: {
        email: 'teste@sistema.com',
        password: '123456'
      }
    };

    const cred = credentials[type];
    setSignInEmail(cred.email);
    setSignInPassword(cred.password);

    // Limpar erros quando preencher credenciais
    setLoginError(null);
    setLoginErrorType(null);

    const typeTranslation = type === 'instructor' ? 'instrutor' : type === 'student' ? 'estudante' : 'teste';
    toast({
      title: t('auth.messages.credentialsFilled'),
      description: t('auth.messages.credentialsFilledDesc', { type: typeTranslation }),
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!signUpEmail || !signUpPassword || !nomeCompleto || !dateOfBirth || !congregacao) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.allFieldsRequired'),
        variant: "destructive"
      });
      return;
    }

    // Validate birth date and age
    const ageValidation = validateAge(dateOfBirth);
    if (!ageValidation.isValid) {
      toast({
        title: t('forms.error'),
        description: ageValidation.message,
        variant: "destructive"
      });
      return;
    }

    // Validate cargo for students
    if (role === 'estudante' && !cargo) {
      toast({
        title: t('forms.error'),
        description: t('auth.validation.roleRequired'),
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
      const { error } = await signUp({
        email: signUpEmail,
        password: signUpPassword,
        nome_completo: nomeCompleto,
        congregacao: congregacao,
        cargo: cargo,
        role: role,
        date_of_birth: dateOfBirth,
      });

      if (error) {
        let errorMessage = t('auth.validation.unexpectedError');

        if (error.message === 'User already registered') {
          errorMessage = t('auth.validation.emailAlreadyExists');
        } else if (error.message.includes('already registered')) {
          errorMessage = t('auth.validation.emailAlreadyExists');
        } else {
          errorMessage = error.message;
        }

        toast({
          title: t('auth.messages.signupError'),
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: t('auth.messages.accountCreated'),
          description: t('auth.messages.accountCreatedDesc'),
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
        title: t('forms.error'),
        description: t('auth.validation.unexpectedError'),
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
        title: t('auth.roles.instrutor.title'),
        description: t('auth.roles.instrutor.description'),
        features: [t('dashboard.manageStudents'), t('programs.importProgram'), t('assignments.generateNew'), t('reports.title')]
      };
    } else {
      return {
        icon: BookOpen,
        title: t('auth.roles.estudante.title'),
        description: t('auth.roles.estudante.description'),
        features: [t('portal.myAssignments'), t('portal.confirmParticipation'), t('portal.myProgress'), t('benefits.sustainability.title')]
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
      {t('common.appName')}
      </CardTitle>
      <CardDescription>
      {t('terms.theocraticMinistrySchool')}
      </CardDescription>
      </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {t('auth.signUp')}
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('auth.email')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('auth.password')}</Label>
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
                  {loading ? t('auth.loggingIn') : t('auth.signIn')}
                </Button>
              </form>

              {/* Feedback de login */}
              <LoginFeedback
                loading={loading}
                error={loginError}
                errorType={loginErrorType}
                success={loginSuccess}
              />

              {/* Credenciais de teste para desenvolvimento */}
              <TestCredentials onFillCredentials={handleFillTestCredentials} />
            </TabsContent>
            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>{t('auth.accountType')} *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {(['instrutor', 'estudante'] as UserRole[]).map((roleOption) => {
                      const roleInfo = getRoleInfo(roleOption);
                      const IconComponent = roleInfo.icon;
                      return (
                        <div
                          key={roleOption}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${role === roleOption
                              ? 'border-jw-blue bg-jw-blue/5'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => setRole(roleOption)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === roleOption ? 'bg-jw-blue text-white' : 'bg-gray-100 text-gray-600'
                              }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{t(`auth.roles.${roleOption}.title`)}</h3>
                                {role === roleOption && (
                                  <Badge variant="default" className="text-xs">{t('auth.selected')}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{t(`auth.roles.${roleOption}.description`)}</p>
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
                    <Label htmlFor="signup-nome">{t('auth.fullName')} *</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder={t('auth.fullNamePlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-birth-date">{t('auth.birthDate')} *</Label>
                    <Input
                      id="signup-birth-date"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]} // 100 years ago
                    />
                    {dateOfBirth && (() => {
                      const ageValidation = validateAge(dateOfBirth);
                      return (
                        <p className={`text-sm ${ageValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {ageValidation.isValid
                            ? `${t('auth.age')}: ${ageValidation.age} ${t('auth.years')}`
                            : t(ageValidation.message)
                          }
                        </p>
                      );
                    })()}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-congregacao">{t('terms.congregation')} *</Label>
                    <Input
                      id="signup-congregacao"
                      type="text"
                      value={congregacao}
                      onChange={(e) => setCongregacao(e.target.value)}
                      placeholder={t('auth.congregationPlaceholder')}
                      required
                    />
                  </div>

                  {role === 'instrutor' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-cargo">{t('auth.roleOptional')}</Label>
                      <Select value={cargo} onValueChange={setCargo}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('auth.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="superintendente_escola">{t('auth.roles.superintendent')}</SelectItem>
                          <SelectItem value="conselheiro_assistente">{t('auth.roles.assistantCounselor')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {role === 'estudante' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-cargo-estudante">{t('auth.congregationRole')} *</Label>
                      <Select value={cargo} onValueChange={setCargo}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('auth.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CARGO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {t(`terms.${value}`)}
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
                    <Label htmlFor="signup-email">{t('auth.email')} *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')} *</Label>
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
                    <p className="text-xs text-gray-500">{t('auth.passwordMinLength')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('auth.confirmPassword')} *</Label>
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
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
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