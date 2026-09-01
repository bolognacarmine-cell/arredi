import { useEffect, useState } from "react"
import persistedSiteSettings from "./siteSettings.json"

export type SiteSettings = {
  brandName: string
  legalName: string
  logoAlt: string
  claim: string
  footerIntro: string
  footerDescription: string
  footerBadges: string[]
  addressLine1: string
  addressLine2: string
  hoursWeek: string
  hoursExtra: string
  phone: string
  phoneHref: string
  whatsapp: string
  whatsappHref: string
  whatsappLabel: string
  email: string
  emailHref: string
  instagramHref: string
  facebookHref: string
  mapEmbedSrc: string
  mapTitle: string
}

const SITE_SETTINGS_STORAGE_KEY = "farcom-site-settings"
const SITE_SETTINGS_EVENT = "farcom-site-settings-updated"
const SITE_SETTINGS_API_PATH = "/__admin/site-settings"

export const fallbackSiteSettings: SiteSettings = {
  brandName: "Farcom Arredi",
  legalName: "Farcom Srl",
  logoAlt: "Farcom Società Cooperativa",
  claim: "Arredi su misura per spazi professionali",
  footerIntro:
    "Ti aiutiamo a trasformare l'idea in uno spazio su misura, funzionale e riconoscibile per il tuo business.",
  footerDescription:
    "Progettiamo e realizziamo arredi su misura per barbieri, uffici, negozi e scuole. Seguiamo ogni fase, dal concept iniziale alla consegna finale, con attenzione ai dettagli e alla funzionalità.",
  footerBadges: ["Su misura", "Produzione dedicata", "Supporto diretto"],
  addressLine1: "Via P. Vertaldi, 27",
  addressLine2: "81050 Macerata Campania (CE)",
  hoursWeek: "Lun-Ven 9:00-13:00 / 15:00-19:00",
  hoursExtra: "Sabato su appuntamento",
  phone: "+39 0823 694427",
  phoneHref: "tel:+390823694427",
  whatsapp: "+39 329 4576079",
  whatsappHref: "https://wa.me/393294576079",
  whatsappLabel: "Scrivici su WhatsApp",
  email: "farcomsrl@hotmail.com",
  emailHref: "mailto:farcomsrl@hotmail.com",
  instagramHref: "https://www.instagram.com/farcom_arredi/",
  facebookHref: "https://www.facebook.com/p/Farcom-arredi-100054867935352/",
  mapEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2377.884846634837!2d14.286448674946657!3d41.05604271648417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133a557cd580ba03%3A0x1f2981eb342f4283!2sVia%20P.%20Vertaldi%2C%2027%2C%2081050%20Macerata%20Campania%20CE!5e1!3m2!1sit!2sit!4v1788194375937!5m2!1sit!2sit",
  mapTitle: "Farcom Srl - Via P. Vertaldi, 27 Macerata Campania",
}

function normalizeSiteSettings(
  partialSettings: Partial<SiteSettings> | undefined,
): SiteSettings {
  return {
    ...fallbackSiteSettings,
    ...partialSettings,
    footerBadges:
      partialSettings?.footerBadges && partialSettings.footerBadges.length > 0
        ? partialSettings.footerBadges
        : fallbackSiteSettings.footerBadges,
  }
}

export const defaultSiteSettings: SiteSettings =
  normalizeSiteSettings(persistedSiteSettings)

export const sectorLinks = [
  { label: "Barbieri & Parrucchieri", to: "/settori/barbieri" },
  { label: "Uffici", to: "/settori/uffici" },
  { label: "Negozi", to: "/settori/negozi" },
  { label: "Scuole", to: "/settori/scuole" },
] as const

export const companyLinks = [
  { label: "Chi siamo", to: "/chi-siamo" },
  { label: "Progetti", to: "/progetti" },
  { label: "Preventivo", to: "/preventivo" },
  { label: "Contatti", to: "/contatti" },
  { label: "Area Admin", to: "/admin" },
] as const

export function readSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSiteSettings

  try {
    const storedValue = window.localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)
    if (!storedValue) return defaultSiteSettings

    const parsed = JSON.parse(storedValue) as Partial<SiteSettings>
    return normalizeSiteSettings(parsed)
  } catch {
    return defaultSiteSettings
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  window.dispatchEvent(new CustomEvent(SITE_SETTINGS_EVENT))
}

export function resetSiteSettings() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(SITE_SETTINGS_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(SITE_SETTINGS_EVENT))
}

export async function saveSiteSettingsToProject(settings: SiteSettings) {
  const response = await fetch(SITE_SETTINGS_API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Salvataggio progetto non riuscito.")
  }

  return (await response.json()) as {
    ok: true
    filePath: string
    backupPath: string | null
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => readSiteSettings())

  useEffect(() => {
    const syncSettings = () => setSettings(readSiteSettings())

    window.addEventListener(SITE_SETTINGS_EVENT, syncSettings)
    window.addEventListener("storage", syncSettings)

    return () => {
      window.removeEventListener(SITE_SETTINGS_EVENT, syncSettings)
      window.removeEventListener("storage", syncSettings)
    }
  }, [])

  return settings
}

export function getFooterContactLinks(settings: SiteSettings) {
  return [
    {
      label: "Telefono",
      value: settings.phone,
      href: settings.phoneHref,
    },
    {
      label: "WhatsApp",
      value: settings.whatsapp,
      href: settings.whatsappHref,
      external: true,
    },
    {
      label: "Email",
      value: settings.email,
      href: settings.emailHref,
    },
  ] as const
}

export function getContactInfoCards(settings: SiteSettings) {
  return [
    {
      label: "Indirizzo",
      entries: [
        { text: settings.addressLine1 },
        { text: settings.addressLine2 },
      ],
    },
    {
      label: "Telefono",
      entries: [
        { text: settings.phone, href: settings.phoneHref },
        {
          text: `${settings.whatsapp} (WhatsApp)`,
          href: settings.whatsappHref,
          external: true,
        },
      ],
    },
    {
      label: "Email",
      entries: [{ text: settings.email, href: settings.emailHref }],
    },
    {
      label: "Orari",
      entries: [{ text: settings.hoursWeek }, { text: settings.hoursExtra }],
    },
  ] as const
}

export function getSocialLinks(settings: SiteSettings) {
  return [
    {
      label: "Instagram",
      href: settings.instagramHref,
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: settings.facebookHref,
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ] as const
}
