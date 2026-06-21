'use client';

import React, { useState, ReactNode } from 'react';
import Image from 'next/image';

type SafeProductImageProps = {
  src: string | undefined | null;
  alt: string;
  fallback?: ReactNode;
  fill?: boolean;
  sizes?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  loading?: 'lazy' | 'eager';
};

export default function SafeProductImage({
  src,
  alt,
  fallback,
  fill,
  sizes,
  width,
  height,
  className,
  loading,
}: SafeProductImageProps) {
  const [imgState, setImgState] = useState<'optimizing' | 'unoptimized' | 'failed'>('optimizing');

  if (!src) {
    return fallback ? <>{fallback}</> : null;
  }

  if (imgState === 'failed') {
    return fallback ? <>{fallback}</> : null;
  }

  if (imgState === 'unoptimized') {
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`${className || ''} max-w-full max-h-full object-contain`.trim()}
          onError={() => setImgState('failed')}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        onError={() => setImgState('failed')}
      />
    );
  }

  // imgState === 'optimizing'
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        loading={loading}
        onError={() => setImgState('unoptimized')}
      />
    );
  }

  const numericWidth = typeof width === 'string' ? parseInt(width, 10) || undefined : width;
  const numericHeight = typeof height === 'string' ? parseInt(height, 10) || undefined : height;

  return (
    <Image
      src={src}
      alt={alt}
      width={numericWidth}
      height={numericHeight}
      className={className}
      loading={loading}
      onError={() => setImgState('unoptimized')}
    />
  );
}
