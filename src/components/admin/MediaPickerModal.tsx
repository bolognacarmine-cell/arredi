import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import React from "react"
import { resolveImageUrl } from "../../lib/cloudinary"
import { getMedia, type Media } from "../../api/mediaApi"
import {
  type RecentUpload,
  type UploadCategory,
} from "../../lib/mediaRecent"

type PickerMode = "cover" | "gallery"

interface MediaPickerModalProps {
  mode: PickerMode
  currentCoverUrl: string
  galleryUrls: string[]
  onClose: () => void
  onPickAsCover: (upload: RecentUpload) => void
  onAddToGallery: (upload: RecentUpload) => void
}

const categoryLabels: Record<UploadCategory, string> = {
  hero: "Hero Home",
  sector: "Settori",
  project: "Progetti",
  gallery: "Gallery",
}

const categoryColors: Record<UploadCategory, string> = {
  hero: "bg-[#4A4A46]/80 text-white",
  sector: "bg-[#4A4A46]/80 text-white",
  project: "bg-[#1B4332]/80 text-white",
  gallery: "bg-[#B5965A]/80 text-white",
}

// Hook for IntersectionObserver lazy loading
function useLazyLoading(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: "50px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return [elementRef, isVisible] as const
}

// Skeleton component for loading state
function ImageSkeleton() {
  return (
    <div className="aspect-square bg-[#EAE7E0] animate-pulse rounded" />
  )
}

// Memoized thumbnail component
const ImageThumbnail = React.memo(function ImageThumbnail({
  upload,
  index,
  isFirstBatch,
  mode,
  inGallery,
  isCover,
  onPick,
}: {
  upload: RecentUpload
  index: number
  isFirstBatch: boolean
  mode: PickerMode
  inGallery: (url: string) => boolean
  isCover: (url: string) => boolean
  onPick: () => void
}) {
  const [imgRef, isIntersecting] = useLazyLoading(0.01)
  const uploadInGallery = inGallery(upload.secureUrl)
  const uploadIsCover = isCover(upload.secureUrl)
  const shouldLoad = isFirstBatch || isIntersecting

  return (
    <button
      type="button"
      onClick={onPick}
      className="relative aspect-square overflow-hidden border-2 transition-all group focus:outline-none focus:ring-2 focus:ring-[#1B4332]/40"
      style={{
        borderColor: uploadIsCover
          ? "#1B4332"
          : uploadInGallery
            ? "rgba(27, 67, 50, 0.6)"
            : "transparent",
      }}
    >
      {shouldLoad ? (
        <img
          ref={imgRef}
          src={resolveImageUrl(
            {
              src: upload.secureUrl,
              publicId: upload.publicId,
            },
            {
              width: 480,
              height: 480,
              objectFit: "cover",
            },
          )}
          alt={upload.titleHint || upload.publicId}
          loading={isFirstBatch ? "eager" : "lazy"}
          fetchPriority={isFirstBatch ? "high" : "auto"}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          style={{ aspectRatio: "1 / 1" }}
        />
      ) : (
        <ImageSkeleton />
      )}

      {/* Selected overlay */}
      {uploadIsCover && (
        <div className="absolute inset-0 bg-[#1B4332]/70 flex items-center justify-center">
          <span className="text-white text-xs font-bold px-2 py-1">
            ✓ Copertina attuale
          </span>
        </div>
      )}

      {/* Hover overlay */}
      {!uploadIsCover && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white text-[#1B4332] text-xs font-bold px-3 py-1.5 rounded shadow whitespace-nowrap">
            {mode === "cover"
              ? "Usa come copertina"
              : uploadInGallery
                ? "Aggiungi ancora"
                : "＋ Aggiungi"}
          </span>
        </div>
      )}

      {/* Category badge and dimensions */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between items-end pointer-events-none">
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${categoryColors[upload.category]}`}
        >
          {categoryLabels[upload.category]}
        </span>
        <span className="text-[10px] bg-white/90 px-1.5 py-0.5 rounded text-[#4A4A46]">
          {upload.width}×{upload.height}
        </span>
      </div>

      {/* Checkmark for gallery items */}
      {mode === "gallery" && uploadInGallery && (
        <div className="absolute top-1 right-1 bg-[#1B4332] text-white w-5 h-5 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  )
})

export default function MediaPickerModal({
  mode,
  currentCoverUrl,
  galleryUrls,
  onClose,
  onPickAsCover,
  onAddToGallery,
}: MediaPickerModalProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<UploadCategory | "all">("all")
  const [libraryFilter, setLibraryFilter] = useState<"Tutte" | "Prodotti" | "BANNER" | "SFONDI">("Tutte")
  const [searchQuery, setSearchQuery] = useState("")

  // Carica media dall'API all'apertura della modale
  useEffect(() => {
    async function loadMedia() {
      setLoading(true)
      try {
        const media = await getMedia()
        setMediaItems(media)
      } catch (error) {
        console.error("Error loading media:", error)
        setMediaItems([])
      } finally {
        setLoading(false)
      }
    }
    loadMedia()
  }, [])

  // Converti Media in RecentUpload per compatibilità con callback esistenti
  const recentUploads: RecentUpload[] = useMemo(() => {
    return mediaItems.map((media: Media) => ({
      id: media._id,
      publicId: media.cloudinaryPublicId,
      secureUrl: media.cloudinaryUrl,
      category: media.category,
      timestamp: new Date(media.createdAt).getTime(),
      width: media.width || 0,
      height: media.height || 0,
      titleHint: media.title,
    }))
  }, [mediaItems])

  const filteredUploads = useMemo(() => {
    return recentUploads.filter((upload) => {
      const matchesCategory =
        categoryFilter === "all" || upload.category === categoryFilter
      const matchesSearch =
        !searchQuery ||
        upload.publicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (upload.titleHint && upload.titleHint.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [recentUploads, categoryFilter, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recentUploads.length }
    recentUploads.forEach((upload) => {
      counts[upload.category] = (counts[upload.category] || 0) + 1
    })
    return counts
  }, [recentUploads])

  const inGallery = (url: string) => galleryUrls.includes(url)
  const isCover = (url: string) => mode === "cover" && currentCoverUrl === url

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden border border-[#DDD9D0] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE7E0] bg-white">
          <div>
            <h3 className="font-display text-lg font-medium text-[#1A1A18]">
              {mode === "cover"
                ? "Scegli immagine di copertina"
                : "Aggiungi immagini alla Gallery"}
            </h3>
            <p className="text-xs text-[#888580] mt-0.5">
              {mode === "cover"
                ? "Clicca su una foto per usarla come copertina del progetto"
                : "Clicca su una o più foto per aggiungerle alla gallery"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#888580] hover:text-[#1A1A18] transition-colors px-3 py-1 rounded hover:bg-[#F7F5F0]"
          >
            ✕ Chiudi
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#EAE7E0] bg-[#FAFAF7] flex-wrap">
          {/* Library Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#888580]">Libreria:</label>
            <select
              value={libraryFilter}
              onChange={(e) => setLibraryFilter(e.target.value as "Tutte" | "Prodotti" | "BANNER" | "SFONDI")}
              className="px-3 py-1.5 text-sm border border-[#DDD9D0] rounded bg-white text-[#1A1A18] focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20"
            >
              <option value="Tutte">Tutte</option>
              <option value="Prodotti">Prodotti</option>
              <option value="BANNER">BANNER</option>
              <option value="SFONDI">SFONDI</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#888580]">Categoria:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as UploadCategory | "all")}
              className="px-3 py-1.5 text-sm border border-[#DDD9D0] rounded bg-white text-[#1A1A18] focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20"
            >
              <option value="all">Tutte ({categoryCounts.all})</option>
              {(Object.keys(categoryLabels) as UploadCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]} ({categoryCounts[cat] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-[#888580]">Cerca:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome file..."
              className="flex-1 px-3 py-1.5 text-sm border border-[#DDD9D0] rounded bg-white text-[#1A1A18] placeholder:text-[#888580]/60 focus:border-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20"
            />
          </div>

          {/* Results count */}
          <span className="text-xs text-[#888580]">
            {filteredUploads.length} {filteredUploads.length === 1 ? "immagine" : "immagini"}
          </span>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#F7F5F0]">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <ImageSkeleton key={i} />
              ))}
            </div>
          ) : filteredUploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl text-[#DDD9D0] mb-4">🔍</div>
              <p className="text-[#4A4A46] mb-2">
                {recentUploads.length === 0
                  ? "Libreria Media ancora vuota"
                  : "Nessuna immagine trovata con questi filtri"}
              </p>
              {recentUploads.length === 0 ? (
                <p className="text-xs text-[#888580]">
                  Vai in{" "}
                  <span className="font-medium">Admin → Libreria Media</span> per caricare le
                  prime immagini.
                </p>
              ) : (
                <button
                  onClick={() => {
                    setCategoryFilter("all")
                    setLibraryFilter("Tutte")
                    setSearchQuery("")
                  }}
                  className="text-xs text-[#1B4332] font-medium hover:underline"
                >
                  Cancella filtri
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredUploads.map((upload, index) => (
                <ImageThumbnail
                  key={upload.id}
                  upload={upload}
                  index={index}
                  isFirstBatch={index < 6}
                  mode={mode}
                  inGallery={inGallery}
                  isCover={isCover}
                  onPick={() =>
                    mode === "cover"
                      ? onPickAsCover(upload)
                      : onAddToGallery(upload)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer for gallery mode */}
        {mode === "gallery" && galleryUrls.length > 0 && (
          <div className="border-t border-[#EAE7E0] px-5 py-3 bg-white flex items-center justify-between">
            <span className="text-sm text-[#4A4A46]">
              {galleryUrls.length} {galleryUrls.length === 1 ? "immagine" : "immagini"} nella
              gallery ·{" "}
              <span className="text-[#1B4332] font-medium">
                {galleryUrls.length > 1
                  ? "saranno mostrate come carosello ✓"
                  : "aggiungine almeno un'altra per il carosello"}
              </span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#1B4332] text-white text-sm px-4 py-2 hover:bg-[#143326] transition-colors rounded"
            >
              Fatto ✓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
