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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 md:px-8 lg:px-16 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="inline-flex items-center min-h-[44px]">
              <img
                src="/logo-farcom.png"
                alt={siteConfig.logoAlt}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 sm:mt-6 max-w-xl text-sm leading-[1.65] sm:leading-relaxed text-white/68 md:text-base">
              {siteConfig.footerDescription}
            </p>

            <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
              {siteConfig.footerBadges.map((item) => (
                <span
                  key={item}
                  className="border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/72 min-h-[32px] inline-flex items-center"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/42">
              Riferimenti
            </h3>

            <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 text-sm text-white/78 leading-[1.6]">
              <p>
                {siteConfig.addressLine1}
                <br />
                {siteConfig.addressLine2}
              </p>
              <p>{siteConfig.hoursWeek}</p>
              <p>{siteConfig.hoursExtra}</p>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[44px] border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/76 transition-colors hover:border-[#E69138] hover:text-[#E69138] rounded-sm"
                >
                  {icon}
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/42">
              Settori
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-1 sm:space-y-1.5">
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
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/42">
              Azienda
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-1 sm:space-y-1.5">
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

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/42">
              Contatti
            </h3>
            <div className="mt-4 sm:mt-5 grid gap-2.5 sm:gap-3">
              {footerContactLinks.map(({ label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col justify-center min-h-[48px] border border-white/10 bg-white/[0.04] px-3 py-2 transition-colors hover:border-[#E69138]/50 hover:bg-white/[0.06]"
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E69138]">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/88 transition-colors group-hover:text-white">
                    {value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-xs text-white/48 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-16" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
          <span>
            © {currentYear} {siteConfig.legalName}. Tutti i diritti riservati.
          </span>
          <div className="flex flex-col gap-2 text-left lg:flex-row lg:gap-6 lg:text-right">
            <span>{siteConfig.claim}</span>
            <a
              href={siteConfig.emailHref}
              className="inline-flex items-center min-h-[36px] -mx-2 px-2 transition-colors hover:text-white self-start sm:self-auto rounded-sm"
            >
              {siteConfig.email}
            </a>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Link to="/privacy" className="inline-flex items-center min-h-[40px] -mx-2 px-2 transition-colors hover:text-white rounded-sm">
                Privacy
              </Link>
              <Link to="/cookie" className="inline-flex items-center min-h-[40px] -mx-2 px-2 transition-colors hover:text-white rounded-sm">
                Cookie
              </Link>
              <Link
                to="/note-legali"
                className="inline-flex items-center min-h-[40px] -mx-2 px-2 transition-colors hover:text-white rounded-sm"
              >
                Note legali
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
