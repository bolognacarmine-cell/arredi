import { Link, useLocation } from "react-router-dom"
import {
  companyLinks,
  getFooterContactLinks,
  getSocialLinks,
  sectorLinks,
  useSiteSettings,
} from "../siteConfig"

export default function Footer() {
  const location = useLocation()
  const siteConfig = useSiteSettings()

  if (location.pathname.startsWith("/admin")) return null

  const currentYear = new Date().getFullYear()
  const footerContactLinks = getFooterContactLinks(siteConfig)
  const socialLinks = getSocialLinks(siteConfig)

  return (
    <footer className="relative overflow-hidden bg-[#11111F] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#E69138]/18 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-[#1B4332]/30 blur-3xl" />
      </div>

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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 md:px-8 md:py-16 lg:px-16">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          {/* Logo + descrizione + badges (2 colonne su mobile, 4 su lg) */}
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" className="inline-flex items-center min-h-[44px]">
              <img
                src="/logo-farcom.png"
                alt={siteConfig.logoAlt}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <p className="mt-3 sm:mt-4 max-w-xl text-sm leading-[1.6] text-white/68 md:text-base md:leading-relaxed">
              {siteConfig.footerDescription}
            </p>

            <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
              {siteConfig.footerBadges.map((item) => (
                <span
                  key={item}
                  className="border border-white/12 bg-white/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/72 min-h-[28px] inline-flex items-center"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Colonna sx mobile: Settori + Azienda */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
              Settori
            </h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              {sectorLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/78 transition-colors hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 sm:mt-8 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
              Azienda
            </h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              {companyLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/78 transition-colors hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonna dx mobile: Social + Contatti + Note legali */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
              Social
            </h3>
            <div className="mt-3 sm:mt-4 flex items-center gap-4">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] border border-white/12 bg-white/5 rounded-sm text-white/76 transition-colors hover:border-[#E69138] hover:text-[#E69138] hover:bg-[#E69138]/10"
                >
                  {icon}
                </a>
              ))}
            </div>

            <h3 className="mt-6 sm:mt-8 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
              Contatti
            </h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              {footerContactLinks.map(({ label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex items-center min-h-[40px] -mx-2 px-2 text-sm text-white/78 transition-colors hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm leading-snug"
                  >
                    <span className="mr-2 text-[#E69138] text-[11px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap">
                      {label}
                    </span>
                    <span className="text-white/78">{value}</span>
                  </a>
                </li>
              ))}
            </ul>
            {/* Riferimenti (indirizzo + orari) — solo su md+ a destra, ma compatto anche su mobile */}
            <div className="mt-5 sm:mt-6 space-y-1.5 text-[13px] sm:text-sm text-white/60 leading-snug">
              <p>
                {siteConfig.addressLine1}
                <br />
                {siteConfig.addressLine2}
              </p>
              <p className="text-white/50">{siteConfig.hoursWeek}</p>
            </div>
          </div>

          {/* Note legali + copyright — col-span-2 su mobile */}
          <div className="col-span-2 pt-5 sm:pt-6 mt-4 sm:mt-6 border-t border-white/10 lg:col-span-3 lg:mt-0 lg:pt-0 lg:border-t-0">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-white/60">
              <Link to="/privacy" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                Privacy
              </Link>
              <span className="text-white/30" aria-hidden="true">•</span>
              <Link to="/cookie" className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm">
                Cookie
              </Link>
              <span className="text-white/30 hidden sm:inline" aria-hidden="true">•</span>
              <Link
                to="/note-legali"
                className="inline-flex items-center min-h-[40px] -mx-2 px-2 hover:text-[#E69138] transition-colors rounded-sm sm:ml-0 ml-1"
              >
                Note legali
              </Link>
            </div>
            <div
              className="mt-2 sm:mt-3 flex flex-col gap-1 text-xs text-white/45"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
            >
              <span>© {currentYear} {siteConfig.legalName}. Tutti i diritti riservati.</span>
              <span className="hidden sm:inline">{siteConfig.claim}</span>
              <a
                href={siteConfig.emailHref}
                className="inline-flex items-center max-w-max min-h-[32px] -mx-2 px-2 text-white/60 hover:text-white transition-colors rounded-sm"
              >
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
