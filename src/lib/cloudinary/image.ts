import { CLOUDINARY_CLOUD_NAME, isCloudinaryConfigured } from "./config"

export type CloudinaryResizeOptions = {
  width?: number
  height?: number
  objectFit?: "cover" | "contain" | "fill" | "inside" | "outside"
  gravity?: "auto" | "faces" | "center"
  quality?: "auto" | number
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

  const transforms: string[] = [`f_auto`, `q_${q}`]

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
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,${w ? `w_${w},` : ""}${h ? `h_${h},` : ""}f_auto,q_auto/${encodeURIComponent(publicId)}`
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
  if (publicId && isCloudinaryConfigured) {
    return buildCloudinaryImageUrl(publicId, options)
  }
  if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
    return src
  }
  return src
}
