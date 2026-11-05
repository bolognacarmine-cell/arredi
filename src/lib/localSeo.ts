// Keyword SEO locali condivise (area Macerata Campania + Caserta).
// Unica fonte per il frontend: meta keywords, JSON-LD LocalBusiness e copy.

export const LOCAL_PRIMARY_CITY = 'Macerata Campania'
export const LOCAL_PRIMARY_PROVINCE = 'Caserta'
export const LOCAL_PRIMARY_REGION = 'Campania'

export const LOCAL_KEYWORDS = [
  'arredamento Macerata Campania',
  'arredamento Caserta',
  'arredi su misura Caserta',
  'arredamento su misura Macerata Campania',
  'showroom arredamento Caserta',
  'negozi di arredamento Caserta',
  'progettazione interni Caserta',
  'arredatore interni Caserta',
  'mobili su misura Caserta',
  'arredamento negozi Caserta',
  'arredamento uffici Caserta',
  'arredamento barberie Caserta',
  'arredo bar Caserta',
  'arredamento scuole Caserta',
  'arredo centri estetici Caserta',
  'arredi commerciali Campania',
  'falegnameria Caserta',
  'arredamento provincia di Caserta',
] as const

export const LOCAL_KEYWORDS_STRING = LOCAL_KEYWORDS.join(', ')

// Keyword per pagina statica (allineate con server/seo.ts).
export const LOCAL_PAGE_KEYWORDS = {
  settori: `settori arredamento Caserta, arredamento negozi Caserta, arredamento uffici Caserta, arredo barberie Caserta, arredo bar Caserta, arredamento scuole Caserta, arredo centri estetici Caserta, arredi commerciali Macerata Campania, ${LOCAL_KEYWORDS_STRING}`,
  progetti: `progetti arredamento Caserta, realizzazioni arredi su misura Macerata Campania, allestimenti negozi Caserta, arredamento commerciale Campania, ${LOCAL_KEYWORDS_STRING}`,
  showroom: `showroom arredamento Caserta, showroom arredi Macerata Campania, negozio arredamento Caserta, arredi professionali Campania, ${LOCAL_KEYWORDS_STRING}`,
  blog: `blog arredamento Caserta, consigli progettazione interni Caserta, arredo contract Campania, idee arredamento Macerata Campania, ${LOCAL_KEYWORDS_STRING}`,
  chiSiamo: `azienda arredamento Caserta, falegnameria Macerata Campania, arredatore interni Caserta, arredamento made in Italy Campania, ${LOCAL_KEYWORDS_STRING}`,
  contatti: `contatti arredamento Caserta, showroom arredamento Macerata Campania, telefono arredatore Caserta, indirizzo showroom arredi Campania, ${LOCAL_KEYWORDS_STRING}`,
  preventivo: `preventivo arredamento Caserta, preventivo arredi su misura Macerata Campania, sopralluogo gratuito arredamento Caserta, arredatore interni Campania, ${LOCAL_KEYWORDS_STRING}`,
} as const

export const LOCAL_SECTOR_KEYWORDS: Record<string, string> = {
  barbieri:
    'arredamento barbiere Caserta, arredo barberia Macerata Campania, arredi parrucchiere Caserta, salone barbiere su misura Campania',
  uffici:
    'arredamento uffici Caserta, arredi per ufficio Macerata Campania, progettazione uffici Caserta, arredo uffici su misura Campania',
  negozi:
    'arredamento negozi Caserta, arredi commerciali Macerata Campania, allestimento negozio Caserta, arredo shop Campania',
  scuole:
    'arredamento scuole Caserta, arredi scolastici Macerata Campania, arredo aule e laboratori Caserta, arredi per istituti Campania',
  bar: 'arredamento bar Caserta, arredo locali Macerata Campania, arredi per ristoranti e pub Caserta, arredo bar su misura Campania',
  'centri-estetici':
    'arredamento centri estetici Caserta, arredi per SPA Macerata Campania, arredo beauty center Caserta, arredi centri benessere Campania',
}

export const LOCAL_AREA_SERVED = [
  { '@type': 'City', name: 'Macerata Campania' },
  { '@type': 'City', name: 'Caserta' },
  { '@type': 'City', name: 'Marcianise' },
  { '@type': 'City', name: 'Santa Maria Capua Vetere' },
  { '@type': 'City', name: 'Capodrise' },
  { '@type': 'City', name: 'San Nicola la Strada' },
  { '@type': 'City', name: 'Casagiove' },
  { '@type': 'City', name: 'Recale' },
  { '@type': 'City', name: 'Portico di Caserta' },
  { '@type': 'City', name: 'Maddaloni' },
  { '@type': 'City', name: 'Aversa' },
  { '@type': 'AdministrativeArea', name: 'Provincia di Caserta' },
  { '@type': 'AdministrativeArea', name: 'Campania' },
  { '@type': 'Country', name: 'Italia' },
] as const

export const LOCAL_KNOWS_ABOUT = [
  'arredamento su misura',
  'progettazione interni',
  'arredo commerciale',
  'arredi per negozi',
  'arredi per uffici',
  'arredo barberie e parrucchieri',
  'arredo bar e locali',
  'arredo scuole',
  'arredo centri estetici',
  'falegnameria su misura',
] as const
