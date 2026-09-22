import { useState, useRef, useCallback, useEffect } from "react"
import { useCloudinaryUpload, type CloudinaryUploadResult } from "../../lib/cloudinary"
import { createMedia, deleteMedia, type Media } from "../../api/mediaApi"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, isCloudinaryConfigured } from "../../lib/cloudinary/config"

interface SectionImageUploaderProps {
  value: string[] // Array di URL immagini già associate
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string
  category?: "hero" | "sector" | "project" | "gallery"
  library?: "Tutte" | "Prodotti" | "BANNER" | "SFONDI" | "trasporto"
  onError?: (msg: string) => void
  disabled?: boolean
}

interface UploadItem {
  id: string
  file: File
  preview: string
  status: "idle" | "uploading" | "success" | "error"
  progress: number
  error?: string
  cloudinaryResult?: CloudinaryUploadResult
  mediaId?: string
}

export default function SectionImageUploader({
  value = [],
  onChange,
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes = "image/*",
  category = "project",
  library = "Tutte",
  onError,
  disabled = false,
}: SectionImageUploaderProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { state: cloudinaryState, upload: uploadToCloudinary, reset: resetCloudinary } = useCloudinaryUpload()
  const { isAuthenticated } = useAdminAuth()

  // Show warning if Cloudinary is not configured
  useEffect(() => {
    if (!isCloudinaryConfigured) {
      console.error('[SectionImageUploader] Cloudinary not configured:', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        hasUploadPreset: !!CLOUDINARY_UPLOAD_PRESET,
        preset: CLOUDINARY_UPLOAD_PRESET
      })
      onError?.('Cloudinary non configurato. Contatta l\'amministratore per configurare VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET nelle variabili d\'ambiente.')
    }
  }, [isCloudinaryConfigured, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, onError])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled) return

    const newUploads: UploadItem[] = []
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        onError?.(`File "${file.name}" non è un'immagine valida`)
        continue
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        onError?.(`File "${file.name}" supera il limite di ${maxSizeMB}MB`)
        continue
      }

      // Check max files limit
      if (value.length + uploads.length + newUploads.length >= maxFiles) {
        onError?.(`Numero massimo di file (${maxFiles}) raggiunto`)
        break
      }

      const preview = URL.createObjectURL(file)
      newUploads.push({
        id: `upload-${Date.now()}-${i}`,
        file,
        preview,
        status: "idle",
        progress: 0,
      })
    }

    if (newUploads.length > 0) {
      setUploads((prev) => [...prev, ...newUploads])
    }
  }, [value.length, uploads.length, maxFiles, maxSizeMB, disabled, onError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [disabled, handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const removeUpload = useCallback((uploadId: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === uploadId)
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview)
      }
      return prev.filter((u) => u.id !== uploadId)
    })
  }, [])

  const removeExistingImage = useCallback((url: string) => {
    onChange(value.filter((u) => u !== url))
  }, [value, onChange])

  const uploadSingleFile = useCallback(async (upload: UploadItem): Promise<void> => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === upload.id ? { ...u, status: "uploading", progress: 0 } : u
      )
    )

    try {
      // Check authentication before proceeding
      if (!isAuthenticated) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.")
      }

      // Upload to Cloudinary
      const folder = category === "gallery" ? "farcom/progetti/gallery" : `farcom/${category}`
      const cloudinaryResult = await uploadToCloudinary(upload.file, folder)

      if (!cloudinaryResult) {
        throw new Error("Upload Cloudinary fallito")
      }

      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: "uploading", progress: 80, cloudinaryResult }
            : u
        )
      )

      // Save metadata to MongoDB via API
      let mediaData: Media
      try {
        mediaData = await createMedia({
          cloudinaryUrl: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          category,
          library: library !== "Tutte" ? library : undefined,
        })
      } catch (apiError) {
        console.error("API call failed, using localStorage fallback:", apiError)
        // If API fails, createMedia will fall back to localStorage
        // We need to create a media object with the Cloudinary data
        mediaData = {
          _id: "local-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
          cloudinaryUrl: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          category,
          library: library !== "Tutte" ? library : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Media
      }

      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: "success", progress: 100, mediaId: mediaData._id }
            : u
        )
      )

      // Add to value array
      onChange([...value, cloudinaryResult.secure_url])

      // Remove from uploads after a delay
      setTimeout(() => {
        removeUpload(upload.id)
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Errore durante l'upload"
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: "error", error: errorMessage }
            : u
        )
      )
      onError?.(errorMessage)
    }
  }, [category, library, uploadToCloudinary, onChange, value, removeUpload, onError, isAuthenticated])

  // Auto-upload files when they are added
  useEffect(() => {
    const idleUploads = uploads.filter((u) => u.status === "idle")
    idleUploads.forEach((upload) => {
      uploadSingleFile(upload)
    })
  }, [uploads, uploadSingleFile])

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      uploads.forEach((upload) => {
        if (upload.preview) {
          URL.revokeObjectURL(upload.preview)
        }
      })
    }
  }, [uploads])

  const allImages = [
    ...value.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isExisting: true,
    })),
    ...uploads.map((upload) => ({
      id: upload.id,
      url: upload.preview,
      isExisting: false,
      status: upload.status,
      progress: upload.progress,
      error: upload.error,
    })),
  ]

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!disabled && value.length + uploads.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? "border-[#1B4332] bg-[#1B4332]/5" : "border-[#DDD9D0] hover:border-[#1B4332]/50"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          <div className="text-4xl mb-3">📷</div>
          <p className="text-sm text-[#4A4A46] mb-1">
            {multiple ? "Trascina immagini o clicca per caricare" : "Trascina un'immagine o clicca per caricare"}
          </p>
          <p className="text-xs text-[#888580]">
            Max {maxSizeMB}MB per file, max {maxFiles} file totali
          </p>
        </div>
      )}

      {/* Progress indicator for active uploads */}
      {uploads.some((u) => u.status === "uploading") && (
        <div className="bg-[#F7F5F0] rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-[#4A4A46]">
            <div className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin" />
            <span>Caricamento in corso...</span>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allImages.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square group rounded-lg overflow-hidden border border-[#DDD9D0]"
            >
              <img
                src={item.url}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />

              {/* Status overlays */}
              {!item.isExisting && item.status === "uploading" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm font-medium">
                    {item.progress}%
                  </div>
                </div>
              )}

              {!item.isExisting && item.status === "error" && (
                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                  <div className="text-white text-xs p-2 text-center">
                    {item.error || "Errore"}
                  </div>
                </div>
              )}

              {!item.isExisting && item.status === "success" && (
                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                  <div className="text-white text-2xl">✓</div>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  item.isExisting
                    ? removeExistingImage(item.url)
                    : removeUpload(item.id)
                }}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Rimuovi"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {value.length === 0 && uploads.length === 0 && (
        <div className="text-center py-8 text-[#888580] text-sm">
          Nessuna immagine caricata
        </div>
      )}
    </div>
  )
}
