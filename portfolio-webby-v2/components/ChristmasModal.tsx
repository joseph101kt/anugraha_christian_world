'use client';

import Image from 'next/image';
import { useEffect } from 'react';

type ChristmasModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChristmasModal({ isOpen, onClose }: ChristmasModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div
        className="
          relative
          w-[95%]
          max-w-3xl
          overflow-hidden
          rounded-3xl
          shadow-2xl
          bg-[var(--color-background)]
          animate-slideUpAndFade
        "
      >
        {/* 🎄 Image Section */}
        <div className="relative h-80 w-full">
          <Image
            src="/christmas.png"
            alt="Merry Christmas"
            fill
            className="object-cover"
            priority
          />

          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-black/35" />

          <h2
            className="
              absolute
              bottom-6
              left-6
              text-white
              text-4xl
              md:text-5xl
              drop-shadow-xl
            "
          >
            Merry Christmas 🎄
          </h2>
        </div>

        {/* ✨ Content */}
        <div className="p-8 text-center">
          <p className="text-xl font-medium text-[var(--color-text)] mb-6">
            Wishing you warmth, joy, and festive cheer!
          </p>

          {/* 🔔 Bottom Notice */}
          <div className="mt-4 rounded-2xl bg-secondary p-6">
            <p className="font-semibold text-lg text-[var(--color-text)] mb-4">
              Shop will be closed on{' '}
              <span className="text-red-700 font-bold">25th</span> and{' '}
              <span className="text-red-700 font-bold">26th</span>
            </p>

            <button
              onClick={onClose}
              className="
                w-full
                rounded-xl
                py-3
                text-lg
                font-semibold
                text-white
                bg-red-600
                hover:bg-red-700
                active:bg-red-800
                transition-all
                hover-scale
              "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
