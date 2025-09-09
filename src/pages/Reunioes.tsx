import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import MeetingManagement from '@/components/MeetingManagement';

const Reunioes = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:text-jw-gold"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
            
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">
                Sistema de <span className="text-jw-gold">Reuniões</span>
              </h1>
              <p className="text-xl opacity-90 max-w-3xl">
                Gerencie reuniões regulares, visitas do superintendente de circuito, 
                eventos especiais e designações administrativas de acordo com as 
                diretrizes organizacionais.
              </p>
            </div>
          </div>
        </section>

        {/* Meeting Management Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <MeetingManagement />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reunioes;
