import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderSitemap, type SitemapEntry } from './sitemap.js';

const ENTRIES: SitemapEntry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/settori', changefreq: 'weekly', priority: '0.9' },
  {
    loc: '/blog/arredamento-barbieri-caserta',
    lastmod: '2026-02-01',
    changefreq: 'monthly',
    priority: '0.6',
  },
  { loc: '/blog/arredamento-su-misura-caserta', priority: '0.6' },
];

describe('renderSitemap — composizione XML', () => {
  it('genera un urlset valido con tutte le URL', () => {
    const xml = renderSitemap(ENTRIES);

    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert.ok(xml.trimEnd().endsWith('</urlset>'));
    assert.equal(xml.split('</urlset>').length - 1, 1);
  });

  it('compone URL assolute sul dominio del sito', () => {
    const xml = renderSitemap(ENTRIES);

    assert.ok(xml.includes('<loc>https://www.farcomarredi.it/</loc>'));
    assert.ok(xml.includes('<loc>https://www.farcomarredi.it/settori</loc>'));
    assert.ok(xml.includes('<loc>https://www.farcomarredi.it/blog/arredamento-barbieri-caserta</loc>'));
  });

  it('include lastmod, changefreq e priority quando presenti', () => {
    const xml = renderSitemap(ENTRIES);

    assert.ok(xml.includes('<lastmod>2026-02-01</lastmod>'));
    assert.ok(xml.includes('<changefreq>weekly</changefreq>'));
    assert.ok(xml.includes('<priority>1.0</priority>'));
  });

  it('omette i tag opzionali quando il campo manca', () => {
    const xml = renderSitemap([{ loc: '/blog/senza-data' }]);

    assert.ok(xml.includes('<loc>https://www.farcomarredi.it/blog/senza-data</loc>'));
    assert.ok(!xml.includes('<lastmod>'));
    assert.ok(!xml.includes('<changefreq>'));
    assert.ok(!xml.includes('<priority>'));
  });

  it('deduplica le URL ripetute', () => {
    const xml = renderSitemap([
      { loc: '/blog', priority: '0.7' },
      { loc: '/blog', priority: '0.9' },
    ]);

    assert.equal(xml.split('<loc>https://www.farcomarredi.it/blog</loc>').length - 1, 1);
    assert.ok(xml.includes('<priority>0.7</priority>'));
    assert.ok(!xml.includes('<priority>0.9</priority>'));
  });

  it('genera una sitemap valida anche senza voci', () => {
    const xml = renderSitemap([]);

    assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(xml.trimEnd().endsWith('</urlset>'));
    assert.ok(!xml.includes('<url>'));
  });
});

describe('renderSitemap — sicurezza XML', () => {
  it('esegue l\'escape dei caratteri speciali nelle URL', () => {
    const xml = renderSitemap([{ loc: '/blog?tag=cucine&bagni=<x>' }]);

    assert.ok(xml.includes('&amp;'));
    assert.ok(xml.includes('&lt;x&gt;'));
    assert.ok(!xml.includes('<x>'));
    assert.ok(!xml.includes('<<'));
  });
});
