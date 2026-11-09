export const SITE_URL = 'https://www.farcomarredi.it';

const DEFAULT_TITLE =
  'Farcom Design s.r.l. - Arredamento e Progettazione Interni a Macerata Campania e in tutta Italia';
const DEFAULT_DESCRIPTION =
  'Farcom Design s.r.l.: arredamento su misura e progettazione interni a Macerata Campania, Caserta e in tutta Italia. Showroom arredi professionali, preventivi gratuiti e sopralluogo. Richiedi un preventivo!';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images-optimized/barber-farcom-social-1200x630.jpg`;
const DEFAULT_OG_TYPE = 'website';
const INDEX_ROBOTS = 'index, follow';
const NOINDEX_ROBOTS = 'noindex, nofollow';

// Limiti oltre i quali Google tronca i metadati nei risultati di ricerca.
export const META_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 160;

// Keyword SEO locali generali (area Macerata Campania + Caserta).
// Tenute allineate con src/lib/localSeo.ts lato frontend.
const LOCAL_KEYWORDS = [
  'arredamento Macerata Campania',
  'arredamento Caserta',
  'arredi su misura Caserta',
  'arredamento su misura Macerata Campania',
  'showroom arredamento Caserta',
  'negozi di arredamento Caserta',
  'progettazione interni Caserta',
  'arredatore interni Caserta',
  'mobili su misura Caserta',
  'arredamento negozi Caserta',
  'arredamento uffici Caserta',
  'arredamento barberie Caserta',
  'arredo bar Caserta',
  'arredamento scuole Caserta',
  'arredo centri estetici Caserta',
  'arredi commerciali Campania',
  'falegnameria Caserta',
  'arredamento provincia di Caserta',
].join(', ');

const SECTOR_KEYWORDS: Record<string, string> = {
  barbieri:
    'arredamento barbiere Caserta, arredo barberia Macerata Campania, arredi parrucchiere Caserta, salone barbiere su misura Campania',
  uffici:
    'arredamento uffici Caserta, arredi per ufficio Macerata Campania, progettazione uffici Caserta, arredo uffici su misura Campania',
  negozi:
    'arredamento negozi Caserta, arredi commerciali Macerata Campania, allestimento negozio Caserta, arredo shop Campania',
  scuole:
    'arredamento scuole Caserta, arredi scolastici Macerata Campania, arredo aule e laboratori Caserta, arredi per istituti Campania',
  bar: 'arredamento bar Caserta, arredo locali Macerata Campania, arredi per ristoranti e pub Caserta, arredo bar su misura Campania',
  'centri-estetici':
    'arredamento centri estetici Caserta, arredi per SPA Macerata Campania, arredo beauty center Caserta, arredi centri benessere Campania',
};

const SECTOR_IDS = new Set([
  'barbieri',
  'uffici',
  'negozi',
  'scuole',
  'bar',
  'centri-estetici',
]);

// Title e description univoci per le pagine settore: senza questa mappa
// ereditavano il title/description generico del sito (contenuto duplicato).
const SECTOR_META: Record<string, { title: string; description: string }> = {
  barbieri: {
    title: 'Arredamento Barberie e Saloni - Farcom Design',
    description:
      'Arredi su misura per barberie e parrucchieri: postazioni taglio, lavatesta, banconi e specchiere. Progettazione e installazione a Caserta e in tutta Italia.',
  },
  uffici: {
    title: 'Arredamento Uffici su Misura - Farcom Design',
    description:
      'Arredi per uffici su misura: scrivanie, reception, sale riunioni e pareti divisorie. Progettazione e installazione a Caserta e in tutta Italia.',
  },
  negozi: {
    title: 'Arredamento Negozi e Retail - Farcom Design',
    description:
      'Allestimento negozi e arredi commerciali su misura: espositori, banconi e vetrine. Progettazione e installazione a Caserta e in tutta Italia.',
  },
  scuole: {
    title: 'Arredamento Scuole e Aule - Farcom Design',
    description:
      'Arredi scolastici su misura per aule, laboratori e biblioteche. Progettazione e installazione per istituti a Caserta e in tutta Italia.',
  },
  bar: {
    title: 'Arredamento Bar e Ristoranti - Farcom Design',
    description:
      'Arredi su misura per bar e ristoranti: banconi, tavoli e zone lounge. Progettazione e installazione a Caserta e in tutta Italia.',
  },
  'centri-estetici': {
    title: 'Arredamento Centri Estetici e SPA - Farcom Design',
    description:
      'Arredi su misura per centri estetici e SPA: cabine, reception e zone relax. Progettazione e installazione a Caserta e in tutta Italia.',
  },
};

type PageMeta = {
  title: string;
  description: string;
  keywords?: string;
};

// Mappa delle route pubbliche conosciute dal server.
// ATTENZIONE: una route non elencata qui (e non riconducibile a un dettaglio
// progetti/blog/showroom) risponde HTTP 404 anche se React Router la gestisce.
// Quando aggiungi una pagina pubblica, registrala qui.
const STATIC_PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: LOCAL_KEYWORDS,
  },
  '/settori': {
    title: 'Settori di Arredamento | Farcom Design s.r.l. - 6 Specializzazioni',
    description:
      'Farcom Design s.r.l. progetta e realizza arredi su misura per 6 settori: barbieri e parrucchieri, uffici, negozi, scuole, bar e locali, centri estetici. Soluzioni specializzate per ogni attività.',
    keywords: `settori arredamento Caserta, arredamento negozi Caserta, arredamento uffici Caserta, arredo barberie Caserta, arredo bar Caserta, arredamento scuole Caserta, arredo centri estetici Caserta, arredi commerciali Macerata Campania, ${LOCAL_KEYWORDS}`,
  },
  '/progetti': {
    title: 'Progetti e Realizzazioni di Arredamento | Farcom Design s.r.l.',
    description:
      'Oltre 500 progetti di arredamento realizzati da Farcom Design s.r.l. in tutta Italia: uffici, negozi, scuole, barberie, bar, locali e centri estetici. Esempi di arredamenti su misura e allestimenti realizzati a Macerata Campania, Caserta e Campania.',
    keywords: `progetti arredamento Caserta, realizzazioni arredi su misura Macerata Campania, allestimenti negozi Caserta, arredamento commerciale Campania, ${LOCAL_KEYWORDS}`,
  },
  '/showroom': {
    title: 'Showroom Arredamento Campania - Arredi Professionali Farcom Design s.r.l.',
    description:
      'Showroom arredamento Campania: arredi professionali su misura per barberie, parrucchieri, uffici, scuole. Visita il nostro showroom a Macerata Campania o richiedi un preventivo in tutta Italia.',
    keywords: `showroom arredamento Caserta, showroom arredi Macerata Campania, negozio arredamento Caserta, arredi professionali Campania, ${LOCAL_KEYWORDS}`,
  },
  '/blog': {
    title: 'Blog Farcom Arredi: arredo contract e progettazione interni',
    description:
      'Guide su arredo contract, arredi su misura e progettazione interni per barbieri, negozi, uffici, bar e centri estetici. Idee e consigli da Farcom Arredi.',
    keywords: `blog arredamento Caserta, consigli progettazione interni Caserta, arredo contract Campania, idee arredamento Macerata Campania, ${LOCAL_KEYWORDS}`,
  },
  '/chi-siamo': {
    title: 'Chi Siamo - Farcom Design s.r.l. | Arredamento Macerata Campania dal 2003',
    description:
      'Farcom Design s.r.l.: dal 2003 arredamento e progettazione interni a Macerata Campania e in tutta Italia. Specializzati in arredi per barberie, uffici, negozi e attività professionali. Qualità artigianale Made in Italy.',
    keywords: `azienda arredamento Caserta, falegnameria Macerata Campania, arredatore interni Caserta, arredamento made in Italy Campania, ${LOCAL_KEYWORDS}`,
  },
  '/contatti': {
    title: 'Contatti - Farcom Design s.r.l. | Showroom Macerata Campania',
    description:
      'Contatta Farcom Design s.r.l.: showroom arredamento a Macerata Campania, Via P. Vertaldi 27. Telefono +39 0823 694427, WhatsApp +39 329 4576079. Arredamento su misura in tutta Italia.',
    keywords: `contatti arredamento Caserta, showroom arredamento Macerata Campania, telefono arredatore Caserta, indirizzo showroom arredi Campania, ${LOCAL_KEYWORDS}`,
  },
  '/preventivo': {
    title: 'Preventivo Arredamento Gratuito - Farcom Design s.r.l. Macerata Campania e Italia',
    description:
      'Richiedi un preventivo gratuito per arredamento su misura a Macerata Campania, Caserta e in tutta Italia. Sopralluogo gratuito e consulenza senza impegno. Arredatore di interni esperti.',
    keywords: `preventivo arredamento Caserta, preventivo arredi su misura Macerata Campania, sopralluogo gratuito arredamento Caserta, arredatore interni Campania, ${LOCAL_KEYWORDS}`,
  },
  '/privacy': {
    title: 'Informativa Privacy | Farcom Design s.r.l. - Macerata Campania',
    description:
      "Informativa sulla privacy di Farcom Design s.r.l.: come raccogliamo, trattiamo e proteggiamo i dati personali degli utenti del sito farcomarredi.it. Diritti dell'interessato e modalità di contatto.",
  },
  '/cookie': {
    title: 'Cookie Policy | Farcom Design s.r.l. - farcomarredi.it',
    description:
      'Cookie Policy di Farcom Design s.r.l.: tipologie di cookie utilizzati, finalità, durata e modalità per gestire le preferenze. Informazioni chiare sui cookie tecnici e strumenti terzi sul sito farcomarredi.it.',
  },
  '/termini-e-condizioni': {
    title: 'Termini e Condizioni | Farcom Design',
    description:
      'Termini e Condizioni di utilizzo del sito web di Farcom Design. Informazioni su diritti, proprietà intellettuale, responsabilità e condizioni generali di servizio.',
  },
  '/note-legali': {
    title: 'Note Legali | Farcom Design s.r.l. - farcomarredi.it',
    description:
      "Note legali del sito farcomarredi.it di Farcom Design s.r.l.: proprietà dei contenuti, limitazione di responsabilità, link esterni e dichiarazione sull'uso dell'intelligenza artificiale nei contenuti.",
  },
  '/resto-al-sud-2-0': {
    title: 'Resto al Sud 2.0 | Assistenza e consulenza Farcom',
    description:
      'Farcom ti accompagna nella pratica Resto al Sud 2.0: valutazione del progetto, documentazione, business plan e presentazione della domanda su Invitalia.',
  },
};

/** Esito della risoluzione dei metadati per una route. */
export type SeoStatus = 'ok' | 'notFound' | 'redirect';

export const STATUS = {
  ok: 'ok',
  notFound: 'notFound',
  redirect: 'redirect',
} as const satisfies Record<string, SeoStatus>;

export interface SeoHead {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  robots: string;
  ogImage: string;
  ogType: string;
  /** true quando la route non esiste: il chiamante deve rispondere HTTP 404. */
  notFound?: boolean;
  status: SeoStatus;
}

export function normalizePathname(pathname: string): string {
  let value = (pathname || '/').split('?')[0]?.split('#')[0] ?? '/';

  if (!value.startsWith('/')) value = `/${value}`;

  value = value.replace(/\/{2,}/g, '/');

  if (value.length > 1) value = value.replace(/\/+$/, '');

  return value || '/';
}

function toCanonical(pathname: string): string {
  return `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
}

function buildSeoHead(
  meta: PageMeta,
  pathname: string,
  robots: string = INDEX_ROBOTS,
): SeoHead {
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords ?? LOCAL_KEYWORDS,
    canonical: toCanonical(pathname),
    robots,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: DEFAULT_OG_TYPE,
    status: 'ok',
  };
}

function defaultMeta(): PageMeta {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: LOCAL_KEYWORDS,
  };
}

export function getSeoHead(pathname: string): SeoHead {
  const path = normalizePathname(pathname);

  if (path === '/admin' || path.startsWith('/admin/')) {
    return {
      title: 'Area riservata | Farcom Design s.r.l.',
      description: 'Area riservata del sito Farcom Design s.r.l.',
      robots: NOINDEX_ROBOTS,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: DEFAULT_OG_TYPE,
      status: 'ok',
    };
  }

  if (path === '/showroom/offerte') {
    // Route rediretta con 301 verso /showroom: non deve emettere structured data.
    return {
      ...buildSeoHead(STATIC_PAGE_META['/showroom'], '/showroom'),
      status: 'redirect',
    };
  }

  const staticMeta = STATIC_PAGE_META[path];
  if (staticMeta) {
    return buildSeoHead(staticMeta, path);
  }

  if (path.startsWith('/settori/')) {
    const sector = path.slice('/settori/'.length);
    if (SECTOR_IDS.has(sector)) {
      const sectorMeta = SECTOR_META[sector];
      const sectorKeywords = SECTOR_KEYWORDS[sector];
      return buildSeoHead(
        {
          title: sectorMeta?.title ?? DEFAULT_TITLE,
          description: sectorMeta?.description ?? DEFAULT_DESCRIPTION,
          keywords: sectorKeywords
            ? `${sectorKeywords}, ${LOCAL_KEYWORDS}`
            : LOCAL_KEYWORDS,
        },
        path,
      );
    }
  }

  if (/^\/(progetti|blog|showroom)\/[^/]+$/.test(path)) {
    return buildSeoHead(defaultMeta(), path);
  }

  return buildNotFoundSeo();
}

/**
 * Metadati della pagina 404. `notFound: true` segnala al chiamante di
 * rispondere con HTTP 404 invece di 200: senza lo status corretto Google
 * classifica queste URL come soft 404 e le mantiene in "Scansionate ma non
 * indicizzate".
 */
export function buildNotFoundSeo(): SeoHead {
  return {
    title: 'Pagina non trovata | Farcom Design s.r.l.',
    description: DEFAULT_DESCRIPTION,
    robots: NOINDEX_ROBOTS,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: DEFAULT_OG_TYPE,
    notFound: true,
    status: 'notFound',
  };
}

/* ------------------------------------------------------------------------- *
 * Metadati delle pagine di dettaglio (progetti, blog, showroom).
 *
 * Qui restano funzioni pure: la lettura da MongoDB vive in `seoDynamic.ts`,
 * così sono testabili senza connessione al database.
 * I formati replicano quelli dei componenti React lato client: se cambi qui,
 * aggiorna anche `src/lib/seoMeta.ts`.
 * ------------------------------------------------------------------------- */

/** Normalizza gli spazi e tronca a `max` caratteri senza spezzare le parole. */
export function truncateMeta(value: string, max: number): string {
  const clean = (value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace >= Math.floor(max * 0.6) ? cut.slice(0, lastSpace) : cut;

  return `${base.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

function absoluteImage(raw?: string): string {
  const value = (raw || '').trim();
  if (!value) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

export interface ProjectMetaSource {
  title: string;
  sector?: string;
  location?: string;
  year?: number | string;
  description?: string;
  coverImages?: string[];
  image?: string;
}

export function buildProjectSeo(project: ProjectMetaSource, pathname: string): SeoHead {
  const sector = (project.sector || '').trim();
  const title = sector ? `${project.title} - Arredamento ${sector}` : project.title;

  const place =
    project.location && project.year
      ? `Realizzato a ${project.location} nel ${project.year}.`
      : '';
  const description = [project.description, place].filter(Boolean).join(' ');

  return {
    title: truncateMeta(title, META_TITLE_MAX),
    description: truncateMeta(description, META_DESCRIPTION_MAX),
    keywords: LOCAL_KEYWORDS,
    canonical: toCanonical(pathname),
    robots: INDEX_ROBOTS,
    ogImage: absoluteImage(project.coverImages?.[0] || project.image),
    ogType: 'website',
    status: 'ok',
  };
}

export interface ProductMetaSource {
  name: string;
  slug: string;
  description?: string;
  /** Etichetta breve del settore, es. "Barberie" o "Uffici". */
  sectorLabel?: string;
  images?: string[];
}

export function buildProductSeo(product: ProductMetaSource, pathname: string): SeoHead {
  const sector = (product.sectorLabel || '').trim();
  const title = sector ? `${product.name} - Arredo ${sector} | Farcom` : `${product.name} | Farcom`;

  const description = [
    product.description,
    sector
      ? `Arredo ${sector} su misura nel showroom Farcom di Macerata Campania, con consegna in tutta Italia.`
      : 'Showroom Farcom di Macerata Campania, con consegna in tutta Italia.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    title: truncateMeta(title, META_TITLE_MAX),
    description: truncateMeta(description, META_DESCRIPTION_MAX),
    keywords: LOCAL_KEYWORDS,
    canonical: toCanonical(pathname),
    robots: INDEX_ROBOTS,
    ogImage: absoluteImage(product.images?.[0]),
    ogType: 'website',
    status: 'ok',
  };
}

export interface PostMetaSource {
  title: string;
  slug: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  coverImage?: string;
  ogImage?: string;
}

export function buildPostSeo(post: PostMetaSource, pathname: string): SeoHead {
  const canonical = (post.canonicalUrl || '').trim() || toCanonical(pathname);

  return {
    title: truncateMeta(post.seoTitle || post.title, META_TITLE_MAX),
    description: truncateMeta(
      post.seoDescription || post.excerpt || DEFAULT_DESCRIPTION,
      META_DESCRIPTION_MAX,
    ),
    keywords: LOCAL_KEYWORDS,
    canonical,
    robots: INDEX_ROBOTS,
    ogImage: absoluteImage(post.ogImage || post.coverImage),
    ogType: 'article',
    status: 'ok',
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSeoTags(seo: SeoHead): string {
  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description)}" data-rh="true" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" data-rh="true" />`,
  ];

  if (seo.keywords) {
    tags.push(
      `<meta name="keywords" content="${escapeHtml(seo.keywords)}" data-rh="true" />`,
    );
  }

  if (seo.canonical) {
    const canonical = escapeHtml(seo.canonical);
    tags.push(
      `<link rel="canonical" href="${canonical}" data-rh="true" />`,
      `<link rel="alternate" href="${canonical}" hreflang="it-IT" data-rh="true" />`,
      `<link rel="alternate" href="${canonical}" hreflang="x-default" data-rh="true" />`,
      `<meta property="og:url" content="${canonical}" data-rh="true" />`,
      `<meta name="twitter:url" content="${canonical}" data-rh="true" />`,
    );
  }

  tags.push(
    `<meta property="og:type" content="${escapeHtml(seo.ogType)}" data-rh="true" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" data-rh="true" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" data-rh="true" />`,
    `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" data-rh="true" />`,
    '<meta property="og:locale" content="it_IT" data-rh="true" />',
    '<meta property="og:site_name" content="Farcom Arredi" data-rh="true" />',
    '<meta name="twitter:card" content="summary_large_image" data-rh="true" />',
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" data-rh="true" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" data-rh="true" />`,
    `<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" data-rh="true" />`,
  );

  return tags.join('\n    ');
}

function replaceTitle(html: string, title: string): string {
  const titleTag = `<title>${escapeHtml(title)}</title>`;

  if (/<title[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title[\s\S]*?<\/title>/i, titleTag);
  }

  return html.replace(/<\/head>/i, `  ${titleTag}\n</head>`);
}

// Rimuove i metadati SEO già presenti in index.html prima di iniettare quelli
// della pagina. Senza questo passaggio l'HTML servito contiene due
// <meta name="description"> e la statica, generica, viene prima: Google usa
// quella e la description specifica della pagina non ha effetto.
const MANAGED_META_TAGS =
  /<meta\s+(?:name|property)=["'](?:description|robots|keywords|author|og:[a-z:_.-]+|twitter:[a-z:_.-]+)["'][^>]*>\s*/gi;
const MANAGED_LINK_TAGS = /<link\s+rel=["'](?:canonical|alternate)["'][^>]*>\s*/gi;

function stripManagedSeo(html: string): string {
  return html.replace(MANAGED_META_TAGS, '').replace(MANAGED_LINK_TAGS, '');
}

export function injectSeoHead(html: string, seo: SeoHead): string {
  const result = replaceTitle(stripManagedSeo(html), seo.title);
  const block = renderSeoTags(seo);

  if (result.includes('<!-- SEO_HEAD -->')) {
    return result.replace('<!-- SEO_HEAD -->', block);
  }

  return result.replace(/<\/head>/i, `    ${block}\n  </head>`);
}
