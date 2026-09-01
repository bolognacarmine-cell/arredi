import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"
import { fileURLToPath } from "node:url"

type AssignPublicIdRequest = {
  collection: "sector" | "project"
  id: string
  field: "hero" | "cover" | "gallery"
  index?: number
  publicId: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.resolve(__dirname, "src", "data.ts")

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function currentIndent(s: string): string {
  const m = s.match(/^[\t ]*/)
  return m?.[0] ?? "  "
}

/**
 * Cerca una corrispondenza `regex` dentro `text` partendo dall'inizio,
 * ma assicurandosi che il match avvenga dentro il PRIMO oggetto che
 * contiene l'id (cioè PRIMA della prossima riga `id:` o della graffa `}`
 * che chiude l'oggetto).
 *
 * Usiamo un limite semplice: cerchiamo il prossimo pattern di chiusura
 * e limitiamo la ricerca a quella porzione.
 */
function findInSameObject(
  text: string,
  idLineStart: number,
  regex: RegExp,
): { match: RegExpExecArray; startAbs: number } | null {
  const fromId = text.slice(idLineStart)
  // Limite: fermati alla prossima graffa chiusa `}` che inizia alla stessa indentazione
  // dell'id. Per semplicità troviamo il primo `,` dopo l'id — no, meglio:
  // cerchiamo la prossima riga che inizi con 2 spazi + `}` (chiusura oggetto).
  // Usiamo il fatto che nel nostro data.ts gli oggetti sono indentati 2 livelli:
  //   SECTORS/PROJECTS sono in []; ogni oggetto ha campi indentati 4 spaces; chiusura a 2.
  const depthLimitRe = /(^|\n)\s{2}\}(,|\s|$)/
  const limMatch = fromId.match(depthLimitRe)
  const limitLen = limMatch && limMatch.index !== undefined
    ? idLineStart + limMatch.index + limMatch[0].length
    : text.length

  const slice = text.slice(idLineStart, limitLen)
  const m = regex.exec(slice)
  if (!m || m.index === undefined) return null
  return { match: m, startAbs: idLineStart + m.index }
}

function injectPublicId(
  source: string,
  req: AssignPublicIdRequest,
): { newSource: string; applied: boolean } {
  // 1. Trova la riga: `id: "xxx"`
  const idRe = new RegExp(`^\\s*id:\\s*"${escapeRegExp(req.id)}"\\s*,?\\s*$`, "m")
  const idMatch = idRe.exec(source)
  if (!idMatch || idMatch.index === undefined) return { newSource: source, applied: false }
  const idLineStart = idMatch.index
  const indent = currentIndent(idMatch[0])

  // 2. Decidi anchor + target
  let anchorRe: RegExp
  let targetField: string
  if (req.collection === "sector") {
    anchorRe = /^\s*heroImage\s*:\s*"[^"]*"\s*,?\s*$/m
    targetField = "heroImageCloudinaryPublicId"
  } else if (req.field === "gallery") {
    // gallery: [ "..", ".." ] (anche su più righe)
    anchorRe = /gallery\s*:\s*\[[\s\S]*?\]\s*,?\s*\n?/
    targetField = "galleryCloudinaryPublicIds"
  } else {
    // cover (image field)
    anchorRe = /^\s*image\s*:\s*"[^"]*"\s*,?\s*$/m
    targetField = "imageCloudinaryPublicId"
  }

  const found = findInSameObject(source, idLineStart, anchorRe)
  if (!found) return { newSource: source, applied: false }
  const { match: anchorMatch, startAbs: anchorStartAbs } = found
  const anchorEndAbs = anchorStartAbs + anchorMatch[0].length

  // 3. Due casi: GALLERY (array) o SINGOLO (hero/cover)
  if (req.field === "gallery") {
    // Cerca targetField esistente dopo l'anchor (stesso oggetto)
    const afterAnchor = source.slice(anchorEndAbs)
    const existingRe = new RegExp(
      `^\\s*${escapeRegExp(targetField)}\\s*:\\s*(\\[[\\s\\S]*?\\])\\s*,?\\s*\\n?`,
      "m",
    )
    const existingMatch = existingRe.exec(afterAnchor)
    const idx = typeof req.index === "number" ? req.index : 0
    if (existingMatch && existingMatch.index !== undefined) {
      // Aggiorna array esistente
      const arrStr = existingMatch[1]
      const items: string[] = []
      const inner = arrStr.slice(1, -1).trim()
      if (inner.length > 0) {
        const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g
        let m
        while ((m = re.exec(inner)) !== null) items.push((m[1] ?? m[2]) ?? "")
      }
      while (items.length <= idx) items.push("")
      items[idx] = req.publicId
      const rebuilt = "[" + items.map((x) => JSON.stringify(x)).join(", ") + "]"
      const startAbs = anchorEndAbs + existingMatch.index
      const endAbs = startAbs + existingMatch[0].length
      const needsNewline = existingMatch[0].endsWith("\n")
      const replacement = `${indent}${targetField}: ${rebuilt},${needsNewline ? "\n" : ""}`
      return {
        newSource: source.slice(0, startAbs) + replacement + source.slice(endAbs),
        applied: true,
      }
    } else {
      // Inserisci NUOVO array subito dopo gallery[]
      const insert = `${indent}${targetField}: [${JSON.stringify(req.publicId)}],\n`
      return {
        newSource: source.slice(0, anchorEndAbs) + insert + source.slice(anchorEndAbs),
        applied: true,
      }
    }
  } else {
    // Caso SINGOLO (hero image o cover image) — valore stringa
    const afterAnchor = source.slice(anchorEndAbs)
    const existingRe = new RegExp(
      `^\\s*${escapeRegExp(targetField)}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,?\\s*\\n?`,
      "m",
    )
    const existingMatch = existingRe.exec(afterAnchor)
    if (existingMatch && existingMatch.index !== undefined) {
      // Sostituisci valore
      const startAbs = anchorEndAbs + existingMatch.index
      const endAbs = startAbs + existingMatch[0].length
      const needsNewline = existingMatch[0].endsWith("\n")
      const replacement = `${indent}${targetField}: ${JSON.stringify(req.publicId)},${needsNewline ? "\n" : ""}`
      return {
        newSource: source.slice(0, startAbs) + replacement + source.slice(endAbs),
        applied: true,
      }
    } else {
      // Inserisci NUOVO campo subito dopo heroImage/image
      const insert = `${indent}${targetField}: ${JSON.stringify(req.publicId)},\n`
      return {
        newSource: source.slice(0, anchorEndAbs) + insert + source.slice(anchorEndAbs),
        applied: true,
      }
    }
  }
}

function writeWithBackup(destPath: string, newContents: string) {
  try {
    const original = fs.readFileSync(destPath, "utf8")
    const stamp = new Date()
      .toISOString()
      .replace(/[:T]/g, "-")
      .replace(/\..+$/, "")
    const backupPath = `${destPath}.backup-${stamp}.ts`
    fs.writeFileSync(backupPath, original, "utf8")
    fs.writeFileSync(destPath, newContents, "utf8")
    return { ok: true as const, backupPath }
  } catch (err) {
    return {
      ok: false as const,
      backupPath: null,
      err: err instanceof Error ? err.message : String(err),
    }
  }
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let body = ""
      req.on("data", (chunk: any) => (body += chunk.toString()))
      req.on("end", () => resolve(body))
      req.on("error", (e: Error) => reject(e))
    } catch (e) {
      reject(e)
    }
  })
}

export function farcomDataApiPlugin(): Plugin {
  return {
    name: "farcom-data-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res, next) => {
        const url = req.url || "/"
        const pathname = url.split("?")[0]
        try {
          if (pathname === "/health") {
            res.statusCode = 200
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ ok: true, dataFile: DATA_FILE }))
            return
          }
          if (pathname !== "/assign-public-id" && pathname !== "/assign") {
            next()
            return
          }
          if (req.method !== "POST") {
            res.statusCode = 405
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({ ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Usa POST" } }))
            return
          }
          const bodyRaw = await readBody(req)
          const payload = JSON.parse(bodyRaw || "{}") as Partial<AssignPublicIdRequest>

          if (
            !payload.collection || !["sector", "project"].includes(payload.collection) ||
            !payload.id ||
            !payload.field || !["hero", "cover", "gallery"].includes(payload.field) ||
            !payload.publicId
          ) {
            res.statusCode = 400
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({
              ok: false,
              error: {
                code: "BAD_REQUEST",
                message:
                  "Payload non valido — collection (sector|project), id, field (hero|cover|gallery), publicId.",
              },
            }))
            return
          }
          if (!fs.existsSync(DATA_FILE)) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({
              ok: false,
              error: { code: "DATA_FILE_MISSING", message: `data.ts non trovato in ${DATA_FILE}` },
            }))
            return
          }

          const source = fs.readFileSync(DATA_FILE, "utf8")
          const reqN: AssignPublicIdRequest = {
            collection: payload.collection as AssignPublicIdRequest["collection"],
            id: payload.id,
            field: payload.field as AssignPublicIdRequest["field"],
            index: typeof payload.index === "number" ? payload.index : undefined,
            publicId: payload.publicId,
          }
          const { newSource, applied } = injectPublicId(source, reqN)
          if (!applied) {
            res.statusCode = 422
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({
              ok: false,
              error: {
                code: "NOT_APPLIED",
                message: `Non trovato il punto di inserimento — collection=${reqN.collection} id=${reqN.id} field=${reqN.field}`,
              },
            }))
            return
          }
          const wr = writeWithBackup(DATA_FILE, newSource)
          if (!wr.ok) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(JSON.stringify({
              ok: false,
              error: { code: "WRITE_FAILED", message: wr.err || "Errore scrittura file" },
            }))
            return
          }
          res.statusCode = 200
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({ ok: true, written: true, backupPath: wr.backupPath }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json; charset=utf-8")
          res.end(JSON.stringify({
            ok: false,
            error: {
              code: "UNKNOWN",
              message:
                err instanceof Error
                  ? `${err.name}: ${err.message}\n${err.stack || ""}`
                  : String(err),
            },
          }))
        }
      })
    },
  }
}
