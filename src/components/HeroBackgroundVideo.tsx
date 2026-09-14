import { useEffect, useRef, useState } from "react"

// Experimental mode: check URL parameter ?heroTest=true or environment variable
const ENABLE_EXPERIMENTAL_HERO =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).get('heroTest') === 'true' ||
   import.meta.env.VITE_ENABLE_EXPERIMENTAL_HERO === 'true')

// Experimental configuration values
const EXPERIMENTAL_CONFIG = {
  revealDelay: 500, // ms before reveal starts
  revealDuration: 1100, // ms for reveal animation
  parallaxIntensity: 20, // max vertical movement in px
  parallaxScale: 1.06, // scale factor for parallax
  parallaxStartDelay: 800, // ms before parallax becomes active
}

type Props = {
  basePath?: string // default "/videos/farcom-hero"

  poster?: string

  fallbackImg?: string

  className?: string

  priority?: boolean // true = carica SUBITO (per hero above the fold), false = lazy con IO

  onVideoReady?: () => void // Callback when video is ready and playing

  isMuted?: boolean // Controlled muted state from parent
}

/**
 * HeroBackgroundVideo — qualità MIGLIORE possibile per hero section:
 * - Multi-source (ordina per qualità/peso): AV1 (HEIF/MP4) → VP9 WebM → H264 MP4
 * - Rimozione automatica dell'MP4 se non esiste (onError <source> cambia src al fallback)
 * - IntersectionObserver: se priority=false, carica solo quando entra in viewport
 * - decoding="async" → non blocca il paint
 * - CSS "image-rendering" unset (nessun upscaling aggressivo) e transition fluide
 */

export default function HeroBackgroundVideo({
  basePath = "/videos/farcom-hero",

  poster = "https://images.unsplash.com/photo-1547609434-b732edfee020?w=1920&h=1080&fit=crop&auto=format",

  fallbackImg = "https://images.unsplash.com/photo-1547609434-b732edfee020?w=1920&h=1080&fit=crop&auto=format",

  className = "",

  priority = true,

  onVideoReady,

  isMuted = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [showFallback, setShowFallback] = useState(false)

  const ioRef = useRef<IntersectionObserver | null>(null)

  const [loadVideo, setLoadVideo] = useState(priority)

  // Experimental mode state
  const [showReveal, setShowReveal] = useState(false)
  const [enableParallax, setEnableParallax] = useState(false)
  const parallaxRef = useRef<number | null>(null)

  // Lazy load con IntersectionObserver (solo se priority=false)

  useEffect(() => {
    if (priority) return

    if (loadVideo) return

    if (!videoRef.current) return

    if (typeof IntersectionObserver === "undefined") {
      setLoadVideo(true)

      return
    }

    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setLoadVideo(true)

            ioRef.current?.disconnect()
          }
        })
      },

      { rootMargin: "300px 0px", threshold: 0.01 },
    )

    ioRef.current.observe(videoRef.current)

    return () => ioRef.current?.disconnect()
  }, [priority, loadVideo])

  // Forza play immediato + auto-show quando priority=true
  // (alcuni browser non fanno partire autoPlay senza esplicito .play() dopo la build)
  useEffect(() => {
    if (!priority) return
    const v = videoRef.current
    if (!v) return
    // Mostriamo subito (non aspettiamo canplay) — se non carica passa al fallback
    v.style.display = "block"
    try {
      const p = v.play()
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay bloccato dal browser (raro perché video muto),
          // lasciamo che l'utente lo scrolli comunque e il poster si vede
        })
      }
    } catch {
      // non fatal
    }
  }, [priority])

  // Callback when video is ready and playing
  useEffect(() => {
    if (!onVideoReady) return
    const v = videoRef.current
    if (!v) return

    const handleCanPlay = () => {
      onVideoReady()
    }

    const handlePlaying = () => {
      onVideoReady()
    }

    v.addEventListener('canplay', handleCanPlay)
    v.addEventListener('playing', handlePlaying)

    return () => {
      v.removeEventListener('canplay', handleCanPlay)
      v.removeEventListener('playing', handlePlaying)
    }
  }, [onVideoReady])

  // Sync video muted state with prop
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.muted = isMuted

    // Se attiviamo l'audio, proviamo a fare play se il video è in pausa
    if (!isMuted && v.paused) {
      v.play().catch(() => {
        // Se fallisce, rimettiamo il muto
        v.muted = true
      })
    }
  }, [isMuted])

  // Experimental mode: reveal animation sequence
  useEffect(() => {
    if (!ENABLE_EXPERIMENTAL_HERO) return

    const revealTimer = setTimeout(() => {
      setShowReveal(true)
    }, EXPERIMENTAL_CONFIG.revealDelay)

    const parallaxTimer = setTimeout(() => {
      setEnableParallax(true)
    }, EXPERIMENTAL_CONFIG.parallaxStartDelay)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(parallaxTimer)
    }
  }, [])

  // Experimental mode: parallax effect with scroll
  useEffect(() => {
    if (!ENABLE_EXPERIMENTAL_HERO || !enableParallax) return

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const handleScroll = () => {
      if (!videoRef.current) return

      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const heroHeight = windowHeight

      // Calculate parallax offset (only when hero is in view)
      if (scrollY <= heroHeight) {
        const progress = scrollY / heroHeight
        const offsetY = progress * EXPERIMENTAL_CONFIG.parallaxIntensity
        const scale = EXPERIMENTAL_CONFIG.parallaxScale - (progress * 0.02) // Slight scale reduction on scroll

        videoRef.current.style.transform = `translate3d(0, ${offsetY}px, 0) scale(${scale})`
      }
    }

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [enableParallax])

  const onVideoError = () => {
    setShowFallback(true)

    if (videoRef.current) videoRef.current.style.display = "none"
  }

  // NOTA: sorgenti ELENCATE SOLO se il file esiste davvero in public/videos.

  // Al browser piace una sorgente sola ben definita invece di 4 sorgenti inesistenti che generano 404.

  // src diretto sul tag <video> come fallback finale se anche <source> fallisce.

  return (
    <div
      ref={containerRef}
      className={`${className} absolute inset-0 overflow-hidden bg-black`}
    >
      {/* Fallback IMG se nessun video è supportato o errore MP4 */}
      <img
        src={fallbackImg}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover ${
          showFallback ? "block" : "hidden"
        }`}
        decoding="async"
      />
      {loadVideo ? (
        <div
          className={`absolute inset-0 overflow-hidden ${showFallback ? "hidden" : "block"} ${
            ENABLE_EXPERIMENTAL_HERO && showReveal ? "experimental-reveal" : ""
          }`}
          style={{
            animationDelay: ENABLE_EXPERIMENTAL_HERO ? "0ms" : undefined,
            animationFillMode: ENABLE_EXPERIMENTAL_HERO ? "forwards" : undefined,
          }}
        >
          <video
            ref={videoRef}
            src={`${basePath}.mp4`}
            className={`absolute inset-0 w-full h-full object-cover ${
              ENABLE_EXPERIMENTAL_HERO && enableParallax ? "experimental-parallax" : ""
            }`}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            disablePictureInPicture
            controls={false}
            preload={priority ? "auto" : "none"}
            poster={poster}
            onError={onVideoError}
            style={{
              imageRendering: "auto",
              transform: ENABLE_EXPERIMENTAL_HERO ? undefined : "translateZ(0)",
            }}
          >
            <source src={`${basePath}.mp4`} type="video/mp4" />
          </video>
        </div>
      ) : (
        // Poster placeholder finché non entra in viewport (lazy)

        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover block"
          decoding="async"
        />
      )}
    </div>
  )
}
