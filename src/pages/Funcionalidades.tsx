import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Features from "@/components/Features";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, BarChart, Shield, Smartphone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Funcionalidades = () => {
  const { t } = useTranslation();
  const detailedFeatures = [
    {
      icon: Users,
      title: t('featuresPage.studentManagement.title'),
      description: t('featuresPage.studentManagement.description'),
      benefits: [
        t('featuresPage.studentManagement.benefits.qualifications'),
        t('featuresPage.studentManagement.benefits.family'),
        t('featuresPage.studentManagement.benefits.history'),
        t('featuresPage.studentManagement.benefits.validation')
      ]
    },
    {
      icon: Clock,
      title: t('featuresPage.programImport.title'),
      description: t('featuresPage.programImport.description'),
      benefits: [
        t('featuresPage.programImport.benefits.recognition'),
        t('featuresPage.programImport.benefits.extraction'),
        t('featuresPage.programImport.benefits.sync'),
        t('featuresPage.programImport.benefits.validation')
      ]
    },
    {
      icon: Smartphone,
      title: t('featuresPage.notifications.title'),
      description: t('featuresPage.notifications.description'),
      benefits: [
        t('featuresPage.notifications.benefits.email'),
        t('featuresPage.notifications.benefits.whatsapp'),
        t('featuresPage.notifications.benefits.reminders'),
        t('featuresPage.notifications.benefits.confirmation')
      ]
    },
    {
      icon: BarChart,
      title: t('featuresPage.reports.title'),
      description: t('featuresPage.reports.description'),
      benefits: [
        t('featuresPage.reports.benefits.metrics'),
        t('featuresPage.reports.benefits.custom'),
        t('featuresPage.reports.benefits.performance'),
        t('featuresPage.reports.benefits.export')
      ]
    },
    {
      icon: Shield,
      title: t('featuresPage.compliance.title'),
      description: t('featuresPage.compliance.description'),
      benefits: [
        t('featuresPage.compliance.benefits.automatic'),
        t('featuresPage.compliance.benefits.guidelines'),
        t('featuresPage.compliance.benefits.gender'),
        t('featuresPage.compliance.benefits.privileges')
      ]
    },
    {
      icon: CheckCircle,
      title: t('featuresPage.studentPortal.title'),
      description: t('featuresPage.studentPortal.description'),
      benefits: [
        t('featuresPage.studentPortal.benefits.mobile'),
        t('featuresPage.studentPortal.benefits.confirmation'),
        t('featuresPage.studentPortal.benefits.history'),
        t('featuresPage.studentPortal.benefits.donations')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('featuresPage.title')} <span className="text-jw-gold">{t('featuresPage.titleHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {t('featuresPage.subtitle')}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {detailedFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-jw-blue/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-jw-blue" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-jw-blue" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('featuresPage.technical.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t('featuresPage.technical.performance.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• {t('featuresPage.technical.performance.realTime')}</li>
                    <li>• {t('featuresPage.technical.performance.availability')}</li>
                    <li>• {t('featuresPage.technical.performance.backup')}</li>
                    <li>• {t('featuresPage.technical.performance.sync')}</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('featuresPage.technical.security.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• {t('featuresPage.technical.security.encryption')}</li>
                    <li>• {t('featuresPage.technical.security.auth')}</li>
                    <li>• {t('featuresPage.technical.security.access')}</li>
                    <li>• {t('featuresPage.technical.security.audit')}</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('featuresPage.technical.compatibility.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• {t('featuresPage.technical.compatibility.webMobile')}</li>
                    <li>• {t('featuresPage.technical.compatibility.whatsapp')}</li>
                    <li>• {t('featuresPage.technical.compatibility.pdf')}</li>
                    <li>• {t('featuresPage.technical.compatibility.export')}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Funcionalidades;