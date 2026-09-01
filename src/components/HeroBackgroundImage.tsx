import { useEffect, useMemo, useRef, useState } from "react"
import {
  buildCloudinaryImageUrl,
  isCloudinaryConfigured,
} from "../lib/cloudinary"

type Props = {
  src?: string
  fallbackSrc?: string
  className?: string
  priority?: boolean
  cloudinaryPublicId?: string
}

/**
 * HeroBackgroundImage — SPLIT SCREEN IMMAGINE FISSA (nessun video!)
 *  - Desktop (sm+):  object-cover + object-center (copertina 16:9)
 *  - Mobile (< sm):  object-[50%_30%] (orizzontale centrato, verticale 30%
 *                     = taglia 20% del cielo in alto, mantiene i mobili centrali)
 *  - Fallback: se l'immagine primaria non carica, passa alla secondaria Unsplash
 *  - loading: se priority=true → eager + fetchpriority high, altrimenti lazy
 *  - Nessun video, nessun LFS, ZERO problemi per sempre.
 */
export default function HeroBackgroundImage({
  src = "https://images.unsplash.com/photo-1547609434-b732edfee020?auto=format&fit=crop&w=2560&h=1440&q=85",
  fallbackSrc = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2560&h=1440&q=85",
  className = "",
  priority = true,
  cloudinaryPublicId,
}: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const ioRef = useRef<IntersectionObserver | null>(null)
  const [loadImg, setLoadImg] = useState(priority)

  const finalSrc = useMemo(() => {
    if (useFallback) return fallbackSrc
    if (cloudinaryPublicId && isCloudinaryConfigured) {
      return buildCloudinaryImageUrl(cloudinaryPublicId, {
        width: 2560,
        height: 1440,
        objectFit: "cover",
        gravity: "center",
      })
    }
    return src
  }, [cloudinaryPublicId, src, fallbackSrc, useFallback])

  useEffect(() => {
    if (priority) return
    if (loadImg) return
    if (typeof IntersectionObserver === "undefined") {
      setLoadImg(true)
      return
    }
    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setLoadImg(true)
            ioRef.current?.disconnect()
          }
        })
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    )
    if (imgRef.current) ioRef.current.observe(imgRef.current)
    return () => ioRef.current?.disconnect()
  }, [priority, loadImg])

  const onError = () => {
    if (!useFallback) setUseFallback(true)
  }

  return (
    <div
      className={`${className} absolute inset-0 overflow-hidden bg-black`}
      aria-hidden="true"
    >
      {/* Placeholder colorato durante caricamento (messo sopra per non avere
          balzi di layout CLS se priority=false, anche se priority di default
          è true per hero above-the-fold) */}
      <div
        className="absolute inset-0 block"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
        }}
      />
      {/* Immagine hero (1 sola sorgente, fallback automatico su errore) */}
      {loadImg ? (
        <img
          ref={imgRef}
          src={finalSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full block object-cover object-[50%_30%] sm:object-center"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={onError}
        />
      ) : null}
    </div>
  )
}
