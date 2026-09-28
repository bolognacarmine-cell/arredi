/**
 * Watermark Farcom — layout UI adattivo + trasformazione Cloudinary opzionale (SEO).
 *
 * Il watermark UI è ancorato all'area visibile della foto (dopo object-fit).
 * Con object-contain usare `objectFitContentRect` e montare l'overlay sul
 * content-rect, non sul viewport (altrimenti finisce sul letterbox).
 * Gli originali Cloudinary restano puliti. Non combinare mai overlay UI + URL
 * già trasformato con l_farcom sulla stessa immagine pubblica.
 *
 * Public ID logo: farcom/brand/logo-farcom
 */

export const FARCOM_WATERMARK_PUBLIC_ID = "farcom/brand/logo-farcom"

/** Marker overlay Cloudinary (slash → colon). */
export const FARCOM_WATERMARK_MARKER = "l_farcom:brand:logo-farcom"

/**
 * Overlay Cloudinary solo per URL non renderizzati con overlay UI
 * (es. Open Graph / crawler). Margini relativi 4%, logo ~10%.
 */
export const FARCOM_WATERMARK_TRANSFORM =
  "l_farcom:brand:logo-farcom,w_0.10,fl_relative,o_80,g_south_east,x_0.04,y_0.04"

/** Aspect ratio del file logo-farcom.png (1915×821). */
export const FARCOM_LOGO_ASPECT = 1915 / 821

/**
 * Larghezza minima leggibile (contenitori medi/grandi).
 * Su card strette si usa `minLogoWidth()` più basso.
 */
export const MIN_LOGO_WIDTH = 28

/** Cap massimo su viewport grandi. */
export const MAX_LOGO_WIDTH = 168

/**
 * Sotto questa larghezza contenitore il watermark è nascosto
 * (troppo piccolo per un logo discreto e leggibile).
 */
export const MIN_WATERMARK_CONTAINER_WIDTH = 240

/** Lato minimo (w e h) sotto cui non montare/mostrare il watermark (miniature). */
export const MIN_WATERMARK_EDGE = 72

/**
 * Contenitori sotto questa larghezza usano safe-area e % logo “compact/mobile”.
 * Basato sulla dimensione reale del contenitore, non sulla viewport.
 */
export const COMPACT_CONTAINER_MAX = 640

/** Margine anti-collisione tra logo e controlli UI. */
export const OBSTACLE_GAP = 8

/**
 * Bleed del bounding box reale (ombra / antialias).
 * Nessuna box-shadow CSS attuale: 2px per sicurezza antialias.
 */
export const LOGO_SHADOW_BLEED = 2

/** True se il contenitore è troppo piccolo per qualsiasi watermark. */
export function isWatermarkContainerTooSmall(containerW: number, containerH: number): boolean {
  return (
    !containerW ||
    !containerH ||
    containerW < MIN_WATERMARK_EDGE ||
    containerH < MIN_WATERMARK_EDGE ||
    containerW < MIN_WATERMARK_CONTAINER_WIDTH
  )
}

/**
 * Larghezza minima logo: più bassa su card strette così si riduce
 * prima di cambiare angolo, senza tagliare.
 */
export function minLogoWidth(containerW: number): number {
  if (containerW < 360) return 18
  return MIN_LOGO_WIDTH
}

export type WatermarkCorner = "south_east" | "south_west" | "north_east" | "north_west"

/** Ordine fallback professionale: SE → SW → NE → NW. */
export const WATERMARK_CORNER_ORDER: WatermarkCorner[] = [
  "south_east",
  "south_west",
  "north_east",
  "north_west",
]

export type Rect = { x: number; y: number; w: number; h: number }

export type EdgeInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

export type WatermarkLayout = {
  /** false = spazio insufficiente anche al minimo → nascondi (mai tagliare). */
  visible: boolean
  corner: WatermarkCorner
  /** Safe inset uniforme calcolato dal lato corto (prima degli extra). */
  padding: number
  /** Inset effettivi per-lato (safe + extraInset). */
  insets: EdgeInsets
  /** Larghezza logo in px (contenuto, senza bleed). */
  width: number
  /** Altezza logo in px. */
  height: number
  /** Bounding box completo incluso bleed, in coordinate contenitore. */
  box: Rect
  opacity: number
}

export type ComputeWatermarkOptions = {
  /** Zone UI da evitare (frecce, counter, badge, dots…). Coordinate contenitore. */
  obstacles?: Rect[]
  /** Aspect ratio reale del logo (naturalWidth/naturalHeight). */
  logoAspect?: number
  /** Spazio extra oltre la safe area (es. barra dots carosello). */
  extraInset?: Partial<EdgeInsets>
  /** Bleed ombra/antialias incluso nel box. */
  shadowBleed?: number
  /** Gap minimo tra logo e ostacoli. */
  obstacleGap?: number
}

/**
 * Safe area interna: 4% del lato corto.
 * - compact (contenitore &lt; 640): clamp 16–32 px (mobile/tablet card)
 * - desktop: clamp 24–64 px
 */
export function computeSafeInset(containerW: number, containerH: number): number {
  const short = Math.min(containerW, containerH)
  const raw = short * 0.04
  if (containerW < COMPACT_CONTAINER_MAX) {
    return Math.round(Math.min(32, Math.max(16, raw)))
  }
  return Math.round(Math.min(64, Math.max(24, raw)))
}

/**
 * Larghezza logo relativa alla larghezza del contenitore visibile.
 * Breakpoint sul contenitore (non sulla viewport):
 * - ≥900 → 9%; 640–899 → 11%; 360–639 → 9%; 240–359 → 8%; &lt;240 → nascosto a monte.
 */
export function computeLogoWidthPct(containerW: number): number {
  if (containerW >= 900) return 0.09
  if (containerW >= 640) return 0.11
  if (containerW >= 360) return 0.09
  if (containerW >= MIN_WATERMARK_CONTAINER_WIDTH) return 0.08
  return 0
}

export function rectsOverlap(a: Rect, b: Rect, gap = 0): boolean {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  )
}

export function fitsInContainer(box: Rect, containerW: number, containerH: number): boolean {
  const eps = 0.5
  return (
    box.x >= -eps &&
    box.y >= -eps &&
    box.x + box.w <= containerW + eps &&
    box.y + box.h <= containerH + eps
  )
}

/**
 * Rettangolo dell'immagine effettivamente disegnata dentro il contenitore
 * con CSS object-fit contain/cover (coordinate del contenitore).
 * Per contain con letterbox/pillarbox il watermark va ancorato qui,
 * non al viewport intero (altrimenti finisce sul fondo grigio).
 */
export function objectFitContentRect(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
  fit: "contain" | "cover" = "contain",
): Rect {
  if (!containerW || !containerH) {
    return { x: 0, y: 0, w: 0, h: 0 }
  }
  if (!naturalW || !naturalH || fit === "cover") {
    return { x: 0, y: 0, w: containerW, h: containerH }
  }
  const cAspect = containerW / containerH
  const iAspect = naturalW / naturalH
  if (iAspect > cAspect) {
    // Immagine più larga: barre sopra/sotto
    const h = containerW / iAspect
    return { x: 0, y: (containerH - h) / 2, w: containerW, h }
  }
  // Immagine più alta/stretta: barre sinistra/destra
  const w = containerH * iAspect
  return { x: (containerW - w) / 2, y: 0, w, h: containerH }
}

/** Sposta ostacoli dal sistema viewport a quello del content-rect. */
export function translateRects(rects: Rect[], dx: number, dy: number): Rect[] {
  if (!dx && !dy) return rects
  return rects.map((r) => ({ ...r, x: r.x + dx, y: r.y + dy }))
}

/**
 * Bounding box del logo in un angolo, inclusi padding e bleed (ombra/antialias).
 */
export function logoBoundingBox(
  corner: WatermarkCorner,
  containerW: number,
  containerH: number,
  logoW: number,
  logoH: number,
  insets: EdgeInsets,
  bleed: number,
): Rect {
  const bw = logoW + bleed * 2
  const bh = logoH + bleed * 2
  switch (corner) {
    case "south_west":
      return {
        x: insets.left,
        y: containerH - insets.bottom - bh,
        w: bw,
        h: bh,
      }
    case "north_east":
      return {
        x: containerW - insets.right - bw,
        y: insets.top,
        w: bw,
        h: bh,
      }
    case "north_west":
      return {
        x: insets.left,
        y: insets.top,
        w: bw,
        h: bh,
      }
    case "south_east":
    default:
      return {
        x: containerW - insets.right - bw,
        y: containerH - insets.bottom - bh,
        w: bw,
        h: bh,
      }
  }
}

function collidesAny(box: Rect, obstacles: Rect[], gap: number): boolean {
  for (const o of obstacles) {
    if (o.w <= 0 || o.h <= 0) continue
    if (rectsOverlap(box, o, gap)) return true
  }
  return false
}

function preferredWidth(containerW: number): number {
  const pct = computeLogoWidthPct(containerW)
  if (pct <= 0) return 0
  return Math.min(MAX_LOGO_WIDTH, containerW * pct)
}

/**
 * Prova un angolo: parte dalla larghezza preferita e riduce fino a MIN.
 * Riduce la dimensione prima di fallire (il chiamante prova poi l'angolo successivo).
 * Ritorna null se anche il minimo collide o esce dalla safe area.
 *
 * Il fallback angolo scatta solo per fit/collisione UI — non per contenuto prodotto.
 */
function tryCorner(
  corner: WatermarkCorner,
  containerW: number,
  containerH: number,
  insets: EdgeInsets,
  aspect: number,
  targetW: number,
  obstacles: Rect[],
  bleed: number,
  gap: number,
  floorW: number,
): { width: number; height: number; box: Rect } | null {
  const maxContentW = Math.max(0, containerW - insets.left - insets.right - bleed * 2)
  const maxContentH = Math.max(0, containerH - insets.top - insets.bottom - bleed * 2)
  if (maxContentW < floorW || maxContentH < floorW / aspect) {
    return null
  }

  let width = Math.min(targetW, maxContentW, maxContentH * aspect)
  if (width < floorW) {
    // Spazio massimo sotto il minimo: prova comunque al massimo disponibile,
    // ma se resta < floor nascondi (gestito dal chiamante).
    width = maxContentW
  }

  // Riduci finché entra senza collisione; stop a floorW (mai tagliare).
  const floor = Math.min(floorW, maxContentW)
  while (width >= floor - 0.5) {
    const w = Math.round(width)
    const h = Math.round(w / aspect)
    if (h > maxContentH) {
      width -= 2
      continue
    }
    const box = logoBoundingBox(corner, containerW, containerH, w, h, insets, bleed)
    if (fitsInContainer(box, containerW, containerH) && !collidesAny(box, obstacles, gap)) {
      return { width: w, height: h, box }
    }
    width -= 2
  }
  return null
}

const HIDDEN: WatermarkLayout = {
  visible: false,
  corner: "south_east",
  padding: 0,
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  width: 0,
  height: 0,
  box: { x: 0, y: 0, w: 0, h: 0 },
  opacity: 0.8,
}

/**
 * Calcola layout watermark rispetto all'area visibile finale.
 * Ordine angoli: basso-destra → basso-sinistra → alto-destra → alto-sinistra.
 * Nasconde se nessuno angolo ospita il logo intero (anche al minimo).
 */
export function computeWatermarkLayout(
  containerW: number,
  containerH: number,
  options: ComputeWatermarkOptions = {},
): WatermarkLayout {
  if (isWatermarkContainerTooSmall(containerW, containerH)) {
    return { ...HIDDEN }
  }

  const aspect = options.logoAspect && options.logoAspect > 0 ? options.logoAspect : FARCOM_LOGO_ASPECT
  const bleed = options.shadowBleed ?? LOGO_SHADOW_BLEED
  const gap = options.obstacleGap ?? OBSTACLE_GAP
  const obstacles = options.obstacles ?? []
  const floorW = minLogoWidth(containerW)

  const padding = computeSafeInset(containerW, containerH)
  const insets: EdgeInsets = {
    top: padding + (options.extraInset?.top ?? 0),
    right: padding + (options.extraInset?.right ?? 0),
    bottom: padding + (options.extraInset?.bottom ?? 0),
    left: padding + (options.extraInset?.left ?? 0),
  }

  const targetW = preferredWidth(containerW)
  if (targetW < floorW) {
    return { ...HIDDEN, padding, insets }
  }

  for (const corner of WATERMARK_CORNER_ORDER) {
    const fit = tryCorner(
      corner,
      containerW,
      containerH,
      insets,
      aspect,
      targetW,
      obstacles,
      bleed,
      gap,
      floorW,
    )
    if (fit && fit.width >= floorW) {
      return {
        visible: true,
        corner,
        padding,
        insets,
        width: fit.width,
        height: fit.height,
        box: fit.box,
        opacity: 0.8,
      }
    }
  }

  return {
    ...HIDDEN,
    padding,
    insets,
  }
}

export function watermarkCornerStyle(
  corner: WatermarkCorner,
  insets: EdgeInsets,
): { top?: number; right?: number; bottom?: number; left?: number } {
  switch (corner) {
    case "south_west":
      return { left: insets.left, bottom: insets.bottom }
    case "north_east":
      return { right: insets.right, top: insets.top }
    case "north_west":
      return { left: insets.left, top: insets.top }
    case "south_east":
    default:
      return { right: insets.right, bottom: insets.bottom }
  }
}

/**
 * Ostacoli tipici del carosello prodotti (coordinate viewport).
 * Usati solo per evitare controlli UI — non per contenuto prodotto.
 */
export function carouselWatermarkObstacles(
  containerW: number,
  containerH: number,
  opts: { multiSlide: boolean; hasOverlay: boolean },
): Rect[] {
  const out: Rect[] = []
  if (opts.hasOverlay) {
    // Badge / overlay alto-sinistra (proporzionale su mobile)
    out.push({
      x: 8,
      y: 8,
      w: Math.min(180, Math.max(96, containerW * 0.42)),
      h: Math.min(72, Math.max(40, containerH * 0.14)),
    })
  }
  if (!opts.multiSlide) return out

  const compact = containerW < COMPACT_CONTAINER_MAX
  const arrow = compact ? 44 : 48
  const counterW = compact ? 64 : 70
  const counterH = 32
  // Contatore "n / m" alto-destra
  out.push({
    x: containerW - counterW - 10,
    y: 10,
    w: counterW,
    h: counterH,
  })
  // Frecce laterali (centro) — hit area reale dei controlli
  out.push({ x: 8, y: containerH / 2 - arrow / 2, w: arrow, h: arrow })
  out.push({
    x: containerW - arrow - 8,
    y: containerH / 2 - arrow / 2,
    w: arrow,
    h: arrow,
  })
  // Indicatori dots + gradient in basso (allineato all'extra inset ≥40 px)
  const dotsH = 56
  out.push({
    x: containerW * 0.1,
    y: containerH - dotsH,
    w: containerW * 0.8,
    h: dotsH,
  })
  return out
}

/**
 * Inserisce il watermark Farcom in un URL Cloudinary (SEO / share).
 * Non usare insieme all'overlay UI sulla stessa immagine pubblica.
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

/** Rimuove un eventuale overlay Farcom già presente nell'URL. */
export function withoutFarcomWatermark(url: string): string {
  if (!url || !url.includes(FARCOM_WATERMARK_MARKER)) return url
  return url
    .replace(/\/?l_farcom:brand:logo-farcom(?:,[a-z0-9_.]+)*\/?/gi, "/")
    .replace("/upload//", "/upload/")
    .replace(/([^:])\/{2,}/g, "$1/")
}

export function withoutFarcomWatermarkAll(urls: string[]): string[] {
  return urls.map(withoutFarcomWatermark)
}
