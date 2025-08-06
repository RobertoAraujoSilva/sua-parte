import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
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