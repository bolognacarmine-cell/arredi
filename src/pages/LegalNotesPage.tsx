import { useEffect } from "react"
import LegalPageLayout from "../components/LegalPageLayout"
import LegalInfoCard from "../components/legal/LegalInfoCard"
import SEOHead from "../components/SEOHead"

const sections = [
  {
    title: "Titolare del sito",
    customContent: <LegalInfoCard />,
  },
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
  {
    title: "Dichiarazione sull'uso dell'intelligenza artificiale",
    paragraphs: [
      "Lo sviluppo tecnico e la produzione di alcuni contenuti del sito sono stati supportati da strumenti di intelligenza artificiale, con revisione e supervisione umana.",
    ],
  },
] as const

export default function LegalNotesPage() {
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
    <>
      <SEOHead
        title="Note Legali | Farcom Srl - farcomarredi.it"
        description="Note legali del sito farcomarredi.it di Farcom Srl: proprietà dei contenuti, limitazione di responsabilità, link esterni e dichiarazione sull'uso dell'intelligenza artificiale nei contenuti."
        canonical="https://www.farcomarredi.it/note-legali"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Note Legali | Farcom Srl",
          "description": "Informazioni legali generali relative al sito Farcom Srl farcomarredi.it.",
          "url": "https://www.farcomarredi.it/note-legali",
          "inLanguage": "it-IT",
          "lastReviewed": "2026-09-08"
        }}
      />
      <LegalPageLayout
        eyebrow="Note legali"
        title="Note Legali"
        intro="Questa sezione raccoglie le principali informazioni relative a contenuti, responsabilita e condizioni generali di utilizzo del sito."
        sections={sections}
        lastUpdated="2026-09-08"
      />
    </>
  )
}
