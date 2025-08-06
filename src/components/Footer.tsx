const Footer = () => {
  return (
    <footer className="bg-jw-navy text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-jw-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <h3 className="text-xl font-semibold">Sistema Ministerial</h3>
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              Automatização inteligente de designações ministeriais para congregações 
              das Testemunhas de Jeová, com foco em eficiência e conformidade.
            </p>
            <p className="text-sm text-white/60">
              Desenvolvido com dedicação para servir às necessidades congregacionais 
              e apoiar o trabalho ministerial.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Funcionalidades</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Gestão de Estudantes</li>
              <li>Importação de Programas</li>
              <li>Designações Automáticas</li>
              <li>Notificações</li>
              <li>Portal do Estudante</li>
              <li>Relatórios</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Tutorial de Uso</li>
              <li>Documentação</li>
              <li>Contato Técnico</li>
              <li>Atualizações</li>
              <li>Comunidade</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-white/60">
            © 2024 Sistema Ministerial. Desenvolvido para servir às congregações das Testemunhas de Jeová.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;