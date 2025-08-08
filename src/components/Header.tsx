import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDebugLogger } from "@/utils/debugLogger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, profile, signOut, isInstrutor, isEstudante } = useAuth();
  const navigate = useNavigate();
  const { logLogoutAttempt, logLogoutResult, logError, logNavigation } = useDebugLogger();

  // Create fallback role checking for when profile hasn't loaded yet
  const userIsInstrutor = isInstrutor || user?.user_metadata?.role === 'instrutor';
  const userIsEstudante = isEstudante || user?.user_metadata?.role === 'estudante';

  const handleSignOut = async (buttonType: 'dropdown' | 'test' = 'dropdown') => {
    console.log(`🚪 Header logout button clicked - ${buttonType}`);
    logLogoutAttempt(buttonType, user);

    try {
      console.log('🔄 Calling signOut function...');
      console.log('🔄 User before signOut:', user?.email, user?.id);

      // Call signOut with built-in timeout handling
      const signOutResult = await signOut();
      console.log('🔄 SignOut result:', signOutResult);

      const { error } = signOutResult;

      if (error) {
        console.error('❌ SignOut error:', error);
        logLogoutResult(false, error, user);
        logError(error, 'Header handleSignOut', user);

        toast({
          title: "Erro",
          description: "Erro ao sair. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log('✅ SignOut successful, navigating to home...');
        logLogoutResult(true, null, user);
        logNavigation(window.location.pathname, '/', user);

        toast({
          title: "Sessão encerrada",
          description: "Você foi desconectado com sucesso.",
        });

        // Small delay to ensure logs are captured
        setTimeout(() => {
          navigate('/');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Header logout exception:', error);
      logLogoutResult(false, error, user);
      logError(error, 'Header handleSignOut Exception', user);

      toast({
        title: "Erro",
        description: "Erro inesperado ao sair. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-jw-navy text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-jw-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h1 className="text-xl font-semibold">Sistema Ministerial</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {!user && (
                <>
                  <Link to="/" className="hover:text-jw-gold transition-colors">
                    INÍCIO
                  </Link>
                  <Link to="/funcionalidades" className="hover:text-jw-gold transition-colors">
                    FUNCIONALIDADES
                  </Link>
                  <Link to="/congregacoes" className="hover:text-jw-gold transition-colors">
                    CONGREGAÇÕES
                  </Link>
                  <Link to="/suporte" className="hover:text-jw-gold transition-colors">
                    SUPORTE
                  </Link>
                  <Link to="/sobre" className="hover:text-jw-gold transition-colors">
                    SOBRE
                  </Link>
                </>
              )}

              {userIsInstrutor && (
                <>
                  <Link to="/dashboard" className="hover:text-jw-gold transition-colors">
                    DASHBOARD
                  </Link>
                  <Link to="/estudantes" className="hover:text-jw-gold transition-colors">
                    ESTUDANTES
                  </Link>
                  <Link to="/programas" className="hover:text-jw-gold transition-colors">
                    PROGRAMAS
                  </Link>
                  <Link to="/designacoes" className="hover:text-jw-gold transition-colors">
                    DESIGNAÇÕES
                  </Link>
                  <Link to="/relatorios" className="hover:text-jw-gold transition-colors">
                    RELATÓRIOS
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Debug Test Button - Remove after testing */}
                <Button
                  onClick={() => {
                    console.log('🧪 Direct test button clicked');
                    handleSignOut('test');
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-red-600 text-white hover:bg-red-700"
                >
                  Test Logout
                </Button>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-jw-gold">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {profile?.nome_completo || user.user_metadata?.nome_completo || user.email}
                    </span>
                    <Badge variant="outline" className="text-xs border-jw-gold text-jw-gold">
                      {(profile?.role === 'instrutor' || user.user_metadata?.role === 'instrutor') ? 'Instrutor' : 'Estudante'}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">
                        {profile?.nome_completo || user.user_metadata?.nome_completo || user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {profile?.congregacao || user.user_metadata?.congregacao || 'Congregação'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {userIsInstrutor && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  )}

                  {userIsEstudante && (
                    <DropdownMenuItem onClick={() => navigate(`/estudante/${user.id}`)}>
                      <User className="w-4 h-4 mr-2" />
                      Meu Portal
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔴 Dropdown MenuItem clicked - calling handleSignOut');

                      // Ensure the dropdown stays open during logout
                      try {
                        await handleSignOut('dropdown');
                      } catch (error) {
                        console.error('🔴 Dropdown logout failed:', error);
                      }
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-jw-gold"
                  onClick={() => navigate('/auth')}
                >
                  Entrar
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Começar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;