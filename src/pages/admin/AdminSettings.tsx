import { useState, useEffect } from "react"
import {
  defaultSiteSettings,
  fallbackSiteSettings,
  readSiteSettings,
  saveSiteSettings,
  saveSiteSettingsToProject,
  type SiteSettings,
} from "../../siteConfig"

const users = [
  { id: 1, nome: "Ugo", email: "admin@farcom.com", ruolo: "admin" },
  { id: 2, nome: "Giulia", email: "giulia@farcom.com", ruolo: "editor" },
  { id: 3, nome: "Sara", email: "sara@farcom.com", ruolo: "editor" },
  { id: 4, nome: "Anna", email: "anna@farcom.com", ruolo: "viewer" },
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

type SettingsTab = "generali" | "seo" | "email" | "sicurezza" | "backup" | "utenti"

// Email Settings Tab Component
function EmailSettingsTab() {
  const [smtpConfig, setSmtpConfig] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpFrom: '',
    smtpFromName: '',
    quoteNotificationEmail: ''
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Load existing SMTP configuration on mount
  useEffect(() => {
    async function loadSmtpConfig() {
      try {
        const response = await fetch('/api/site-config/smtp')
        if (response.ok) {
          const config = await response.json()
          setSmtpConfig({
            smtpHost: config.smtpHost || '',
            smtpPort: config.smtpPort || '',
            smtpUsername: config.smtpUsername || '', // Note: smtpUsername is write-only (sensitive), may not be returned
            smtpPassword: '', // Never load password from server for security (write-only)
            smtpFrom: config.smtpFrom || '',
            smtpFromName: config.smtpFromName || '',
            quoteNotificationEmail: config.quoteNotificationEmail || ''
          })
        }
      } catch (err) {
        console.error('Failed to load SMTP configuration:', err)
      }
    }
    loadSmtpConfig()
  }, [])

  const updateSmtpField = (key: keyof typeof smtpConfig, value: string) => {
    setSmtpConfig(current => ({ ...current, [key]: value }))
  }

  const handleSaveSmtpConfig = async () => {
    setLoading(true)
    setError('')
    
    // Frontend validation before sending to backend
    const requiredFields: { key: keyof typeof smtpConfig; label: string }[] = [
      { key: 'smtpHost', label: 'Host SMTP' },
      { key: 'smtpPort', label: 'Porta' },
      { key: 'smtpUsername', label: 'Username' },
      { key: 'smtpPassword', label: 'Password' },
      { key: 'smtpFrom', label: 'Email mittente' },
      { key: 'smtpFromName', label: 'Nome mittente' },
    ]

    const missingFields = requiredFields
      .filter(field => !smtpConfig[field.key] || smtpConfig[field.key].trim() === '')
      .map(field => field.label)

    if (missingFields.length > 0) {
      setError(`Compila i campi obbligatori: ${missingFields.join(', ')}`)
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/site-config/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpConfig),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save SMTP configuration')
      }

      // Reload configuration after successful save to verify persistence
      const reloadResponse = await fetch('/api/site-config/smtp')
      if (reloadResponse.ok) {
        const config = await reloadResponse.json()
        setSmtpConfig({
          smtpHost: config.smtpHost || '',
          smtpPort: config.smtpPort || '',
          smtpUsername: smtpConfig.smtpUsername, // Keep current username (write-only)
          smtpPassword: '', // Always clear password after save (write-only)
          smtpFrom: config.smtpFrom || '',
          smtpFromName: config.smtpFromName || '',
          quoteNotificationEmail: config.quoteNotificationEmail || ''
        })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save SMTP configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/site-config/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to send test email'
        throw new Error(errorMessage)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test email'
      
      // Provide specific guidance based on error type
      let userMessage = errorMessage
      if (errorMessage.includes('autenticazione')) {
        userMessage = `${errorMessage} Controlla che username e password siano corretti.`
      } else if (errorMessage.includes('connettersi')) {
        userMessage = `${errorMessage} Verifica che host e porta siano corretti e che il server sia accessibile.`
      } else if (errorMessage.includes('incompleta')) {
        userMessage = `${errorMessage} Compila tutti i campi obbligatori nella configurazione SMTP.`
      } else if (errorMessage.includes('TLS') || errorMessage.includes('SSL')) {
        userMessage = `${errorMessage} Verifica che la porta sia corretta (587 per TLS, 465 per SSL).`
      }
      
      setError(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDebugConfig = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/site-config/smtp/debug')
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
        setShowDebug(true)
      } else {
        throw new Error('Failed to fetch debug information')
      }
    } catch (err) {
      setError('Impossibile recuperare le informazioni di debug')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border border-[#DDD9D0] bg-[#F7F5F0] p-4 text-sm text-[#4A4A46]">
        Configurazione invio email per notifiche preventivi e contatti. 
        Username e password SMTP vengono salvati in modo sicuro e non vengono mostrati nel frontend (write-only).
        Dopo il salvataggio, questi campi appariranno vuoti ma la configurazione rimarrà attiva.
      </div>
      <div className="space-y-6 border border-[#DDD9D0] bg-white p-6">
        <div>
          <h2 className="font-display text-2xl font-light text-[#1A1A18]">
            Configurazione SMTP
          </h2>
          <p className="mt-1 text-sm text-[#888580]">
            Imposta il server SMTP per l'invio automatico delle email di notifica preventivi.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Host SMTP
            </label>
            <input
              type="text"
              value={smtpConfig.smtpHost}
              onChange={(e) => updateSmtpField('smtpHost', e.target.value)}
              placeholder="smtp.example.com"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Porta
            </label>
            <input
              type="number"
              value={smtpConfig.smtpPort}
              onChange={(e) => updateSmtpField('smtpPort', e.target.value)}
              placeholder="587"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Username
            </label>
            <input
              type="text"
              value={smtpConfig.smtpUsername}
              onChange={(e) => updateSmtpField('smtpUsername', e.target.value)}
              placeholder="noreply@farcom.com"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#888580]">Username è salvato in modo sicuro e non viene mostrato dopo il salvataggio</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Password
            </label>
            <input
              type="password"
              value={smtpConfig.smtpPassword}
              onChange={(e) => updateSmtpField('smtpPassword', e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#888580]">Password è salvata in modo sicuro e non viene mai mostrata (write-only)</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Email mittente
            </label>
            <input
              type="email"
              value={smtpConfig.smtpFrom}
              onChange={(e) => updateSmtpField('smtpFrom', e.target.value)}
              placeholder="noreply@farcom.com"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Nome mittente
            </label>
            <input
              type="text"
              value={smtpConfig.smtpFromName}
              onChange={(e) => updateSmtpField('smtpFromName', e.target.value)}
              placeholder="Farcom Arredi"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
              Email notifiche preventivi (opzionale)
            </label>
            <input
              type="email"
              value={smtpConfig.quoteNotificationEmail}
              onChange={(e) => updateSmtpField('quoteNotificationEmail', e.target.value)}
              placeholder="owner@farcom.com (lascia vuoto per usare farcomsrl@hotmail.com)"
              className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 border-t border-[#EAE7E0] pt-4">
          <button
            onClick={handleSaveSmtpConfig}
            disabled={loading}
            className="bg-[#1B4332] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvataggio...' : saved ? '✓ Salvato' : 'Salva configurazione SMTP'}
          </button>
          <button
            onClick={handleSendTestEmail}
            disabled={loading}
            className="border border-[#DDD9D0] px-6 py-2.5 text-sm font-medium text-[#1A1A18] transition-colors hover:border-[#1B4332] hover:text-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Invio in corso...' : 'Invia email di test'}
          </button>
          <button
            onClick={handleDebugConfig}
            disabled={loading}
            className="border border-[#DDD9D0] px-6 py-2.5 text-sm font-medium text-[#1A1A18] transition-colors hover:border-[#1B4332] hover:text-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Debug configurazione
          </button>
        </div>
        {error && (
          <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        {showDebug && debugInfo && (
          <div className="text-sm border border-blue-200 bg-blue-50 p-3 rounded">
            <div className="font-medium mb-2">Informazioni di debug configurazione SMTP:</div>
            <div className="space-y-1">
              <div>Host: {debugInfo.configuration.smtpHost?.value || 'Non configurato'} ({debugInfo.configuration.smtpHost?.configured ? '✓' : '✗'})</div>
              <div>Porta: {debugInfo.configuration.smtpPort?.value || 'Non configurato'} ({debugInfo.configuration.smtpPort?.configured ? '✓' : '✗'})</div>
              <div>Username: {debugInfo.configuration.smtpUsername?.configured ? '✓ Configurato' : '✗ Non configurato'}</div>
              <div>Password: {debugInfo.configuration.smtpPassword?.configured ? '✓ Configurata' : '✗ Non configurata'}</div>
              <div>Email mittente: {debugInfo.configuration.smtpFrom?.value || 'Non configurato'} ({debugInfo.configuration.smtpFrom?.configured ? '✓' : '✗'})</div>
              <div>Nome mittente: {debugInfo.configuration.smtpFromName?.value || 'Non configurato'} ({debugInfo.configuration.smtpFromName?.configured ? '✓' : '✗'})</div>
              <div>Email notifiche: {debugInfo.configuration.quoteNotificationEmail?.value || 'Non configurato'} ({debugInfo.configuration.quoteNotificationEmail?.configured ? '✓' : '✗'})</div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                Configurazione completa: {debugInfo.complete ? '✓ Sì' : '✗ No'}
              </div>
              <div className="text-xs text-gray-500">
                Timestamp: {new Date(debugInfo.timestamp).toLocaleString('it-IT')}
              </div>
            </div>
            <button
              onClick={() => setShowDebug(false)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Chiudi debug
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("generali")
  const [form, setForm] = useState<SiteSettingsFormState>(() =>
    toFormState(readSiteSettings()),
  )
  const [saved, setSaved] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusTone, setStatusTone] = useState<"success" | "warning">("success")

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
        {(["generali", "seo", "email", "sicurezza", "backup", "utenti"] as const).map((tab) => {
          const tabLabels: Record<string, string> = {
            generali: "Generali",
            seo: "SEO",
            email: "Email",
            sicurezza: "Sicurezza",
            backup: "Backup",
            utenti: "Utenti"
          }
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "border-[#1B4332] text-[#1B4332]"
                  : "border-transparent text-[#888580] hover:text-[#1A1A18]"
              }`}
            >
              {tabLabels[tab] || tab}
            </button>
          )
        })}
      </div>

      {activeTab === "generali" && (
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

      {activeTab === "seo" && (
        <div className="max-w-4xl space-y-6">
          <div className="border border-[#DDD9D0] bg-[#F7F5F0] p-4 text-sm text-[#4A4A46]">
            Configurazione SEO globale del sito. Questi valori vengono utilizzati nei meta tag delle pagine.
          </div>
          <div className="space-y-6 border border-[#DDD9D0] bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-light text-[#1A1A18]">
                Meta tag globali
              </h2>
              <p className="mt-1 text-sm text-[#888580]">
                Titolo e descrizione predefiniti per le pagine senza configurazione specifica.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
                Meta title predefinito
              </label>
              <input
                type="text"
                placeholder="Farcom - Arredamenti su misura"
                className="w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-[#888580]">
                Meta description predefinita
              </label>
              <textarea
                rows={3}
                placeholder="Descrizione del sito per i motori di ricerca"
                maxLength={160}
                className="w-full resize-none border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-2.5 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none"
              />
            </div>
            <div className="flex gap-3 border-t border-[#EAE7E0] pt-4">
              <button className="bg-[#1B4332] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#143326]">
                Salva impostazioni SEO
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "email" && (
        <EmailSettingsTab />
      )}

      {activeTab === "sicurezza" && (
        <div className="max-w-4xl space-y-6">
          <div className="border border-[#DDD9D0] bg-[#F7F5F0] p-4 text-sm text-[#4A4A46]">
            Impostazioni di sicurezza del pannello admin.
          </div>
          <div className="space-y-6 border border-[#DDD9D0] bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-light text-[#1A1A18]">
                Autenticazione
              </h2>
              <p className="mt-1 text-sm text-[#888580]">
                Configura le opzioni di accesso al pannello.
              </p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#EAE7E0]">
              <div>
                <p className="font-medium text-[#1A1A18]">Autenticazione a due fattori (2FA)</p>
                <p className="text-sm text-[#888580]">Richiede codice OTP aggiuntivo per l'accesso</p>
              </div>
              <button className="px-4 py-2 text-sm border border-[#DDD9D0] rounded hover:border-[#1B4332] transition-colors">
                Configura
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#EAE7E0]">
              <div>
                <p className="font-medium text-[#1A1A18]">Timeout sessione</p>
                <p className="text-sm text-[#888580]">Disconnessione automatica dopo inattività</p>
              </div>
              <select className="px-4 py-2 text-sm border border-[#DDD9D0] rounded bg-white focus:border-[#1B4332] focus:outline-none">
                <option>15 minuti</option>
                <option>30 minuti</option>
                <option>1 ora</option>
                <option>4 ore</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-[#1A1A18]">Log accessi</p>
                <p className="text-sm text-[#888580]">Registra tutti gli accessi al pannello</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1B4332]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === "backup" && (
        <div className="max-w-4xl space-y-6">
          <div className="border border-[#DDD9D0] bg-[#F7F5F0] p-4 text-sm text-[#4A4A46]">
            Gestione backup e ripristino dei dati del sito.
          </div>
          <div className="space-y-6 border border-[#DDD9D0] bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-light text-[#1A1A18]">
                Backup automatici
              </h2>
              <p className="mt-1 text-sm text-[#888580]">
                Configura la frequenza dei backup automatici dei dati.
              </p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#EAE7E0]">
              <div>
                <p className="font-medium text-[#1A1A18]">Backup giornaliero</p>
                <p className="text-sm text-[#888580]">Salvataggio automatico ogni 24 ore</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1B4332]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B4332]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#EAE7E0]">
              <div>
                <p className="font-medium text-[#1A1A18]">Ultimo backup</p>
                <p className="text-sm text-[#888580]">Mai eseguito</p>
              </div>
              <button className="px-4 py-2 text-sm bg-[#1B4332] text-white rounded hover:bg-[#143326] transition-colors">
                Crea backup ora
              </button>
            </div>
            <div>
              <h3 className="font-medium text-[#1A1A18] mb-3">Ripristino</h3>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm border border-[#DDD9D0] rounded hover:border-[#1B4332] transition-colors">
                  Carica backup
                </button>
                <button className="px-4 py-2 text-sm border border-[#DDD9D0] rounded hover:border-[#1B4332] transition-colors">
                  Ripristina default
                </button>
              </div>
            </div>
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
