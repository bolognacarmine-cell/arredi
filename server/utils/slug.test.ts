import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  slugify,
  isValidSlug,
  ensureUniqueSlug,
  SLUG_PATTERN,
  SLUG_MAX_LENGTH,
} from './slug.js';

describe('slugify', () => {
  it('genera uno slug URL-friendly da un titolo italiano', () => {
    assert.equal(
      slugify('Arredamento su misura a Caserta'),
      'arredamento-misura-caserta'
    );
  });

  it('rimuove accenti e caratteri speciali', () => {
    assert.equal(
      slugify('Cucine & Bagni: guida all’arredamento'),
      'cucine-bagni-guida-allarredamento'
    );
    assert.equal(slugify('Preventivo gratuito!'), 'preventivo-gratuito');
  });

  it('collassa trattini multipli e quelli iniziali/finali', () => {
    assert.equal(slugify('  ---a--b-- c-- '), 'a-b-c');
  });

  it('ritorna stringa vuota per input non valido', () => {
    assert.equal(slugify(''), '');
    assert.equal(slugify(null as unknown as string), '');
    assert.equal(slugify(undefined as unknown as string), '');
  });

  it('rispetta la lunghezza massima senza trattini finali', () => {
    const long = 'parole '.repeat(40);
    const slug = slugify(long);
    assert.ok(slug.length <= 60);
    assert.ok(!slug.endsWith('-'));
  });

  it('tronca a maxLength senza lasciare frammenti incompleti', () => {
    const slug = slugify('parola '.repeat(30), 20);
    assert.ok(slug.length <= 20);
    assert.ok(SLUG_PATTERN.test(slug));
    assert.ok(!slug.endsWith('-'));
  });
});

describe('isValidSlug', () => {
  it('accetta slug nel formato previsto', () => {
    assert.equal(isValidSlug('arredamento-barbieri-caserta'), true);
    assert.equal(isValidSlug('abc123'), true);
  });

  it('rifiuta formati non validi', () => {
    assert.equal(isValidSlug('Arredamento-Barbieri'), false); // maiuscole
    assert.equal(isValidSlug('arredamento barbieri'), false); // spazi
    assert.equal(isValidSlug('cucine_persone'), false); // underscore
    assert.equal(isValidSlug('/blog/test'), false); // slash
    assert.equal(isValidSlug(''), false);
    assert.equal(isValidSlug(null), false);
    assert.equal(isValidSlug(42 as unknown as string), false);
  });

  it('rifiuta slug più lunghi del massimo', () => {
    const tooLong = 'a'.repeat(SLUG_MAX_LENGTH + 1);
    assert.equal(isValidSlug(tooLong), false);
  });
});

describe('ensureUniqueSlug', () => {
  it('ritorna lo slug base se non collide', async () => {
    const slug = await ensureUniqueSlug('arredamento-bar', async () => false);
    assert.equal(slug, 'arredamento-bar');
  });

  it('aggiunge un suffisso numerato in caso di collisione', async () => {
    const taken = new Set(['guida', 'guida-2']);
    const slug = await ensureUniqueSlug('guida', async (candidate) =>
      taken.has(candidate)
    );
    assert.equal(slug, 'guida-3');
  });

  it('gestisce molti slug duplicati consecutivi', async () => {
    const taken = new Set(['guida', 'guida-2', 'guida-3', 'guida-4']);
    const slug = await ensureUniqueSlug('guida', async (candidate) =>
      taken.has(candidate)
    );
    assert.equal(slug, 'guida-5');
  });

  it('rigenera uno slug malformato (ad esempio con maiuscole)', async () => {
    const slug = await ensureUniqueSlug('Arredamento Su Misura', async () => false);
    assert.equal(slug, 'arredamento-misura');
  });

  it('lancia un errore se non riesce a trovare uno slug libero', async () => {
    await assert.rejects(
      () => ensureUniqueSlug('guida', async () => true, 5),
      /Impossibile generare uno slug univoco/
    );
  });
});
