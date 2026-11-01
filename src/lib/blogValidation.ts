/**
 * Validazione lato client del form articoli (pannello admin).
 *
 * Speciale spec:
 *  - titolo, slug e contenuto obbligatori
 *  - slug univoco → il controllo finale è del server (409 SLUG_DUPLICATE),
 *    qui preveniamo solo il formato
 *  - meta title massimo 60 caratteri  → ERRORE
 *  - meta description tra 140 e 155    → WARNING (il server blocca solo oltre 160,
 *    così i vecchi articoli restano modificabili)
 *  - immagine di copertina consigliata → WARNING
 */

export const LIMITS = {
  title: 300,
  slug: 80,
  content: 50000,
  excerpt: 300,
  seoTitle: 60,
  seoDescriptionMax: 160,
  seoDescriptionMin: 140,
  seoDescriptionIdealMax: 155,
  coverImageAlt: 200,
} as const;

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export interface ValidationMessages {
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

/** Conta i caratteri visibili del contenuto HTML (senza tag). */
export function visibleTextLength(html: string): number {
  if (!html) return 0;
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

/** True se il contenuto contiene almeno del testo utilizzabile. */
export function hasVisibleContent(html: string): boolean {
  return visibleTextLength(html) > 0;
}

export function validatePostForm(
  post: {
    title?: string;
    slug?: string;
    sectorSlug?: string;
    excerpt?: string;
    content?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    coverImage?: string;
    coverImageAlt?: string;
    faq?: Array<{ question?: string; answer?: string }>;
    internalLinks?: Array<{ label?: string; url?: string }>;
  },
  options: { isNew: boolean }
): ValidationMessages {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // --- Obbligatori --------------------------------------------------------
  if (!post.title || !post.title.trim()) {
    errors.title = 'Il titolo è obbligatorio';
  } else if (post.title.length > LIMITS.title) {
    errors.title = `Massimo ${LIMITS.title} caratteri (attuali: ${post.title.length})`;
  }

  if (!post.slug || !post.slug.trim()) {
    errors.slug = 'Lo slug è obbligatorio';
  } else if (!SLUG_PATTERN.test(post.slug)) {
    errors.slug = 'Solo lettere minuscole, numeri e trattini (es. arredamento-barbieri-caserta)';
  } else if (post.slug.length > LIMITS.slug) {
    errors.slug = `Massimo ${LIMITS.slug} caratteri`;
  }

  if (!post.sectorSlug || !post.sectorSlug.trim()) {
    errors.sectorSlug = 'Seleziona un settore';
  }

  if (!post.excerpt || !post.excerpt.trim()) {
    errors.excerpt = "L'estratto è obbligatorio";
  } else if (post.excerpt.length > LIMITS.excerpt) {
    errors.excerpt = `Massimo ${LIMITS.excerpt} caratteri (attuali: ${post.excerpt.length})`;
  }

  if (!post.content || !hasVisibleContent(post.content)) {
    errors.content = 'Il contenuto è obbligatorio';
  } else if (post.content.length > LIMITS.content) {
    errors.content = `Massimo ${LIMITS.content} caratteri (attuali: ${post.content.length})`;
  }

  // --- Meta title ---------------------------------------------------------
  if (post.seoTitle && post.seoTitle.length > LIMITS.seoTitle) {
    errors.seoTitle = `Meta title troppo lungo: ${post.seoTitle.length}/${LIMITS.seoTitle} caratteri`;
  } else if (post.seoTitle && post.seoTitle.length > 0 && post.seoTitle.length < 30) {
    warnings.seoTitle = 'Meta title molto corto: valuta almeno 30-60 caratteri';
  }

  // --- Meta description ---------------------------------------------------
  if (post.seoDescription && post.seoDescription.length > LIMITS.seoDescriptionMax) {
    errors.seoDescription = `Meta description troppo lunga: ${post.seoDescription.length}/${LIMITS.seoDescriptionMax} caratteri`;
  } else if (post.seoDescription) {
    const len = post.seoDescription.length;
    if (len < LIMITS.seoDescriptionMin) {
      warnings.seoDescription = `Meta description corta: ${len}/${LIMITS.seoDescriptionMin} caratteri minimi consigliati`;
    } else if (len > LIMITS.seoDescriptionIdealMax) {
      warnings.seoDescription = `Meta description: ${len} caratteri, Google ne tronca oltre i 155`;
    }
  } else if (options.isNew) {
    warnings.seoDescription = 'Meta description mancante: verrà generata dall\'estratto';
  }

  // --- URL canonico -------------------------------------------------------
  if (post.canonicalUrl && post.canonicalUrl.trim()) {
    const value = post.canonicalUrl.trim();
    const valid = value.startsWith('/') || /^https?:\/\/.+/i.test(value);
    if (!valid) errors.canonicalUrl = 'Usa un percorso interno (/pagina) o un URL http(s)';
  }

  // --- Copertina ----------------------------------------------------------
  if (post.coverImage && post.coverImage.trim()) {
    if (!post.coverImageAlt || !post.coverImageAlt.trim()) {
      warnings.coverImageAlt = 'Aggiungi un alt text alla copertina (accessibilità e SEO immagini)';
    } else if (post.coverImageAlt.length > LIMITS.coverImageAlt) {
      errors.coverImageAlt = `Massimo ${LIMITS.coverImageAlt} caratteri`;
    }
  } else if (options.isNew) {
    warnings.coverImage = 'Copertina consigliata: le card senza immagine performano peggio';
  }

  // --- FAQ ----------------------------------------------------------------
  ;(post.faq || []).forEach((item, index) => {
    if ((item.question && item.question.trim()) || (item.answer && item.answer.trim())) {
      if (!item.question || !item.question.trim()) {
        errors[`faq.${index}.question`] = 'Domanda obbligatoria';
      }
      if (!item.answer || !item.answer.trim()) {
        errors[`faq.${index}.answer`] = 'Risposta obbligatoria';
      }
    }
  })

  // --- Link interni -------------------------------------------------------
  ;(post.internalLinks || []).forEach((item, index) => {
    // Le righe completamente vuote (righe appena aggiunte) vengono ignorate
    if (!(item.label || "").trim() && !(item.url || "").trim()) return

    if (!item.label || !item.label.trim()) {
      errors[`internalLinks.${index}.label`] = 'Etichetta obbligatoria';
    }
    const url = (item.url || '').trim();
    if (!url) {
      errors[`internalLinks.${index}.url`] = 'URL obbligatorio';
    } else if (!url.startsWith('/') && !/^https?:\/\/.+/i.test(url)) {
      errors[`internalLinks.${index}.url`] = 'Percorso interno (/pagina) o URL http(s)';
    }
  })

  return { errors, warnings };
}

/** Conta errori e avvisi per la barra di stato del form. */
export function countMessages(messages: ValidationMessages): { errors: number; warnings: number } {
  return {
    errors: Object.keys(messages.errors).length,
    warnings: Object.keys(messages.warnings).length,
  };
}
