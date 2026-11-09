import { before, afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { Project } from './models/Project.js';
import Post from './models/Post.js';
import { Product } from './models/Product.js';
import { clearSeoCache, resolveSeoHead } from './seoDynamic.js';
import { getSeoHead, injectSeoHead, SITE_URL, STATUS } from './seo.js';

const PAGE_HTML =
  '<html><head><title>Vecchio</title><!-- SEO_HEAD --></head><body><div id="root"></div></body></html>';

/**
 * Estrae e valida i blocchi JSON-LD dell'HTML.
 * Ogni blocco deve essere un array serializzato: un solo <script> per pagina.
 */
function jsonLdBlocks(html: string): Array<Array<Record<string, any>>> {
  const matches = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];

  return matches.map((match) => {
    const parsed = JSON.parse(match[1]);
    assert.ok(Array.isArray(parsed), 'il JSON-LD deve essere serializzato come array');
    return parsed as Array<Record<string, any>>;
  });
}

function render(seo: Parameters<typeof injectSeoHead>[1]): string {
  return injectSeoHead(PAGE_HTML, seo);
}

/** Sostituisce findOne del modello: i test non toccano il database reale. */
function stubFindOne(model: unknown, value: unknown): void {
  (model as { findOne: () => unknown }).findOne = () => ({ lean: async () => value });
}

function typesOf(nodes: Array<Record<string, any>>): string[] {
  return nodes.flatMap((node) => {
    const value = node['@type'];
    return Array.isArray(value) ? value : [value];
  });
}

before(() => {
  Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });
});

afterEach(() => {
  clearSeoCache();
});

describe('JSON-LD — homepage', () => {
  it('emette LocalBusiness e WebSite in un unico blocco', () => {
    const html = render(getSeoHead('/'));
    const blocks = jsonLdBlocks(html);

    assert.equal(blocks.length, 1);
    const types = typesOf(blocks[0]);
    assert.ok(types.includes('LocalBusiness'), 'manca LocalBusiness');
    assert.ok(types.includes('WebSite'), 'manca WebSite');
  });

  it('usa solo dati reali dell\'azienda', () => {
    const [nodes] = jsonLdBlocks(render(getSeoHead('/')));
    const business = nodes.find((node) => typesOf([node]).includes('LocalBusiness'));

    assert.ok(business);
    assert.equal(business.name, 'Farcom Design s.r.l.');
    assert.equal(business.telephone, '+39 0823 694427');
    assert.equal(business.address.streetAddress, 'Via P. Vertaldi, 27');
    assert.equal(business.address.addressLocality, 'Macerata Campania');
    assert.equal(business.address.postalCode, '81047');
    assert.ok(Array.isArray(business.openingHoursSpecification));
  });

  it('non emette JSON-LD su una pagina non indicizzabile', () => {
    const html = render(getSeoHead('/admin'));

    assert.equal(jsonLdBlocks(html).length, 0);
  });

  it('non emette JSON-LD sulla route in redirect', () => {
    const seo = getSeoHead('/showroom/offerte');

    assert.equal(seo.status, STATUS.redirect);
    assert.equal(jsonLdBlocks(render(seo)).length, 0);
  });
});

describe('JSON-LD — pagine settore', () => {
  it('emette una BreadcrumbList con URL assolute', () => {
    const blocks = jsonLdBlocks(render(getSeoHead('/settori/barbieri')));

    assert.equal(blocks.length, 1);
    const breadcrumb = blocks[0].find((node) => node['@type'] === 'BreadcrumbList');

    assert.ok(breadcrumb);
    const items = breadcrumb.itemListElement as Array<Record<string, any>>;
    assert.ok(items.length >= 2);

    for (const item of items) {
      assert.equal(item['@type'], 'ListItem');
      assert.ok(item.name);
      assert.ok(item.item.startsWith(`${SITE_URL}/`), `URL non assoluta: ${item.item}`);
    }

    assert.equal(items.at(-1)?.item, `${SITE_URL}/settori/barbieri`);
  });
});

describe('JSON-LD — progetto', () => {
  it('/progetti/negozi-farmacia emette BreadcrumbList con URL assolute', async () => {
    stubFindOne(Project, {
      title: 'Farmacia Sinuessa',
      sector: 'Negozi',
      location: 'Mondragone (CE)',
      year: 2024,
      description: 'Allestimento completo della farmacia con arredi su misura.',
      image: '/images-optimized/farmacia.jpg',
    });

    const seo = await resolveSeoHead('/progetti/negozi-farmacia');
    const blocks = jsonLdBlocks(render(seo));

    assert.equal(seo.status, STATUS.ok);
    assert.equal(blocks.length, 1);

    const breadcrumb = blocks[0].find((node) => node['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumb);

    const items = breadcrumb.itemListElement as Array<Record<string, any>>;
    assert.ok(items.length >= 2);
    for (const item of items) {
      assert.ok(item.item.startsWith(`${SITE_URL}/`), `URL non assoluta: ${item.item}`);
    }

    assert.equal(items.at(-1)?.item, `${SITE_URL}/progetti/negozi-farmacia`);
    assert.equal(items.at(-1)?.name, 'Farmacia Sinuessa');

    const work = blocks[0].find((node) => node['@type'] === 'CreativeWork');
    assert.ok(work);
    assert.equal(work.name, 'Farmacia Sinuessa');
    assert.equal(work.dateCreated, '2024');
    assert.equal(work.contentLocation.name, 'Mondragone (CE)');
  });
});

describe('JSON-LD — showroom', () => {
  it('/showroom/man-cromo emette BreadcrumbList con URL assolute', async () => {
    stubFindOne(Product, {
      name: 'Man Cromo',
      slug: 'man-cromo',
      description: 'Lavatesta professionale in acciaio.',
      activitySector: 'barber',
      images: ['/images-optimized/man-cromo.jpg'],
    });

    const seo = await resolveSeoHead('/showroom/man-cromo');
    const blocks = jsonLdBlocks(render(seo));

    assert.equal(blocks.length, 1);
    const breadcrumb = blocks[0].find((node) => node['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumb);

    const items = breadcrumb.itemListElement as Array<Record<string, any>>;
    assert.ok(items.length >= 2);
    for (const item of items) {
      assert.ok(item.item.startsWith(`${SITE_URL}/`), `URL non assoluta: ${item.item}`);
    }

    assert.equal(items.at(-1)?.item, `${SITE_URL}/showroom/man-cromo`);
    assert.equal(items.at(-1)?.name, 'Man Cromo');

    // Nessun Product/Offer: il prezzo in pagina dipende da promozioni calcolate
    // lato client e non sarebbe verificabile dal server.
    assert.equal(typesOf(blocks[0]).includes('Product'), false);
  });
});

describe('JSON-LD — articoli blog', () => {
  it('un articolo pubblicato emette BlogPosting con le proprietà disponibili', async () => {
    stubFindOne(Post, {
      title: 'Arredamento bar: guida completa',
      slug: 'arredamento-bar',
      excerpt: 'Come progettare il bancone e le zone lounge di un bar.',
      coverImage: '/images-optimized/bar.jpg',
      publishedAt: new Date('2025-03-14T09:00:00.000Z'),
      updatedAt: new Date('2025-04-01T10:30:00.000Z'),
      author: { name: 'Farcom Design', role: 'Progettazione interni' },
      isPublished: true,
    });

    const seo = await resolveSeoHead('/blog/arredamento-bar');
    const blocks = jsonLdBlocks(render(seo));

    assert.equal(blocks.length, 1);
    const article = blocks[0].find((node) => node['@type'] === 'BlogPosting');

    assert.ok(article);
    assert.equal(article.headline, 'Arredamento bar: guida completa');
    assert.ok(article.description);
    assert.equal(article.datePublished, '2025-03-14T09:00:00.000Z');
    assert.equal(article.dateModified, '2025-04-01T10:30:00.000Z');
    assert.equal(article.author.name, 'Farcom Design');
    assert.equal(article.publisher.name, 'Farcom Design s.r.l.');
    assert.equal(article.mainEntityOfPage['@id'], `${SITE_URL}/blog/arredamento-bar`);
    assert.equal(article.url, `${SITE_URL}/blog/arredamento-bar`);
    assert.ok(article.image.startsWith(SITE_URL));

    const breadcrumb = blocks[0].find((node) => node['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumb);
  });

  it('una bozza resta noindex e senza JSON-LD', async () => {
    stubFindOne(Post, {
      title: 'Bozza non pubblicata',
      slug: 'bozza',
      excerpt: 'Contenuto in lavorazione.',
      publishedAt: new Date('2025-03-14T09:00:00.000Z'),
      isPublished: false,
    });

    const seo = await resolveSeoHead('/blog/bozza');
    const html = render(seo);

    assert.equal(seo.robots, 'noindex, nofollow');
    assert.equal(jsonLdBlocks(html).length, 0);
  });
});

describe('JSON-LD — 404', () => {
  it('nessuna delle quattro route 404 emette JSON-LD', async () => {
    stubFindOne(Project, null);
    stubFindOne(Post, null);
    stubFindOne(Product, null);

    const paths = [
      '/progetti/non-esiste',
      '/blog/non-esiste',
      '/showroom/non-esiste',
      '/settori/sconosciuto',
    ];

    for (const path of paths) {
      const seo = await resolveSeoHead(path);
      assert.equal(seo.status, STATUS.notFound, path);
      assert.equal(jsonLdBlocks(render(seo)).length, 0, path);
    }
  });
});

describe('JSON-LD — integrità del markup', () => {
  it('rimuove un blocco JSON-LD statico già presente in index.html', () => {
    const html =
      '<html><head><title>Vecchio</title>' +
      '<script type="application/ld+json">{"@type":"Thing"}</script>' +
      '<!-- SEO_HEAD --></head><body></body></html>';

    const result = injectSeoHead(html, getSeoHead('/'));

    assert.equal(result.split('application/ld+json').length - 1, 1);
    assert.ok(!result.includes('"@type":"Thing"'));
  });

  it('non spezza l\'HTML se un testo contiene </script>', () => {
    const seo = {
      ...getSeoHead('/settori/barbieri'),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Thing',
          name: '</script><img src=x onerror=alert(1)>',
        },
      ],
    };

    const html = render(seo);

    assert.ok(!html.includes('</script><img'));
    assert.equal(jsonLdBlocks(html).length, 1);
  });
});

describe('JSON-LD — nessun dato non verificato', () => {
  /** Serializza un blocco così com'è nell'HTML: serve per i controlli "assenti". */
  function rawJsonLd(html: string): string {
    return [
      ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ]
      .map((match) => match[1])
      .join('\n');
  }

  it('la homepage non contiene priceRange, vatID o foundingDate', () => {
    const raw = rawJsonLd(render(getSeoHead('/')));

    assert.ok(!raw.includes('"priceRange"'), 'priceRange non è un dato verificato');
    assert.ok(!raw.includes('"vatID"'));
    assert.ok(!raw.includes('"foundingDate"'));
  });

  it('la homepage non contiene coordinate', () => {
    const raw = rawJsonLd(render(getSeoHead('/')));

    assert.ok(!raw.includes('"geo"'), 'geo non ha una fonte unica condivisa');
    assert.ok(!raw.includes('"latitude"'));
    assert.ok(!raw.includes('"longitude"'));
  });

  it('gli articoli non espongono author.url né author.sameAs', async () => {
    stubFindOne(Post, {
      title: 'Arredamento bar: guida completa',
      slug: 'arredamento-bar',
      excerpt: 'Come progettare il bancone e le zone lounge di un bar.',
      coverImage: '/images-optimized/bar.jpg',
      publishedAt: new Date('2025-03-14T09:00:00.000Z'),
      updatedAt: new Date('2025-04-01T10:30:00.000Z'),
      author: { name: 'Farcom Design', role: 'Progettazione interni' },
      isPublished: true,
    });

    const blocks = jsonLdBlocks(render(await resolveSeoHead('/blog/arredamento-bar')));
    const article = blocks[0].find((node) => node['@type'] === 'BlogPosting');

    assert.ok(article);
    assert.equal(article.author.url, undefined);
    assert.equal(article.author.sameAs, undefined);
    assert.deepEqual(Object.keys(article.author).sort(), ['@type', 'jobTitle', 'name']);
    assert.equal(article.author.name, 'Farcom Design');
    assert.equal(article.author.jobTitle, 'Progettazione interni');
  });

  it('nessuna pagina showroom emette Product', async () => {
    stubFindOne(Product, {
      name: 'Man Cromo',
      slug: 'man-cromo',
      description: 'Lavatesta professionale in acciaio.',
      activitySector: 'barber',
      images: ['/images-optimized/man-cromo.jpg'],
    });

    const html = render(await resolveSeoHead('/showroom/man-cromo'));
    assert.ok(!rawJsonLd(html).includes('"Product"'));
    assert.ok(!typesOf(jsonLdBlocks(html)[0]).includes('Product'));

    // Anche la lista showroom non deve introdurre Product/Offer.
    const list = render(getSeoHead('/showroom'));
    assert.ok(!rawJsonLd(list).includes('"Product"'));
  });
});

describe('JSON-LD — nessun duplicato', () => {
  it('ogni pagina ha al massimo un blocco JSON-LD', () => {
    const paths = [
      '/',
      '/progetti',
      '/blog',
      '/showroom',
      '/settori/barbieri',
      '/chi-siamo',
      '/contatti',
      '/admin',
    ];

    for (const path of paths) {
      const html = render(getSeoHead(path));
      const count = (html.match(/application\/ld\+json/g) ?? []).length;

      assert.ok(count <= 1, `${path}: trovati ${count} script JSON-LD`);
    }
  });

  it('il server non emette mai Product né FAQPage', () => {
    const paths = [
      '/',
      '/progetti',
      '/blog',
      '/showroom',
      '/settori/barbieri',
      '/settori/negozi',
      '/chi-siamo',
      '/contatti',
    ];

    for (const path of paths) {
      const html = render(getSeoHead(path));

      assert.ok(!html.includes('"Product"'), `${path}: Product lato server`);
      assert.ok(!html.includes('"FAQPage"'), `${path}: FAQPage lato server`);
    }
  });
});
