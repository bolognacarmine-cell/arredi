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
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#E69138]">
              {siteConfig.brandName}
            </p>
            <h2 className="font-display text-3xl font-light text-white md:text-4xl">
              Hai un progetto da arredare?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/68 md:text-base">
              {siteConfig.footerIntro}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/preventivo"
              className="inline-flex items-center justify-center bg-[#E69138] px-6 py-3 text-sm font-semibold text-[#1A1A2E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0a14b] hover:shadow-lg hover:shadow-[#E69138]/20"
            >
              Richiedi preventivo
            </Link>
            <a
              href={siteConfig.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[#25D366] hover:text-[#25D366]"
            >
              {siteConfig.whatsappLabel}
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-8 lg:px-16 lg:py-18">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/logo-farcom.png"
                alt={siteConfig.logoAlt}
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/68 md:text-base">
              {siteConfig.footerDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {siteConfig.footerBadges.map((item) => (
                <span
                  key={item}
                  className="border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/72"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {footerContactLinks.map(({ label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-[#E69138]/50 hover:bg-white/[0.06]"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E69138]">
                    {label}
                  </span>
                  <span className="mt-2 block text-sm text-white/88 transition-colors group-hover:text-white">
                    {value}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 lg:col-start-7">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
              Settori
            </h3>
            <ul className="mt-5 space-y-3">
              {sectorLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/78 transition-colors hover:text-[#E69138]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
              Azienda
            </h3>
            <ul className="mt-5 space-y-3">
              {companyLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/78 transition-colors hover:text-[#E69138]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
              Riferimenti
            </h3>

            <div className="mt-5 space-y-4 text-sm text-white/78">
              <p>
                {siteConfig.addressLine1}
                <br />
                {siteConfig.addressLine2}
              </p>
              <p>{siteConfig.hoursWeek}</p>
              <p>{siteConfig.hoursExtra}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/76 transition-colors hover:border-[#E69138] hover:text-[#E69138]"
                >
                  {icon}
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-xs text-white/48 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <span>
            © {currentYear} {siteConfig.legalName}. Tutti i diritti riservati.
          </span>
          <div className="flex flex-col gap-1 text-left lg:flex-row lg:gap-6 lg:text-right">
            <span>{siteConfig.claim}</span>
            <a
              href={siteConfig.emailHref}
              className="transition-colors hover:text-white"
            >
              {siteConfig.email}
            </a>
            <div className="flex flex-wrap gap-4">
              <Link to="/privacy" className="transition-colors hover:text-white">
                Privacy
              </Link>
              <Link to="/cookie" className="transition-colors hover:text-white">
                Cookie
              </Link>
              <Link
                to="/note-legali"
                className="transition-colors hover:text-white"
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
