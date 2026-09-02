import express from "express"
import Product from "../models/Product.js"

const router = express.Router()

// GET /api/products - Get all products
router.get("/", async (req, res) => {
  try {
    const { activitySector, active } = req.query
    const filter: any = {}
    if (activitySector) filter.activitySector = activitySector
    if (active !== undefined) filter.active = active === "true"

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: products })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch products" }
    })
  }
})

// GET /api/products/slug/:slug - Get product by slug (must come before :id)
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: "Product not found" }
      })
    }
    res.json({ success: true, data: product })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch product" }
    })
  }
})

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id })
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: "Product not found" }
      })
    }
    res.json({ success: true, data: product })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch product" }
    })
  }
})
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: "Product not found" }
      })
    }
    res.json({ success: true, data: product })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch product" }
    })
  }
})

// POST /api/products - Create product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: "Product with this ID or slug already exists" }
      })
    }
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create product" }
    })
  }
})

// PUT /api/products/:id - Update product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: "Product not found" }
      })
    }

    res.json({ success: true, data: product })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update product" }
    })
  }
})

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: "Product not found" }
      })
    }

    res.json({ success: true, data: { message: "Product deleted successfully" } })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete product" }
    })
  }
})

export default router
