// Tipologie arredo showroom (coerenti con barberie, parrucchieri, uffici, scuole)
export const FURNITURE_TYPES = [
  "Banconi reception",
  "Postazioni taglio",
  "Specchiere retroilluminate",
  "Zone attesa",
  "Armadiature",
  "Lavandini integrati",
  "Vetrine espositive",
  "Sedute operative",
  "Scrivanie / Banchi lavoro",
  "Scaffalature espositive / Librerie",
  "Cassettiere / Armadietti",
  "Banchi scuola / Banchi operativi",
  "Postazioni trucco / styling",
  "Illuminazione tecnica per arredo",
  "Elementi modulari per arredo",
  "Altro",
] as const

export type FurnitureTypeOption = (typeof FURNITURE_TYPES)[number]
