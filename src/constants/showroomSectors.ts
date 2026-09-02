// Costanti: settori showroom + mappa tipologie arredo specifiche per settore
export type ActivitySector = "barber" | "office" | "retail" | "school" | "other"

export interface SectorMeta {
  value: ActivitySector
  label: string
  furnitureTypes: string[]
}

export const SECTORS: SectorMeta[] = [
  {
    value: "barber",
    label: "Barberie e parrucchieri",
    furnitureTypes: [
      "Banconi reception",
      "Postazioni taglio",
      "Specchiere retroilluminate",
      "Zone attesa",
      "Armadiature",
      "Lavandini integrati",
      "Vetrine espositive",
      "Sedute operative",
      "Postazioni trucco / styling",
      "Illuminazione tecnica per arredo",
      "Elementi modulari per arredo",
      "Altro",
    ],
  },
  {
    value: "office",
    label: "Uffici",
    furnitureTypes: [
      "Scrivanie e postazioni",
      "Reception e banconi ingresso",
      "Librerie e scaffalature",
      "Sale riunioni",
      "Pareti divisorie",
      "Armadi ufficio",
      "Lounge e aree relax",
      "Sedute operative",
      "Cassettiere",
      "Illuminazione tecnica per ufficio",
      "Altro",
    ],
  },
  {
    value: "retail",
    label: "Negozi / Retail",
    furnitureTypes: [
      "Banchi cassa",
      "Scaffalature espositive",
      "Manichini e supporti",
      "Camerini",
      "Vetrine",
      "Banconi servizio",
      "Insegne e arredi esterni",
      "Zone attesa",
      "Illuminazione commerciale",
      "Altro",
    ],
  },
  {
    value: "school",
    label: "Scuole / Istituti",
    furnitureTypes: [
      "Banchi e sedie ergonomiche",
      "Librerie aula",
      "Lavagne integrate",
      "Spogliatoi",
      "Mense e refettori",
      "Arredi aula magna",
      "Spazi gioco",
      "Armadiature scolastiche",
      "Reception e banconi ingresso scuola",
      "Altro",
    ],
  },
  {
    value: "other",
    label: "Altro",
    furnitureTypes: ["Altro"],
  },
]

export const SECTOR_OPTIONS: ActivitySector[] = SECTORS.map((s) => s.value)
export const SECTOR_LABELS: Record<ActivitySector, string> = SECTORS.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.label }),
  {} as Record<ActivitySector, string>,
)
export const FURNITURE_BY_SECTOR: Record<ActivitySector, string[]> = SECTORS.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.furnitureTypes }),
  {} as Record<ActivitySector, string[]>,
)

export const displaySectorLabel = (v: ActivitySector): string => SECTOR_LABELS[v] || "Altro"

export const furnitureTypesFor = (sector: ActivitySector | "all" | string): string[] => {
  if (sector === "all" || !sector) {
    const all = new Set<string>()
    SECTORS.forEach((s) => s.furnitureTypes.forEach((t) => all.add(t)))
    return Array.from(all)
  }
  return FURNITURE_BY_SECTOR[sector as ActivitySector] || ["Altro"]
}
