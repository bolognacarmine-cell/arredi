// Footer redesign wow — mobile 2-col con accordion, desktop md+ 5 colonne
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  companyLinks,
  getFooterContactLinks,
  getSocialLinks,
  sectorLinks,
  useSiteSettings,
} from "../siteConfig"

type SectionKey = "settori" | "azienda" | "contatti" | "sociallegal"

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
      open ? "-rotate-180" : ""
    }`}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const GoogleStar = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="#E69138"
    aria-hidden="true"
    className="w-3.5 h-3.5"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

const GoogleG = () => (
  <svg width="12" height="12" viewBox="0 0 48 48" aria-hidden="true" className="w-3 h-3">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-3.5 h-3.5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-3.5 h-3.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-3.5 h-3.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
    <path d="M20.52 3.48A11.81 11.81 0 0012.04 0C5.46 0 .08 5.38.08 11.97c0 2.1.56 4.15 1.61 5.94L0 24l6.22-1.63a11.95 11.95 0 005.82 1.51h.01c6.58 0 11.96-5.38 11.96-11.97 0-3.19-1.25-6.19-3.49-8.43zM12.05 21.8h-.01a9.82 9.82 0 01-5.01-1.37l-.36-.21-3.69.97 1-3.6-.23-.37a9.87 9.87 0 01-1.51-5.24C2.25 6.58 6.65 2.18 12.05 2.18c2.63 0 5.1 1.02 6.96 2.88a9.83 9.83 0 012.88 6.96c0 5.4-4.4 9.78-9.84 9.78zm5.39-7.35c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.65.15s-.73.95-.9 1.15c-.17.2-.33.22-.62.07a7.8 7.8 0 01-2.3-1.42 8.68 8.68 0 01-1.59-1.98c-.17-.29 0-.44.13-.58.12-.13.29-.33.43-.5s.19-.29.29-.48c.1-.2.05-.37-.02-.52-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5h-.55c-.2 0-.5.07-.77.35s-1.02 1-1.02 2.44c0 1.44 1.05 2.83 1.2 3.03.15.2 2.07 3.16 5.01 4.43.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.7 1.98-1.38.25-.68.25-1.27.18-1.38-.07-.12-.27-.2-.56-.35z" />
  </svg>
)

export default function Footer() {
  const location = useLocation()
  const siteConfig = useSiteSettings()
  if (location.pathname.startsWith("/admin")) return null

  const currentYear = new Date().getFullYear()
  const footerContactLinks = getFooterContactLinks(siteConfig)
  const socialLinks = getSocialLinks(siteConfig)
  const telHref = footerContactLinks.find((c) => c.label.toLowerCase() === "tel")?.href ?? siteConfig.emailHref
  const waHref = siteConfig.whatsappHref

  // Stato accordion mobile: max uno per colonna (col-1: settori/azienda; col-2: contatti/sociallegal)
  const [open, setOpen] = useState<{ col1: SectionKey | null; col2: SectionKey | null }>({
    col1: null,
    col2: null,
  })

  const toggle = (col: "col1" | "col2", key: SectionKey) => {
    setOpen((prev) => ({ ...prev, [col]: prev[col] === key ? null : key }))
  }

  // Header sezione desktop (sempre visibile md+)
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/42">
      {children}
    </h3>
  )

  // Header + contenuto per accordion mobile
  const Accordion = ({
    col,
    keyId,
    title,
    children,
  }: {
    col: "col1" | "col2"
    keyId: SectionKey
    title: string
    children: React.ReactNode
  }) => {
    const isOpen = open[col] === keyId
    const id = `footer-accordion-${keyId}`
    return (
      <div className="md:hidden border-b border-white/10 last:border-b-0">
        <button
          type="button"
          onClick={() => toggle(col, keyId)}
          aria-expanded={isOpen}
          aria-controls={id}
          className="w-full inline-flex items-center justify-between min-h-[44px] -mx-2 px-2 text-left text-sm font-semibold uppercase tracking-[0.16em] text-white/85 hover:text-[#E69138] transition-colors rounded-sm"
        >
          <span>{title}</span>
          <ChevronDown open={isOpen} />
        </button>
        <div
          id={id}
          role="region"
          aria-labelledby={`${id}-header`}
          className={`grid transition-all duration-200 ease-out ${
            isOpen ? "grid-rows-[1fr] opacity-100 pb-3" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <footer className="relative overflow-hidden bg-[#11111F] text-white">
      {/* Accenti sfondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#E69138]/18 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-[#1B4332]/30 blur-3xl" />
      </div>

      {/* Banda CTA superiore */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6 px-4 sm:px-6 py-5 sm:py-6 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-[#E69138]">
              {siteConfig.brandName}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-white leading-[1.2] sm:leading-tight">
              Hai un progetto da arredare?
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm leading-[1.65] sm:leading-relaxed text-white/68 md:text-base">
              {siteConfig.footerIntro}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
            <Link
              to="/preventivo"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#E69138] px-6 py-3 text-sm font-semibold text-[#1A1A2E] transition-all duration-300 hover:bg-[#f0a14b] hover:shadow-lg hover:shadow-[#E69138]/20 w-full sm:w-auto"
            >
              Richiedi preventivo
            </Link>
            <a
              href={siteConfig.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[#25D366] hover:text-[#25D366] w-full sm:w-auto"
            >
              {siteConfig.whatsappLabel}
            </a>
          </div>
        </div>
      </div>

      {/* Riga separatore bronzo "wow" */}
      <div className="relative border-t-2 border-[#E69138]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14 md:px-8 md:py-16 lg:px-16">
          {/* Logo + badges — SEMPRE visibile, sopra la griglia, col-span-2/5 */}
          <div className="mb-8 sm:mb-10 md:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-6">
            <div className="flex flex-col gap-3">
              <Link to="/" className="inline-flex items-center min-h-[44px] -ml-1">
                <img
                  src="/logo-farcom.png"
                  alt={siteConfig.logoAlt}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-sm sm:text-[15px] leading-[1.6] text-white/68 max-w-xl">
                {siteConfig.footerDescription}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-3">
              <div className="flex flex-wrap gap-2">
                {siteConfig.footerBadges.map((item) => (
                  <span
                    key={item}
                    className="border border-white/12 bg-white/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/72 min-h-[28px] inline-flex items-center"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-white/[0.04] text-xs text-white/70">
                <div className="flex items-center gap-0.5 mr-1">
                  <GoogleStar />
                  <GoogleStar />
                  <GoogleStar />
                  <GoogleStar />
                  <GoogleStar />
                </div>
                <span>5.0</span>
                <span className="text-white/30">·</span>
                <GoogleG />
                <span>Google</span>
              </div>
            </div>
          </div>

          {/* ===== MOBILE: accordion 2 colonne ===== */}
          <div className="md:hidden grid grid-cols-2 gap-4 sm:gap-6">
            {/* Colonna 1 — Settori + Azienda */}
            <div className="flex flex-col">
              <Accordion col="col1" keyId="settori" title="Settori">
                <ul className="space-y-1">
                  {sectorLinks.map(({ label, to }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/72 hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion col="col1" keyId="azienda" title="Azienda">
                <ul className="space-y-1">
                  {companyLinks.map(({ label, to }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/72 hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Accordion>
            </div>

            {/* Colonna 2 — Contatti + Social & Legal */}
            <div className="flex flex-col">
              <Accordion col="col2" keyId="contatti" title="Contatti">
                <ul className="space-y-2">
                  {footerContactLinks.map(({ label, value, href, external }) => {
                    const Icon =
                      label.toLowerCase() === "tel" ? PhoneIcon : label.toLowerCase() === "email" ? MailIcon : MapPinIcon
                    return (
                      <li key={label}>
                        <a
                          href={href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="flex items-start gap-2.5 min-h-[40px] -mx-2 px-2 py-1 text-sm text-white/72 hover:text-white hover:bg-white/[0.04] rounded-sm transition-colors leading-snug"
                        >
                          <span className="mt-0.5 text-[#E69138] shrink-0">
                            <Icon />
                          </span>
                          <span className="min-w-0 break-words">
                            <span className="block text-[10px] uppercase tracking-[0.16em] text-white/40 mb-0.5">
                              {label}
                            </span>
                            {value}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <a
                    href={telHref}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] bg-[#E69138] px-3 py-2 text-[13px] font-semibold text-[#1A1A2E] hover:bg-[#f0a14b] transition-colors rounded-md"
                  >
                    <PhoneIcon />
                    Chiama ora
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] border border-[#25D366]/50 bg-[#25D366]/10 text-[#25D366] px-3 py-2 text-[13px] font-semibold hover:bg-[#25D366]/15 transition-colors rounded-md"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                </div>
              </Accordion>

              <Accordion col="col2" keyId="sociallegal" title="Social & Legal">
                <div className="flex items-center gap-3 mb-4">
                  {socialLinks.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] border border-white/12 bg-white/5 rounded-md text-white/76 transition-colors hover:border-[#E69138] hover:text-[#E69138] hover:bg-[#E69138]/10"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-white/60 mb-3">
                  <Link to="/privacy" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                    Privacy
                  </Link>
                  <span className="text-white/30" aria-hidden="true">•</span>
                  <Link to="/cookie" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                    Cookie
                  </Link>
                  <span className="text-white/30" aria-hidden="true">•</span>
                  <Link to="/note-legali" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                    Note legali
                  </Link>
                </div>
                <div className="text-xs text-white/45">
                  © {currentYear} {siteConfig.legalName}.
                </div>
              </Accordion>
            </div>
          </div>

          {/* ===== DESKTOP md+: 5 colonne sempre espanso ===== */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-10">
            {/* Col 1 — Azienda */}
            <div>
              <SectionTitle>Azienda</SectionTitle>
              <ul className="mt-4 sm:mt-5 space-y-2">
                {companyLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/72 hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2 — Settori */}
            <div>
              <SectionTitle>Settori</SectionTitle>
              <ul className="mt-4 sm:mt-5 space-y-2">
                {sectorLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/72 hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Contatti */}
            <div className="lg:col-span-2">
              <SectionTitle>Contatti</SectionTitle>
              <ul className="mt-4 sm:mt-5 space-y-2.5">
                {footerContactLinks.map(({ label, value, href, external }) => {
                  const Icon =
                    label.toLowerCase() === "tel" ? PhoneIcon : label.toLowerCase() === "email" ? MailIcon : MapPinIcon
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="flex items-start gap-3 min-h-[40px] -mx-2 px-2 py-1 text-sm text-white/72 hover:text-white hover:bg-white/[0.04] rounded-sm transition-colors leading-snug"
                      >
                        <span className="mt-1 text-[#E69138] shrink-0">
                          <Icon />
                        </span>
                        <span className="min-w-0 break-words">
                          <span className="block text-[10px] uppercase tracking-[0.16em] text-white/40 mb-0.5">
                            {label}
                          </span>
                          {value}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-4 text-xs text-white/55 leading-relaxed">
                {siteConfig.hoursWeek}
                <br />
                {siteConfig.hoursExtra}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm">
                <a
                  href={telHref}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] bg-[#E69138] px-4 py-2.5 text-sm font-semibold text-[#1A1A2E] hover:bg-[#f0a14b] hover:shadow-md hover:shadow-[#E69138]/25 transition-all rounded-md"
                >
                  <PhoneIcon />
                  Chiama ora
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] border border-[#25D366]/50 bg-[#25D366]/10 text-[#25D366] px-4 py-2.5 text-sm font-semibold hover:bg-[#25D366]/15 hover:shadow-md hover:shadow-[#25D366]/15 transition-all rounded-md"
                >
                  <WhatsAppIcon />
                  Scrivici
                </a>
              </div>
            </div>

            {/* Col 4 — Social + Legal + © */}
            <div>
              <SectionTitle>Seguici</SectionTitle>
              <div className="mt-4 sm:mt-5 flex items-center gap-3 mb-5">
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] border border-white/12 bg-white/5 rounded-md text-white/76 transition-colors hover:border-[#E69138] hover:text-[#E69138] hover:bg-[#E69138]/10 hover:-translate-y-0.5"
                  >
                    {icon}
                  </a>
                ))}
              </div>

              <SectionTitle>Note legali</SectionTitle>
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-white/60">
                <Link to="/privacy" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                  Privacy
                </Link>
                <span className="text-white/30" aria-hidden="true">•</span>
                <Link to="/cookie" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                  Cookie
                </Link>
              </div>
              <Link
                to="/note-legali"
                className="mt-1 inline-flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/60 hover:text-[#E69138] transition-colors rounded-sm"
              >
                Note legali
              </Link>

              <div className="mt-6 pt-5 border-t border-white/10">
                <a
                  href={siteConfig.emailHref}
                  className="inline-flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/60 hover:text-white transition-colors rounded-sm break-all"
                >
                  {siteConfig.email}
                </a>
                <div className="mt-1.5 text-xs text-white/45 leading-relaxed" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
                  © {currentYear} {siteConfig.legalName}.
                  <br />
                  {siteConfig.claim}
                </div>
              </div>
            </div>
          </div>

          {/* Safe area su mobile (solo quando nessun accordion lo contiene) */}
          <div className="md:hidden h-px safe-bottom" aria-hidden="true" />
        </div>
      </div>
    </footer>
  )
}
