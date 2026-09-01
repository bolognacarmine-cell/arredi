import { Cloudinary } from "@cloudinary/url-gen"

export const CLOUDINARY_CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || "demo"

export const CLOUDINARY_UPLOAD_PRESET =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || ""

export const isCloudinaryConfigured =
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== "demo"

export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true,
  },
})
