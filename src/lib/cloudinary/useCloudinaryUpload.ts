import { useCallback, useState } from "react"
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  isCloudinaryConfigured,
} from "./config"

export type CloudinaryUploadResult = {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
  created_at: string
}

export type UploadState = {
  status: "idle" | "uploading" | "success" | "error"
  progress: number
  result?: CloudinaryUploadResult
  error?: string
}

export function useCloudinaryUpload() {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  })

  const upload = useCallback(
    async (file: File | Blob, folder?: string): Promise<CloudinaryUploadResult | null> => {
      console.log('[Cloudinary Upload] Starting upload...', {
        isCloudinaryConfigured,
        cloudName: CLOUDINARY_CLOUD_NAME,
        hasUploadPreset: !!CLOUDINARY_UPLOAD_PRESET,
        preset: CLOUDINARY_UPLOAD_PRESET?.substring(0, 10) + '...'
      })

      if (!isCloudinaryConfigured) {
        const msg = "Cloudinary non configurato. Contatta l'amministratore per configurare VITE_CLOUDINARY_CLOUD_NAME"
        console.error('[Cloudinary Upload] Configuration error:', msg)
        setState({ status: "error", progress: 0, error: msg })
        return null
      }
      if (!CLOUDINARY_UPLOAD_PRESET) {
        const msg = "Upload preset mancante. Contatta l'amministratore per configurare VITE_CLOUDINARY_UPLOAD_PRESET"
        console.error('[Cloudinary Upload] Upload preset error:', msg)
        setState({ status: "error", progress: 0, error: msg })
        return null
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
      if (folder) formData.append("folder", folder)

      setState({ status: "uploading", progress: 0 })

      try {
        const xhr = new XMLHttpRequest()

        const result: CloudinaryUploadResult = await new Promise((resolve, reject) => {
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            true,
          )

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setState((prev) => ({
                ...prev,
                progress: Math.round((e.loaded / e.total) * 100),
              }))
            }
          }

          xhr.onload = () => {
            console.log('[Cloudinary Upload] Response:', {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText?.substring(0, 200)
            })

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                console.log('[Cloudinary Upload] Success:', data.public_id)
                resolve(data)
              } catch (e) {
                console.error('[Cloudinary Upload] Parse error:', e)
                reject(new Error("Risposta Cloudinary non valida"))
              }
            } else {
              console.error('[Cloudinary Upload] Upload failed:', xhr.status, xhr.responseText)
              reject(new Error(`Upload fallito (status ${xhr.status}): ${xhr.responseText}`))
            }
          }

          xhr.onerror = () => {
            console.error('[Cloudinary Upload] Network error')
            reject(new Error("Errore di rete durante l'upload Cloudinary"))
          }
          xhr.onabort = () => {
            console.error('[Cloudinary Upload] Upload aborted')
            reject(new Error("Upload annullato"))
          }

          xhr.send(formData)
        })

        setState({ status: "success", progress: 100, result })
        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : "Errore upload sconosciuto"
        console.error('[Cloudinary Upload] Error:', error)
        setState({ status: "error", progress: 0, error })
        return null
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setState({ status: "idle", progress: 0 })
  }, [])

  return { state, upload, reset }
}
