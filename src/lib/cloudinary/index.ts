export { cld, isCloudinaryConfigured, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./config"
export {
  buildCloudinaryImageUrl,
  getPublicIdFromUrl,
  resolveImageUrl,
  type CloudinaryResizeOptions,
  type SrcOrPublicIdPair,
} from "./image"
export { useCloudinaryUpload, type UploadState, type CloudinaryUploadResult } from "./useCloudinaryUpload"
export {
  FARCOM_WATERMARK_PUBLIC_ID,
  FARCOM_WATERMARK_MARKER,
  FARCOM_WATERMARK_TRANSFORM,
  FARCOM_LOGO_ASPECT,
  MIN_LOGO_WIDTH,
  MAX_LOGO_WIDTH,
  WATERMARK_CORNER_ORDER,
  computeSafeInset,
  computeLogoWidthPct,
  computeWatermarkLayout,
  logoBoundingBox,
  carouselWatermarkObstacles,
  watermarkCornerStyle,
  withFarcomWatermark,
  withFarcomWatermarkAll,
  withoutFarcomWatermark,
  withoutFarcomWatermarkAll,
  type WatermarkCorner,
  type WatermarkLayout,
  type Rect,
  type EdgeInsets,
} from "./watermark"
