import { useState } from 'react'

interface PictureImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'eager' | 'lazy'
  fetchpriority?: 'high' | 'low' | 'auto'
  decoding?: 'sync' | 'async' | 'auto'
  priority?: boolean
}

/**
 * PictureImage - Componente immagine con supporto WebP/AVIF per immagini esterne
 * 
 * Per immagini da CDN esterni (Unsplash, Cloudinary, ecc.) che supportano
 * automaticamente formati moderni tramite parametri URL.
 */
export default function PictureImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  fetchpriority = 'auto',
  decoding = 'async',
  priority = false,
}: PictureImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Se priority è true, usa eager loading
  const finalLoading = priority ? 'eager' : loading
  const finalFetchPriority = priority ? 'high' : fetchpriority

  // Per Unsplash e altri CDN, aggiungi parametri per formati moderni
  const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'avif' | 'jpg') => {
    if (originalSrc.includes('unsplash.com')) {
      // Unsplash supporta formati via URL parameters
      return originalSrc.replace('auto=format', `auto=format&fm=${format}`)
    }
    if (originalSrc.includes('cloudinary.com')) {
      // Cloudinary supporta formati via transformation
      return originalSrc.replace('/upload/', `/upload/f_${format}/`)
    }
    // Per altri CDN, ritorna l'originale (fallback)
    return originalSrc
  }

  const webpSrc = getOptimizedSrc(src, 'webp')
  const avifSrc = getOptimizedSrc(src, 'avif')
  const fallbackSrc = getOptimizedSrc(src, 'jpg')

  return (
    <picture className={className}>
      {/* AVIF per browser moderni */}
      <source
        srcSet={avifSrc}
        type="image/avif"
      />
      {/* WebP per compatibilità più ampia */}
      <source
        srcSet={webpSrc}
        type="image/webp"
      />
      {/* Fallback JPG */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={finalLoading}
        fetchPriority={finalFetchPriority}
        decoding={decoding}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{ 
          backgroundColor: isLoaded ? 'transparent' : '#f3f4f6',
        }}
      />
    </picture>
  )
}