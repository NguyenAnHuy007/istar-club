import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import DepartmentsSection from "@/components/home/DepartmentsSection";
import AchievementsSection from "@/components/home/AchievementsSection";
import Footer from "@/components/layout/Footer";

import { HomepageConfig } from "@/types/landing";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getHomepageConfig(): Promise<HomepageConfig | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/homepage`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const config = await getHomepageConfig();

  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] min-w-[320px]">
        <HeroSection config={config?.hero} />
        <AboutSection config={config?.about} />
        <DepartmentsSection config={config?.departments} />
        <AchievementsSection config={config?.achievements} />
      </main>
      <Footer />
    </>
  );
}
