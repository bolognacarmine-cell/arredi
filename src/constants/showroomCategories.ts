// Categorie attività / settori (select per showroom
export const ACTIVITY_CATEGORIES = [
  "Barberie",
  "Parrucchieri",
  "Uffici",
  "Scuole",
  "Studi medici",
  "Negozi",
  "Hotel",
  "Altro",
] as const

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number] | string
