import { Card } from "@/components/ui/card";
import { Users, BookOpen, Bell, BarChart3, Shield, Smartphone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Users,
      titleKey: 'features.studentManagement.title',
      descriptionKey: 'features.studentManagement.description'
    },
    {
      icon: BookOpen,
      titleKey: 'features.programImport.title',
      descriptionKey: 'features.programImport.description'
    },
    {
      icon: Bell,
      titleKey: 'features.notifications.title',
      descriptionKey: 'features.notifications.description'
    },
    {
      icon: BarChart3,
      titleKey: 'features.reports.title',
      descriptionKey: 'features.reports.description'
    },
    {
      icon: Shield,
      titleKey: 'features.compliance.title',
      descriptionKey: 'features.compliance.description'
    },
    {
      icon: Smartphone,
      titleKey: 'features.studentPortal.title',
      descriptionKey: 'features.studentPortal.description'
    }
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-background overflow-x-hidden">
      <div className="responsive-container">
        <div className="text-center mb-16">
          <h2 className="text-balance text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-balance text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="responsive-grid">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-jw-blue/30 min-w-0">
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 bg-jw-blue/10 rounded-lg">
                  <feature.icon className="w-6 h-6 text-jw-blue" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;