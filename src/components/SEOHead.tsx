import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  schema?: Record<string, any>
}

export default function SEOHead({ title, description, canonical, ogImage, schema }: SEOHeadProps) {
  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage || 'https://arredi.onrender.com/og-image.jpg'} />
      <meta property="og:locale" content="it_IT" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || 'https://arredi.onrender.com/og-image.jpg'} />
      
      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}