import { useState, useRef, useCallback, useEffect } from "react";
import { useCloudinaryUpload, type CloudinaryUploadResult } from "../../lib/cloudinary";
import { createMedia, deleteMedia, type Media } from "../../api/mediaApi";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  isCloudinaryConfigured,
} from "../../lib/cloudinary/config";

interface SectionImageUploaderProps {
  value: string[]; // Array di URL immagini già associate
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string;
  category?: "hero" | "sector" | "project" | "gallery";
  library?: "Tutte" | "Prodotti" | "BANNER" | "SFONDI" | "trasporto";
  onError?: (msg: string) => void;
  disabled?: boolean;
}

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  cloudinaryResult?: CloudinaryUploadResult;
  mediaId?: string;
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
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  // Ref sincronizzato: upload paralleli non devono leggere uno `value` stale
  // da closure (altrimenti onChange lascia solo l'ultima URL).
  const valueRef = useRef(value);
  const uploadsRef = useRef(uploads);
  const {
    state: cloudinaryState,
    upload: uploadToCloudinary,
    reset: resetCloudinary,
  } = useCloudinaryUpload();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  // Show warning if Cloudinary is not configured
  useEffect(() => {
    if (!isCloudinaryConfigured) {
      console.error("[SectionImageUploader] Cloudinary not configured:", {
        cloudName: CLOUDINARY_CLOUD_NAME,
        hasUploadPreset: !!CLOUDINARY_UPLOAD_PRESET,
        preset: CLOUDINARY_UPLOAD_PRESET,
      });
      onError?.(
        "Cloudinary non configurato. Contatta l'amministratore per configurare VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET nelle variabili d'ambiente.",
      );
    }
  }, [isCloudinaryConfigured, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, onError]);

  const appendUrl = useCallback(
    (url: string) => {
      const next = [...valueRef.current, url];
      valueRef.current = next;
      onChange(next);
      console.log(
        "[SectionImageUploader] URL aggiunta:",
        url.slice(0, 80),
        "| totale:",
        next.length,
      );
    },
    [onChange],
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const newUploads: UploadItem[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const currentCount = valueRef.current.length + uploadsRef.current.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          onError?.(`File "${file.name}" non è un'immagine valida`);
          continue;
        }

        // Validate file size
        if (file.size > maxSizeBytes) {
          onError?.(`File "${file.name}" supera il limite di ${maxSizeMB}MB`);
          continue;
        }

        // Check max files limit
        if (currentCount + newUploads.length >= maxFiles) {
          onError?.(`Numero massimo di file (${maxFiles}) raggiunto`);
          break;
        }

        const preview = URL.createObjectURL(file);
        newUploads.push({
          id: `upload-${Date.now()}-${i}`,
          file,
          preview,
          status: "idle",
          progress: 0,
        });
      }

      if (newUploads.length > 0) {
        setUploads((prev) => [...prev, ...newUploads]);
      }
    },
    [maxFiles, maxSizeMB, disabled, onError],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [disabled, handleFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect],
  );

  const removeUpload = useCallback((uploadId: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === uploadId);
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((u) => u.id !== uploadId);
    });
  }, []);

  const removeExistingImage = useCallback(
    (index: number) => {
      if (!window.confirm("Eliminare definitivamente questa immagine?")) return;
      const next = valueRef.current.filter((_, i) => i !== index);
      valueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const moveImage = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0) return;
      const len = valueRef.current.length;
      if (to >= len) return;
      const next = [...valueRef.current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      valueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const replaceImage = useCallback(
    async (index: number, file: File) => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (!file.type.startsWith("image/")) {
        onError?.("Il file selezionato non è un'immagine valida");
        return;
      }
      if (file.size > maxSizeBytes) {
        onError?.(`Il file "${file.name}" supera il limite di ${maxSizeMB}MB`);
        return;
      }
      if (!isAuthenticated) {
        onError?.("Sessione scaduta. Effettua nuovamente il login.");
        return;
      }
      try {
        const folder = category === "gallery" ? "farcom/progetti/gallery" : `farcom/${category}`;
        const cloudinaryResult = await uploadToCloudinary(file, folder);
        if (!cloudinaryResult) throw new Error("Upload Cloudinary fallito");
        createMedia({
          cloudinaryUrl: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          category,
          library: library !== "Tutte" ? library : undefined,
        }).catch((err) => console.error("Media library non aggiornata:", err));
        // Sostituisci solo dopo upload riuscito: l'URL vecchia viene sovrascritta
        // nella stessa posizione, senza alterare l'ordine delle altre immagini.
        const next = [...valueRef.current];
        next[index] = cloudinaryResult.secure_url;
        valueRef.current = next;
        onChange(next);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Errore durante la sostituzione";
        onError?.(errorMessage);
      }
    },
    [category, library, maxSizeMB, uploadToCloudinary, onChange, onError, isAuthenticated],
  );

  const handleReplaceInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && replaceIndex !== null) {
        void replaceImage(replaceIndex, file);
      }
      setReplaceIndex(null);
      e.target.value = "";
    },
    [replaceIndex, replaceImage],
  );

  const uploadSingleFile = useCallback(
    async (upload: UploadItem): Promise<void> => {
      setUploads((prev) =>
        prev.map((u) => (u.id === upload.id ? { ...u, status: "uploading", progress: 0 } : u)),
      );

      try {
        // Check authentication before proceeding
        if (!isAuthenticated) {
          throw new Error("Sessione scaduta. Effettua nuovamente il login.");
        }

        // Upload to Cloudinary
        const folder = category === "gallery" ? "farcom/progetti/gallery" : `farcom/${category}`;
        const cloudinaryResult = await uploadToCloudinary(upload.file, folder);

        if (!cloudinaryResult) {
          throw new Error("Upload Cloudinary fallito");
        }

        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, status: "uploading", progress: 80, cloudinaryResult } : u,
          ),
        );

        // Save metadata to MongoDB via API
        let mediaData: Media;
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
          });
        } catch (apiError) {
          console.error("API call failed, using localStorage fallback:", apiError);
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
          } as Media;
        }

        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id
              ? { ...u, status: "success", progress: 100, mediaId: mediaData._id }
              : u,
          ),
        );

        // Append atomico via ref: sicuro con upload paralleli
        appendUrl(cloudinaryResult.secure_url);

        // Remove from uploads after a delay
        setTimeout(() => {
          removeUpload(upload.id);
        }, 2000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Errore durante l'upload";
        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, status: "error", error: errorMessage } : u,
          ),
        );
        onError?.(errorMessage);
      }
    },
    [category, library, uploadToCloudinary, appendUrl, removeUpload, onError, isAuthenticated],
  );

  // Auto-upload files when they are added (marca subito "uploading" via uploadSingleFile)
  useEffect(() => {
    const idleUploads = uploads.filter((u) => u.status === "idle");
    idleUploads.forEach((upload) => {
      void uploadSingleFile(upload);
    });
  }, [uploads, uploadSingleFile]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      uploads.forEach((upload) => {
        if (upload.preview) {
          URL.revokeObjectURL(upload.preview);
        }
      });
    };
  }, [uploads]);

  const allImages = [
    ...value.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isExisting: true,
      valueIndex: index,
    })),
    ...uploads.map((upload) => ({
      id: upload.id,
      url: upload.preview,
      isExisting: false,
      status: upload.status,
      progress: upload.progress,
      error: upload.error,
    })),
  ];

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
            {multiple
              ? "Trascina immagini o clicca per caricare"
              : "Trascina un'immagine o clicca per caricare"}
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
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          onDragOver={(e) => {
            // Consenti il drop di file dal computer anche sulla griglia (upload)
            if (e.dataTransfer.types.includes("Files")) e.preventDefault();
          }}
          onDrop={(e) => {
            if (e.dataTransfer.files?.length) {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files);
            }
          }}
        >
          {allImages.map((item) => {
            const isExisting = item.isExisting;
            const valueIndex = isExisting ? (item as any).valueIndex : -1;
            const isFirst = isExisting && valueIndex === 0;
            const isLast = isExisting && valueIndex === value.length - 1;
            return (
              <div
                key={item.id}
                draggable={isExisting}
                onDragStart={(e) => {
                  if (!isExisting) return;
                  setDragFromIndex(valueIndex);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(valueIndex));
                }}
                onDragOver={(e) => {
                  if (dragFromIndex !== null) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  if (dragFromIndex !== null && isExisting) {
                    moveImage(dragFromIndex, valueIndex);
                  }
                  setDragFromIndex(null);
                }}
                onDragEnd={() => setDragFromIndex(null)}
                className={`relative aspect-square group rounded-lg overflow-hidden border transition-all ${
                  dragFromIndex === valueIndex
                    ? "opacity-40 scale-95 border-[#1B4332]"
                    : "border-[#DDD9D0]"
                } ${isExisting ? "cursor-move" : ""}`}
              >
                <img src={item.url} alt="Upload preview" className="w-full h-full object-cover" />

                {/* Status overlays */}
                {!isExisting && item.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">{item.progress}%</div>
                  </div>
                )}

                {!isExisting && item.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <div className="text-white text-xs p-2 text-center">
                      {item.error || "Errore"}
                    </div>
                  </div>
                )}

                {!isExisting && item.status === "success" && (
                  <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                    <div className="text-white text-2xl">✓</div>
                  </div>
                )}

                {/* Posizione (solo immagini esistenti) */}
                {isExisting && (
                  <div className="absolute top-1 left-1 bg-white/90 backdrop-blur px-1.5 py-0.5 text-[10px] font-medium text-[#4A4A46] rounded">
                    {valueIndex + 1}
                  </div>
                )}

                {/* Pulsanti azione (solo immagini esistenti) */}
                {isExisting && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5 justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(valueIndex, valueIndex - 1);
                          }}
                          disabled={isFirst}
                          className="bg-white text-[#1B4332] text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap min-h-[28px] disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Sposta su"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(valueIndex, valueIndex + 1);
                          }}
                          disabled={isLast}
                          className="bg-white text-[#1B4332] text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap min-h-[28px] disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Sposta giù"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplaceIndex(valueIndex);
                          replaceInputRef.current?.click();
                        }}
                        className="bg-[#1B4332] text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap min-h-[28px]"
                        title="Sostituisci immagine"
                      >
                        🔄 Sostituisci
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingImage(valueIndex);
                        }}
                        className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap min-h-[28px]"
                        title="Elimina immagine"
                      >
                        ✕ Elimina
                      </button>
                    </div>
                  </div>
                )}

                {/* Remove button per upload in corso */}
                {!isExisting && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUpload(item.id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Rimuovi"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Input nascosto per la sostituzione di una singola immagine */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceInputChange}
      />

      {/* Empty state */}
      {value.length === 0 && uploads.length === 0 && (
        <div className="text-center py-8 text-[#888580] text-sm">Nessuna immagine caricata</div>
      )}
    </div>
  );
}
