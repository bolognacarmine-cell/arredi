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
      if (!isCloudinaryConfigured) {
        const msg = "Cloudinary non configurato. Imposta VITE_CLOUDINARY_CLOUD_NAME in .env"
        setState({ status: "error", progress: 0, error: msg })
        return null
      }
      if (!CLOUDINARY_UPLOAD_PRESET) {
        const msg = "Upload preset mancante. Imposta VITE_CLOUDINARY_UPLOAD_PRESET in .env"
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
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                resolve(data)
              } catch (e) {
                reject(new Error("Risposta Cloudinary non valida"))
              }
            } else {
              reject(new Error(`Upload fallito (status ${xhr.status}): ${xhr.responseText}`))
            }
          }

          xhr.onerror = () => reject(new Error("Errore di rete durante l'upload Cloudinary"))
          xhr.onabort = () => reject(new Error("Upload annullato"))

          xhr.send(formData)
        })

        setState({ status: "success", progress: 100, result })
        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : "Errore upload sconosciuto"
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
