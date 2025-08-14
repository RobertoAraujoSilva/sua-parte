import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQSection from "@/components/FAQSection";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <FAQSection />
      <Benefits />
      <Footer />
      
      {/* CTA Flutuante */}
      <button
        className="floating-cta"
        onClick={() => window.location.href = '/auth'}
        aria-label="Começar agora"
      >
        Começar
      </button>
    </div>
  );
};

export default Index;
