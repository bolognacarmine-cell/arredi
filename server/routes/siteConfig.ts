import express from "express"
import SiteConfig from "../models/SiteConfig.js"

const router = express.Router()

// GET /api/site-config - Get site config (always returns the single config)
router.get("/", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ id: "default" })
    if (!config) {
      // Create default config if it doesn't exist
      config = await SiteConfig.create({
        id: "default",
        companyName: "Arredi Farcom",
        contactEmail: "info@farcom.it",
        contactPhone: "+39 012 345 6789"
      })
    }
    res.json({ success: true, data: config })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch site config" }
    })
  }
})

// PUT /api/site-config - Update site config
router.put("/", async (req, res) => {
  try {
    const config = await SiteConfig.findOneAndUpdate(
      { id: "default" },
      { $set: req.body },
      { new: true, runValidators: true, upsert: true }
    )

    res.json({ success: true, data: config })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update site config" }
    })
  }
})

export default router
