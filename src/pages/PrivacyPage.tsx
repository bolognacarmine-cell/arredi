import LegalPageLayout from "../components/LegalPageLayout"
import LegalInfoCard from "../components/legal/LegalInfoCard"

const sections = [
  {
    title: "Titolare del trattamento",
    customContent: <LegalInfoCard />,
  },
  {
    title: "Tipologie di dati raccolti",
    paragraphs: [
      "Questo sito puo raccogliere dati identificativi e di contatto inviati volontariamente attraverso form, email o altri canali di richiesta informazioni.",
      "I dati raccolti possono includere nome, email, numero di telefono, settore di interesse, citta e contenuti del messaggio inviato dall'utente.",
      "I dati possono essere raccolti anche tramite contatti diretti tramite WhatsApp o altri canali di comunicazione messaggistica.",
    ],
  },
  {
    title: "Finalita del trattamento",
    paragraphs: [
      "I dati vengono trattati per rispondere a richieste di contatto, formulare preventivi, organizzare sopralluoghi, gestire comunicazioni commerciali richieste e migliorare i servizi offerti.",
      "Il conferimento dei dati e facoltativo, ma la mancata comunicazione delle informazioni essenziali puo impedire la gestione della richiesta.",
      "Le finalità principali sono: gestione delle richieste commerciali, elaborazione di preventivi, rapporti commerciali e customer service.",
    ],
  },
  {
    title: "Base giuridica del trattamento",
    paragraphs: [
      "Il trattamento dei dati si basa sull'esecuzione di misure precontrattuali e contrattuali, nonché sul legittimo interesse del titolare per finalità commerciali.",
      "Per le comunicazioni di marketing diretto, il trattamento si basa sul consenso dell'interessato quando espresso.",
    ],
  },
  {
    title: "Destinatari e responsabili",
    paragraphs: [
      "I dati possono essere condivisi con provider di servizi tecnici, hosting, gestione email e altri soggetti necessari per l'erogazione dei servizi.",
      "I destinatari sono individuati tra personale autorizzato, partner commerciali e fornitori di servizi tecnicamente necessari.",
    ],
  },
  {
    title: "Trasferimenti fuori dallo Spazio economico europeo",
    paragraphs: [
      "Alcuni provider tecnici potrebbero trasferire dati al di fuori dello Spazio economico europeo, nel rispetto delle garanzie adeguate previste dalla normativa.",
      "In tal caso, il titolare assicura l'adozione di clausole contrattuali standard o altre misure di garanzia adeguate.",
    ],
  },
  {
    title: "Conservazione e sicurezza",
    paragraphs: [
      "I dati vengono conservati per il tempo strettamente necessario alla gestione delle richieste e degli obblighi amministrativi o legali applicabili.",
      "Il titolare adotta misure tecniche e organizzative adeguate per limitare accessi non autorizzati, perdita accidentale o trattamento improprio dei dati.",
    ],
  },
  {
    title: "Diritti dell'interessato",
    paragraphs: [
      "L'utente puo richiedere accesso, rettifica, cancellazione, limitazione del trattamento, opposizione o portabilita dei dati nei limiti previsti dalla normativa applicabile.",
      "Per esercitare i propri diritti e possibile contattare il titolare tramite i recapiti indicati in questa pagina.",
      "L'interessato ha inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.",
    ],
  },
] as const

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy"
      title="Informativa Privacy"
      intro="Questa informativa descrive in modo sintetico come vengono trattati i dati personali raccolti attraverso il sito e i canali di contatto collegati alle richieste commerciali."
      sections={sections}
    />
  )
}
