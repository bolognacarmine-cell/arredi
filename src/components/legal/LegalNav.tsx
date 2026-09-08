import { Link, useLocation } from "react-router-dom"
import { legalConfig } from "../../siteConfig"

export default function LegalNav() {
  const location = useLocation()

  const navItems = [
    { label: "Privacy Policy", to: legalConfig.links.privacyPolicy },
    { label: "Cookie Policy", to: legalConfig.links.cookiePolicy },
    { label: "Note legali", to: legalConfig.links.legalNotes },
  ] as const

  return (
    <nav className="mb-8 border-b border-[#DDD9D0] pb-6" aria-label="Navigazione pagine legali">
      <ul className="flex flex-wrap gap-6 text-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`transition-colors ${
                  isActive
                    ? "font-semibold text-[#1B4332]"
                    : "text-[#4A4A46] hover:text-[#1B4332]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}