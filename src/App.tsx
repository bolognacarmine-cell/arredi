import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import SectorPage from "./pages/SectorPage";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Quote from "./pages/Quote";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import PrivacyPage from "./pages/PrivacyPage";
import CookiePage from "./pages/CookiePage";
import LegalNotesPage from "./pages/LegalNotesPage";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/settori/:id" element={<SectorPage />} />
        <Route path="/progetti" element={<Projects />} />
        <Route path="/progetti/:id" element={<ProjectDetail />} />
        <Route path="/preventivo" element={<Quote />} />
        <Route path="/chi-siamo" element={<About />} />
        <Route path="/contatti" element={<Contacts />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookie" element={<CookiePage />} />
        <Route path="/note-legali" element={<LegalNotesPage />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="progetti" element={<AdminProjects />} />
          <Route path="preventivi" element={<AdminQuotes />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="impostazioni" element={<AdminSettings />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
