import express from "express"
import Project from "../models/Project.js"

const router = express.Router()

// GET /api/projects - Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ year: -1, createdAt: -1 })
    res.json({ success: true, data: projects })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch projects" }
    })
  }
})

// GET /api/projects/:id - Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id })
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: "Project not found" }
      })
    }
    res.json({ success: true, data: project })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch project" }
    })
  }
})

// POST /api/projects - Create project
router.post("/", async (req, res) => {
  try {
    const project = await Project.create(req.body)
    res.status(201).json({ success: true, data: project })
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: "Project with this ID already exists" }
      })
    }
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create project" }
    })
  }
})

// PUT /api/projects/:id - Update project
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: "Project not found" }
      })
    }

    res.json({ success: true, data: project })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update project" }
    })
  }
})

// DELETE /api/projects/:id - Delete project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ id: req.params.id })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: "Project not found" }
      })
    }

    res.json({ success: true, data: { message: "Project deleted successfully" } })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete project" }
    })
  }
})

export default router
