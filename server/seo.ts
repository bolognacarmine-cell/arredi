export const SITE_URL = 'https://www.farcomarredi.it';

const DEFAULT_TITLE =
  'Farcom Design s.r.l. - Arredamento e Progettazione Interni a Macerata Campania e in tutta Italia';
const DEFAULT_DESCRIPTION =
  'Farcom Design s.r.l.: arredamento su misura e progettazione interni a Macerata Campania, Caserta e in tutta Italia. Showroom arredi professionali, preventivi gratuiti e sopralluogo. Richiedi un preventivo!';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images-optimized/barber-farcom-social-1200x630.jpg`;
const DEFAULT_OG_TYPE = 'website';
const INDEX_ROBOTS = 'index, follow';
const NOINDEX_ROBOTS = 'noindex, nofollow';

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

type PageMeta = {
  title: string;
  description: string;
  keywords?: string;
};

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

export interface SeoHead {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  robots: string;
  ogImage: string;
  ogType: string;
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
    };
  }

  if (path === '/showroom/offerte') {
    return buildSeoHead(STATIC_PAGE_META['/showroom'], '/showroom');
  }

  const staticMeta = STATIC_PAGE_META[path];
  if (staticMeta) return buildSeoHead(staticMeta, path);

  if (path.startsWith('/settori/')) {
    const sector = path.slice('/settori/'.length);
    if (SECTOR_IDS.has(sector)) {
      const meta = defaultMeta();
      const sectorKeywords = SECTOR_KEYWORDS[sector];
      if (sectorKeywords) {
        meta.keywords = `${sectorKeywords}, ${LOCAL_KEYWORDS}`;
      }
      return buildSeoHead(meta, path);
    }
  }

  if (/^\/(progetti|blog|showroom)\/[^/]+$/.test(path)) {
    return buildSeoHead(defaultMeta(), path);
  }

  return {
    title: 'Pagina non trovata | Farcom Design s.r.l.',
    description: DEFAULT_DESCRIPTION,
    robots: NOINDEX_ROBOTS,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: DEFAULT_OG_TYPE,
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

// Rimuove eventuali meta keywords statici già presenti in index.html per
// evitare duplicati: il layer server inietta quelli specifici per pagina.
function stripKeywordsMeta(html: string): string {
  return html.replace(/\s*<meta\s+name=["']keywords["'][^>]*>\s*/gi, '\n    ');
}

export function injectSeoHead(html: string, seo: SeoHead): string {
  const result = replaceTitle(stripKeywordsMeta(html), seo.title);
  const block = renderSeoTags(seo);

  if (result.includes('<!-- SEO_HEAD -->')) {
    return result.replace('<!-- SEO_HEAD -->', block);
  }

  return result.replace(/<\/head>/i, `    ${block}\n  </head>`);
}
