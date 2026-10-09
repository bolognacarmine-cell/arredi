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
    title: "Oggetto e ambito di applicazione",
    paragraphs: [
      "I presenti Termini e Condizioni disciplinano l'utilizzo del sito web di Farcom Srl, accessibile all'indirizzo www.farcomarredi.it e ai suoi sottodomini.",
      "Il sito ha finalità informative e commerciali relative ai servizi di progettazione e realizzazione di arredi su misura per spazi professionali (barbieri, uffici, negozi, scuole, bar, centri estetici e altri settori).",
      "L'accesso e la navigazione sul sito implicano l'accettazione integrale dei presenti Termini e Condizioni. Qualora l'utente non intenda accettare tali termini, è invitato a non utilizzare il sito.",
    ],
  },
  {
    title: "Utilizzo del sito",
    paragraphs: [
      "Il sito può essere utilizzato per consultare informazioni sui servizi offerti, visualizzare progetti realizzati, richiedere preventivi e contattare Farcom Design per finalità commerciali.",
      "È vietato l'uso del sito per finalità illecite, contrarie alla morale o al buon costume, o comunque in modo tale da danneggiare il funzionamento del sito o i diritti di terzi.",
      "L'utente si impegna a non diffondere virus, malware o altri codici dannosi, a non effettuare attacchi al sito o tentativi di accesso non autorizzato ai sistemi informatici.",
    ],
  },
  {
    title: "Proprietà intellettuale",
    paragraphs: [
      "Tutti i contenuti del sito (testi, immagini, grafiche, loghi, layout, elementi multimediali) sono di proprietà esclusiva di Farcom Design o dei suoi licenziatari e sono protetti dalle leggi sul diritto d'autore e sulla proprietà intellettuale.",
      "È vietata la riproduzione, modifica, distribuzione, comunicazione al pubblico o qualsiasi forma di sfruttamento dei contenuti senza l'autorizzazione scritta di Farcom Design.",
      "Restano salvi i diritti di terzi su eventuali contenuti concessi in licenza o utilizzati a titolo esemplificativo.",
    ],
  },
  {
    title: "Descrizione dei servizi",
    paragraphs: [
      "Farcom Design offre servizi di progettazione e realizzazione di arredi su misura per spazi professionali. I servizi includono sopralluoghi, consulenza, progettazione, produzione e installazione.",
      "Le informazioni sui prodotti e servizi presentati sul sito hanno carattere indicativo e possono essere soggette a variazioni senza preavviso.",
      "Le richieste di preventivo trasmesse attraverso il sito non costituiscono un vincolo contrattuale per Farcom Design, salvo successiva conferma scritta.",
    ],
  },
  {
    title: "Preventivi e accordi commerciali",
    paragraphs: [
      "I preventivi formulati da Farcom Design hanno validità temporale indicata nel documento stesso e non vincolano le parti fino alla stipula di un contratto scritto.",
      "Le condizioni commerciali, i tempi di realizzazione e i costi saranno definiti caso per caso e formalizzati in contratto separato.",
      "Eventuali acconti o pagamenti anticipati saranno regolati dalle condizioni specificate nel contratto di fornitura.",
    ],
  },
  {
    title: "Limitazione di responsabilità",
    paragraphs: [
      "Farcom Design non garantisce che il sito sia privo di errori, interruzioni o incompatibilità tecniche. Il sito è fornito \"così com'è\" senza garanzie di alcun tipo, espresse o implicite.",
      "Farcom Design non è responsabile per danni diretti o indiretti derivanti dall'uso o dall'impossibilità di usare il sito, inclusi ma non limitati a danni per perdita di profitti, dati o avviamento commerciale.",
      "Farcom Design declina ogni responsabilità per contenuti, servizi o politiche di siti terzi collegati tramite link esterni.",
    ],
  },
  {
    title: "Modifiche ai Termini e Condizioni",
    paragraphs: [
      "Farcom Design si riserva il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento. Le modifiche entreranno in vigore dalla loro pubblicazione sul sito.",
      "L'utente è invitato a consultare periodicamente questa pagina per verificare eventuali aggiornamenti. L'uso continuato del sito dopo le modifiche costituisce accettazione dei nuovi termini.",
    ],
  },
  {
    title: "Collegamenti ad altre pagine legali",
    paragraphs: [
      "Per informazioni dettagliate sul trattamento dei dati personali, si rimanda alla ",
      <a key="privacy" href="/privacy" className="text-[#1B4332] underline underline-offset-2 hover:text-[#E69138] transition-colors">Informativa Privacy</a>,
      ".",
      "Per informazioni sull'uso dei cookie e tecnologie simili, si rimanda alla ",
      <a key="cookie" href="/cookie" className="text-[#1B4332] underline underline-offset-2 hover:text-[#E69138] transition-colors">Cookie Policy</a>,
      ".",
    ],
  },
  {
    title: "Legge applicabile e foro competente",
    paragraphs: [
      "I presenti Termini e Condizioni sono regolati dalla legge italiana. Per qualsiasi controversia relativa all'interpretazione o all'esecuzione degli stessi, sarà competente in via esclusiva il Foro di Caserta.",
    ],
  },
] as const

export default function TermsPage() {
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
        title="Termini e Condizioni | Farcom Design"
        description="Termini e Condizioni di utilizzo del sito web di Farcom Design. Informazioni su diritti, proprietà intellettuale, responsabilità e condizioni generali di servizio."
        canonical="https://www.farcomarredi.it/termini-e-condizioni"
      />
      <LegalPageLayout
        eyebrow="Termini"
        title="Termini e Condizioni"
        intro="Questa pagina contiene i termini e le condizioni generali di utilizzo del sito web di Farcom Design. La navigazione sul sito implica l'accettazione integrale di quanto riportato di seguito."
        sections={sections}
        lastUpdated="2026-10-05"
      />
    </>
  )
}
