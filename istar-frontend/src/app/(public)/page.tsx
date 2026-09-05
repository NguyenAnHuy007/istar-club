import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import DepartmentsSection from "@/components/home/DepartmentsSection";
import AchievementsSection from "@/components/home/AchievementsSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] min-w-[320px]">
        <HeroSection />
        <AboutSection />
        <DepartmentsSection />
        <AchievementsSection />
      </main>
      <Footer />
    </>
  );
}
