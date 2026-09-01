import LegalPageLayout from "../components/LegalPageLayout"

const sections = [
  {
    title: "Dati raccolti",
    paragraphs: [
      "Questo sito puo raccogliere dati identificativi e di contatto inviati volontariamente attraverso form, email o altri canali di richiesta informazioni.",
      "I dati raccolti possono includere nome, email, numero di telefono, settore di interesse, citta e contenuti del messaggio inviato dall'utente.",
    ],
  },
  {
    title: "Finalita del trattamento",
    paragraphs: [
      "I dati vengono trattati per rispondere a richieste di contatto, formulare preventivi, organizzare sopralluoghi, gestire comunicazioni commerciali richieste e migliorare i servizi offerti.",
      "Il conferimento dei dati e facoltativo, ma la mancata comunicazione delle informazioni essenziali puo impedire la gestione della richiesta.",
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
