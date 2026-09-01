import LegalPageLayout from "../components/LegalPageLayout"

const sections = [
  {
    title: "Proprieta dei contenuti",
    paragraphs: [
      "Testi, layout, immagini, elementi grafici, marchi e materiali pubblicati sul sito sono riservati e non possono essere copiati, distribuiti o riutilizzati senza autorizzazione.",
      "Restano salvi eventuali diritti di terzi sui contenuti conferiti o sulle immagini usate per finalita illustrative o redazionali.",
    ],
  },
  {
    title: "Limitazione di responsabilita",
    paragraphs: [
      "Le informazioni presenti sul sito hanno finalita informative e commerciali generali e possono essere aggiornate, corrette o rimosse senza preavviso.",
      "Il titolare non garantisce l'assenza assoluta di errori materiali, interruzioni di servizio o incompatibilita tecniche derivanti da browser, dispositivi o servizi esterni.",
    ],
  },
  {
    title: "Link esterni e contatti",
    paragraphs: [
      "Il sito puo contenere collegamenti verso piattaforme esterne, social network o servizi terzi. Il titolare non e responsabile per contenuti, politiche o trattamenti effettuati da tali soggetti.",
      "Per richieste commerciali, segnalazioni o chiarimenti sui contenuti pubblicati e possibile utilizzare i recapiti indicati nel sito.",
    ],
  },
] as const

export default function LegalNotesPage() {
  return (
    <LegalPageLayout
      eyebrow="Note legali"
      title="Note Legali"
      intro="Questa sezione raccoglie le principali informazioni relative a contenuti, responsabilita e condizioni generali di utilizzo del sito."
      sections={sections}
    />
  )
}
