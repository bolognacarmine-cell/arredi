// Tipologie arredo showroom
export const FURNITURE_TYPES = [
  "Banconi reception",
  "Postazioni taglio",
  "Specchiere retroilluminate",
  "Zone attesa",
  "Armadiature",
  "Lavandini integrati",
  "Vetrine espositive",
  "Sedute operative",
  "Scrivanie",
  "Scaffalature",
  "Illuminazione tecnica",
  "Elementi modulari",
  "Altro",
] as const

export type FurnitureType = (typeof FURNITURE_TYPES)[number] | string
