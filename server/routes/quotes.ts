import express from "express"
import Quote from "../models/Quote.js"

const router = express.Router()

// GET /api/quotes - Get all quotes
router.get("/", async (req, res) => {
  try {
    const { status } = req.query
    const filter: any = {}
    if (status) filter.status = status

    const quotes = await Quote.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: quotes })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch quotes" }
    })
  }
})

// GET /api/quotes/:id - Get single quote
router.get("/:id", async (req, res) => {
  try {
    const quote = await Quote.findOne({ id: req.params.id })
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: "Quote not found" }
      })
    }
    res.json({ success: true, data: quote })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch quote" }
    })
  }
})

// POST /api/quotes - Create quote
router.post("/", async (req, res) => {
  try {
    const quote = await Quote.create(req.body)
    res.status(201).json({ success: true, data: quote })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: "Quote with this ID already exists" }
      })
    }
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create quote" }
    })
  }
})

// PUT /api/quotes/:id - Update quote
router.put("/:id", async (req, res) => {
  try {
    const quote = await Quote.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: "Quote not found" }
      })
    }

    res.json({ success: true, data: quote })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update quote" }
    })
  }
})

// DELETE /api/quotes/:id - Delete quote
router.delete("/:id", async (req, res) => {
  try {
    const quote = await Quote.findOneAndDelete({ id: req.params.id })

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: { message: "Quote not found" }
      })
    }

    res.json({ success: true, data: { message: "Quote deleted successfully" } })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete quote" }
    })
  }
})

export default router
