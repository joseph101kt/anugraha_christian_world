'use client';

import React from "react";
import Image from "next/image";
import Carousel from "./Carousel";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
  size?: string; // ✅ same pattern as FeaturedCategory
};

const testimonialSlides: Testimonial[][] = [
  [
    {
      name: "Rev Fr S Aloysius",
      role: "Rector & Parish Priest, St Anthony’s Shrine, Mettuguda, Secundrabad, Telangana",
      quote:
        "Anugraha Christian World at Mettuguda has been a great blessing to countless number of people, particularly to all the devotees of St Anthony of Padua who throng to his Shrine here.  The Lord has mightily used Biju George for His glory.  What started as a small religious articles shop, blessed by Archbishop Marampudi Joji, Archbishop of Hyderabad, in 2004, has thrived and grown marvellously these past 21 years.  As this website is launched on the Solemnity of the Assumption, may the Lord continue to shower His blessings by making every effort of Biju George fruitful and successful for His greater glory !!!",
      image: "/testimonials/fr-Aloysius.jpg",
      size: "col-span-4 row-span-1",
    },
    {
      name: "Rev Fr Dr VK Swamy",
      role: "Parish Priest, St. Alphonsa Church, Banjara Hills",
      quote:
        "I congratulate Mr Biju of Anugraha who is spreading the Word of God through his preaching and serving the society through holy articles. I appreciate his new initiative of launching website to enhance the visibility of his work and ministry",
      image: "/testimonials/Rev-Fr-Dr-VK-Swamy.jpg",
      size: "col-span-4 row-span-1",
    },


  ],
  [
    {
      name: "Rev Fr.S. Balashowry",
      role: "Parish Priest, Hamsavaram Church, Andhra Pradesh",
      quote:
        "Dear friends in Jesus Christ I am really happy to tell you about Anugraha Christian world. it's a wonderful place near Mettiguda St. Antotny's Shrine where we get all religious articles it's running by Br. Biju George and I am very happy to introduce him, he so wonderfully provides all religious articles . I am Fr S Balashowry praying for you and I support with my prayers. God bless you.",
      image: "/testimonials/fr-Aloysius.jpg",
      size: "col-span-4 row-span-1",
    },


  ],
];

export default function Testimonials() {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-center mb-10">
        What Our Community Says
      </h2>
      <Carousel slideClass="w-full">
        {testimonialSlides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className="grid grid-cols-2 md:grid-cols-4 auto-rows-[300px] gap-6 w-full"
          >
            {slide.map((t, tIndex) => (
              <div
                key={tIndex}
                className={`relative bg-secondary shadow-lg rounded-lg overflow-hidden hover:scale-[1.02] transition-transform duration-200 ease-in-out ${t.size || ""}`}
              >
          

                {/* Text Overlay */}
                <div className="relative z-10 flex flex-col justify-end h-full p-4">
                  <p className="italic text-sm md:text-base mb-3">
                    “{t.quote}”
                  </p>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">
                      {t.name}
                    </h3>
                    <p className="font-light">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </Carousel>
    </section>
  );
}
