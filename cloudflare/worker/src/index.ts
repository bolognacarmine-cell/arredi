import { FALLBACK_SITEMAP_XML, ROBOTS_TXT } from './generated';

interface Env {
  SITEMAP_KV: KVNamespace;
  KEEP_ALIVE_URL: string;
}

const CANONICAL_HOST = 'www.farcomarredi.it';
const SITEMAP_PATHS = new Set(['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml']);

function textResponse(body: string, contentType: string, method: string): Response {
  return new Response(method === 'HEAD' ? null : body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'X-Served-By': 'farcom-seo-edge',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    if (url.hostname === 'farcomarredi.it') {
      return Response.redirect(`https://${CANONICAL_HOST}${url.pathname}${url.search}`, 301);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          Allow: 'GET, HEAD',
          'X-Served-By': 'farcom-seo-edge',
        },
      });
    }

    if (pathname === '/robots.txt') {
      return textResponse(ROBOTS_TXT, 'text/plain; charset=utf-8', request.method);
    }

    if (SITEMAP_PATHS.has(pathname)) {
      let xml = FALLBACK_SITEMAP_XML;

      try {
        const stored = await env.SITEMAP_KV?.get('sitemap.xml', {
          type: 'text',
          cacheTtl: 60,
        });
        if (stored && stored.includes('<urlset')) {
          xml = stored;
        }
      } catch (error) {
        console.error('[kv] lettura sitemap fallita, uso fallback statico:', error);
      }

      return textResponse(xml, 'application/xml; charset=utf-8', request.method);
    }

    return new Response('Not Found', {
      status: 404,
      headers: {
        'X-Served-By': 'farcom-seo-edge',
      },
    });
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const url = env.KEEP_ALIVE_URL;
    const startedAt = new Date().toISOString();
    const startedMs = Date.now();

    if (!url) {
      console.error(`[keep-alive] at=${startedAt} error=KEEP_ALIVE_URL non configurato`);
      return;
    }

    console.log(
      `[keep-alive] at=${startedAt} start cron=${controller.cron} url=${url}`,
    );

    ctx.waitUntil(
      fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'farcom-seo-edge-keepalive/1.0',
        },
        signal: AbortSignal.timeout(25_000),
      })
        .then(async (response) => {
          if (response.body) {
            await response.body.cancel().catch(() => {});
          }

          const durationMs = Date.now() - startedMs;
          const finishedAt = new Date().toISOString();

          if (response.ok) {
            console.log(
              `[keep-alive] at=${finishedAt} ok url=${url} status=${response.status} durationMs=${durationMs}`,
            );
          } else {
            console.warn(
              `[keep-alive] at=${finishedAt} http_error url=${url} status=${response.status} durationMs=${durationMs}`,
            );
          }
        })
        .catch((error) => {
          const durationMs = Date.now() - startedMs;
          const finishedAt = new Date().toISOString();
          const message = error instanceof Error ? error.message : String(error);

          console.error(
            `[keep-alive] at=${finishedAt} network_error url=${url} error=${message} durationMs=${durationMs}`,
          );
        }),
    );
  },
} satisfies ExportedHandler<Env>;
