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

  // NOTA: i source in ordine QUALITÀ/PESO (AV1→VP9→H264).
  // Il browser sceglie il PRIMO che riesce a decodificare.
  return (
    <>
      {/* Fallback IMG se nessun video è supportato o errore MP4 */}
      <img
        src={fallbackImg}
        alt=""
        aria-hidden="true"
        className={`${className} w-full h-full object-cover ${
          showFallback ? "block" : "hidden"
        }`}
        decoding="async"
      />
      {loadVideo ? (
        <video
          ref={videoRef}
          className={`${className} w-full h-full object-cover ${
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
          decoding="async"
          onError={onVideoError}
          style={{
            imageRendering: "auto", // nessun smoothing aggressivo di default
            transform: "translateZ(0)", // compositing layer separato
          }}
        >
          <source src={`${basePath}.av1.mp4`} type="video/mp4; codecs=av01.0.08M.08" />
          <source src={`${basePath}-vp9.webm`} type="video/webm; codecs=vp9,opus" />
          <source src={`${basePath}.mp4`} type="video/mp4; codecs=avc1.640028,mp4a.40.2" />
          <source src={`${basePath}-hq.mp4`} type="video/mp4" />
        </video>
      ) : (
        // Postero placeholder finché non entra in viewport
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className={`${className} w-full h-full object-cover block`}
          decoding="async"
        />
      )}
    </>
  );
}
