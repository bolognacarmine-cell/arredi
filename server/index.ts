import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import { connectDB } from "./db.js"
import mediaRoutes from "./routes/media.js"
import projectRoutes from "./routes/projects.js"
import productRoutes from "./routes/products.js"
import offerRoutes from "./routes/offers.js"
import quoteRoutes from "./routes/quotes.js"
import siteConfigRoutes from "./routes/siteConfig.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API Routes
app.use("/api/media", mediaRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/products", productRoutes)
app.use("/api/offers", offerRoutes)
app.use("/api/quotes", quoteRoutes)
app.use("/api/site-config", siteConfigRoutes)

// Serve static files from dist/ in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist")
  app.use(express.static(distPath, {
    maxAge: "1y", // Cache static files for 1 year
    etag: true
  }))

  // Serve index.html for all non-API routes (SPA routing)
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/health")) {
      res.sendFile(path.join(distPath, "index.html"))
    }
  })
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err)
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      status: err.status || 500
    }
  })
})

// Start server
async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 MongoDB connected`)
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`)
      if (process.env.NODE_ENV === "production") {
        console.log(`📁 Serving static files from dist/`)
      }
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

start()
