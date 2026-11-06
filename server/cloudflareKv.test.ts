import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCloudflareKvValueUrl,
  getCloudflareKvConfig,
  isCloudflareKvConfigured,
  publishSitemapToKv,
  type CloudflareKvConfig,
} from './cloudflareKv.js';

const CONFIG: CloudflareKvConfig = {
  accountId: 'acct-123',
  namespaceId: 'ns-456',
  apiToken: 'token-secret',
};

describe('Cloudflare KV — configurazione', () => {
  it('legge le variabili e rimuove gli spazi', () => {
    const config = getCloudflareKvConfig({
      CLOUDFLARE_ACCOUNT_ID: ' acct ',
      CLOUDFLARE_KV_NAMESPACE_ID: ' ns ',
      CLOUDFLARE_API_TOKEN: ' token ',
    } as NodeJS.ProcessEnv);

    assert.deepEqual(config, { accountId: 'acct', namespaceId: 'ns', apiToken: 'token' });
    assert.equal(isCloudflareKvConfigured({} as NodeJS.ProcessEnv), false);
  });

  it('costruisce la URL API con la chiave codificata', () => {
    assert.equal(
      buildCloudflareKvValueUrl(CONFIG),
      'https://api.cloudflare.com/client/v4/accounts/acct-123/storage/kv/namespaces/ns-456/values/sitemap.xml',
    );
    assert.ok(buildCloudflareKvValueUrl(CONFIG, 'a b/c').endsWith('/values/a%20b%2Fc'));
  });
});

describe('publishSitemapToKv', () => {
  it('non chiama la rete se la configurazione manca', async () => {
    let called = false;

    const ok = await publishSitemapToKv('<urlset/>', {
      config: null,
      fetcher: async () => {
        called = true;
        return new Response('{}');
      },
    });

    assert.equal(ok, false);
    assert.equal(called, false);
  });

  it('invia PUT con token, content-type e body', async () => {
    let captured: { url: string; init?: RequestInit } | undefined;

    const ok = await publishSitemapToKv('<urlset/>', {
      config: CONFIG,
      fetcher: async (url, init) => {
        captured = { url: String(url), init };
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      },
    });

    assert.equal(ok, true);
    assert.ok(captured);
    assert.equal(captured.url, buildCloudflareKvValueUrl(CONFIG));
    assert.equal(captured.init?.method, 'PUT');
    assert.equal(captured.init?.body, '<urlset/>');
    assert.equal(
      (captured.init?.headers as Record<string, string>).Authorization,
      'Bearer token-secret',
    );
  });

  it('ritorna false sugli errori HTTP', async () => {
    const originalError = console.error;
    console.error = () => {};

    try {
      const ok = await publishSitemapToKv('<urlset/>', {
        config: CONFIG,
        fetcher: async () => new Response('nope', { status: 403 }),
      });
      assert.equal(ok, false);
    } finally {
      console.error = originalError;
    }
  });
});
