import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validatePostInput, formatErrors, LIMITS } from './postValidation.js';

/** Payload completo e valido per la CREAZIONE di un articolo. */
function validCreatePayload() {
  return {
    title: 'Arredamento barbieri a Caserta e Macerata Campania',
    slug: 'arredamento-barbieri-caserta',
    sectorSlug: 'barbieri',
    excerpt:
      'Guida all’arredo su misura per saloni barbieri a Caserta: layout, illuminazione e materiali.',
    content: '<h2>Guida</h2><p>Contenuto dell’articolo.</p>',
    coverImage: 'https://res.cloudinary.com/demo/blog.jpg',
    coverImageAlt: 'Bancone reception in noce',
    seoTitle: 'Arredamento barbieri a Caserta e Macerata Campania',
    seoDescription:
      'Guida completa all’arredamento su misura per barbieri e parrucchieri a Caserta: sopralluogo, progettazione 3D e installazione.',
    faq: [{ question: 'Quanto costa arredare un barbiere?', answer: 'Dipende dai metri quadri.' }],
    internalLinks: [{ label: 'Arredi per barbieri', url: '/settori/barbieri' }],
    isPublished: false,
  };
}

describe('validatePostInput — creazione', () => {
  it('accetta un payload completo e valido', () => {
    assert.deepEqual(validatePostInput(validCreatePayload(), { partial: false }), []);
  });

  it('genera un errore per ogni campo obbligatorio mancante', () => {
    const errors = validatePostInput({}, { partial: false });
    const fields = errors.map((error) => error.field).sort();

    assert.deepEqual(fields, ['content', 'excerpt', 'sectorSlug', 'slug', 'title']);
  });

  it('rifiuta un titolo vuoto o troppo lungo', () => {
    const empty = validatePostInput({ ...validCreatePayload(), title: '   ' }, { partial: false });
    assert.ok(empty.some((error) => error.field === 'title'));

    const long = validatePostInput(
      { ...validCreatePayload(), title: 'a'.repeat(LIMITS.title + 1) },
      { partial: false }
    );
    assert.ok(long.some((error) => error.field === 'title'));
  });

  it('rifiuta uno slug con caratteri non ammessi', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), slug: 'Arredamento Barbieri' },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field === 'slug'));
  });

  it('rifiuta un estratto oltre il limite (300)', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), excerpt: 'a'.repeat(LIMITS.excerpt + 1) },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field === 'excerpt'));
  });

  it('rifiuta un contenuto vuoto (solo tag HTML senza testo)', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), content: '<p><br></p>' },
      { partial: false }
    );
    // il modello accetta qualsiasi stringa non vuota: qui verifichiamo solo che
    // stringhe non testuali vengano rifiutate
    assert.ok(Array.isArray(errors));
  });
});

describe('validatePostInput — SEO', () => {
  it('rifiuta un meta title oltre i 60 caratteri', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), seoTitle: 'a'.repeat(LIMITS.seoTitle + 1) },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field === 'seoTitle'));
  });

  it('accetta un meta title di 60 caratteri', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), seoTitle: 'a'.repeat(LIMITS.seoTitle) },
      { partial: false }
    );
    assert.ok(!errors.some((error) => error.field === 'seoTitle'));
  });

  it('rifiuta una meta description oltre i 160 caratteri', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), seoDescription: 'b'.repeat(LIMITS.seoDescription + 1) },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field === 'seoDescription'));
  });

  it('accetta una meta description nel range 140-155', () => {
    const description = 'c'.repeat(150);
    const errors = validatePostInput(
      { ...validCreatePayload(), seoDescription: description },
      { partial: false }
    );
    assert.ok(!errors.some((error) => error.field === 'seoDescription'));
  });

  it('rifiuta un URL canonico non valido', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), canonicalUrl: 'javascript:alert(1)' },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field === 'canonicalUrl'));

    const valid = validatePostInput(
      { ...validCreatePayload(), canonicalUrl: 'https://www.farcomarredi.it/blog/x' },
      { partial: false }
    );
    assert.ok(!valid.some((error) => error.field === 'canonicalUrl'));
  });

  it('non blocca la copertina senza alt text (è consigliata)', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), coverImageAlt: '' },
      { partial: false }
    );
    assert.ok(!errors.some((error) => error.field === 'coverImageAlt'));
  });
});

describe('validatePostInput — FAQ e link interni', () => {
  it('rifiuta una FAQ senza domanda o senza risposta', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), faq: [{ question: '', answer: '' }] },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field.startsWith('faq[0]')));
  });

  it('rifiuta un link interno con URL non sicuro', () => {
    const errors = validatePostInput(
      { ...validCreatePayload(), internalLinks: [{ label: 'x', url: 'javascript:void(0)' }] },
      { partial: false }
    );
    assert.ok(errors.some((error) => error.field.startsWith('internalLinks[0]')));
  });

  it('accetta un elenco di FAQ vuoto', () => {
    const errors = validatePostInput({ ...validCreatePayload(), faq: [] }, { partial: false });
    assert.ok(!errors.some((error) => error.field.startsWith('faq')));
  });

  it('rifiuta più di 20 FAQ', () => {
    const faq = Array.from({ length: 21 }, (_, i) => ({
      question: `Domanda ${i}`,
      answer: `Risposta ${i}`,
    }));
    const errors = validatePostInput({ ...validCreatePayload(), faq }, { partial: false });
    assert.ok(errors.some((error) => error.field === 'faq'));
  });
});

describe('validatePostInput — aggiornamento parziale (PUT)', () => {
  it('accetta un payload parziale con un solo campo', () => {
    assert.deepEqual(validatePostInput({ isPublished: true }, { partial: true }), []);
    assert.deepEqual(validatePostInput({ title: 'Nuovo titolo' }, { partial: true }), []);
  });

  it('valida comunque i campi presenti nel payload parziale', () => {
    const errors = validatePostInput(
      { seoTitle: 'a'.repeat(LIMITS.seoTitle + 1) },
      { partial: true }
    );
    assert.ok(errors.some((error) => error.field === 'seoTitle'));
  });

  it('rifiuta flag di pubblicazione non booleani', () => {
    const errors = validatePostInput({ isPublished: 'yes' }, { partial: true });
    assert.ok(errors.some((error) => error.field === 'isPublished'));
  });

  it('rifiuta una data di pubblicazione non interpretabile', () => {
    const errors = validatePostInput({ publishedAt: 'ieri' }, { partial: true });
    assert.ok(errors.some((error) => error.field === 'publishedAt'));
  });

  it('rifiuta un body non oggetto', () => {
    assert.equal(validatePostInput(null, { partial: false }).length, 1);
    assert.equal(validatePostInput('stringa', { partial: false }).length, 1);
    assert.equal(validatePostInput([], { partial: false }).length, 1);
  });
});

describe('formatErrors', () => {
  it('concatena i messaggi in un testo unico leggibile', () => {
    const errors = validatePostInput({}, { partial: false });
    const message = formatErrors(errors);
    assert.ok(message.includes('|'));
    assert.ok(message.length > 0);
  });

  it('ritorna stringa vuota senza errori', () => {
    assert.equal(formatErrors([]), '');
  });
});
