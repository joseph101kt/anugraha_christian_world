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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-[92%] max-w-lg overflow-hidden rounded-3xl shadow-2xl bg-[var(--color-background)] animate-slideUpAndFade">

        {/* 🎄 Image Section */}
        <div className="relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1543589077-47d81606c1bf"
            alt="Merry Christmas"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
          <h2 className="absolute bottom-4 left-4 text-white text-3xl drop-shadow-lg">
            Merry Christmas 🎄
          </h2>
        </div>

        {/* ✨ Content */}
        <div className="p-6 text-center">
          <p className="text-lg text-muted mb-4">
            Wishing you warmth, joy, and festive cheer!
          </p>

          {/* 🔔 Bottom Notice */}
          <div className="mt-6 rounded-xl bg-secondary p-4">
            <p className="font-medium text-base mb-3">
              Shop will be closed on <strong>25th</strong> and <strong>26th</strong>
            </p>

            <button
              onClick={onClose}
              className="btn btn-primary w-full hover-scale"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
