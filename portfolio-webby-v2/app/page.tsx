import AboutSection from "@/components/AboutSection";
import EnquireButton from "@/components/EnquireButton";
import FeaturedCategories from "@/components/FeaturedCategories";
import HeroSection from "@/components/HeroSection";
import ProductList from "@/components/ProductList";
import Testimonials from "@/components/Testimonials";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSection />
        <AboutSection />
        <FeaturedCategories />
        <Testimonials />
      
          <div className='w-full text-center'><h1 className='mx-auto'>Our Products</h1></div>
          <ProductList ActionButton={EnquireButton} ITEMS_PER_PAGE={12} />
      </Suspense>
    </>
  );
}