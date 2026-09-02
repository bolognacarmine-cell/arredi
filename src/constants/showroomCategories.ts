// Categorie attività / settori showroom (solo settori target)
export const ACTIVITY_CATEGORIES = [
  "Barberie",
  "Parrucchieri / Hair salon",
  "Uffici",
  "Scuole / Istituti",
  "Altro",
] as const

export type ActivityCategoryOption = (typeof ACTIVITY_CATEGORIES)[number]
