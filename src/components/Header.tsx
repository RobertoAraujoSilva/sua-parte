import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Settings, Languages } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDebugLogger } from "@/utils/debugLogger";
import { useTranslation } from "@/hooks/useTranslation";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
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
    const { t, language } = useTranslation();
    const { toggleLanguage } = useLanguage();
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
          title: t("Erro"),
          description: t("Erro ao sair. Tente novamente."),
          variant: "destructive"
        });
      } else {
        console.log('✅ SignOut successful, navigating to home...');
        logLogoutResult(true, null, user);
        logNavigation(window.location.pathname, '/', user);

        toast({
          title: t("Sessão encerrada"),
          description: t("Você foi desconectado com sucesso."),
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
        title: t("Erro"),
        description: t("Erro inesperado ao sair. Tente novamente."),
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-jw-navy text-white shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-2 sm:space-x-8">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-jw-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h1 className="header-title text-lg sm:text-xl font-semibold">Sistema Ministerial</h1>
            </div>
            
            <nav className="header-nav hidden md:flex items-center space-x-6">
                          {!user && (
                            <>
                              <Link to="/" className="hover:text-jw-gold transition-colors">
                                                  {t('INÍCIO')}
                                                </Link>
                                                <Link to="/funcionalidades" className="hover:text-jw-gold transition-colors">
                                                  {t('FUNCIONALIDADES')}
                                                </Link>
                                                <a href="#faq" className="hover:text-jw-gold transition-colors">
                                                  {t('FAQ')}
                                                </a>
                                                <Link to="/congregacoes" className="hover:text-jw-gold transition-colors">
                                                  {t('CONGREGAÇÕES')}
                                                </Link>
                                                <Link to="/suporte" className="hover:text-jw-gold transition-colors">
                                                  {t('SUPORTE')}
                                                </Link>
                                                <Link to="/sobre" className="hover:text-jw-gold transition-colors">
                                                  {t('SOBRE')}
                                                </Link>
                                                <Link to="/doar" className="hover:text-jw-gold transition-colors font-semibold">
                                                  {t('DOAR')}
                                                </Link>
                            </>
                          )}
            
                          {userIsInstrutor && (
                            <>
                              <Link to="/dashboard" className="hover:text-jw-gold transition-colors">
                                                  {t('DASHBOARD')}
                                                </Link>
                                                <Link to="/estudantes" className="hover:text-jw-gold transition-colors">
                                                  {t('ESTUDANTES')}
                                                </Link>
                                                <Link to="/programas" className="hover:text-jw-gold transition-colors">
                                                  {t('PROGRAMAS')}
                                                </Link>
                                                <Link to="/designacoes" className="hover:text-jw-gold transition-colors">
                                                  {t('DESIGNAÇÕES')}
                                                </Link>
                                                <Link to="/relatorios" className="hover:text-jw-gold transition-colors">
                                                  {t('RELATÓRIOS')}
                                                </Link>
                            </>
                          )}
                        </nav>
          </div>
          
          {/* Mobile Navigation */}
          <MobileNavigation className="md:hidden" />
          
 <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-jw-gold p-2 sm:px-3"
              onClick={toggleLanguage}
              title={language === 'pt' ? t('Alternar para Inglês') : t('Alternar para Português')}
            >
              <Languages className="w-4 h-4 sm:mr-2" />
              <span className="hidden md:inline">
                {language === 'pt' ? t('Inglês') : t('Português')}
              </span>
            </Button>
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
                                  className="text-xs bg-red-600 text-white hover:bg-red-700 hidden sm:inline-flex"
                                >
                                  {t('Test Logout')}
                                </Button>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 text-white hover:text-jw-gold p-2 sm:px-3">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline max-w-32 truncate">
                      {profile?.nome_completo || user.user_metadata?.nome_completo || user.email}
                    </span>
                    <Badge variant="outline" className="text-xs border-jw-gold text-jw-gold hidden sm:inline-flex">
                                          {(profile?.role === 'instrutor' || user.user_metadata?.role === 'instrutor') ? t('Instrutor') : t('Estudante')}
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
                        {profile?.congregacao || user.user_metadata?.congregacao || t('Congregação')}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {userIsInstrutor && (
                                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                                            <Settings className="w-4 h-4 mr-2" />
                                                            {t('Dashboard')}
                                                          </DropdownMenuItem>
                                                        )}
                                      
                                                        {userIsEstudante && (
                                                          <DropdownMenuItem onClick={() => navigate(`/estudante/${user.id}`)}>
                                                            <User className="w-4 h-4 mr-2" />
                                                            {t('Meu Portal')}
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
                                        {t('Sair')}
                                      </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:text-jw-gold p-2 sm:px-3"
                                  onClick={() => navigate('/auth')}
                                >
                                  <span className="hidden sm:inline">{t('Entrar')}</span>
                                  <span className="sm:hidden">Login</span>
                                </Button>
                                <Button
                                  variant="hero"
                                  size="sm"
                                  className="p-2 sm:px-3"
                                  onClick={() => navigate('/auth')}
                                >
                                  <span className="hidden sm:inline">{t('Começar')}</span>
                                  <span className="sm:hidden">Start</span>
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