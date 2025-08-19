import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Users2, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Benefits = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 bg-gradient-to-br from-jw-blue/5 to-jw-navy/5 overflow-x-hidden">
      <div className="responsive-container">
        <div className="text-center mb-16">
          <h2 className="text-balance text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-foreground mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-balance text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('benefits.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <Clock className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('benefits.timeEfficiency.title')}</h3>
                <p className="text-muted-foreground">
                  {t('benefits.timeEfficiency.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <CheckCircle className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('benefits.compliance.title')}</h3>
                <p className="text-muted-foreground">
                  {t('benefits.compliance.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <Users2 className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('benefits.engagement.title')}</h3>
                <p className="text-muted-foreground">
                  {t('benefits.engagement.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-jw-blue/10 rounded-lg shrink-0">
                <Heart className="w-6 h-6 text-jw-blue" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('benefits.sustainability.title')}</h3>
                <p className="text-muted-foreground">
                  {t('benefits.sustainability.description')}
                </p>
              </div>
            </div>
          </div>

          <Card className="p-8 bg-card border-border/50">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                {t('benefits.cta.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('benefits.cta.description')}
              </p>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>✓ {t('benefits.features.studentManagement')}</span>
                    <span className="font-medium">{t('benefits.features.included')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ {t('benefits.features.programImport')}</span>
                    <span className="font-medium">{t('benefits.features.included')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ {t('benefits.features.notifications')}</span>
                    <span className="font-medium">{t('benefits.features.included')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ {t('benefits.features.studentPortal')}</span>
                    <span className="font-medium">{t('benefits.features.included')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ {t('benefits.features.reports')}</span>
                    <span className="font-medium">{t('benefits.features.included')}</span>
                  </div>
                </div>
                
                <Button variant="hero" size="lg" className="w-full">
                  {t('benefits.cta.button')}
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  {t('benefits.cta.note')}
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