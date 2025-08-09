import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQSection from "@/components/FAQSection";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <FAQSection />
      <Benefits />
      <Footer />
    </div>
  );
};

export default Index;
