import React from 'react'

/**
 * OptimizedImage component with lazy loading and modern format support
 * @param {Object} props - Component props
 * @param {string} props.src - Primary image source
 * @param {string} props.webpSrc - WebP format source (optional)
 * @param {string} props.avifSrc - AVIF format source (optional)
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.className - CSS classes
 * @param {boolean} props.priority - High priority/LCP image
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 */
const OptimizedImage = ({ 
  src, 
  webpSrc, 
  avifSrc, 
  alt, 
  className = '', 
  priority = false,
  width,
  height 
}) => {
  // For LCP/hero images, use fetchpriority
  if (priority) {
    return (
      <picture>
        {avifSrc && (
          <source srcSet={avifSrc} type="image/avif" />
        )}
        {webpSrc && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          fetchpriority="high"
          decoding="sync"
        />
      </picture>
    )
  }

  // For non-critical images, use lazy loading
  return (
    <picture>
      {avifSrc && (
        <source srcSet={avifSrc} type="image/avif" />
      )}
      {webpSrc && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  )
}

export default OptimizedImage