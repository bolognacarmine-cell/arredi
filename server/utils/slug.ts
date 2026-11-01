/**
 * Generazione degli slug SEO per gli articoli del blog.
 *
 * Funzioni PURE: nessun accesso a DB né a Express, così possono essere
 * testate in isolamento e riusate sia dalle route sia (eventualmente)
 * dal pannello admin.
 */

/** Stop words italiane rimosse dallo slug per mantenerlo corto e descrittivo. */
export const SLUG_STOP_WORDS = [
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
  'in', 'con', 'per', 'da', 'a', 'su', 'di', 'del', 'dello', 'della',
  'dei', 'degli', 'delle', 'e', 'o', 'ma', 'perche', 'come', 'che', 'non',
  'al', 'allo', 'alla', 'dai', 'nei', 'nelle', 'su', 'tra', 'fra',
];

/** Pattern accettato dal campo `slug` del modello Post. */
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const SLUG_MAX_LENGTH = 80;

/**
 * Trasforma un titolo in uno slug URL-friendly.
 * - rimuove accenti e caratteri non alfanumerici
 * - elimina le stop words
 * - collassa i trattini multipli
 * - tronca a `maxLength` senza lasciare trattini finali
 *
 * Esempio: "Arredamento su misura a Caserta" → "arredamento-misura-caserta"
 */
export function slugify(title: string, maxLength = 60): string {
  if (typeof title !== 'string') return '';

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // rimuove gli accenti
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((word) => word && !SLUG_STOP_WORDS.includes(word))
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length <= maxLength) return slug;

  return slug
    .substring(0, maxLength)
    .replace(/-+$/g, '')
    .replace(/^[^a-z0-9]+/, '');
}

/** Verifica che uno slug sia nel formato ammesso (lowercase, alfanumerico, trattini). */
export function isValidSlug(slug: unknown): slug is string {
  return (
    typeof slug === 'string' &&
    slug.length > 0 &&
    slug.length <= SLUG_MAX_LENGTH &&
    SLUG_PATTERN.test(slug)
  );
}

/**
 * Aggiunge un suffisso incrementale finché lo slug non collide con quelli già
 * usati. `isTaken` è iniettato per restare una funzione pura (testabile).
 *
 * Esempio: base "guida" con 2 collisioni → "guida-3"
 */
export async function ensureUniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
  maxAttempts = 50
): Promise<string> {
  const clean = base && SLUG_PATTERN.test(base) ? base : slugify(base);
  if (!clean) {
    throw new Error('Impossibile generare uno slug valido');
  }

  if (!(await isTaken(clean))) return clean;

  for (let suffix = 2; suffix <= maxAttempts; suffix++) {
    const candidate = `${clean}-${suffix}`.substring(0, SLUG_MAX_LENGTH).replace(/-+$/g, '');
    if (!(await isTaken(candidate))) return candidate;
  }

  throw new Error('Impossibile generare uno slug univoco');
}
