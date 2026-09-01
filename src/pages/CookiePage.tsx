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
      "Il sito puo utilizzare cookie tecnici di sessione, preferenze locali del browser e strumenti di memorizzazione necessari a mantenere alcune impostazioni utente durante la navigazione.",
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
] as const

export default function CookiePage() {
  return (
    <LegalPageLayout
      eyebrow="Cookie"
      title="Cookie Policy"
      intro="Questa pagina riassume le principali informazioni sull'uso di cookie e tecnologie simili durante la navigazione del sito."
      sections={sections}
    />
  )
}
