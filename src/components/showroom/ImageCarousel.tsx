// Carosello immagini showroom: slide fluido, swipe/drag, frecce, indicatori e thumbnail.
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"

type Props = {
  images: string[]
  alt: string
  /** Contenuto opzionale sovrapposto in alto a sinistra (es. badge offerta). */
  overlay?: React.ReactNode
}

// Oltre questa distanza (in px) il drag cambia slide invece di tornare indietro.
const SWIPE_THRESHOLD = 50
// Sotto questa distanza il gesto resta un click: il drag non parte.
const DRAG_START_SLOP = 8

export default function ImageCarousel({ images, alt, overlay }: Props) {
  const list = Array.isArray(images) ? images.filter(Boolean) : []
  const count = list.length

  const [index, setIndex] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [loaded, setLoaded] = useState<Record<number, boolean>>({})

  const viewportRef = useRef<HTMLDivElement>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setIndex(0)
  }, [count, list[0]])

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return
      setIndex(((i % count) + count) % count)
    },
    [count],
  )
  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  // Mantiene la thumbnail attiva sempre visibile.
  useEffect(() => {
    const active = thumbsRef.current?.children[index] as HTMLElement | undefined
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
  }, [index])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (count < 2 || (e.pointerType === "mouse" && e.button !== 0)) return
    // Frecce e indicatori vivono dentro il viewport: catturare il pointer qui
    // dirotterebbe il loro click sul contenitore.
    if ((e.target as HTMLElement).closest("button")) return
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current
    if (!start) return
    const dx = e.clientX - start.x
    if (!dragging) {
      if (Math.abs(dx) < DRAG_START_SLOP) return
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    // Resistenza ai bordi: nessun loop visivo durante il drag.
    const atEdge = (index === 0 && dx > 0) || (index === count - 1 && dx < 0)
    setDrag(atEdge ? dx * 0.3 : dx)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) {
      pointerStart.current = null
      return
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (drag <= -SWIPE_THRESHOLD) next()
    else if (drag >= SWIPE_THRESHOLD) prev()
    pointerStart.current = null
    setDragging(false)
    setDrag(0)
  }

  if (count === 0) {
    return (
      <div className="aspect-[4/3] w-full border border-[#DDD9D0] bg-white flex items-center justify-center text-[#DDD9D0] text-7xl">
        🖼️
      </div>
    )
  }

  const width = viewportRef.current?.clientWidth ?? 0
  const offset = width ? (-index * 100) + (drag / width) * 100 : -index * 100

  return (
    <div className="space-y-4">
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carosello"
        aria-label={`Immagini di ${alt}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); prev() }
          if (e.key === "ArrowRight") { e.preventDefault(); next() }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`group relative aspect-[4/3] w-full overflow-hidden border border-[#DDD9D0] bg-white select-none touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/40 ${
          count > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translate3d(${offset}%, 0, 0)`,
            transition: dragging ? "none" : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {list.map((url, i) => (
            <div key={url.slice(-40) + i} className="relative h-full w-full shrink-0 bg-[#F3F1EC]">
              {!loaded[i] && <div className="absolute inset-0 animate-pulse bg-[#EAE7E0]" />}
              <img
                src={url}
                alt={`${alt} — immagine ${i + 1} di ${count}`}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => setLoaded((s) => ({ ...s, [i]: true }))}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  loaded[i] ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ))}
        </div>

        {overlay && <div className="pointer-events-none absolute top-4 left-4 z-10">{overlay}</div>}

        {count > 1 && (
          <>
            <span className="absolute top-4 right-4 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
              {index + 1} / {count}
            </span>

            <button
              type="button"
              aria-label="Immagine precedente"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-[#1A1A18] shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Immagine successiva"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-[#1A1A18] shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
            >
              ›
            </button>

            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center gap-2 bg-gradient-to-t from-black/35 to-transparent pb-3.5 pt-8">
              {list.map((url, i) => (
                <button
                  key={"dot" + url.slice(-20) + i}
                  type="button"
                  aria-label={`Vai all'immagine ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/85"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          ref={thumbsRef}
          className="grid grid-flow-col auto-cols-[22%] gap-3 overflow-x-auto pb-1 sm:auto-cols-[18%] md:grid-flow-row md:auto-cols-auto md:grid-cols-6 md:overflow-visible"
        >
          {list.map((url, i) => (
            <button
              key={"thumb" + url.slice(-30) + i}
              type="button"
              aria-label={`Anteprima immagine ${i + 1}`}
              onClick={() => goTo(i)}
              className={`aspect-square overflow-hidden border bg-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                i === index
                  ? "border-[#1B4332] ring-2 ring-[#1B4332]/20"
                  : "border-[#DDD9D0] opacity-70 hover:opacity-100 hover:border-[#888580]"
              }`}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
