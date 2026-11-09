import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPostSeo,
  buildProductSeo,
  buildProjectSeo,
  getSeoHead,
  injectSeoHead,
  META_DESCRIPTION_MAX,
  META_TITLE_MAX,
  normalizePathname,
  SITE_URL,
  truncateMeta,
} from './seo.js';
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

  it('marca come notFound le URL che devono rispondere 404', () => {
    for (const path of ['/pagina-inesistente', '/settori/sconosciuto', '/foo/bar/baz']) {
      assert.equal(getSeoHead(path).notFound, true, path);
    }
  });

  it('non marca come notFound le pagine valide e l\'area admin', () => {
    for (const path of ['/', '/blog', '/settori/barbieri', '/admin', '/blog/qualcosa']) {
      assert.notEqual(getSeoHead(path).notFound, true, path);
    }
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

  it('rimuove le meta keywords statiche e ne inietta una sola', () => {
    const html =
      '<html><head><title>Vecchio</title><meta name="keywords" content="statiche" /><!-- SEO_HEAD --></head><body></body></html>';
    const result = injectSeoHead(html, getSeoHead('/settori/barbieri'));

    assert.equal(result.split('name="keywords"').length - 1, 1);
    assert.ok(!result.includes('content="statiche"'));
    assert.ok(result.includes('arredo barberia Macerata Campania'));
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

  it('rimuove i meta statici di index.html per non duplicare description e OG', () => {
    const html =
      '<html><head><title>Vecchio</title>' +
      '<meta name="description" content="statica generica" />' +
      '<meta name="robots" content="index, follow" />' +
      '<meta property="og:title" content="statico" />' +
      '<link rel="canonical" href="https://www.farcomarredi.it/" />' +
      '<!-- SEO_HEAD --></head><body></body></html>';
    const result = injectSeoHead(html, getSeoHead('/contestus-finto'));

    assert.equal(result.split('name="description"').length - 1, 1);
    assert.equal(result.split('name="robots"').length - 1, 1);
    assert.equal(result.split('property="og:title"').length - 1, 1);
    assert.ok(!result.includes('content="statica generica"'));
    assert.ok(!result.includes('content="statico"'));
  });
});

describe('truncateMeta', () => {
  it('lascia intatto un testo entro il limite', () => {
    assert.equal(truncateMeta('Arredo barberie', 60), 'Arredo barberie');
  });

  it('collassa gli spazi e tronca senza spezzare le parole', () => {
    const result = truncateMeta('  Arredi   su misura per barberie e parrucchieri a Caserta  ', 30);

    assert.ok(result.length <= 30);
    assert.ok(result.endsWith('…'));
    assert.ok(!result.includes('  '));
  });
});

describe('buildProjectSeo', () => {
  const project = {
    title: 'Farmacia Sinuessa',
    sector: 'Negozi',
    location: 'Mondragone (CE)',
    year: 2024,
    description: 'Allestimento completo della farmacia con arredi su misura.',
    image: '/images-optimized/farmacia.jpg',
  };

  it('genera un title specifico entro i 60 caratteri', () => {
    const seo = buildProjectSeo(project, '/progetti/negozi-farmacia-sinuessa');

    assert.equal(seo.title, 'Farmacia Sinuessa - Arredamento Negozi');
    assert.ok(seo.title.length <= META_TITLE_MAX);
    assert.equal(seo.canonical, `${SITE_URL}/progetti/negozi-farmacia-sinuessa`);
    assert.equal(seo.robots, 'index, follow');
  });

  it('include luogo e anno nella description e la limita a 160 caratteri', () => {
    const seo = buildProjectSeo(project, '/progetti/negozi-farmacia-sinuessa');

    assert.ok(seo.description.includes('Mondragone (CE)'));
    assert.ok(seo.description.includes('2024'));
    assert.ok(seo.description.length <= META_DESCRIPTION_MAX);
  });

  it('rende assoluto il path dell\'immagine Open Graph', () => {
    const seo = buildProjectSeo(project, '/progetti/negozi-farmacia-sinuessa');

    assert.equal(seo.ogImage, `${SITE_URL}/images-optimized/farmacia.jpg`);
  });

  it('non produce lo stesso title per progetti diversi', () => {
    const a = buildProjectSeo(project, '/progetti/a');
    const b = buildProjectSeo({ ...project, title: 'Barberia De Luxe' }, '/progetti/b');

    assert.notEqual(a.title, b.title);
  });
});

describe('buildProductSeo', () => {
  it('usa l\'etichetta breve del settore nel title', () => {
    const seo = buildProductSeo(
      { name: 'Man Cromo', sectorLabel: 'Barberie', description: 'Lavatesta professionale.' },
      '/showroom/man-cromo-fdcr',
    );

    assert.equal(seo.title, 'Man Cromo - Arredo Barberie | Farcom');
    assert.ok(seo.description.startsWith('Lavatesta professionale.'));
    assert.equal(seo.canonical, `${SITE_URL}/showroom/man-cromo-fdcr`);
  });

  it('ricade sull\'immagine di default senza immagini', () => {
    const seo = buildProductSeo({ name: 'Sfera' }, '/showroom/sfera');

    assert.ok(seo.ogImage.endsWith('/images-optimized/barber-farcom-social-1200x630.jpg'));
  });
});

describe('buildPostSeo', () => {
  it('preferisce i campi SEO dedicati e il canonical personalizzato', () => {
    const seo = buildPostSeo(
      {
        title: 'Titolo lungo di default che verrebbe troncato da Google',
        slug: 'arredamento-bar',
        excerpt: 'Estratto di default.',
        seoTitle: 'Arredamento bar: guida',
        seoDescription: 'Come arredare un bar.',
        canonicalUrl: 'https://www.farcomarredi.it/blog/arredamento-bar',
      },
      '/blog/arredamento-bar',
    );

    assert.equal(seo.title, 'Arredamento bar: guida');
    assert.equal(seo.description, 'Come arredare un bar.');
    assert.equal(seo.canonical, 'https://www.farcomarredi.it/blog/arredamento-bar');
    assert.equal(seo.ogType, 'article');
  });

  it('ricade su excerpt e canonical della route quando i campi SEO mancano', () => {
    const seo = buildPostSeo(
      { title: 'Arredamento uffici', slug: 'arredamento-uffici', excerpt: 'Scrivanie e sedute.' },
      '/blog/arredamento-uffici',
    );

    assert.equal(seo.title, 'Arredamento uffici');
    assert.equal(seo.description, 'Scrivanie e sedute.');
    assert.equal(seo.canonical, `${SITE_URL}/blog/arredamento-uffici`);
  });
});
