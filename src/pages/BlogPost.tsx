import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getPostBySlug, getPosts, type Post } from "../api/blogApi"

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPost() {
      setLoading(true)
      try {
        const postData = await getPostBySlug(slug || "")
        if (postData) {
          setPost(postData)
          // Load related posts from same sector
          const related = await getPosts({ sectorSlug: postData.sectorSlug, limit: 4 })
          setRelatedPosts(related.data.filter(p => p._id !== postData._id).slice(0, 3))
        }
      } catch (error) {
        console.error("Error loading post:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [slug])

  useEffect(() => {
    if (post) {
      // Update document title and meta description
      document.title = post.seoTitle || post.title
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', post.seoDescription || post.excerpt)
      }
    }
  }, [post])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  // Schema.org JSON-LD
  const getSchemaOrgData = () => {
    if (!post) return null
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.seoDescription || post.excerpt,
      "image": post.coverImage,
      "author": {
        "@type": "Person",
        "name": post.author.name,
      },
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center">
        <div className="text-[#888580]">Caricamento...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-medium text-[#1A1A18] mb-4">Articolo non trovato</h1>
          <Link to="/blog" className="text-[#B5965A] hover:underline">
            Torna al blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaOrgData()) }}
        />
      )}
      
      <article className="min-h-screen bg-[#F0EDE6]">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-[#DDD9D0]">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <ol className="flex items-center gap-2 text-sm text-[#888580]">
              <li><Link to="/" className="hover:text-[#B5965A]">Home</Link></li>
              <li>/</li>
              <li><Link to="/blog" className="hover:text-[#B5965A]">Blog</Link></li>
              <li>/</li>
              <li className="text-[#1A1A18] truncate max-w-[200px]">{post.title}</li>
            </ol>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white border-b border-[#DDD9D0]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-[#B5965A] uppercase tracking-wide">
                {post.sectorSlug}
              </span>
              <span className="text-sm text-[#888580]">•</span>
              <span className="text-sm text-[#888580]">{formatDate(post.publishedAt)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-[#1A1A18] mb-6">
              {post.title}
            </h1>
            <p className="text-lg text-[#888580] mb-8">{post.excerpt}</p>
            
            {/* Author */}
            <div className="flex items-center gap-4">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium text-[#1A1A18]">{post.author.name}</p>
                <p className="text-sm text-[#888580]">{post.author.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-h2:text-2xl prose-h3:text-xl prose-p:text-[#1A1A18] prose-a:text-[#B5965A] prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#DDD9D0]">
              <h3 className="text-sm font-medium text-[#888580] mb-4">TAG</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${tag}`}
                    className="px-3 py-1 bg-white rounded-full text-sm text-[#1A1A18] hover:bg-[#B5965A] hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Products CTA */}
          {post.relatedProductSlugs && post.relatedProductSlugs.length > 0 && post.sectorSlug && (
            <div className="mt-12 p-8 bg-[#1A1A18] rounded-lg">
              <h3 className="text-2xl font-display font-medium text-white mb-4">
                Scopri le soluzioni per {post.sectorSlug.charAt(0).toUpperCase() + post.sectorSlug.slice(1)}
              </h3>
              <p className="text-white/80 mb-6">
                Trova l'arredamento ideale per il tuo spazio professionale
              </p>
              <Link
                to="/settori"
                className="inline-block px-6 py-3 bg-[#B5965A] text-white rounded-lg hover:bg-[#9A7F4D] transition-colors"
              >
                Esplora i settori →
              </Link>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-display font-medium text-[#1A1A18] mb-8">
              Leggi anche
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  to={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {relatedPost.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-medium text-[#1A1A18] mb-2 line-clamp-2 group-hover:text-[#B5965A] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-[#888580] line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
