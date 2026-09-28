import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  FARCOM_LOGO_ASPECT,
  computeWatermarkLayout,
  watermarkCornerStyle,
  withoutFarcomWatermark,
  type EdgeInsets,
  type Rect,
  type WatermarkLayout,
} from "../lib/cloudinary/watermark"

const LOGO_SRC = "/logo-farcom.png"

type Props = {
  /** Opacità override (default dal layout: 0.8) */
  opacity?: number
  /** Spazio extra oltre la safe area (es. barra dots). */
  extraInset?: Partial<EdgeInsets>
  /** Zone UI da evitare (frecce, counter, badge…). */
  obstacles?: Rect[]
  /**
   * Chiave esterna per forzare il ricalcolo (cambio slide, breakpoint, ecc.).
   */
  layoutKey?: string | number
  className?: string
}

const EMPTY: WatermarkLayout = computeWatermarkLayout(0, 0)

/**
 * Overlay watermark ancorato all'area visibile del genitore `relative`.
 * Fallback angoli: SE → SW → NE → NW solo per fit/collisione UI.
 * Se non entra nemmeno al minimo → nascosto (mai tagliato).
 */
export default function FarcomImageWatermark({
  opacity,
  extraInset,
  obstacles = [],
  layoutKey,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [logoAspect, setLogoAspect] = useState(FARCOM_LOGO_ASPECT)
  const [layout, setLayout] = useState<WatermarkLayout>(EMPTY)

  // Stabilizza dipendenze: oggetti inline dal parent non devono loopare.
  const obstaclesKey = useMemo(() => JSON.stringify(obstacles), [obstacles])
  const insetKey = useMemo(() => JSON.stringify(extraInset ?? {}), [extraInset])
  const stableObstacles = useMemo(() => obstacles, [obstaclesKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const stableInset = useMemo(() => extraInset, [insetKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const recalc = useCallback(() => {
    const parent = rootRef.current?.parentElement
    if (!parent) {
      setLayout(EMPTY)
      return
    }
    setLayout(
      computeWatermarkLayout(parent.clientWidth, parent.clientHeight, {
        logoAspect,
        extraInset: stableInset,
        obstacles: stableObstacles,
      }),
    )
  }, [logoAspect, stableInset, stableObstacles])

  useEffect(() => {
    const parent = rootRef.current?.parentElement
    if (!parent) return

    recalc()

    const ro = new ResizeObserver(() => recalc())
    ro.observe(parent)

    const onWin = () => recalc()
    window.addEventListener("resize", onWin)
    window.addEventListener("orientationchange", onWin)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", onWin)
      window.removeEventListener("orientationchange", onWin)
    }
  }, [recalc, layoutKey])

  const onLogoLoad = () => {
    const img = imgRef.current
    if (!img || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
      recalc()
      return
    }
    const aspect = img.naturalWidth / img.naturalHeight
    if (Math.abs(aspect - logoAspect) > 0.001) {
      setLogoAspect(aspect)
    } else {
      recalc()
    }
  }

  const corner = watermarkCornerStyle(layout.corner, layout.insets)
  const show = layout.visible

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute inset-0 z-[5] ${className}`}
      aria-hidden="true"
    >
      <img
        ref={imgRef}
        src={LOGO_SRC}
        alt=""
        draggable={false}
        decoding="async"
        onLoad={onLogoLoad}
        style={{
          position: "absolute",
          ...corner,
          width: show ? layout.width : 0,
          height: show ? layout.height : 0,
          objectFit: "contain",
          opacity: show ? (opacity ?? layout.opacity) : 0,
          visibility: show ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

/** Helper: URL prodotto senza watermark Cloudinary (per uso con overlay UI). */
export function productImageSrc(url: string): string {
  return withoutFarcomWatermark(url)
}
