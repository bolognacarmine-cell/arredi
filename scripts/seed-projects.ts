/**
 * Seed progetti in MongoDB da src/data.ts (o da un JSON).
 *
 * Modalità sicura (default): upsert per `id` — non cancella documenti esistenti.
 * Modalità --replace-all: svuota la collezione e reinserisce (richiede --yes).
 *
 * Uso:
 *   npm run seed:projects
 *   npm run seed:projects -- --dry-run
 *   npm run seed:projects -- --from=./backup-projects.json
 *   npm run seed:projects -- --replace-all --yes
 */
import dotenv from "dotenv"
import fs from "fs"
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

type SeedProject = {
  id: string
  title: string
  sector: string
  sectorId?: string
  location: string
  year: number
  client?: string
  description: string
  image: string
  imageCloudinaryPublicId?: string
  coverImages?: string[]
  galleryImages?: string[]
  galleryCloudinaryPublicIds?: string[]
  tags?: string[]
  materials: string
  status?: "bozza" | "in lavorazione" | "completato"
  featured?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    slug?: string
  }
}

function parseArgs(argv: string[]) {
  const flags = new Set<string>()
  let fromFile: string | null = null
  for (const arg of argv) {
    if (arg === "--dry-run") flags.add("dry-run")
    else if (arg === "--replace-all") flags.add("replace-all")
    else if (arg === "--yes" || arg === "-y") flags.add("yes")
    else if (arg.startsWith("--from=")) fromFile = arg.slice("--from=".length)
    else if (arg === "--help" || arg === "-h") flags.add("help")
  }
  return { flags, fromFile }
}

function normalizeProject(raw: any, index: number): SeedProject {
  const id = String(raw?.id || raw?._id || `project-${index}`)
  const galleryImages: string[] =
    (Array.isArray(raw?.galleryImages) && raw.galleryImages) ||
    (Array.isArray(raw?.galleryImagesImages) && raw.galleryImagesImages) ||
    (Array.isArray(raw?.gallery) && raw.gallery) ||
    []

  const galleryCloudinaryPublicIds: string[] =
    (Array.isArray(raw?.galleryCloudinaryPublicIds) && raw.galleryCloudinaryPublicIds) ||
    (Array.isArray(raw?.galleryImagesCloudinaryPublicIds) &&
      raw.galleryImagesCloudinaryPublicIds) ||
    []

  const coverImages: string[] =
    (Array.isArray(raw?.coverImages) && raw.coverImages) ||
    (raw?.image ? [String(raw.image)] : [])

  return {
    id,
    title: String(raw?.title || "").trim() || `Progetto ${index + 1}`,
    sector: String(raw?.sector || "Generico"),
    sectorId: raw?.sectorId ? String(raw.sectorId) : undefined,
    location: String(raw?.location || ""),
    year: Number(raw?.year) || new Date().getFullYear(),
    client: raw?.client ? String(raw.client) : undefined,
    description: String(raw?.description || ""),
    image: String(raw?.image || coverImages[0] || ""),
    imageCloudinaryPublicId: raw?.imageCloudinaryPublicId
      ? String(raw.imageCloudinaryPublicId)
      : undefined,
    coverImages,
    galleryImages: galleryImages.length > 0 ? galleryImages : coverImages,
    galleryCloudinaryPublicIds,
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : [],
    materials: String(raw?.materials || "Materiali da definire"),
    status: (["bozza", "in lavorazione", "completato"] as const).includes(raw?.status)
      ? raw.status
      : "completato",
    featured: Boolean(raw?.featured),
    seo: raw?.seo
      ? {
          metaTitle: raw.seo.metaTitle,
          metaDescription: raw.seo.metaDescription,
          slug: raw.seo.slug,
        }
      : undefined,
  }
}

async function loadSourceProjects(fromFile: string | null): Promise<SeedProject[]> {
  if (fromFile) {
    const abs = path.resolve(process.cwd(), fromFile)
    if (!fs.existsSync(abs)) {
      throw new Error(`File non trovato: ${abs}`)
    }
    const parsed = JSON.parse(fs.readFileSync(abs, "utf8"))
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.data)
        ? parsed.data
        : Array.isArray(parsed?.projects)
          ? parsed.projects
          : null
    if (!list) {
      throw new Error("JSON non valido: atteso un array (o { data: [] } / { projects: [] })")
    }
    console.log(`[source] ${list.length} progetti da ${abs}`)
    return list.map(normalizeProject)
  }

  const { PROJECTS } = await import("../src/data.ts")
  if (!Array.isArray(PROJECTS) || PROJECTS.length === 0) {
    throw new Error("src/data.ts non espone PROJECTS con dati")
  }
  console.log(`[source] ${PROJECTS.length} progetti da src/data.ts`)
  return PROJECTS.map(normalizeProject)
}

function printHelp() {
  console.log(`
Seed progetti → MongoDB

  npx tsx scripts/seed-projects.ts [opzioni]
  npm run seed:projects -- [opzioni]

Opzioni:
  --dry-run              Mostra cosa farebbe, senza scrivere
  --from=path.json       Importa da JSON invece di src/data.ts
  --replace-all --yes    Cancella TUTTI i progetti e reinserisce (distruttivo)
  --help                 Mostra questo aiuto

Default: upsert per campo id (nessuna cancellazione di documenti non presenti nel seed).
`)
}

async function main() {
  const { flags, fromFile } = parseArgs(process.argv.slice(2))
  if (flags.has("help")) {
    printHelp()
    process.exit(0)
  }

  const uri = process.env.MONGODB_URI
  if (!uri || uri.includes("<user>") || uri.includes("<password>")) {
    console.error("❌ MONGODB_URI mancante o ancora con placeholder.")
    console.error("   Esempio:")
    console.error('   MONGODB_URI="mongodb+srv://USER:PASS@cluster.../arredi" npm run seed:projects')
    process.exit(1)
  }

  const projects = await loadSourceProjects(fromFile)
  const missingRequired = projects.filter(
    (p) => !p.id || !p.title || !p.sector || !p.location || !p.description || !p.image || !p.materials,
  )
  if (missingRequired.length > 0) {
    console.error("❌ Alcuni progetti non hanno i campi obbligatori:")
    for (const p of missingRequired.slice(0, 5)) {
      console.error(`   - id=${p.id} title=${p.title}`)
    }
    process.exit(1)
  }

  await mongoose.connect(uri)
  const { Project } = await import("../server/models/Project.ts")

  const before = await Project.countDocuments()
  console.log(`[db] progetti esistenti: ${before}`)

  if (flags.has("dry-run")) {
    console.log(`[dry-run] inserirei/aggiornerei ${projects.length} progetti (upsert per id)`)
    console.log(`[dry-run] primi id: ${projects.slice(0, 5).map((p) => p.id).join(", ")}`)
    await mongoose.connection.close()
    process.exit(0)
  }

  if (flags.has("replace-all")) {
    if (!flags.has("yes")) {
      console.error("❌ --replace-all richiede anche --yes (operazione distruttiva).")
      await mongoose.connection.close()
      process.exit(1)
    }
    console.log("[mode] replace-all: deleteMany + insertMany")
    await Project.deleteMany({})
    await Project.insertMany(projects, { ordered: true })
  } else {
    console.log("[mode] upsert sicuro per id (nessuna delete globale)")
    const ops = projects.map((p) => ({
      updateOne: {
        filter: { id: p.id },
        update: {
          $set: {
            ...p,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }))
    const result = await Project.bulkWrite(ops, { ordered: false })
    console.log("[bulkWrite]", {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    })
  }

  const after = await Project.countDocuments()
  const sample = await Project.find().sort({ createdAt: -1 }).limit(5).lean()
  console.log(`✅ Seed completato. Documenti in projects: ${after}`)
  console.log(
    "   Sample id:",
    sample.map((p: any) => p.id).join(", ") || "(vuoto)",
  )

  await mongoose.connection.close()
  console.log("🔌 MongoDB connection closed")
}

main().catch(async (err) => {
  console.error("❌ Seed fallito:", err)
  try {
    await mongoose.connection.close()
  } catch {
    /* ignore */
  }
  process.exit(1)
})
