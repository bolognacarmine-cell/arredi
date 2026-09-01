import { useState } from "react"
import {
  defaultSiteSettings,
  fallbackSiteSettings,
  readSiteSettings,
  saveSiteSettings,
  saveSiteSettingsToProject,
  type SiteSettings,
} from "../../siteConfig"

const users = [
  { id: 1, nome: "Marco Ferretti", email: "marco@artigianalegno.it", ruolo: "admin" },
  { id: 2, nome: "Giulia Ferretti", email: "giulia@artigianalegno.it", ruolo: "editor" },
  { id: 3, nome: "Sara Moretti", email: "sara@artigianalegno.it", ruolo: "editor" },
  { id: 4, nome: "Anna Conti", email: "anna@artigianalegno.it", ruolo: "viewer" },
]

const roleColor: Record<string, string> = {
  admin: "bg-[#1B4332] text-white",
  editor: "bg-amber-100 text-amber-700",
  viewer: "bg-gray-100 text-gray-600",
}

type SiteSettingsFormState = {
  brandName: string
  legalName: string
  logoAlt: string
  claim: string
  phone: string
  whatsapp: string
  whatsappLabel: string
  email: string
  instagramHref: string
  facebookHref: string
  addressLine1: string
  addressLine2: string
  hoursWeek: string
  hoursExtra: string
  footerIntro: string
  footerDescription: string
  footerBadgesText: string
  mapTitle: string
  mapEmbedSrc: string
}

function toFormState(settings: SiteSettings): SiteSettingsFormState {
  return {
    brandName: settings.brandName,
    legalName: settings.legalName,
    logoAlt: settings.logoAlt,
    claim: settings.claim,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    whatsappLabel: settings.whatsappLabel,
    email: settings.email,
    instagramHref: settings.instagramHref,
    facebookHref: settings.facebookHref,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    hoursWeek: settings.hoursWeek,
    hoursExtra: settings.hoursExtra,
    footerIntro: settings.footerIntro,
    footerDescription: settings.footerDescription,
    footerBadgesText: settings.footerBadges.join(", "),
    mapTitle: settings.mapTitle,
    mapEmbedSrc: settings.mapEmbedSrc,
  }
}

function normalizePhoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`
}

function normalizeWhatsappHref(whatsapp: string) {
  const digits = whatsapp.replace(/[^\d]/g, "")
  return `https://wa.me/${digits}`
}

function normalizeEmailHref(email: string) {
  return `mailto:${email.trim()}`
}

function toSiteSettings(form: SiteSettingsFormState): SiteSettings {
  const footerBadges = form.footerBadgesText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    brandName: form.brandName.trim(),
    legalName: form.legalName.trim(),
    logoAlt: form.logoAlt.trim(),
    claim: form.claim.trim(),
    footerIntro: form.footerIntro.trim(),
    footerDescription: form.footerDescription.trim(),
    footerBadges:
      footerBadges.length > 0 ? footerBadges : defaultSiteSettings.footerBadges,
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim(),
    hoursWeek: form.hoursWeek.trim(),
    hoursExtra: form.hoursExtra.trim(),
    phone: form.phone.trim(),
    phoneHref: normalizePhoneHref(form.phone),
    whatsapp: form.whatsapp.trim(),
    whatsappHref: normalizeWhatsappHref(form.whatsapp),
    whatsappLabel: form.whatsappLabel.trim(),
    email: form.email.trim(),
    emailHref: normalizeEmailHref(form.email),
    instagramHref: form.instagramHref.trim(),
    facebookHref: form.facebookHref.trim(),
    mapEmbedSrc: form.mapEmbedSrc.trim(),
    mapTitle: form.mapTitle.trim(),
  }
}

const generalFields = [
  { key: "brandName", label: "Nome brand", type: "text" },
  { key: "legalName", label: "Ragione sociale", type: "text" },
  { key: "logoAlt", label: "Testo alternativo logo", type: "text" },
  { key: "claim", label: "Claim sito", type: "text" },
  { key: "phone", label: "Telefono sito", type: "tel" },
  { key: "whatsapp", label: "Numero WhatsApp", type: "tel" },
  { key: "whatsappLabel", label: "Etichetta pulsante WhatsApp", type: "text" },
  { key: "email", label: "Email contatti", type: "email" },
  { key: "instagramHref", label: "Link Instagram", type: "url" },
  { key: "facebookHref", label: "Link Facebook", type: "url" },
  { key: "addressLine1", label: "Indirizzo riga 1", type: "text" },
  { key: "addressLine2", label: "Indirizzo riga 2", type: "text" },
  { key: "hoursWeek", label: "Orari feriali", type: "text" },
  { key: "hoursExtra", label: "Orari extra", type: "text" },
  { key: "footerBadgesText", label: "Badge footer", type: "text" },
  { key: "mapTitle", label: "Titolo mappa", type: "text" },
] as const satisfies ReadonlyArray<{
  key: keyof SiteSettingsFormState
  label: string
  type: string
}>

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"generale" | "utenti">("generale")
  const [saved, setSaved] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusTone, setStatusTone] = useState<"success" | "warning">("success")
  const [form, setForm] = useState<SiteSettingsFormState>(() =>
    toFormState(readSiteSettings()),
  )

  const updateField = (key: keyof SiteSettingsFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const showSavedState = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const showStatus = (message: string, tone: "success" | "warning") => {
    setStatusMessage(message)
    setStatusTone(tone)
  }

  const handleSave = async () => {
    const settings = toSiteSettings(form)

    try {
      await saveSiteSettingsToProject(settings)
      saveSiteSettings(settings)
      showStatus(
        "Salvato nel progetto e sincronizzato nel browser corrente.",
        "success",
      )
    } catch {
      saveSiteSettings(settings)
      showStatus(
        "Endpoint progetto non disponibile: impostazioni salvate solo in questo browser.",
        "warning",
      )
    }

    showSavedState()
  }

  const handleReset = async () => {
    const resetValues = fallbackSiteSettings

    setForm(toFormState(resetValues))

    try {
      await saveSiteSettingsToProject(resetValues)
      saveSiteSettings(resetValues)
      showStatus(
        "Ripristino completato e salvato nel progetto.",
        "success",
      )
    } catch {
      saveSiteSettings(resetValues)
      showStatus(
        "Ripristino applicato solo in locale: il progetto non era scrivibile.",
        "warning",
      )
    }

    showSavedState()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-light text-[#1A1A18]">
          Impostazioni
        </h1>
      </div>

      <div className="mb-6 flex gap-1 border-b border-[#DDD9D0]">
        {(["generale", "utenti"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab
                ? "border-[#1B4332] text-[#1B4332]"
                : "border-transparent text-[#888580] hover:text-[#1A1A18]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "generale" && (
        <div className="max-w-4xl space-y-6">
          <div className="border border-[#DDD9D0] bg-[#F7F5F0] p-4 text-sm text-[#4A4A46]">
            In sviluppo le impostazioni vengono salvate anche su file del
            progetto con backup automatico. Se il filesystem non e scrivibile,
            il form usa il fallback locale nel browser.
          </div>

          <div className="space-y-6 border border-[#DDD9D0] bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-light text-[#1A1A18]">
                Contenuti sito
              </h2>
              <p className="mt-1 text-sm text-[#888580]">
                Modifica testi, contatti, social e riferimenti del footer e
                della pagina contatti.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {generalFields.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
                Intro footer
              </label>
              <textarea
                rows={3}
                value={form.footerIntro}
                onChange={(e) => updateField("footerIntro", e.target.value)}
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
                Descrizione footer
              </label>
              <textarea
                rows={4}
                value={form.footerDescription}
                onChange={(e) =>
                  updateField("footerDescription", e.target.value)
                }
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
                URL embed Google Maps
              </label>
              <textarea
                rows={4}
                value={form.mapEmbedSrc}
                onChange={(e) => updateField("mapEmbedSrc", e.target.value)}
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EAE7E0] pt-2 sm:flex-row">
              <button
                onClick={handleSave}
                className="bg-[#1B4332] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#143326]"
              >
                {saved ? "✓ Salvato" : "Salva impostazioni"}
              </button>
              <button
                onClick={handleReset}
                className="border border-[#DDD9D0] px-6 py-2.5 text-sm font-medium text-[#1A1A18] transition-colors hover:border-[#1B4332] hover:text-[#1B4332]"
              >
                Ripristina default
              </button>
            </div>

            {statusMessage && (
              <div
                className={`text-sm ${
                  statusTone === "success"
                    ? "text-[#1B4332]"
                    : "text-amber-700"
                }`}
              >
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "utenti" && (
        <div className="max-w-3xl">
          <div className="mb-4 overflow-hidden border border-[#DDD9D0] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDD9D0] bg-[#F7F5F0] text-xs uppercase tracking-wide text-[#888580]">
                  <th className="px-5 py-3 text-left">Utente</th>
                  <th className="hidden px-5 py-3 text-left sm:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left">Ruolo</th>
                  <th className="px-5 py-3 text-left">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-[#EAE7E0] hover:bg-[#F7F5F0]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-xs font-medium text-white">
                          {user.nome
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium text-[#1A1A18]">
                          {user.nome}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-xs text-[#888580] sm:table-cell">
                      {user.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleColor[user.ruolo]}`}
                      >
                        {user.ruolo}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="mr-3 text-xs text-[#888580] transition-colors hover:text-[#1B4332]">
                        Modifica
                      </button>
                      {user.ruolo !== "admin" && (
                        <button className="text-xs text-red-400 transition-colors hover:text-red-600">
                          Rimuovi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#143326]">
            + Invita utente
          </button>
        </div>
      )}
    </div>
  )
}
