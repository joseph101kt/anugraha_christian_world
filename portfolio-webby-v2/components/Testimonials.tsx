'use client';

import Image from "next/image";
import Carousel from "./Carousel";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
  large?: boolean;
};

// Split testimonials into "slides" for the carousel
const testimonialSlides: Testimonial[][] = [
  [
    {
      name: "Fr. John K.",
      role: "Parish Priest",
      quote: "Anugraha’s offerings uplift our ceremonies with grace and elegance.",
      image: "/testimonials/fr-john.jpg",
      large: true,
    },
    {
      name: "Sr. Mary Teresa",
      role: "Nun",
      quote: "A sanctuary of spiritual treasures.",
      image: "/testimonials/sr-mary.jpg",
    },
    {
      name: "Fr. Dominic",
      role: "Retired Priest",
      quote: "Deeply impressed by the authenticity of their articles.",
      image: "/testimonials/fr-dominic.jpg",
    },
    {
      name: "Sr. Agnes",
      role: "Missionary",
      quote: "Their rosaries travel with us in prayer.",
      image: "/testimonials/sr-agnes.jpg",
    },
        {
      name: "Sr. Agnes",
      role: "Missionary",
      quote: "Their rosaries travel with us in prayer.",
      image: "/testimonials/sr-agnes.jpg",
    },
  ],
  [
    {
      name: "Br. Andrew",
      role: "Youth Coordinator",
      quote: "Perfect place for gifts that matter.",
      image: "/testimonials/br-andrew.jpg",
    },
    // Optionally repeat some or add more testimonials for balance
    {
      name: "Sr. Mary Teresa",
      role: "Nun",
      quote: "A sanctuary of spiritual treasures.",
      image: "/testimonials/sr-mary.jpg",
    },
    {
      name: "Fr. Dominic",
      role: "Retired Priest",
      quote: "Deeply impressed by the authenticity of their articles.",
      image: "/testimonials/fr-dominic.jpg",
    },
    {
      name: "Sr. Agnes",
      role: "Missionary",
      quote: "Their rosaries travel with us in prayer.",
      image: "/testimonials/sr-agnes.jpg",
    },
  ]
];

export default function Testimonials() {
  return (
    <section className="bg-gradient-to-br p-6">
      <h2 className="text-3xl font-bold text-center mb-10">
        What Our Community Says
      </h2>

      <Carousel slideClass="w-full">
        {testimonialSlides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-[250px] gap-6 w-full"
          >
            {slide.map((t, i) => (
              <div
                key={i}
                className={`relative p-4 bg-secondary shadow-lg rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 ease-in-out ${t.large ? "md:col-span-2" : ""}`}
              >
                <div className="flex items-center mb-4 space-x-4 relative z-10">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3
                      className={`font-semibold ${
                        t.large ? "text-xl font-script" : "text-md"
                      }`}
                    >
                      {t.name}
                    </h3>
                    <p className="text-sm text-muted">{t.role}</p>
                  </div>
                </div>
                <p
                  className={`italic relative z-10 ${
                    t.large ? "font-script text-lg" : "text-sm"
                  }`}
                >
                  “{t.quote}”
                </p>
              </div>
            ))}
          </div>
        ))}
      </Carousel>
    </section>
  );
}
