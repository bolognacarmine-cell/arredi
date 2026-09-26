import { CLOUDINARY_CLOUD_NAME, isCloudinaryConfigured } from "./config"

export type CloudinaryResizeOptions = {
  width?: number
  height?: number
  objectFit?: "cover" | "contain" | "fill" | "inside" | "outside"
  gravity?: "auto" | "faces" | "center"
  quality?: "auto" | number
  format?: "auto" | "webp" | "avif" | "jpg" | "png"
  dpr?: number
}

export function buildCloudinaryImageUrl(
  publicId: string,
  options?: CloudinaryResizeOptions,
): string {
  if (!isCloudinaryConfigured) return getFallbackUrl(publicId, options)

  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId
  }

  const q = options?.quality ?? "auto"
  const format = options?.format ?? "auto"
  const dpr = options?.dpr

  const transforms: string[] = [`f_${format}`, `q_${q}`]

  if (dpr) {
    transforms.push(`dpr_${dpr}`)
  }

  if (options?.width || options?.height) {
    const w = options.width
    const h = options.height
    const fit = options.objectFit ?? "cover"

    let crop = "fill"
    if (fit === "contain" || fit === "inside") crop = "scale"
    if (fit === "fill") crop = "fill"

    let gravity = "auto"
    if (options.gravity === "faces") gravity = "face"
    if (options.gravity === "center") gravity = "center"

    transforms.push(`c_${crop}`)
    if (w) transforms.push(`w_${w}`)
    if (h) transforms.push(`h_${h}`)
    if (gravity && crop === "fill") transforms.push(`g_${gravity}`)
  }

  const transformStr = transforms.join(",")
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${encodeURIComponent(publicId)}`
}

function getFallbackUrl(
  publicId: string,
  options?: CloudinaryResizeOptions,
): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId
  }
  const w = options?.width
  const h = options?.height
  const format = options?.format ?? "auto"
  const quality = options?.quality ?? "auto"
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,${w ? `w_${w},` : ""}${h ? `h_${h},` : ""}f_${format},q_${quality}/${encodeURIComponent(publicId)}`
}

export function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(
    /res\.cloudinary\.com\/([^/]+)\/(?:image|video)\/upload\/(?:v\d+\/)?([^.?]+)/,
  )
  return match ? decodeURIComponent(match[2]) : null
}

export type SrcOrPublicIdPair = {
  src: string
  publicId?: string | null
}

export function resolveImageUrl(
  pair: SrcOrPublicIdPair,
  options?: CloudinaryResizeOptions,
): string {
  const { src, publicId } = pair
  // Use Cloudinary if configured and publicId is provided (priority over src)
  if (publicId && isCloudinaryConfigured) {
    return buildCloudinaryImageUrl(publicId, options)
  }
  // If src is a full URL (Unsplash, etc.), optimize it
  if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
    return optimizeExternalUrl(src, options)
  }
  // Fallback to src
  return src
}

/**
 * Ottimizza URL di immagini esterne (Unsplash, ecc.) con parametri CDN
 */
export function optimizeExternalUrl(
  url: string,
  options?: CloudinaryResizeOptions,
): string {
  const { width, height, quality = 85 } = options || {}

  try {
    const urlObj = new URL(url)

    // Unsplash optimization
    if (urlObj.hostname.includes('unsplash.com')) {
      const params = new URLSearchParams(urlObj.search)
      params.set('auto', 'format')
      params.set('fit', 'crop')
      if (width) params.set('w', width.toString())
      if (height) params.set('h', height.toString())
      params.set('q', quality.toString())
      urlObj.search = params.toString()
      return urlObj.toString()
    }

    // Cloudinary optimization (se già su Cloudinary)
    if (urlObj.hostname.includes('cloudinary.com')) {
      // Cloudinary già ottimizzato tramite buildCloudinaryImageUrl
      return url
    }

    // Per altri servizi, ritorna l'URL originale
    return url
  } catch (error) {
    // Se l'URL non è valido, ritorna l'originale
    return url
  }
}
