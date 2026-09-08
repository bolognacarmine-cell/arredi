import { useEffect } from "react"
import LegalPageLayout from "../components/LegalPageLayout"

const sections = [
  {
    title: "Cosa sono i cookie",
    paragraphs: [
      "I cookie sono piccoli file di testo che il sito puo memorizzare nel browser dell'utente per migliorare navigazione, prestazioni e funzionalita.",
      "Alcuni cookie sono tecnici e necessari al corretto funzionamento del sito, mentre altri possono essere usati per statistiche anonime o funzionalita aggiuntive.",
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
    title: "Gestione del consenso",
    paragraphs: [
      "L'utente puo gestire o disattivare i cookie direttamente dalle impostazioni del proprio browser, con la consapevolezza che alcune funzioni del sito potrebbero non essere piu disponibili.",
      "La rimozione dei cookie gia installati e possibile in qualsiasi momento dalle preferenze del browser o del dispositivo in uso.",
    ],
  },
  {
    title: "Gestisci preferenze cookie",
    paragraphs: [
      "Per gestire le preferenze sui cookie, utilizza il banner di consenso presente sul sito o le impostazioni del tuo browser.",
      "TODO: integrare con CMP reale per la gestione granulare delle preferenze cookie.",
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
