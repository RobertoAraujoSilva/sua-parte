import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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

              {isInstrutor && (
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
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-jw-gold">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{profile.nome_completo}</span>
                    <Badge variant="outline" className="text-xs border-jw-gold text-jw-gold">
                      {profile.role === 'instrutor' ? 'Instrutor' : 'Estudante'}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{profile.nome_completo}</p>
                      <p className="text-sm text-gray-500">{profile.congregacao}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {isInstrutor && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  )}

                  {isEstudante && (
                    <DropdownMenuItem onClick={() => navigate(`/estudante/${user.id}`)}>
                      <User className="w-4 h-4 mr-2" />
                      Meu Portal
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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