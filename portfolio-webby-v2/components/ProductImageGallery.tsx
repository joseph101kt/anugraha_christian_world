// components/ProductImageGallery.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  name: string;
  mainImage: string;
  secondaryImages: string[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  name,
  mainImage,
  secondaryImages,
}) => {
  const [currentImage, setCurrentImage] = useState(mainImage);

  // Combine main and secondary images for thumbnail display
  const allThumbnails = [mainImage, ...secondaryImages];

  return (
    <div className="w-full">
      {/* 🖼 Main Image */}
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-4">
        <Image
          src={currentImage}
          alt={name}
          fill
          className="object-contain transition-opacity duration-300"
        />
      </div>

      {/* 🔄 Thumbnails (Main + Secondary) */}
      <div className="flex flex-wrap gap-2">
        {allThumbnails.map((imgUrl, index) => (
          <div
            key={index}
            onClick={() => setCurrentImage(imgUrl)}
            className={`relative w-24 h-16 rounded-md overflow-hidden cursor-pointer border transition-colors ${
              currentImage === imgUrl
                ? 'border-accent'
                : 'border-gray-300 hover:border-accent'
            }`}
            title={index === 0 ? 'Main image' : `Secondary image ${index}`}
          >
            <Image
              src={imgUrl}
              alt={`${name} preview ${index}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
