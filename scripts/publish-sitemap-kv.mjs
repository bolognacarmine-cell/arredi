import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: resolve(root, '.server.env') });

const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
const namespaceId = (process.env.CLOUDFLARE_KV_NAMESPACE_ID || '').trim();
const apiToken = (process.env.CLOUDFLARE_API_TOKEN || '').trim();

if (!accountId || !namespaceId || !apiToken) {
  console.error('Mancano CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID o CLOUDFLARE_API_TOKEN.');
  console.error('Aggiungile a .server.env (locale) e alle Environment Variables di Render.');
  process.exit(1);
}

const fileArg = process.argv.find((arg) => arg.startsWith('--file='))?.slice('--file='.length);
const sitemapPath = resolve(root, fileArg || 'public/sitemap.xml');
const xml = readFileSync(sitemapPath, 'utf8');

if (!xml.includes('<urlset') || !xml.includes('</urlset>')) {
  console.error(`Sitemap non valida: ${sitemapPath}`);
  process.exit(1);
}

const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/storage/kv/namespaces/${encodeURIComponent(namespaceId)}/values/${encodeURIComponent('sitemap.xml')}`;

try {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/xml; charset=utf-8',
    },
    body: xml,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    console.error(
      `Pubblicazione fallita: HTTP ${response.status}${details ? ` - ${details.slice(0, 500)}` : ''}`,
    );
    process.exit(1);
  }

  const urlCount = (xml.match(/<loc>/g) || []).length;
  console.log(`[cloudflare-kv] sitemap pubblicata (${urlCount} URL) da ${sitemapPath}`);
} catch (error) {
  console.error('Pubblicazione fallita:', error instanceof Error ? error.message : error);
  process.exit(1);
}
