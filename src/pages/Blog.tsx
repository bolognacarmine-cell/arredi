import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getPosts, getSectors, type Post, type BlogSector } from "../api/blogApi"

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sectors, setSectors] = useState<BlogSector[]>([])
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [postsData, sectorsData] = await Promise.all([
          getPosts({ sectorSlug: selectedSector || undefined, page: currentPage, limit: 12 }),
          getSectors(),
        ])
        setPosts(postsData.data)
        setTotalPages(postsData.pagination.totalPages)
        setSectors(sectorsData)
      } catch (error) {
        console.error("Error loading blog data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedSector, currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#F0EDE6]">
      {/* Header */}
      <div className="bg-[#1A1A18] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-display font-medium mb-4">Blog</h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Idee, guide e consigli per arredare la tua casa con stile e funzionalità
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Sector Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedSector(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSector === null
                ? "bg-[#B5965A] text-white"
                : "bg-white text-[#1A1A18] hover:bg-[#B5965A] hover:text-white"
            }`}
          >
            Tutti gli articoli
          </button>
          {sectors.map((sector) => (
            <button
              key={sector.slug}
              onClick={() => setSelectedSector(sector.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSector === sector.slug
                  ? "bg-[#B5965A] text-white"
                  : "bg-white text-[#1A1A18] hover:bg-[#B5965A] hover:text-white"
              }`}
            >
              {sector.title}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3" />
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#888580] text-lg">Nessun articolo disponibile</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {post.coverImage && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-[#B5965A] uppercase tracking-wide">
                        {sectors.find(s => s.slug === post.sectorSlug)?.title || post.sectorSlug}
                      </span>
                      <span className="text-xs text-[#888580]">•</span>
                      <span className="text-xs text-[#888580]">{formatDate(post.publishedAt)}</span>
                    </div>
                    <h3 className="text-xl font-display font-medium text-[#1A1A18] mb-3 line-clamp-2 group-hover:text-[#B5965A] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#888580] text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <span className="text-sm font-medium text-[#B5965A] group-hover:underline">
                      Leggi articolo →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white rounded-lg text-[#1A1A18] hover:bg-[#B5965A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Precedente
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? "bg-[#B5965A] text-white"
                        : "bg-white text-[#1A1A18] hover:bg-[#B5965A] hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white rounded-lg text-[#1A1A18] hover:bg-[#B5965A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Successiva
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
