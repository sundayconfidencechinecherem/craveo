/**
 * Image optimization utilities for Craveo
 */

export const imageConfig = {
  quality: 85,
  formats: ['webp', 'avif'] as const,
  breakpoints: [640, 768, 1024, 1280, 1536],
};

export interface ImageOptimizationOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Generates optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(options: ImageOptimizationOptions) {
  const {
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  } = options;

  // Explicitly type loading as 'eager' | 'lazy'
  const loading: 'eager' | 'lazy' = priority ? 'eager' : 'lazy';

  return {
    src,
    alt,
    width: width || 800,
    height: height || 600,
    className: `${className} object-cover`,
    priority,
    sizes,
    loading, // now correctly typed
    quality: imageConfig.quality,
  };
}


export function generateSrcSet(src: string, widths: number[] = imageConfig.breakpoints): string {
  return widths.map((w) => `${src}?width=${w} ${w}w`).join(', ');
}

export function generatePictureSources(src: string, alt: string, widths: number[] = imageConfig.breakpoints) {
  const sources = imageConfig.formats.map((format) => ({
    type: `image/${format}`,
    srcSet: widths.map((w) => `${src}?format=${format}&width=${w} ${w}w`).join(', '),
  }));

  return {
    sources,
    fallback: {
      src,
      alt,
      srcSet: generateSrcSet(src, widths),
    },
  };
}

export function lazyLoadImage(imageElement: HTMLImageElement, src: string, srcset?: string) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (srcset) img.srcset = srcset;
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '50px' }
  );
  observer.observe(imageElement);
}

export function preloadImage(url: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  link.fetchPriority = 'high';
  document.head.appendChild(link);
  return link;
}
