import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Congregacoes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const testimonials = [
    {
      congregation: t('congregationsPage.testimonials.congregations.central.name'),
      city: t('congregationsPage.testimonials.congregations.central.city'),
      members: 120,
      coordinator: t('congregationsPage.testimonials.congregations.central.coordinator'),
      testimonial: t('congregationsPage.testimonials.congregations.central.testimonial'),
      rating: 5,
      monthsUsing: 18
    },
    {
      congregation: t('congregationsPage.testimonials.congregations.north.name'),
      city: t('congregationsPage.testimonials.congregations.north.city'), 
      members: 85,
      coordinator: t('congregationsPage.testimonials.congregations.north.coordinator'),
      testimonial: t('congregationsPage.testimonials.congregations.north.testimonial'),
      rating: 5,
      monthsUsing: 12
    },
    {
      congregation: t('congregationsPage.testimonials.congregations.west.name'),
      city: t('congregationsPage.testimonials.congregations.west.city'),
      members: 95,
      coordinator: t('congregationsPage.testimonials.congregations.west.coordinator'),
      testimonial: t('congregationsPage.testimonials.congregations.west.testimonial'),
      rating: 5,
      monthsUsing: 8
    },
    {
      congregation: t('congregationsPage.testimonials.congregations.south.name'),
      city: t('congregationsPage.testimonials.congregations.south.city'),
      members: 110,
      coordinator: t('congregationsPage.testimonials.congregations.south.coordinator'),
      testimonial: t('congregationsPage.testimonials.congregations.south.testimonial'),
      rating: 5,
      monthsUsing: 15
    }
  ];

  const stats = [
    { label: t('congregationsPage.stats.activeCongregations'), value: t('congregacoes.stats.activeCongregationsValue'), icon: Users },
    { label: t('congregationsPage.stats.registeredStudents'), value: t('congregacoes.stats.registeredStudentsValue'), icon: Users },
    { label: t('congregationsPage.stats.generatedAssignments'), value: t('congregacoes.stats.generatedAssignmentsValue'), icon: Calendar },
    { label: t('congregationsPage.stats.satisfaction'), value: t('congregacoes.stats.satisfactionValue'), icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('congregationsPage.title')} <span className="text-jw-gold">{t('congregationsPage.titleHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {t('congregationsPage.subtitle')}
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center border-2 hover:border-jw-blue/20 transition-all duration-300">
                    <CardContent className="pt-6">
                      <IconComponent className="w-8 h-8 text-jw-blue mx-auto mb-4" />
                      <div className="text-3xl font-bold text-jw-blue mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('congregationsPage.testimonials.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2 hover:border-jw-blue/20 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{testimonial.congregation}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {testimonial.city}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {testimonial.members} {t('congregationsPage.testimonials.members')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-jw-gold text-jw-gold" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-sm mb-4 italic">
                      {t('footer.testimonialQuote', { testimonial: testimonial.testimonial })}
                    </blockquote>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{t('footer.testimonialAuthor', { author: testimonial.coordinator })}</span>
                      <span>{t('congregationsPage.testimonials.usingFor')} {testimonial.monthsUsing} {t('congregationsPage.testimonials.months')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t('congregationsPage.successStories.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-jw-blue">{t('congregacoes.successStories.timeReductionValue')}</CardTitle>
                  <CardDescription>{t('congregationsPage.successStories.timeReduction.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {t('congregationsPage.successStories.timeReduction.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-jw-blue">{t('congregacoes.successStories.engagementValue')}</CardTitle>
                  <CardDescription>{t('congregationsPage.successStories.engagement.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {t('congregationsPage.successStories.engagement.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-jw-blue">{t('congregacoes.successStories.complianceValue')}</CardTitle>
                  <CardDescription>{t('congregationsPage.successStories.compliance.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {t('congregationsPage.successStories.compliance.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-jw-blue to-jw-blue-light">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">
              {t('congregationsPage.cta.title')}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t('congregationsPage.cta.subtitle')}
            </p>
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-4 bg-white text-jw-blue hover:bg-white/90"
              onClick={() => navigate('/auth')}
            >
              {t('congregationsPage.cta.button')}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Congregacoes;