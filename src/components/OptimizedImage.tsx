import { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps {
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
 * OptimizedImage - Componente immagine con supporto WebP/AVIF e fallback
 * 
 * Implementa automaticamente:
 * - <picture> element con WebP/AVIF fallback
 * - Lazy loading nativo o eager per above-the-fold
 * - Fetch priority per LCP optimization
 * - Decoding async per performance
 * - Fallback PNG/JPG per browser legacy
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  fetchpriority = 'auto',
  decoding = 'async',
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Genera percorsi per formati moderni
  const getFormatPath = (format: 'webp' | 'avif') => {
    const ext = src.split('.').pop()?.toLowerCase()
    const baseName = src.replace(`.${ext}`, '')
    return `${baseName}.${format}`
  }

  const webpSrc = getFormatPath('webp')
  const avifSrc = getFormatPath('avif')

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback se WebP/AVIF non sono supportati
    const target = e.target as HTMLImageElement
    if (target.src !== src) {
      target.src = src
    }
  }

  // Se priority è true, usa eager loading
  const finalLoading = priority ? 'eager' : loading
  const finalFetchPriority = priority ? 'high' : fetchpriority

  return (
    <picture className={className}>
      {/* AVIF per browser moderni ( migliore compressione) */}
      <source
        srcSet={avifSrc}
        type="image/avif"
      />
      {/* WebP per compatibilità più ampia */}
      <source
        srcSet={webpSrc}
        type="image/webp"
      />
      {/* Fallback PNG/JPG */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={finalLoading}
        fetchPriority={finalFetchPriority}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
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