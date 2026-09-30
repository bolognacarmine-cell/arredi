/**
 * Elenca le collezioni MongoDB e conta i documenti (projects in evidenza).
 *
 * Uso:
 *   MONGODB_URI="mongodb+srv://..." npx tsx scripts/inspect-mongodb.ts
 *   npm run db:inspect
 */
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envCandidates = [
  path.resolve(__dirname, "../.server.env"),
  path.resolve(__dirname, "../server/server.env"),
  path.resolve(__dirname, "../.env"),
]
for (const envPath of envCandidates) {
  const result = dotenv.config({ path: envPath })
  if (!result.error) {
    console.log(`[env] Loaded ${envPath}`)
    break
  }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri || uri.includes("<user>") || uri.includes("<password>")) {
    console.error("❌ MONGODB_URI mancante o ancora con placeholder.")
    console.error("   Esporta l'URI reale di Atlas/Render, oppure mettilo in .server.env")
    process.exit(1)
  }

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  if (!db) throw new Error("Connessione MongoDB senza database")

  console.log(`\n📦 Database: ${db.databaseName}`)
  console.log("─".repeat(48))

  const collections = await db.listCollections().toArray()
  if (collections.length === 0) {
    console.log("(nessuna collezione)")
  }

  const rows: { name: string; count: number }[] = []
  for (const col of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await db.collection(col.name).countDocuments()
    rows.push({ name: col.name, count })
    console.log(`  ${col.name.padEnd(28)} ${count} documenti`)
  }

  const projectsNames = ["projects", "project"]
  const projectsRow =
    rows.find((r) => projectsNames.includes(r.name)) ??
    rows.find((r) => r.name.toLowerCase().includes("project"))

  console.log("─".repeat(48))
  if (!projectsRow) {
    console.log("⚠️  Collezione projects non trovata (0 documenti effettivi).")
  } else {
    const empty = projectsRow.count === 0
    console.log(
      empty
        ? `✅ Conferma: \`${projectsRow.name}\` ha 0 documenti.`
        : `ℹ️  \`${projectsRow.name}\` ha ${projectsRow.count} documenti.`,
    )
  }

  await mongoose.connection.close()
}

main().catch(async (err) => {
  console.error("❌ Inspect fallito:", err)
  try {
    await mongoose.connection.close()
  } catch {
    /* ignore */
  }
  process.exit(1)
})
