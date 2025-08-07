import AboutSection from "@/components/AboutSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import HeroSection from "@/components/HeroSection";
import Testimonials from "@/components/Testimonials";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedCategories />
      <Testimonials />
    </>
  );
}