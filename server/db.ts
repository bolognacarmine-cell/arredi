import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/arredi"

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined")
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected")
})

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error)
})
