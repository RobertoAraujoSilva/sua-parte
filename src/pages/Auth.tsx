import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [congregacao, setCongregacao] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (isSignUp && !nomeCompleto) {
      toast({
        title: "Erro", 
        description: "Nome completo é obrigatório para cadastro.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          nome_completo: nomeCompleto,
          congregacao: congregacao
        });

        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message === 'User already registered' 
              ? "Este e-mail já está cadastrado. Tente fazer login."
              : error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu e-mail para confirmar a conta.",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Erro no login",
            description: error.message === 'Invalid login credentials'
              ? "E-mail ou senha incorretos."
              : error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo ao Sistema Ministerial.",
          });
          navigate('/');
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-jw-navy via-jw-navy to-jw-blue flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-jw-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-jw-navy">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Crie sua conta para gerenciar designações ministeriais'
              : 'Entre com suas credenciais para acessar o sistema'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Seu nome completo"
                    required={isSignUp}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="congregacao">Congregação</Label>
                  <Input
                    id="congregacao"
                    type="text"
                    value={congregacao}
                    onChange={(e) => setCongregacao(e.target.value)}
                    placeholder="Nome da congregação (opcional)"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              variant="hero"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? 'Criando conta...' : 'Entrando...') 
                : (isSignUp ? 'Criar Conta' : 'Entrar')
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </p>
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-jw-blue font-medium"
            >
              {isSignUp ? 'Fazer login' : 'Criar conta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;