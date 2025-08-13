'use client';

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';

interface CarouselProps {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  slideClass?: string;
}

export default function Carousel({ children, options, slideClass = 'w-full' }: CarouselProps) {
  // Force loop to be true, merge with user options
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative h-full w-full">
      {/* Carousel track */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex w-full">
          {React.Children.map(children, (child, index) => (
            <div key={index} className={`flex-none ${slideClass}`}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10 w-15 h-15 rounded-full backdrop-blur-md bg-accent/80 hover:bg-accent/100 flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-140"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={scrollNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-15 h-15 rounded-full backdrop-blur-md bg-accent/80 hover:bg-accent/100 flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-140"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
