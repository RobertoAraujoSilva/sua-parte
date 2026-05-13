import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import Features from "@/components/Features";
import FAQSection from "@/components/FAQSection";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useTranslation } from "@/hooks/useTranslation";

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é o Sistema Ministerial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plataforma para congregações das Testemunhas de Jeová que automatiza a gestão de estudantes e a geração das designações da Escola do Ministério Teocrático seguindo as regras S-38.",
      },
    },
    {
      "@type": "Question",
      name: "Como faço o cadastro de estudantes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O instrutor cadastra cada estudante manualmente ou importa em massa via planilha. Os dados ficam restritos à congregação.",
      },
    },
    {
      "@type": "Question",
      name: "Como o sistema gera as designações?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A programação oficial é carregada e o sistema sugere designações respeitando as regras S-38 (gênero, idade, parentesco e qualificações).",
      },
    },
  ],
};


const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="Sistema Ministerial — Designações da Escola do Ministério"
        description="Plataforma para congregações das Testemunhas de Jeová: gestão de estudantes e designações automáticas (S-38)."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_JSONLD)}</script>
      </Helmet>
      <Header />
      <LandingHero />
      <Features />
      <FAQSection />
      <Benefits />
      <Footer />
      
      {/* CTA Flutuante */}
      <button
        className="floating-cta"
        onClick={() => window.location.href = '/auth'}
        aria-label={t('hero.getStarted')}
      >
        {t('navigation.getStarted')}
      </button>
    </div>
  );
};

export default Index;
