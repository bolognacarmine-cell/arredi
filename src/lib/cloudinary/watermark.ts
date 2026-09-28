/**
 * Watermark Farcom via trasformazione dinamica Cloudinary.
 * Non modifica né sovrascrive i file originali su Cloudinary.
 *
 * Public ID del logo: farcom/brand/logo-farcom
 * (caricato da public/logo-farcom.png — PNG RGBA già con trasparenza)
 */

/** Overlay: basso-destra, ~14% larghezza, opacità 80%, margine 25px. */
export const FARCOM_WATERMARK_PUBLIC_ID = "farcom/brand/logo-farcom"

/** Marker usato per evitare overlay duplicati (slash → colon in overlay Cloudinary). */
export const FARCOM_WATERMARK_MARKER = "l_farcom:brand:logo-farcom"

/**
 * w_0.14 + fl_relative → larghezza logo = 14% dell'immagine base
 * (resta proporzionale anche con resize responsive a monte/valle).
 */
export const FARCOM_WATERMARK_TRANSFORM =
  "l_farcom:brand:logo-farcom,w_0.14,fl_relative,o_80,g_south_east,x_25,y_25"

/**
 * Inserisce il watermark Farcom in un URL Cloudinary.
 * - Ignora URL non-Cloudinary (placehold, data URL, ecc.)
 * - Se il watermark è già presente, restituisce l'URL invariato
 * - Gli originali restano accessibili senza trasformazione
 */
export function withFarcomWatermark(url: string): string {
  if (!url || typeof url !== "string") return url
  if (!url.includes("res.cloudinary.com/")) return url
  if (url.includes(FARCOM_WATERMARK_MARKER)) return url

  const marker = "/upload/"
  const idx = url.indexOf(marker)
  if (idx === -1) return url

  const before = url.slice(0, idx + marker.length)
  const after = url.slice(idx + marker.length)
  return `${before}${FARCOM_WATERMARK_TRANSFORM}/${after}`
}

export function withFarcomWatermarkAll(urls: string[]): string[] {
  return urls.map(withFarcomWatermark)
}
