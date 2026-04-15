'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  placeholderColor?: string;
}

export default function OptimizedImage({
  placeholderColor = '#e5e7eb',
  className = '',
  alt,
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // For fill mode, use absolute positioning
  if (fill) {
    return (
      <div className="relative w-full h-full">
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundColor: placeholderColor }}
        />
        <Image
          {...props}
          alt={alt}
          fill
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  // For non-fill mode, let image determine size
  return (
    <div className="relative inline-block w-full">
      <div
        className={`absolute inset-0 transition-opacity duration-300 rounded-lg ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ backgroundColor: placeholderColor }}
      />
      <Image
        {...props}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
