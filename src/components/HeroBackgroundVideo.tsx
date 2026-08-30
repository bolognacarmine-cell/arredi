import { useEffect, useRef, useState } from "react";

type Props = {
  basePath?: string; // default "/videos/farcom-hero"
  poster?: string;
  fallbackImg?: string;
  className?: string;
  priority?: boolean; // true = carica SUBITO (per hero above the fold), false = lazy con IO
};

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
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const [loadVideo, setLoadVideo] = useState(priority);

  // Lazy load con IntersectionObserver (solo se priority=false)
  useEffect(() => {
    if (priority) return;
    if (loadVideo) return;
    if (!videoRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setLoadVideo(true);
      return;
    }
    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setLoadVideo(true);
            ioRef.current?.disconnect();
          }
        });
      },
      { rootMargin: "300px 0px", threshold: 0.01 }
    );
    ioRef.current.observe(videoRef.current);
    return () => ioRef.current?.disconnect();
  }, [priority, loadVideo]);

  const onVideoError = () => {
    setShowFallback(true);
    if (videoRef.current) videoRef.current.style.display = "none";
  };

  // NOTA: sorgenti ELENCATE SOLO se il file esiste davvero in public/videos.
  // Al browser piace una sorgente sola ben definita invece di 4 sorgenti inesistenti che generano 404.
  // src diretto sul tag <video> come fallback finale se anche <source> fallisce.
  return (
    <div className={`${className} absolute inset-0 overflow-hidden bg-black`} aria-hidden="true">
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
        <video
          ref={videoRef}
          src={`${basePath}.mp4`}
          className={`absolute inset-0 w-full h-full object-cover ${
            showFallback ? "hidden" : "block"
          }`}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controls={false}
          preload={priority ? "auto" : "none"}
          poster={poster}
          onError={onVideoError}
          style={{
            imageRendering: "auto",
            transform: "translateZ(0)",
          }}
        >
          <source src={`${basePath}.mp4`} type="video/mp4" />
        </video>
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
  );
}
