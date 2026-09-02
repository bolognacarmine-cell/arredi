import express from "express"
import Offer from "../models/Offer.js"

const router = express.Router()

// GET /api/offers - Get all offers
router.get("/", async (req, res) => {
  try {
    const { activitySector, active } = req.query
    const filter: any = {}
    if (activitySector) filter.activitySector = activitySector
    if (active !== undefined) filter.active = active === "true"

    const offers = await Offer.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: offers })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch offers" }
    })
  }
})

// GET /api/offers/:id - Get single offer
router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findOne({ id: req.params.id })
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: { message: "Offer not found" }
      })
    }
    res.json({ success: true, data: offer })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch offer" }
    })
  }
})

// POST /api/offers - Create offer
router.post("/", async (req, res) => {
  try {
    const offer = await Offer.create(req.body)
    res.status(201).json({ success: true, data: offer })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: "Offer with this ID already exists" }
      })
    }
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create offer" }
    })
  }
})

// PUT /api/offers/:id - Update offer
router.put("/:id", async (req, res) => {
  try {
    const offer = await Offer.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: { message: "Offer not found" }
      })
    }

    res.json({ success: true, data: offer })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update offer" }
    })
  }
})

// DELETE /api/offers/:id - Delete offer
router.delete("/:id", async (req, res) => {
  try {
    const offer = await Offer.findOneAndDelete({ id: req.params.id })

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: { message: "Offer not found" }
      })
    }

    res.json({ success: true, data: { message: "Offer deleted successfully" } })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete offer" }
    })
  }
})

export default router
