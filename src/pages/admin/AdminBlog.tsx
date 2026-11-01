import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  getAdminPosts,
  updatePost,
  deletePost,
  reorderPosts,
  formatPostDate,
  type Post,
} from "../../api/blogApi"
import PostForm from "../../components/admin/blog/PostForm"
import { btnPrimaryCls, btnSecondaryCls, inputCls } from "../../components/admin/blog/blogStyles"

type SortKey = "latest" | "oldest" | "title" | "order"

const SORT_LABELS: Array<{ value: SortKey; label: string }> = [
  { value: "latest", label: "Più recenti" },
  { value: "oldest", label: "Meno recenti" },
  { value: "title", label: "Titolo (A-Z)" },
  { value: "order", label: "Ordine personalizzato" },
]

const SECTOR_LABELS: Record<string, string> = {
  barbieri: "Barbieri e parrucchieri",
  uffici: "Uffici",
  negozi: "Negozi",
  scuole: "Scuole",
  bar: "Bar",
  "centri-estetici": "Centri estetici",
}

function statusBadge(post: Post) {
  if (post.isPublished) {
    return (
      <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        Pubblicato
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
      Bozza
    </span>
  )
}

/** Sezione del form raggiunta dall'URL: /admin/blog | /admin/blog/nuovo | /admin/blog/:id */
function parseRoute(pathname: string): { mode: "list" | "new" | "edit"; id?: string } {
  const parts = pathname.replace(/\/+$/, "").split("/")
  const tail = parts[parts.length - 1] || ""
  if (tail === "nuovo") return { mode: "new" }
  const index = parts.indexOf("blog")
  const maybeId = index >= 0 ? parts[index + 1] : undefined
  if (maybeId && maybeId !== "blog") return { mode: "edit", id: maybeId }
  return { mode: "list" }
}

export default function AdminBlog() {
  const location = useLocation()
  const navigate = useNavigate()

  const route = useMemo(() => parseRoute(location.pathname), [location.pathname])
  const showForm = route.mode !== "list"

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("latest")
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  const showError = useCallback((message: string) => {
    setErrorToast(message)
    window.setTimeout(() => setErrorToast(null), 6000)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await getAdminPosts(sort)
      setPosts(data)
    } catch (error) {
      console.error("[AdminBlog] caricamento fallito:", error)
      setListError(error instanceof Error ? error.message : "Impossibile caricare gli articoli")
    } finally {
      setLoading(false)
    }
  }, [sort])

  // Messaggio di conferma portato dal form dopo la creazione
  useEffect(() => {
    const state = location.state as { toast?: string } | null
    if (state?.toast) {
      showToast(state.toast)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state, location.pathname, navigate, showToast])

  // Elenco: ricaricato al cambio di ordinamento e ogni volta che si torna
  // dalla scheda articolo (altrimenti le modifiche non si vedrebbero).
  useEffect(() => {
    if (!showForm) load()
  }, [showForm, load])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return posts
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(needle) ||
        post.slug.toLowerCase().includes(needle) ||
        post.tags.some((tag) => tag.toLowerCase().includes(needle))
    )
  }, [posts, query])

  const draftToEdit = route.id ? posts.find((post) => post._id === route.id) || null : null
  const editPending = route.mode === "edit" && !loading && draftToEdit === null

  const togglePublish = async (post: Post) => {
    setBusyId(post._id)
    try {
      const next = await updatePost(post._id, { isPublished: !post.isPublished })
      setPosts((prev) => prev.map((item) => (item._id === post._id ? next : item)))
      showToast(next.isPublished ? "Articolo pubblicato" : "Articolo nascosto (bozza)")
    } catch (error) {
      showError(error instanceof Error ? error.message : "Impossibile aggiornare lo stato")
    } finally {
      setBusyId(null)
    }
  }

  const removePost = async (post: Post) => {
    const confirmed = window.confirm(
      `Eliminare definitivamente "${post.title}"? L'azione non è reversibile.`
    )
    if (!confirmed) return

    setBusyId(post._id)
    try {
      await deletePost(post._id)
      setPosts((prev) => prev.filter((item) => item._id !== post._id))
      showToast("Articolo eliminato")
    } catch (error) {
      showError(error instanceof Error ? error.message : "Impossibile eliminare l'articolo")
    } finally {
      setBusyId(null)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= filtered.length) return

    // Riordino ricalcolato sull'elenco completo, così gli indici restano stabili
    const idsInOrder = posts.map((post) => post._id)
    const movedId = filtered[index]._id
    const swappedId = filtered[target]._id
    const from = idsInOrder.indexOf(movedId)
    const to = idsInOrder.indexOf(swappedId)

    const next = [...idsInOrder]
    next.splice(to, 0, next.splice(from, 1)[0])

    const items = next.map((id, order) => ({ id, order }))
    setBusyId(movedId)
    try {
      await reorderPosts(items)
      await load()
      showToast("Ordine aggiornato")
    } catch (error) {
      showError(error instanceof Error ? error.message : "Impossibile riordinare")
    } finally {
      setBusyId(null)
    }
  }

  // ---------------------------------------------------------------------
  // SCHEDA ARTICOLO
  // ---------------------------------------------------------------------
  if (showForm) {
    if (route.mode === "edit" && loading) {
      return (
        <div className="border border-[#DDD9D0] bg-white p-8 text-center text-sm text-[#888580]">
          Caricamento articolo…
        </div>
      )
    }

    if (editPending) {
      return (
        <div className="border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-sm text-red-700">
            Articolo non trovato: potrebbe essere stato eliminato da un altro operatore.
          </p>
          <button type="button" onClick={() => navigate("/admin/blog")} className={btnPrimaryCls}>
            Torna all'elenco
          </button>
        </div>
      )
    }

    return <PostForm post={draftToEdit} />
  }

  // ---------------------------------------------------------------------
  // ELENCO
  // ---------------------------------------------------------------------
  return (
    <div>
      {/* Intestazione */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A18]">Blog</h1>
          <p className="mt-1 text-sm text-[#888580]">
            {posts.length} articolo{posts.length === 1 ? "" : "i"} ·{" "}
            {posts.filter((post) => post.isPublished).length} pubblicati
          </p>
        </div>
        <Link
          to="/admin/blog/nuovo"
          className={`${btnPrimaryCls} no-underline`}
          onClick={() => undefined}
        >
          <span aria-hidden="true">＋</span> Nuovo articolo
        </Link>
      </div>

      {/* Filtri */}
      <div className="mb-6 flex flex-col gap-3 border border-[#DDD9D0] bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="admin-blog-search" className="sr-only">
            Cerca articoli
          </label>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#888580]"
          >
            🔎
          </span>
          <input
            id="admin-blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per titolo, slug o tag…"
            className={`${inputCls} pl-10`}
          />
        </div>

        <label htmlFor="admin-blog-sort" className="sr-only">
          Ordina per
        </label>
        <select
          id="admin-blog-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className={`${inputCls} sm:w-56`}
        >
          {SORT_LABELS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stati */}
      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded border border-[#DDD9D0] bg-white" />
          ))}
        </div>
      ) : listError ? (
        <div className="border border-red-200 bg-red-50 px-4 py-6 text-center">
          <p className="mb-4 text-sm text-red-700">{listError}</p>
          <button type="button" onClick={load} className={btnPrimaryCls}>
            Riprova
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-[#DDD9D0] bg-white px-6 py-14 text-center">
          <p className="mb-2 font-display text-lg font-bold text-[#1A1A18]">
            {posts.length === 0 ? "Nessun articolo" : "Nessun risultato"}
          </p>
          <p className="mb-6 text-sm text-[#888580]">
            {posts.length === 0
              ? "Crea il primo articolo SEO per supportare le pagine di servizio."
              : "Prova con un'altra keyword."}
          </p>
          {posts.length === 0 ? (
            <Link to="/admin/blog/nuovo" className={`${btnPrimaryCls} no-underline`}>
              <span aria-hidden="true">＋</span> Nuovo articolo
            </Link>
          ) : (
            <button type="button" onClick={() => setQuery("")} className={btnSecondaryCls}>
              Azzera la ricerca
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#DDD9D0] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F5F0] text-xs uppercase tracking-wide text-[#888580]">
                {sort === "order" && <th className="px-3 py-3 text-left">Ordine</th>}
                <th className="px-4 py-3 text-left">Titolo</th>
                <th className="px-4 py-3 text-left">Settore</th>
                <th className="px-4 py-3 text-left">Stato</th>
                <th className="px-4 py-3 text-left">Pubblicazione</th>
                <th className="px-4 py-3 text-left">SEO</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, index) => (
                <tr key={post._id} className="border-t border-[#EAE7E0] align-top">
                  {sort === "order" && (
                    <td data-label="Ordine" className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0 || busyId === post._id}
                          aria-label={`Sposta "${post.title}" su`}
                          className="min-h-[28px] rounded border border-[#DDD9D0] bg-[#F7F5F0] px-2 text-xs transition-colors hover:bg-[#EAE7E0] disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === filtered.length - 1 || busyId === post._id}
                          aria-label={`Sposta "${post.title}" giù`}
                          className="min-h-[28px] rounded border border-[#DDD9D0] bg-[#F7F5F0] px-2 text-xs transition-colors hover:bg-[#EAE7E0] disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                  )}

                  <td data-label="Titolo" className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Link
                        to={`/admin/blog/${post._id}`}
                        className="font-medium text-[#1A1A18] underline-offset-2 hover:text-[#1B4332] hover:underline"
                      >
                        {post.title}
                      </Link>
                      {post.featured && (
                        <span className="rounded-full bg-[#E69138]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B5761F]">
                          In evidenza
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block font-mono text-xs text-[#888580]">
                      /blog/{post.slug}
                    </span>
                  </td>

                  <td data-label="Settore" className="px-4 py-3 text-[#4A4A46]">
                    {SECTOR_LABELS[post.sectorSlug] || post.sectorSlug}
                  </td>

                  <td data-label="Stato" className="px-4 py-3">
                    {statusBadge(post)}
                  </td>

                  <td data-label="Pubblicazione" className="px-4 py-3 text-[#4A4A46]">
                    {formatPostDate(post.publishedAt)}
                  </td>

                  <td data-label="SEO" className="px-4 py-3 text-xs text-[#4A4A46]">
                    <div>
                      <span className={post.seoTitle && post.seoTitle.length <= 60 ? "text-green-700" : post.seoTitle ? "text-red-600" : "text-[#888580]"}>
                        {post.seoTitle ? `title ${post.seoTitle.length}/60` : "title: dal titolo"}
                      </span>
                    </div>
                    <div>
                      <span className={
                        !post.seoDescription
                          ? "text-[#888580]"
                          : post.seoDescription.length >= 140 && post.seoDescription.length <= 155
                            ? "text-green-700"
                            : post.seoDescription.length > 160
                              ? "text-red-600"
                              : "text-amber-600"
                      }>
                        {post.seoDescription
                          ? `desc ${post.seoDescription.length} (140-155)`
                          : "desc: dall'estratto"}
                      </span>
                    </div>
                  </td>

                  <td data-label="Azioni" className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        to={`/admin/blog/${post._id}`}
                        className="inline-flex min-h-[34px] items-center rounded border border-[#DDD9D0] bg-[#F7F5F0] px-3 text-xs text-[#4A4A46] transition-colors hover:bg-[#EAE7E0]"
                      >
                        Modifica
                      </Link>
                      <button
                        type="button"
                        onClick={() => togglePublish(post)}
                        disabled={busyId === post._id}
                        className="inline-flex min-h-[34px] items-center rounded border border-[#DDD9D0] bg-white px-3 text-xs text-[#1B4332] transition-colors hover:bg-[#EAE7E0] disabled:opacity-50"
                      >
                        {post.isPublished ? "Nascondi" : "Pubblica"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePost(post)}
                        disabled={busyId === post._id}
                        className="inline-flex min-h-[34px] items-center rounded border border-red-200 bg-white px-3 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pubblicare/nascondere è rapido dall'elenco: link alla guida del form */}
      <p className="mt-4 text-xs text-[#888580]">
        Suggerimento: scegli "Ordine personalizzato" per trascinare (↑/↓) l'ordine degli articoli
        nel blog.
      </p>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A18] text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md bg-red-700 text-white text-sm px-5 py-2.5 shadow-2xl animate-fade-in">
          {errorToast}
        </div>
      )}
    </div>
  )
}
