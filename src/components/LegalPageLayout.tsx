import { Link } from "react-router-dom"
import { useSiteSettings } from "../siteConfig"

type LegalSection = {
  title: string
  paragraphs: string[]
}

type LegalPageLayoutProps = {
  eyebrow: string
  title: string
  intro: string
  sections: LegalSection[]
}

export default function LegalPageLayout({
  eyebrow,
  title,
  intro,
  sections,
}: LegalPageLayoutProps) {
  const siteSettings = useSiteSettings()

  return (
    <div className="min-h-screen bg-[#F7F5F0] pt-24">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-[#888580] transition-colors hover:text-[#1B4332]"
        >
          ← Torna alla home
        </Link>

        <div className="mt-8 border-b border-[#DDD9D0] pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B5965A]">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-4xl font-light text-[#1A1A18] lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#4A4A46] md:text-base">
            {intro}
          </p>
          <div className="mt-5 text-xs text-[#888580]">
            Titolare del sito: {siteSettings.legalName} · Contatto:
            {" "}
            <a
              href={siteSettings.emailHref}
              className="transition-colors hover:text-[#1B4332]"
            >
              {siteSettings.email}
            </a>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border border-[#DDD9D0] bg-white p-6 md:p-8"
            >
              <h2 className="font-display text-2xl font-light text-[#1A1A18]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#4A4A46] md:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
