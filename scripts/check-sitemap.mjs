import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = 'https://www.farcomarredi.it';
const distDir = resolve(process.cwd(), 'dist');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const robotsPath = resolve(distDir, 'robots.txt');

const errors = [];

for (const file of [sitemapPath, robotsPath]) {
  if (!existsSync(file)) {
    errors.push(`file mancante nella build: ${file}`);
  }
}

let urlCount = 0;

if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, 'utf8').trim();

  if (!xml.startsWith('<?xml')) {
    errors.push('sitemap.xml non inizia con la dichiarazione XML');
  }
  if (!xml.includes('<urlset') || !xml.includes('</urlset>')) {
    errors.push('sitemap.xml non contiene un urlset valido');
  }

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  urlCount = locs.length;

  if (urlCount === 0) {
    errors.push('sitemap.xml non contiene URL');
  }

  const seen = new Set();
  for (const loc of locs) {
    if (!loc.startsWith(`${SITE_URL}/`)) {
      errors.push(`URL non canonico (atteso ${SITE_URL}): ${loc}`);
    }
    if (seen.has(loc)) {
      errors.push(`URL duplicato nella sitemap: ${loc}`);
    }
    seen.add(loc);
  }
}

if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
    errors.push('robots.txt non dichiara la sitemap canonica');
  }
}

if (errors.length > 0) {
  console.error('[sitemap] Build bloccata:');
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(`[sitemap] OK: ${urlCount} URL, sitemap.xml e robots.txt presenti in dist/`);
