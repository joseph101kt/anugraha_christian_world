"use client";
import AboutSection from "@/components/AboutSection";
import ChristmasModal from "@/components/ChristmasModal";
import EnquireButton from "@/components/EnquireButton";
import FeaturedCategories from "@/components/FeaturedCategories";
import HeroSection from "@/components/HeroSection";
import ProductList from "@/components/ProductList";
import Testimonials from "@/components/Testimonials";
import { useState } from "react";

export default function HomePage() {
  const [open, setOpen] = useState(true);
  return (
    <> 
    <ChristmasModal isOpen={open} onClose={() => setOpen(false)} />
    <div className="flex  flex-col">
        <HeroSection /> 
        <AboutSection />
        <FeaturedCategories />
        <Testimonials /> 
      
          <div className='w-full text-center'><h1 className='mx-auto'>Our Products</h1></div>
          <ProductList ActionButton={EnquireButton} ITEMS_PER_PAGE={12} />
    </div>
    </>
  );
}