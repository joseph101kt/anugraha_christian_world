// components/FeaturedCategory.tsx
'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import Carousel from './Carousel';

const allCategories = [
  // Slide 1 (Bento box layout)
  [
    { name: "Statues", image: "/statue.jpg", size: "col-span-2 row-span-2" },
    { name: "Church Articles", image: "/church-articles.jpg", size: "col-span-2" },
    { name: "Rosaries", image: "/rosaries.jpg", size: "" },
    { name: "Photo Frames", image: "/photo-frames.jpg", size: "" },
  ],
  // Slide 2 (Another bento box layout)
  [
    { name: "Crosses", image: "/crosses.jpg", size: "col-span-2" },
    { name: "Prayer Books", image: "/prayer-books.jpg", size: "col-span-2" },
    { name: "Candles", image: "/candles.jpg", size: "" },
    { name: "Medals", image: "/medals.jpg", size: "" },
  ],
];

export default function FeaturedCategory() {
  return (
    <section className="p-6">
      <h2 className="text-3xl font-bold text-center mb-10">Featured Categories</h2>
      {/* Removed container class */}
      <Carousel slideClass="w-full">
        {allCategories.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-6 w-full"
          >
            {slide.map((cat, catIndex) => (
              <div
                key={catIndex}
                className={`relative p-4 bg-secondary shadow-lg rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 ease-in-out ${cat.size}`}
              >
                <Link href={`/categories/${cat.name.toLowerCase().replace(' ', '-')}`}>
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg opacity-70"
                    />
                  </div>
                  <div className="relative z-10 flex items-end h-full">
                    <h3 className="text-xl font-bold drop-shadow-md">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ))}
      </Carousel>
    </section>
  );
}
