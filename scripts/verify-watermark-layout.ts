/**
 * Verifica valori responsive del layout watermark Farcom (container-based).
 * Esegui: npx tsx scripts/verify-watermark-layout.ts
 */
import {
  COMPACT_CONTAINER_MAX,
  FARCOM_LOGO_ASPECT,
  MAX_LOGO_WIDTH,
  MIN_WATERMARK_CONTAINER_WIDTH,
  MIN_WATERMARK_EDGE,
  computeLogoWidthPct,
  computeSafeInset,
  computeWatermarkLayout,
  isWatermarkContainerTooSmall,
  minLogoWidth,
  fitsInContainer,
} from "../src/lib/cloudinary/watermark"

let failed = 0

function assert(cond: boolean, msg: string) {
  if (!cond) {
    failed += 1
    console.error("FAIL:", msg)
  } else {
    console.log("ok:", msg)
  }
}

// Hide thresholds
assert(isWatermarkContainerTooSmall(71, 200), "hide se lato < 72")
assert(isWatermarkContainerTooSmall(200, 71), "hide se altezza < 72")
assert(isWatermarkContainerTooSmall(239, 200), "hide se larghezza < 240")
assert(!isWatermarkContainerTooSmall(240, 180), "mostra da 240×180")
assert(MIN_WATERMARK_EDGE === 72, "MIN_WATERMARK_EDGE = 72")
assert(MIN_WATERMARK_CONTAINER_WIDTH === 240, "MIN_WATERMARK_CONTAINER_WIDTH = 240")

// Logo % by container width
assert(computeLogoWidthPct(239) === 0, "% = 0 sotto 240")
assert(computeLogoWidthPct(240) === 0.08, "240–359 → 8%")
assert(computeLogoWidthPct(359) === 0.08, "359 → 8%")
assert(computeLogoWidthPct(360) === 0.09, "360–639 → 9%")
assert(computeLogoWidthPct(639) === 0.09, "639 → 9%")
assert(computeLogoWidthPct(640) === 0.11, "640–899 → 11%")
assert(computeLogoWidthPct(899) === 0.11, "899 → 11%")
assert(computeLogoWidthPct(900) === 0.09, "≥900 → 9%")

// Cap 168
const wide = computeWatermarkLayout(2000, 1200)
assert(wide.visible && wide.width <= MAX_LOGO_WIDTH, `cap ≤168 (got ${wide.width})`)

// Safe inset: compact vs desktop
const safePhone = computeSafeInset(360, 270)
assert(safePhone >= 16 && safePhone <= 32, `safe compact clamp 16–32 (got ${safePhone})`)
assert(360 < COMPACT_CONTAINER_MAX, "360 è compact")
const safeDesk = computeSafeInset(900, 600)
assert(safeDesk >= 24 && safeDesk <= 64, `safe desktop clamp 24–64 (got ${safeDesk})`)

// Layout phone card: intero, SE preferito, dentro box
const phone = computeWatermarkLayout(360, 270, {
  logoAspect: FARCOM_LOGO_ASPECT,
  obstacles: [{ x: 8, y: 8, w: 100, h: 28 }],
})
assert(phone.visible, "card 360×270 visibile")
assert(phone.corner === "south_east", `card preferisce SE (got ${phone.corner})`)
assert(
  fitsInContainer(phone.box, 360, 270),
  "bounding box (bleed incluso) dentro contenitore phone",
)
assert(phone.width >= minLogoWidth(360), "larghezza ≥ minimo")

// Carousel dots: extra bottom 40 → ancora dentro
const carousel = computeWatermarkLayout(390, 280, {
  logoAspect: FARCOM_LOGO_ASPECT,
  extraInset: { bottom: 40 },
  obstacles: [
    { x: 8, y: 116, w: 44, h: 44 },
    { x: 338, y: 116, w: 44, h: 44 },
    { x: 39, y: 224, w: 312, h: 56 },
  ],
})
assert(carousel.visible, "carosello mobile con dots/frecce: logo visibile o fallback")
assert(
  fitsInContainer(carousel.box, 390, 280),
  "carosello: box intero dentro viewport",
)
assert(carousel.insets.bottom >= 40 + 16, `inset bottom ≥ safe+40 (got ${carousel.insets.bottom})`)

// Too small → hidden, never partial
const tiny = computeWatermarkLayout(200, 150)
assert(!tiny.visible && tiny.width === 0, "sotto 240: nascosto, width 0")

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log("\nAll watermark layout checks passed.")
