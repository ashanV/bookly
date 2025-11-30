import Navigation from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedServices from "@/components/home/FeaturedServices";
import FeaturesSection from "@/components/home/FeaturesSection";

// Główny komponent strony
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturedServices />
      <FeaturesSection />
      <Footer />
    </main>
  );
}