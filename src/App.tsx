import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import SettoriList from "./pages/SettoriList";
import SectorPage from "./pages/SectorPage";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Quote from "./pages/Quote";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import PrivacyPage from "./pages/PrivacyPage";
import CookiePage from "./pages/CookiePage";
import LegalNotesPage from "./pages/LegalNotesPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminSettings from "./pages/admin/AdminSettings";
import {
  ShowroomIndexRedirect,
  ProductsList as ShowroomProducts,
} from "./routes/adminShowroomRoutes";
import {
  PublicShowroomList,
  PublicShowroomDetail,
} from "./routes/publicShowroomRoutes";
import { AdminAuthProvider } from "./hooks/useAdminAuth";

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AdminAuthProvider>
          <ScrollToTop />
          <Navbar />
          <Routes>
            {/* PUBLIC */}
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
            <Route path="/note-legali" element={<LegalNotesPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* ADMIN */}
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

            {/* RETE DI SICUREZZA /api/*: se per qualunque motivo (SW vecchio, fallback SPA
                disallineato, cache CDN) il browser carica index.html su un URL /api/*
                invece della risposta JSON, REACT ROUTER NON DEVE redirigere a /admin
                (che nascondeva il sintomo e creava loop "pagina bianca → admin").
                Invece forziamo un hard reload full-page (window.location.reload())
                che bypassa il navigation route del SW e raggiunge il server →
                le guardie /api/* L1/L2/L3 rispondono JSON 404 come da specifica. */}
            <Route path="/api/*" element={
              <div className="min-h-screen flex items-center justify-center text-sm text-[#888580] bg-[var(--background)] p-4">
                <span className="w-4 h-4 border-2 border-[#1B4332]/30 border-t-[#1B4332] rounded-full animate-spin mr-3 inline-block align-middle" />
                <ApiFallbackForceReload />
              </div>
            } />
          </Routes>
          <Footer />
          <CookieBanner />
        </AdminAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
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
