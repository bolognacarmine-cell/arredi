import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getSeoHead, injectSeoHead, normalizePathname, SITE_URL } from './seo.js';

describe('normalizePathname', () => {
  it('normalizza root, query, hash e slash finali', () => {
    assert.equal(normalizePathname('/'), '/');
    assert.equal(normalizePathname('/blog?tag=bar'), '/blog');
    assert.equal(normalizePathname('/blog/#top'), '/blog');
    assert.equal(normalizePathname('//blog//'), '/blog');
  });
});

describe('getSeoHead — canonical', () => {
  it('usa il canonical assoluto per la home', () => {
    const seo = getSeoHead('/');

    assert.equal(seo.canonical, `${SITE_URL}/`);
    assert.equal(seo.robots, 'index, follow');
  });

  it('usa il canonical della pagina statica senza slash finale', () => {
    const seo = getSeoHead('/blog/');

    assert.equal(seo.canonical, `${SITE_URL}/blog`);
    assert.equal(seo.robots, 'index, follow');
  });

  it('usa il canonical della pagina dinamica', () => {
    const seo = getSeoHead('/blog/arredamento-misura-macerata-campania');

    assert.equal(
      seo.canonical,
      `${SITE_URL}/blog/arredamento-misura-macerata-campania`,
    );
    assert.equal(seo.robots, 'index, follow');
  });

  it('accetta solo i settori noti', () => {
    assert.equal(
      getSeoHead('/settori/barbieri').canonical,
      `${SITE_URL}/settori/barbieri`,
    );
    assert.equal(getSeoHead('/settori/sconosciuto').robots, 'noindex, nofollow');
    assert.equal(getSeoHead('/settori/sconosciuto').canonical, undefined);
  });

  it('mappa /showroom/offerte sul canonical /showroom', () => {
    const seo = getSeoHead('/showroom/offerte');

    assert.equal(seo.canonical, `${SITE_URL}/showroom`);
    assert.equal(seo.robots, 'index, follow');
  });
});

describe('getSeoHead — noindex', () => {
  it('blocca tutto /admin e le sue sottopagine', () => {
    for (const path of ['/admin', '/admin/login', '/admin/blog']) {
      const seo = getSeoHead(path);

      assert.equal(seo.robots, 'noindex, nofollow');
      assert.equal(seo.canonical, undefined);
    }
  });

  it('blocca le URL sconosciute senza canonical', () => {
    const seo = getSeoHead('/pagina-inesistente');

    assert.equal(seo.robots, 'noindex, nofollow');
    assert.equal(seo.canonical, undefined);
  });
});

describe('injectSeoHead', () => {
  it('sostituisce titolo e marker con meta gestiti da react-helmet', () => {
    const html = '<html><head><title>Vecchio</title><!-- SEO_HEAD --></head><body></body></html>';
    const seo = getSeoHead('/blog');
    const result = injectSeoHead(html, seo);

    assert.ok(result.includes('<title>Blog Farcom Arredi: arredo contract e progettazione interni</title>'));
    assert.ok(result.includes(`<link rel="canonical" href="${SITE_URL}/blog" data-rh="true" />`));
    assert.ok(result.includes('<meta name="robots" content="index, follow" data-rh="true" />'));
    assert.ok(result.includes(`<meta name="twitter:url" content="${SITE_URL}/blog" data-rh="true" />`));
    assert.ok(!result.includes('<!-- SEO_HEAD -->'));
    assert.equal(result.split('rel="canonical"').length - 1, 1);
  });

  it('inietta i meta prima di </head> se il marker manca', () => {
    const html = '<html><head><title>Vecchio</title></head><body></body></html>';
    const seo = getSeoHead('/contatti');
    const result = injectSeoHead(html, seo);

    assert.ok(result.includes(`<link rel="canonical" href="${SITE_URL}/contatti" data-rh="true" />`));
    assert.ok(result.indexOf('rel="canonical"') < result.indexOf('</head>'));
  });

  it('non aggiunge canonical sulle pagine noindex', () => {
    const html = '<html><head><title>Vecchio</title><!-- SEO_HEAD --></head><body></body></html>';
    const seo = getSeoHead('/admin');
    const result = injectSeoHead(html, seo);

    assert.ok(!result.includes('rel="canonical"'));
    assert.ok(result.includes('<meta name="robots" content="noindex, nofollow" data-rh="true" />'));
  });

  it('esegue l\'escape dei valori HTML', () => {
    const html = '<html><head><title>Vecchio</title><!-- SEO_HEAD --></head><body></body></html>';
    const seo = {
      ...getSeoHead('/'),
      title: 'A "quote" & <tag>',
    };
    const result = injectSeoHead(html, seo);

    assert.ok(result.includes('<title>A &quot;quote&quot; &amp; &lt;tag&gt;</title>'));
  });
});
