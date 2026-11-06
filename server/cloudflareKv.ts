const KV_KEY = 'sitemap.xml';
const KV_API_BASE = 'https://api.cloudflare.com/client/v4';

export type CloudflareKvConfig = {
  accountId: string;
  namespaceId: string;
  apiToken: string;
};

export type CloudflareKvPublishOptions = {
  config?: CloudflareKvConfig | null;
  fetcher?: typeof fetch;
};

export function getCloudflareKvConfig(
  env: NodeJS.ProcessEnv = process.env,
): CloudflareKvConfig | null {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const namespaceId = env.CLOUDFLARE_KV_NAMESPACE_ID?.trim();
  const apiToken = env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !namespaceId || !apiToken) return null;
  return { accountId, namespaceId, apiToken };
}

export function isCloudflareKvConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return getCloudflareKvConfig(env) !== null;
}

export function buildCloudflareKvValueUrl(
  config: CloudflareKvConfig,
  key: string = KV_KEY,
): string {
  return `${KV_API_BASE}/accounts/${encodeURIComponent(config.accountId)}/storage/kv/namespaces/${encodeURIComponent(config.namespaceId)}/values/${encodeURIComponent(key)}`;
}

export async function publishSitemapToKv(
  xml: string,
  options: CloudflareKvPublishOptions = {},
): Promise<boolean> {
  const config = options.config === undefined ? getCloudflareKvConfig() : options.config;
  if (!config) return false;

  const fetcher = options.fetcher ?? fetch;

  try {
    const response = await fetcher(buildCloudflareKvValueUrl(config), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/xml; charset=utf-8',
      },
      body: xml,
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error(
        `[cloudflare-kv] pubblicazione sitemap fallita: HTTP ${response.status}${details ? ` - ${details.slice(0, 300)}` : ''}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      '[cloudflare-kv] pubblicazione sitemap fallita:',
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
