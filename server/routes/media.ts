import express from "express"
import Media from "../models/Media.js"

const router = express.Router()

// GET /api/media - Get all media
router.get("/", async (req, res) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const media = await Media.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: media })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch media" }
    })
  }
})

// GET /api/media/:id - Get single media
router.get("/:id", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: "Media not found" }
      })
    }
    res.json({ success: true, data: media })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch media" }
    })
  }
})

// POST /api/media - Create media
router.post("/", async (req, res) => {
  try {
    const {
      cloudinaryUrl,
      cloudinaryPublicId,
      title,
      category,
      width,
      height,
      format,
      bytes
    } = req.body

    if (!cloudinaryUrl || !cloudinaryPublicId || !category) {
      return res.status(400).json({
        success: false,
        error: { message: "Missing required fields: cloudinaryUrl, cloudinaryPublicId, category" }
      })
    }

    const media = await Media.create({
      cloudinaryUrl,
      cloudinaryPublicId,
      title: title || "",
      category,
      width: width || 0,
      height: height || 0,
      format: format || "",
      bytes: bytes || 0
    })

    res.status(201).json({ success: true, data: media })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: "Media with this cloudinaryPublicId already exists" }
      })
    }
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create media" }
    })
  }
})

// PUT /api/media/:id - Update media
router.put("/:id", async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: "Media not found" }
      })
    }

    res.json({ success: true, data: media })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update media" }
    })
  }
})

// DELETE /api/media/:id - Delete media
router.delete("/:id", async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id)

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: "Media not found" }
      })
    }

    res.json({ success: true, data: { message: "Media deleted successfully" } })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete media" }
    })
  }
})

export default router
