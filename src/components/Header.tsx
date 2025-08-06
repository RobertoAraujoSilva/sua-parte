import { Button } from "@/components/ui/button";

const Header = () => {
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
              <a href="#inicio" className="hover:text-jw-gold transition-colors">
                INÍCIO
              </a>
              <a href="#funcionalidades" className="hover:text-jw-gold transition-colors">
                FUNCIONALIDADES
              </a>
              <a href="#congregacoes" className="hover:text-jw-gold transition-colors">
                CONGREGAÇÕES
              </a>
              <a href="#suporte" className="hover:text-jw-gold transition-colors">
                SUPORTE
              </a>
              <a href="#sobre" className="hover:text-jw-gold transition-colors">
                SOBRE
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-jw-gold">
              Entrar
            </Button>
            <Button variant="hero" size="sm">
              Começar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;