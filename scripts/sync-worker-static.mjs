import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const robotsPath = resolve(root, 'public/robots.txt');
const sitemapPath = resolve(root, 'public/sitemap.xml');
const outputPath = resolve(root, 'cloudflare/worker/src/generated.ts');

const robots = readFileSync(robotsPath, 'utf8');
const sitemap = readFileSync(sitemapPath, 'utf8');

if (!robots.includes('Sitemap: https://www.farcomarredi.it/sitemap.xml')) {
  throw new Error('public/robots.txt non dichiara la sitemap canonica');
}
if (!sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) {
  throw new Error('public/sitemap.xml non contiene un urlset valido');
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  '// File generato da scripts/sync-worker-static.mjs. Non modificare a mano.\n' +
    `export const ROBOTS_TXT = ${JSON.stringify(robots)};\n\n` +
    `export const FALLBACK_SITEMAP_XML = ${JSON.stringify(sitemap)};\n`,
);

const urlCount = (sitemap.match(/<loc>/g) || []).length;
console.log(`[worker] generati robots.txt e sitemap.xml di fallback (${urlCount} URL)`);
