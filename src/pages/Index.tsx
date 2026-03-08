import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RiskChecker from "@/components/RiskChecker";
import HowItWorks from "@/components/HowItWorks";
import FrostbiteMap from "@/components/FrostbiteMap";
import PreventionTips from "@/components/PreventionTips";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RiskChecker />
      <HowItWorks />
      <FrostbiteMap />
      <PreventionTips />
      <Footer />
    </div>
  );
};

export default Index;
