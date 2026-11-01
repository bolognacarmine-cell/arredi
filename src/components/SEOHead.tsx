import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

type Schema = Record<string, any>

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
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
  ogImage,
  schema,
  ogType = 'website',
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title
  }, [title])

  const schemas = (Array.isArray(schema) ? schema : [schema]).filter(Boolean) as Schema[]

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage || 'https://www.farcomarredi.it/og-image.jpg'} />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:site_name" content="Farcom Arredi" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || 'https://www.farcomarredi.it/og-image.jpg'} />

      {/* Structured Data (JSON-LD) */}
      {schemas.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item).replace(/</g, '\\u003c')}
        </script>
      ))}
    </Helmet>
  )
}
