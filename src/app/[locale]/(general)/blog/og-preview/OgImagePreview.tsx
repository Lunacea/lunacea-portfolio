'use client';

import { useState } from 'react';

interface OgImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export default function OgImagePreview({ src, alt, className }: OgImagePreviewProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/ogp-2025-06-09-14_11_26.png');
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={imgSrc} 
        alt={alt} 
        className={className}
        onError={handleError}
      />
      {hasError && (
        <div className="absolute inset-0 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded flex items-center justify-center">
          <span className="text-red-600 dark:text-red-400 text-sm">
            フォールバック画像
          </span>
        </div>
      )}
    </div>
  );
}

