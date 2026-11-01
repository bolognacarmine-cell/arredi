import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderSitemap } from './sitemap.js';

const STATIC_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.farcomarredi.it/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.farcomarredi.it/settori</loc>
    <priority>0.8</priority>
  </url>
</urlset>`;

const POSTS = [
  {
    slug: 'arredamento-barbieri-caserta',
    publishedAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
  },
  { slug: 'arredamento-su-misura-caserta' }, // senza date: deve usare il fallback
];

describe('renderSitemap — composizione XML', () => {
  it('inietta gli articoli pubblicati nella sitemap statica', () => {
    const xml = renderSitemap(STATIC_SITEMAP, POSTS, '2026-03-01');

    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.trimEnd().endsWith('</urlset>'));
    // le pagine statiche restano presenti
    assert.ok(xml.includes('https://www.farcomarredi.it/'));
    assert.ok(xml.includes('https://www.farcomarredi.it/settori'));
    // gli articoli vengono aggiunti
    assert.ok(xml.includes('https://www.farcomarredi.it/blog/arredamento-barbieri-caserta'));
    assert.ok(xml.includes('https://www.farcomarredi.it/blog/arredamento-su-misura-caserta'));
  });

  it('usa updatedAt come lastmod quando disponibile', () => {
    const xml = renderSitemap(STATIC_SITEMAP, POSTS, '2026-03-01');
    assert.ok(xml.includes('<lastmod>2026-02-01</lastmod>'));
  });

  it('usa la data corrente come fallback quando le date mancano', () => {
    const xml = renderSitemap(STATIC_SITEMAP, POSTS, '2026-03-01');
    assert.ok(xml.includes('<lastmod>2026-03-01</lastmod>'));
  });

  it('non duplica la chiusura del urlset', () => {
    const xml = renderSitemap(STATIC_SITEMAP, POSTS, '2026-03-01');
    const closingTags = xml.split('</urlset>').length - 1;
    assert.equal(closingTags, 1);
  });

  it('genera un urlset di fallback quando la sitemap statica non esiste', () => {
    const xml = renderSitemap(null, POSTS, '2026-03-01');

    assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.includes('https://www.farcomarredi.it/</loc>'));
    assert.ok(xml.includes('https://www.farcomarredi.it/blog</loc>'));
    assert.ok(xml.includes('https://www.farcomarredi.it/blog/arredamento-barbieri-caserta'));
  });

  it('genera la sitemap anche senza articoli', () => {
    const xml = renderSitemap(STATIC_SITEMAP, [], '2026-03-01');
    assert.ok(!xml.includes('/blog/'));
    assert.ok(xml.trimEnd().endsWith('</urlset>'));
  });

  it('assegna priorità e frequenza di aggiornamento ai post', () => {
    const xml = renderSitemap(null, POSTS, '2026-03-01');
    assert.ok(xml.includes('<priority>0.7</priority>'));
    assert.ok(xml.includes('<changefreq>weekly</changefreq>'));
  });
});

describe('renderSitemap — sicurezza XML', () => {
  it('produce XML valido anche per slug con caratteri normali di uno slug', () => {
    const xml = renderSitemap(null, [{ slug: 'cucine-2026' }], '2026-03-01');
    assert.ok(xml.includes('https://www.farcomarredi.it/blog/cucine-2026'));
    assert.ok(!xml.includes('<<'));
  });
});
