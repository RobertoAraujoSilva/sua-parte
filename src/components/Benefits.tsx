import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Users2, Heart } from "lucide-react";

const Benefits = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-jw-blue/5 to-jw-navy/5 overflow-x-hidden">
      <div className="responsive-container">
        <div className="text-center mb-16">
          <h2 className="text-balance text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-foreground mb-4">
            Transforme a Organização da Sua Congregação
          </h2>
          <p className="text-balance text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Reduza drasticamente o tempo gasto em tarefas administrativas e 
            foque no que realmente importa: o desenvolvimento espiritual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <Clock className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Economia de Tempo Significativa</h3>
                <p className="text-muted-foreground">
                  De horas para minutos: o que antes tomava uma tarde inteira de trabalho 
                  agora é resolvido em menos de 5 minutos por semana.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <CheckCircle className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Conformidade Garantida</h3>
                <p className="text-muted-foreground">
                  Algoritmo inteligente que automaticamente respeita todas as regras 
                  congregacionais, gênero, cargo e relações familiares.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <Users2 className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Engajamento Estudantil</h3>
                <p className="text-muted-foreground">
                  Portal dedicado onde estudantes acompanham suas designações, 
                  confirmam participação e contribuem para sustentabilidade.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <Heart className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sustentabilidade via Doações</h3>
                <p className="text-muted-foreground">
                  Sistema autofinanciado através de contribuições voluntárias, 
                  garantindo continuidade sem custos fixos para congregações.
                </p>
              </div>
            </div>
          </div>

          <Card className="p-8 bg-card border-border/50">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                Comece Hoje Mesmo
              </h3>
              <p className="text-muted-foreground">
                Cadastre sua congregação e experimente a eficiência da automação 
                ministerial. Setup completo em menos de 30 minutos.
              </p>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>✓ Cadastro de estudantes</span>
                    <span className="font-medium">Incluído</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ Importação de programas</span>
                    <span className="font-medium">Incluído</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ Notificações automáticas</span>
                    <span className="font-medium">Incluído</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ Portal do estudante</span>
                    <span className="font-medium">Incluído</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ Relatórios completos</span>
                    <span className="font-medium">Incluído</span>
                  </div>
                </div>
                
                <Button variant="hero" size="lg" className="w-full">
                  Começar Gratuitamente
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Sistema sustentado por doações voluntárias
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Benefits;