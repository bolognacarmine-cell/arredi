import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LOCAL_KEYWORDS_STRING } from '../lib/localSeo'

type Schema = Record<string, any>

/** Percorso del JSON-LD iniettato dal server, se presente nell'HTML iniziale. */
function getServerJsonLdPath(): string | null {
  if (typeof document === 'undefined') return null
  const tag = document.querySelector('script[type="application/ld+json"][data-seo-path]')
  return tag ? tag.getAttribute('data-seo-path') : null
}

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  /** Meta keywords: se omesso usa il set locale generale. */
  keywords?: string
  ogImage?: string
  /** Singolo oggetto schema.org oppure una lista (Article + FAQPage + BreadcrumbList). */
  schema?: Schema | Array<Schema | null | undefined>
  /** og:type: "article" per i dettagli blog, "website" (default) per il resto. */
  ogType?: string
  /** Blocca l'indicizzazione (pagine di anteprima, bozze). */
  noindex?: boolean
}

export default function SEOHead({
  title,
  description,
  canonical,
  keywords = LOCAL_KEYWORDS_STRING,
  ogImage,
  schema,
  ogType = 'website',
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title
  }, [title])

  // Il server emette già il JSON-LD corretto per questa pagina: il client non
  // ne aggiunge un secondo. Dopo una navigazione SPA il blocco del server è
  // riferito a un'altra route, quindi viene rimosso e il client prende il
  // controllo dei dati strutturati.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const serverOwnsJsonLd = getServerJsonLdPath() === pathname

  useEffect(() => {
    if (typeof document === 'undefined') return
    document
      .querySelectorAll('script[type="application/ld+json"][data-seo-path]')
      .forEach((tag) => {
        if (tag.getAttribute('data-seo-path') !== pathname) tag.remove()
      })
  }, [pathname])

  const schemas = (Array.isArray(schema) ? schema : [schema]).filter(Boolean) as Schema[]

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Farcom Design s.r.l." />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      {!noindex && keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <link rel="alternate" href={canonical} hrefLang="it-IT" />}
      {canonical && <link rel="alternate" href={canonical} hrefLang="x-default" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage || 'https://www.farcomarredi.it/images-optimized/barber-farcom-social-1200x630.jpg'} />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="Farcom Arredi" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {canonical && <meta name="twitter:url" content={canonical} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || 'https://www.farcomarredi.it/images-optimized/barber-farcom-social-1200x630.jpg'} />

      {/* Structured Data (JSON-LD) — soppresso se il server ha già iniettato
          il blocco per questa pagina, per non duplicare le entità. */}
      {!serverOwnsJsonLd &&
        schemas.map((item, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(item).replace(/</g, '\\u003c')}
          </script>
        ))}
    </Helmet>
  )
}
