import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import { AdminAuthProvider } from "./hooks/useAdminAuth";

// Code-splitting: ogni pagina è caricata on-demand in un chunk separato.
// Navbar/Footer/ScrollToTop/CookieBanner restano eager (sempre visibili).
const Home = lazy(() => import("./pages/Home"));
const SettoriList = lazy(() => import("./pages/SettoriList"));
const SectorPage = lazy(() => import("./pages/SectorPage"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Quote = lazy(() => import("./pages/Quote"));
const About = lazy(() => import("./pages/About"));
const Contacts = lazy(() => import("./pages/Contacts"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const CookiePage = lazy(() => import("./pages/CookiePage"));
const LegalNotesPage = lazy(() => import("./pages/LegalNotesPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const ShowroomIndexRedirect = lazy(() =>
  import("./routes/adminShowroomRoutes").then((m) => ({ default: m.ShowroomIndexRedirect })),
);
const ShowroomProducts = lazy(() =>
  import("./routes/adminShowroomRoutes").then((m) => ({ default: m.ProductsList })),
);
const PublicShowroomList = lazy(() =>
  import("./routes/publicShowroomRoutes").then((m) => ({ default: m.PublicShowroomList })),
);
const PublicShowroomDetail = lazy(() =>
  import("./routes/publicShowroomRoutes").then((m) => ({ default: m.PublicShowroomDetail })),
);

/** Auth admin solo su /admin/* — non montare sul sito pubblico (evita GET /api/admin/me → 401). */
function AdminAuthScope() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
          {/* PUBLIC */}
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settori" element={<SettoriList />} />
              <Route path="/settori/:id" element={<SectorPage />} />
              <Route path="/progetti" element={<Projects />} />
              <Route path="/progetti/:id" element={<ProjectDetail />} />
              <Route path="/showroom" element={<PublicShowroomList />} />
              <Route path="/showroom/offerte" element={<Navigate to="/showroom" replace />} />
              <Route path="/showroom/:slug" element={<PublicShowroomDetail />} />
              <Route path="/preventivo" element={<Quote />} />
              <Route path="/chi-siamo" element={<About />} />
              <Route path="/contatti" element={<Contacts />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookie" element={<CookiePage />} />
              <Route path="/termini-e-condizioni" element={<TermsPage />} />
              <Route path="/note-legali" element={<LegalNotesPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* ADMIN — provider auth solo qui */}
              <Route element={<AdminAuthScope />}>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="progetti" element={<AdminProjects />} />
                  <Route path="progetti/nuovo" element={<AdminProjects />} />
                  <Route path="progetti/:id" element={<AdminProjects />} />
                  <Route path="preventivi" element={<AdminQuotes />} />
                  {/* <Route path="media" element={<AdminMedia />} /> Removed: Media page no longer accessible from menu */}
                  <Route path="impostazioni" element={<AdminSettings />} />
                  <Route path="showroom">
                    <Route index element={<ShowroomIndexRedirect />} />
                    <Route path="products" element={<ShowroomProducts />} />
                  </Route>
                </Route>
              </Route>

              {/* RETE DI SICUREZZA /api/* */}
              <Route path="/api/*" element={
                <div className="min-h-screen flex items-center justify-center text-sm text-[#888580] bg-[var(--background)] p-4">
                  <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin mr-3 inline-block align-middle" />
                  <ApiFallbackForceReload />
                </div>
              } />
            </Routes>
          </Suspense>
        {/* Buffer di transizione cromatica tra ultimo contenuto e Footer (bianco → scuro) */}
        <div aria-hidden="true" className="relative overflow-hidden -mb-px">
          <div className="h-16 sm:h-24 md:h-32 bg-gradient-to-b from-white via-[#FAFAF9] to-[#1A1A2E]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24">
            <div className="absolute left-1/2 -translate-x-1/2 w-[900px] h-24 blur-[60px] opacity-25 bg-gradient-to-t from-[#E69138]/50 to-transparent" />
          </div>
        </div>
        <Footer />
        <CookieBanner />
      </BrowserRouter>
    </HelmetProvider>
  )
}

/** Fallback minimale durante il code-splitting delle route. */
function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <span className="w-5 h-5 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin" />
    </div>
  )
}

/** Fallback /api/*: se React Router intercetta un URL API per SW/fallback disallineato,
 *  forza window.location.reload() una sola volta con cache: no-store → la richiesta passa
 *  attraverso la rete, arriva al server, e le guardie JSON /api/* L1/L2/L3 entrano in funzione.
 *  Protezione anti-loop: dopo 1 reload la variabile localStorage blocca un secondo tentativo
 *  e mostra un messaggio chiaro invece di ricaricare all'infinito. */
function ApiFallbackForceReload() {
  useEffect(() => {
    const KEY = "__api_fallback_reload_attempted"
    if (typeof window === "undefined") return
    try {
      const already = window.sessionStorage.getItem(KEY) === "1"
      if (!already) {
        window.sessionStorage.setItem(KEY, "1")
        window.setTimeout(() => {
          window.location.reload()
        }, 150)
        return
      }
    } catch {
      /* sessionStorage non disponibile */
    }
  }, [])
  return (
    <span>
      Caricamento risorsa API… se la pagina non si aggiorna entro 2 secondi,
      premi <button
        type="button"
        onClick={() => { try { window.sessionStorage.removeItem("__api_fallback_reload_attempted") } catch {}; window.location.reload() }}
        className="underline decoration-dotted underline-offset-4 hover:text-[#1B4332]"
      >qui per forzare il ricaricamento</button>.
    </span>
  )
}
