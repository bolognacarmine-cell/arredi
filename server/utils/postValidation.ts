/**
 * Validazione lato server dei dati di un articolo del blog.
 *
 * Funzioni PURE (nessun DB, nessun Express): riusate dalle route e testate
 * in isolamento. Ritornano un elenco di errori campo-per-campo invece di un
 * errore generico, così l'admin può evidenziare i campi invalidi.
 *
 * REGOLE (vincoli duri lato server — i range consigliati 140-155 per la
 * meta description sono controllati nell'admin come warning, così i vecchi
 * articoli restano modificabili senza bloccare il salvataggio):
 *  - titolo: obbligatorio, max 300
 *  - slug: obbligatorio, formato ^[a-z0-9-]+$, max 80, univoco (controllo DB a parte)
 *  - contenuto: obbligatorio, max 50000
 *  - estratto: obbligatorio, max 300 (allineato al modello)
 *  - meta title: max 60
 *  - meta description: max 160
 */

import { isValidSlug, SLUG_MAX_LENGTH } from './slug.js';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  label: string;
  url: string;
}

export interface PostValidationOptions {
  /** true = aggiornamento parziale (PUT): i campi mancanti non sono obbligatori */
  partial: boolean;
}

export const LIMITS = {
  title: 300,
  slug: SLUG_MAX_LENGTH,
  content: 50000,
  excerpt: 300,
  seoTitle: 60,
  seoDescription: 160,
  sectorSlug: 60,
  faq: 20,
  internalLinks: 30,
} as const;

const SLUG_ERROR = `Slug obbligatorio: solo lettere minuscole, numeri e trattini (max ${LIMITS.slug} caratteri)`;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSafeUrl(value: string): boolean {
  // Ammette i link interni assoluti al sito ("/settori/barbieri") e gli URL http(s).
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateFaq(faq: unknown, errors: ValidationError[]): void {
  if (faq === undefined || faq === null) return;
  if (!Array.isArray(faq)) {
    errors.push({ field: 'faq', message: 'Le FAQ devono essere una lista' });
    return;
  }
  if (faq.length > LIMITS.faq) {
    errors.push({ field: 'faq', message: `Massimo ${LIMITS.faq} domande FAQ` });
  }
  faq.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push({ field: `faq[${index}]`, message: 'Voce FAQ non valida' });
      return;
    }
    const { question, answer } = item as FaqItem;
    if (!isNonEmptyString(question)) {
      errors.push({ field: `faq[${index}].question`, message: 'La domanda è obbligatoria' });
    }
    if (!isNonEmptyString(answer)) {
      errors.push({ field: `faq[${index}].answer`, message: 'La risposta è obbligatoria' });
    }
  });
}

function validateInternalLinks(links: unknown, errors: ValidationError[]): void {
  if (links === undefined || links === null) return;
  if (!Array.isArray(links)) {
    errors.push({ field: 'internalLinks', message: 'I link interni devono essere una lista' });
    return;
  }
  if (links.length > LIMITS.internalLinks) {
    errors.push({ field: 'internalLinks', message: `Massimo ${LIMITS.internalLinks} link interni` });
  }
  links.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push({ field: `internalLinks[${index}]`, message: 'Link interno non valido' });
      return;
    }
    const { label, url } = item as InternalLink;
    if (!isNonEmptyString(label)) {
      errors.push({ field: `internalLinks[${index}].label`, message: 'L\'etichetta del link è obbligatoria' });
    }
    if (!isNonEmptyString(url) || !isSafeUrl(url.trim())) {
      errors.push({
        field: `internalLinks[${index}].url`,
        message: 'URL non valido: usa un percorso interno (/pagina) o un URL http(s)',
      });
    }
  });
}

function optionalString(
  body: Record<string, unknown>,
  field: string,
  maxLength: number,
  errors: ValidationError[],
  emptyAllowed = true
): void {
  const value = body[field];
  if (value === undefined || value === null) return;
  if (typeof value !== 'string') {
    errors.push({ field, message: 'Campo non valido' });
    return;
  }
  if (!emptyAllowed && value.trim().length === 0) {
    errors.push({ field, message: 'Campo obbligatorio' });
    return;
  }
  if (value.length > maxLength) {
    errors.push({ field, message: `Massimo ${maxLength} caratteri (attuali: ${value.length})` });
  }
}

/**
 * Valida il payload di creazione/modifica di un articolo.
 * Ritorna `[]` quando il payload è valido.
 */
export function validatePostInput(
  body: unknown,
  { partial }: PostValidationOptions
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [{ field: 'body', message: 'Corpo della richiesta non valido' }];
  }

  const data = body as Record<string, unknown>;

  // --- Titolo -------------------------------------------------------------
  if (data.title === undefined || data.title === null) {
    if (!partial) errors.push({ field: 'title', message: 'Il titolo è obbligatorio' });
  } else if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Il titolo è obbligatorio' });
  } else if (data.title.length > LIMITS.title) {
    errors.push({ field: 'title', message: `Massimo ${LIMITS.title} caratteri (attuali: ${data.title.length})` });
  }

  // --- Slug ---------------------------------------------------------------
  if (data.slug === undefined || data.slug === null || data.slug === '') {
    if (!partial) errors.push({ field: 'slug', message: SLUG_ERROR });
  } else if (!isValidSlug(data.slug)) {
    errors.push({ field: 'slug', message: SLUG_ERROR });
  }

  // --- Settore ------------------------------------------------------------
  if (data.sectorSlug === undefined || data.sectorSlug === null) {
    if (!partial) errors.push({ field: 'sectorSlug', message: 'Il settore è obbligatorio' });
  } else if (typeof data.sectorSlug !== 'string' || data.sectorSlug.trim().length === 0) {
    errors.push({ field: 'sectorSlug', message: 'Il settore è obbligatorio' });
  } else if (data.sectorSlug.length > LIMITS.sectorSlug) {
    errors.push({ field: 'sectorSlug', message: `Massimo ${LIMITS.sectorSlug} caratteri` });
  }

  // --- Estratto -----------------------------------------------------------
  if (data.excerpt === undefined || data.excerpt === null) {
    if (!partial) errors.push({ field: 'excerpt', message: 'L\'estratto è obbligatorio' });
  } else if (typeof data.excerpt !== 'string' || data.excerpt.trim().length === 0) {
    errors.push({ field: 'excerpt', message: 'L\'estratto è obbligatorio' });
  } else if (data.excerpt.length > LIMITS.excerpt) {
    errors.push({
      field: 'excerpt',
      message: `Massimo ${LIMITS.excerpt} caratteri (attuali: ${data.excerpt.length})`,
    });
  }

  // --- Contenuto ----------------------------------------------------------
  if (data.content === undefined || data.content === null) {
    if (!partial) errors.push({ field: 'content', message: 'Il contenuto è obbligatorio' });
  } else if (typeof data.content !== 'string' || data.content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Il contenuto è obbligatorio' });
  } else if (data.content.length > LIMITS.content) {
    errors.push({
      field: 'content',
      message: `Massimo ${LIMITS.content} caratteri (attuali: ${data.content.length})`,
    });
  }

  // --- SEO ----------------------------------------------------------------
  optionalString(data, 'seoTitle', LIMITS.seoTitle, errors);
  optionalString(data, 'seoDescription', LIMITS.seoDescription, errors);
  optionalString(data, 'canonicalUrl', 500, errors);

  if (isNonEmptyString(data.canonicalUrl) && !isSafeUrl(data.canonicalUrl.trim())) {
    errors.push({ field: 'canonicalUrl', message: 'URL canonico non valido' });
  }

  // --- Immagini -----------------------------------------------------------
  // Alt text e copertina sono CONSIGLIATI (mai bloccanti): se mancano lo
  // segnala il pannello admin come warning non-invalidante.
  optionalString(data, 'coverImage', 2000, errors);
  optionalString(data, 'coverImageAlt', 200, errors);
  optionalString(data, 'ogImage', 2000, errors);

  // --- Campi strutturati --------------------------------------------------
  validateFaq(data.faq, errors);
  validateInternalLinks(data.internalLinks, errors);

  // --- Flag e date --------------------------------------------------------
  if (data.isPublished !== undefined && typeof data.isPublished !== 'boolean') {
    errors.push({ field: 'isPublished', message: 'Stato di pubblicazione non valido' });
  }
  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push({ field: 'featured', message: 'Flag "in evidenza" non valido' });
  }
  if (data.order !== undefined && data.order !== null && typeof data.order !== 'number') {
    errors.push({ field: 'order', message: 'Ordine non valido' });
  }
  if (data.publishedAt !== undefined && data.publishedAt !== null && data.publishedAt !== '') {
    if (Number.isNaN(Date.parse(String(data.publishedAt)))) {
      errors.push({ field: 'publishedAt', message: 'Data di pubblicazione non valida' });
    }
  }

  // --- Tags / autore ------------------------------------------------------
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push({ field: 'tags', message: 'I tag devono essere una lista' });
  }
  if (data.author !== undefined) {
    const author = data.author as { name?: unknown; role?: unknown } | null;
    if (!author || typeof author !== 'object' || !isNonEmptyString(author.name)) {
      errors.push({ field: 'author', message: 'L\'autore è obbligatorio' });
    }
  }

  return errors;
}

/** Formatta gli errori in un messaggio singolo leggibile per la response. */
export function formatErrors(errors: ValidationError[]): string {
  return errors.map((e) => e.message).join(' | ');
}
