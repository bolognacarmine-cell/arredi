import { useEffect } from "react"
import LegalPageLayout from "../components/LegalPageLayout"
import { resetCookieConsent } from "../components/CookieBanner"

const sections = [
  {
    title: "Cosa sono i cookie",
    paragraphs: [
      "I cookie sono piccoli file di testo che il sito può memorizzare nel browser dell'utente per migliorare navigazione, prestazioni e funzionalità.",
      "Alcuni cookie sono tecnici e necessari al corretto funzionamento del sito, mentre altri possono essere usati per statistiche anonime o funzionalità aggiuntive.",
    ],
  },
  {
    title: "Tipologie utilizzate",
    paragraphs: [
      "Il sito utilizza cookie tecnici necessari per il corretto funzionamento del sito (sessione, preferenze, autenticazione).",
      "Non vengono utilizzati cookie di profilazione o marketing senza il consenso esplicito dell'utente.",
      "Eventuali strumenti terzi integrati nel sito possono installare propri cookie secondo le rispettive policy, consultabili tramite i servizi esterni utilizzati.",
    ],
  },
  {
    title: "Tabella dei cookie utilizzati",
    paragraphs: [
      "Di seguito una tabella dettagliata dei cookie utilizzati dal sito:",
    ],
    table: (
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]">Nome</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]">Scopo</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]">Durata</th>
              <th className="text-left py-3 px-4 font-semibold text-[#1A1A2E]">Provider</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-[#1A1A2E]">cookie_consent_accepted</td>
              <td className="py-3 px-4 text-[#6B7280]">Memorizza il consenso dell'utente all'uso dei cookie</td>
              <td className="py-3 px-4 text-[#6B7280]">1 anno</td>
              <td className="py-3 px-4 text-[#6B7280]">Questo sito</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-[#1A1A2E]">farcom-projects</td>
              <td className="py-3 px-4 text-[#6B7280]">Memorizza le preferenze sui progetti visualizzati</td>
              <td className="py-3 px-4 text-[#6B7280]">Persistente</td>
              <td className="py-3 px-4 text-[#6B7280]">Questo sito</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: "Gestione del consenso",
    paragraphs: [
      "L'utente può gestire o disattivare i cookie direttamente dalle impostazioni del proprio browser, con la consapevolezza che alcune funzioni del sito potrebbero non essere più disponibili.",
      "La rimozione dei cookie già installati è possibile in qualsiasi momento dalle preferenze del browser o del dispositivo in uso.",
    ],
  },
  {
    title: "Come gestire i cookie nel browser",
    paragraphs: [
      "Per gestire o eliminare i cookie, segui le istruzioni specifiche per il tuo browser:",
      <ul key="browser-list" className="list-disc list-inside mt-2 space-y-1 text-[#6B7280]">
        <li><strong className="text-[#1A1A2E]">Chrome:</strong> Impostazioni &gt; Privacy e sicurezza &gt; Cookie e altri dati dei siti</li>
        <li><strong className="text-[#1A1A2E]">Firefox:</strong> Opzioni &gt; Privacy e sicurezza &gt; Cookie e dati dei siti</li>
        <li><strong className="text-[#1A1A2E]">Safari:</strong> Preferenze &gt; Privacy &gt; Gestire dati dei siti web</li>
        <li><strong className="text-[#1A1A2E]">Edge:</strong> Impostazioni &gt; Cookie e autorizzazioni del sito</li>
      </ul>,
    ],
  },
  {
    title: "Gestisci preferenze cookie",
    paragraphs: [
      "Puoi modificare le tue preferenze sui cookie in qualsiasi momento utilizzando il banner di consenso presente sul sito.",
      "Per ripristinare il banner di consenso e modificare la tua scelta, clicca sul pulsante qui sotto:",
    ],
    action: (
      <button
        onClick={resetCookieConsent}
        className="mt-4 px-6 py-2.5 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#1A1A2E] font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50"
      >
        Ripristina banner consenso
      </button>
    ),
  },
  {
    title: "Contatti per la privacy",
    paragraphs: [
      "Per qualsiasi domanda relativa alla presente Cookie Policy o al trattamento dei tuoi dati personali, puoi contattarci ai seguenti recapiti:",
      <div key="contact-info" className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2 text-[#6B7280]">
        <p><strong className="text-[#1A1A2E]">Email:</strong> privacy@farcom.it</p>
        <p><strong className="text-[#1A1A2E]">Sito web:</strong> www.farcom.it</p>
      </div>,
    ],
  },
] as const

export default function CookiePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 100)
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 300)
  }, [])

  return (
    <LegalPageLayout
      eyebrow="Cookie"
      title="Cookie Policy"
      intro="Questa pagina riassume le principali informazioni sull'uso di cookie e tecnologie simili durante la navigazione del sito."
      sections={sections}
    />
  )
}
