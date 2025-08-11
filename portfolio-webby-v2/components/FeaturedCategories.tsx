// components/FeaturedCategory.tsx
'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import Carousel from './Carousel';

// images are stored at /images/......

const allCategories = [
  // Slide 1 (Bento box layout)
  [
    { name: "Chalice", image: "/images/categories/chalice.webp", tag: "chalice, church-offering", size: "col-span-2 row-span-2" },
    { name: "Cross", image: "/images/categories/brass-cross.webp", tag: "cross, church-offering", size: "col-span-2" },
    { name: "Ciborium", image: "/images/categories/ciborium.webp", tag: "ciborium, church-offering", size: "" },
    { name: "Monstrance", image: "/images/categories/monstrance.webp", tag: "monstrance, church-offering", size: "" },
  ],
  // Slide 2 (Another bento box layout)
  [
    { name: "Brass Candle Stands", image: "/images/categories/brass-candle-stands.webp", tag: "brass, candle-stands,  ", size: "col-span-2 row-span-2" },
    { name: "Fiber Globes", image: "/images/categories/fiber-globes-for-candle-stand.webp", tag: "fiber, globes,  ", size: "col-span-2" },
    { name: "Fiber Candle Stands", image: "/images/categories/fiber-candlestands.webp", tag: "fiber, candle-stands,  ", size: "col-span-2" },
  ],
  // Slide 3
  [
    { name: "Statues", image: "/images/categories/nativity-set.webp", tag: "statues", size: "col-span-2 row-span-2" },
    { name: "Holy Family Statues", image: "/images/categories/holy-family.webp", tag: "holy-family, statues", size: "col-span-2" },
    { name: "Mary Statues", image: "/images/categories/mary-statues.webp", tag: "mary, statues", size: "col-span-2" },
  ],
];

export default function FeaturedCategory() {
  return (
    <section className=" p-6">
      <h2 className="text-2xl font-bold text-center mb-10">Featured Categories</h2>
      <Carousel slideClass="w-full">
        {allCategories.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className="grid grid-cols-2 md:grid-cols-4 auto-rows-[300px] gap-6 w-full"
          >
            {slide.map((cat, catIndex) => (
              <div
                key={catIndex}
                className={`relative p-4 bg-secondary shadow-lg rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 ease-in-out ${cat.size}`}
              >
                <Link  href={`/products?tags=${encodeURIComponent(cat.tag)}`}>
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
                    <h3 className="text-xl backdrop-blur-xs rounded-full font-bold drop-shadow-md">
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
