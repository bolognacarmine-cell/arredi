import { useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";

const INVITALIA_URL =
  "https://www.invitalia.it/incentivi-e-strumenti/resto-al-sud-20";

const territories = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Molise",
  "Puglia",
  "Sardegna",
  "Sicilia",
];

const recipients = [
  {
    title: "Giovani under 35",
    text: "Dai 18 anni compiuti ai 35 anni non ancora compiuti.",
  },
  {
    title: "Persone inattive, inoccupate o disoccupate",
    text: "In condizione di inattività, inoccupazione o disoccupazione.",
  },
  {
    title: "Disoccupati del Programma GOL",
    text: "Anche chi partecipa al Programma GOL rientra tra i destinatari indicati.",
  },
  {
    title: "Lavoratori “working poor”",
    text: "La misura include anche i lavoratori in condizione di working poor.",
  },
  {
    title: "Chi vuole avviare un’attività nel Mezzogiorno",
    text: "Nuove iniziative imprenditoriali, libero-professionali o di lavoro autonomo.",
  },
];

const projectTypes = [
  {
    title: "Nuove iniziative di autoimpiego",
    text: "Progetti per avviare un’attività in proprio nel Mezzogiorno.",
  },
  {
    title: "Attività di lavoro autonomo",
    text: "Iniziative libero-professionali e di lavoro autonomo.",
  },
  {
    title: "Impresa individuale, società, cooperativa o libera professione",
    text: "Le forme previste per le nuove iniziative ammissibili.",
  },
  {
    title: "Tutti i settori ammessi",
    text: "Sono esclusi agricoltura, pesca e acquacoltura.",
  },
];

const opportunities = [
  {
    title: "Voucher a fondo perduto",
    value: "fino a 40.000 €",
    detail: "elevabile a 50.000 €",
  },
  {
    title: "Contributo del 75% a fondo perduto",
    value: "fino a 120.000 €",
    detail: "per programmi di investimento fino a 120.000 €",
  },
  {
    title: "Contributo del 70% a fondo perduto",
    value: "tra 120.000 € e 200.000 €",
    detail: "per programmi di investimento tra 120.000 € e 200.000 €",
  },
];

const farcomServices = [
  {
    title: "Prima consulenza",
    text: "Valutazione della compatibilità del progetto con la misura.",
  },
  {
    title: "Analisi dell’idea imprenditoriale",
    text: "Esame dell’idea e del piano di investimento.",
  },
  {
    title: "Documentazione",
    text: "Supporto nella raccolta e preparazione dei documenti.",
  },
  {
    title: "Business plan",
    text: "Assistenza nella redazione o revisione del business plan.",
  },
  {
    title: "Presentazione della domanda",
    text: "Guida nella presentazione online tramite l’area personale Invitalia.",
  },
  {
    title: "Affiancamento successivo",
    text: "Supporto nelle fasi successive, dove previsto.",
  },
];

const steps = [
  {
    title: "Prima consulenza",
    text: "Ascoltiamo la tua idea e il contesto in cui vuoi avviare l’attività.",
  },
  {
    title: "Valutazione del progetto e dei requisiti",
    text: "Verifichiamo insieme la compatibilità del progetto con la misura.",
  },
  {
    title: "Preparazione della documentazione e del business plan",
    text: "Raccogliamo e organizziamo i documenti e lavoriamo sul business plan.",
  },
  {
    title: "Presentazione della domanda",
    text: "Ti guidiamo nella presentazione online tramite l’area personale Invitalia.",
  },
  {
    title: "Affiancamento e monitoraggio",
    text: "Restiamo al tuo fianco nelle fasi successive, dove previsto.",
  },
];

const faqs = [
  {
    q: "Cos’è Resto al Sud 2.0?",
    a: "Resto al Sud 2.0 è l’incentivo per gli under 35 che vogliono avviare un’attività nel Mezzogiorno. Sostiene nuove iniziative imprenditoriali, libero-professionali e di lavoro autonomo in Abruzzo, Basilicata, Calabria, Campania, Molise, Puglia, Sardegna e Sicilia. È gestito da Invitalia e finanziato dal Programma nazionale Giovani, donne e lavoro FSE+ 2021-2027.",
  },
  {
    q: "Chi può presentare domanda?",
    a: "La misura è rivolta a giovani tra i 18 anni compiuti e i 35 anni non ancora compiuti, in condizione di inattività, inoccupazione o disoccupazione. Sono inclusi anche i disoccupati del Programma GOL e i lavoratori “working poor”.",
  },
  {
    q: "Posso presentare domanda se non ho ancora avviato l’attività?",
    a: "Resto al Sud 2.0 sostiene nuove iniziative imprenditoriali, libero-professionali e di lavoro autonomo. I requisiti e le condizioni sono definiti da Invitalia: Farcom ti aiuta a valutare la tua situazione e a capire come preparare la pratica.",
  },
  {
    q: "Farcom eroga il finanziamento?",
    a: "No. Farcom non è Invitalia, non è una banca e non eroga il finanziamento. Farcom offre accompagnamento, consulenza e supporto operativo per la valutazione del progetto e la preparazione della pratica.",
  },
  {
    q: "Farcom può aiutarmi con il business plan?",
    a: "Sì. Farcom offre assistenza nella redazione o revisione del business plan e supporto nella raccolta e preparazione della documentazione necessaria.",
  },
  {
    q: "Quanto tempo richiede l’esame della domanda?",
    a: "Invitalia indica un esame della domanda entro 90 giorni, in base all’ordine cronologico di presentazione e nei limiti delle risorse disponibili. Farcom non può garantire tempi di approvazione o di erogazione.",
  },
  {
    q: "Come posso richiedere una consulenza?",
    a: "Puoi richiedere una consulenza tramite la pagina Contatti del sito, per telefono o su WhatsApp. Valuteremo insieme la tua idea e il percorso più adatto.",
  },
];

function ArrowUpRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
          light ? "text-[#E69138]" : "text-[#888580]"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-2 font-display text-3xl font-light leading-tight sm:text-4xl lg:text-[2.75rem] ${
          light ? "text-white" : "text-[#1A1A18]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-relaxed ${
            light ? "text-white/70" : "text-[#4A4A46]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function RestoAlSud() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <SEOHead
        title="Resto al Sud 2.0 | Assistenza e consulenza Farcom"
        description="Farcom ti accompagna nella pratica Resto al Sud 2.0: valutazione del progetto, documentazione, business plan e presentazione della domanda su Invitalia."
        canonical="https://www.farcomarredi.it/resto-al-sud-2-0"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }}
      />

      <section className="relative overflow-hidden bg-[#1A1A2E] pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#1B4332] opacity-60 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-56 left-1/4 h-[420px] w-[420px] rounded-full bg-[#E69138] opacity-[0.12] blur-[120px]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E69138]" />
                Incentivi per il Mezzogiorno
              </span>
              <h1 className="mt-6 max-w-3xl font-display text-4xl font-light leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                Resto al Sud 2.0: trasforma la tua idea in attività
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
                L’incentivo per gli under 35 che vogliono avviare un’attività nel
                Mezzogiorno. Farcom ti accompagna nella pratica, dalla
                valutazione del progetto alla presentazione della domanda.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contatti"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-[#E69138] px-6 py-3 text-sm font-semibold text-[#1A1A2E] transition-colors hover:bg-[#D67F28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
                >
                  Richiedi una consulenza
                  <ArrowUpRight />
                </Link>
                <a
                  href="#come-funziona"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E]"
                >
                  Scopri come funziona
                </a>
              </div>

              <p className="mt-6 max-w-2xl border-l-2 border-[#E69138]/60 pl-4 text-xs leading-relaxed text-white/55">
                Farcom non è Invitalia, non è una banca e non eroga il
                finanziamento. Offre accompagnamento, consulenza e supporto
                operativo alla pratica.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
              {[
                { value: "18–35", label: "anni, requisito under 35" },
                { value: "8", label: "Regioni del Mezzogiorno" },
                { value: "Invitalia", label: "ente che gestisce la misura" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-white/12 bg-white/[0.05] px-3 py-4 sm:px-5 sm:py-5"
                >
                  <div className="font-display text-xl font-light text-[#E69138] sm:text-2xl">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[10px] leading-snug text-white/60 sm:text-xs">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cos-e" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Cos’è"
                title="Un incentivo per avviare nuove attività nel Mezzogiorno"
                description="Resto al Sud 2.0 sostiene nuove iniziative imprenditoriali, libero-professionali e di lavoro autonomo. È gestito da Invitalia e finanziato dal Programma nazionale Giovani, donne e lavoro FSE+ 2021-2027."
              />
              <p className="mt-6 text-base leading-relaxed text-[#4A4A46]">
                La misura è rivolta agli under 35 che vogliono avviare
                un’attività nelle regioni del Mezzogiorno. La domanda si presenta
                online tramite l’area personale di Invitalia.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#4A4A46]">
                Farcom non sostituisce Invitalia: ti affianca nella lettura dei
                requisiti, nella preparazione dei documenti e nella gestione
                operativa della pratica.
              </p>
              <a
                href={INVITALIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1B4332] underline decoration-[#E69138] decoration-2 underline-offset-4 transition-colors hover:text-[#E69138] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2"
              >
                Vai alla pagina ufficiale Invitalia
                <ArrowUpRight />
              </a>
            </div>

            <div className="border border-[#E5E5E7] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-xl font-medium text-[#1A1A18]">
                  Territori coinvolti
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B4332]/15 bg-[#1B4332]/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1B4332]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332]" />
                  Attivo
                </span>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {territories.map((region) => (
                  <li
                    key={region}
                    className="flex items-center gap-2 border border-[#E5E5E7] bg-[#FAFAFA] px-3 py-2 text-sm text-[#1A1A18]"
                  >
                    <span className="text-[#E69138]">
                      <CheckIcon />
                    </span>
                    {region}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-[#E5E5E7] pt-4 text-xs leading-relaxed text-[#6B7280]">
                Stato indicato da Invitalia: “Attivo”, con apertura dal
                15/10/2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="destinatari" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Destinatari"
            title="A chi si rivolge Resto al Sud 2.0"
            description="La misura è pensata per giovani che vogliono avviare un’attività nel Mezzogiorno e si trovano in una delle condizioni previste."
          />

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recipients.map((item) => (
              <li
                key={item.title}
                className="border border-[#E5E5E7] bg-[#FAFAFA] p-5 transition-colors hover:border-[#E69138]/50"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-white">
                    <CheckIcon />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A18]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                      {item.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-l-4 border-[#E69138] bg-[#F7F5F0] p-5 sm:p-6">
            <h3 className="font-display text-lg font-medium text-[#1A1A18]">
              Un’attenzione particolare al mondo arredi
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[#4A4A46]">
              Se il tuo progetto riguarda arredi, interior design, contract,
              artigianato, showroom o attività collegate, Farcom può aiutarti a
              valutare la compatibilità della tua idea con la misura. Resto al
              Sud 2.0 è comunque aperto a tutti i settori ammessi, non solo
              all’arredamento.
            </p>
          </div>
        </div>
      </section>

      <section id="cosa-realizzare" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Progetti"
            title="Cosa si può realizzare"
            description="Resto al Sud 2.0 sostiene nuove iniziative di autoimpiego, attività di lavoro autonomo e progetti d’impresa nei settori ammessi."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {projectTypes.map((item, index) => (
              <div
                key={item.title}
                className="group border border-[#E5E5E7] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#1B4332]/25 hover:shadow-[0_8px_24px_rgba(26,26,46,0.06)]"
              >
                <span className="font-display text-sm font-light text-[#E69138]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-medium text-[#1A1A18]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="opportunita" className="bg-[#1A1A2E] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <SectionHeading
            light
            eyebrow="Agevolazioni"
            title="Le opportunità economiche"
            description="Le agevolazioni previste dalla misura comprendono voucher e contributi a fondo perduto, secondo le condizioni definite da Invitalia."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {opportunities.map((item) => (
              <div
                key={item.title}
                className="flex flex-col border border-white/12 bg-white/[0.05] p-6"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                  {item.title}
                </h3>
                <div className="mt-4 font-display text-3xl font-light text-[#E69138]">
                  {item.value}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-4xl border-l-2 border-[#E69138]/60 pl-4 text-sm leading-relaxed text-white/65">
            Le condizioni, i requisiti e le disponibilità finanziarie sono
            definiti da Invitalia. Farcom ti aiuta a valutare la tua posizione e
            a preparare la documentazione. Le agevolazioni non sono automatiche
            e non è garantita l’approvazione della domanda.
          </p>
        </div>
      </section>

      <section id="come-aiuta-farcom" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Il supporto Farcom"
            title="Come aiuta Farcom"
            description="Farcom ti affianca con consulenza e supporto operativo, senza sostituirsi a Invitalia o agli istituti finanziari."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {farcomServices.map((service) => (
              <div
                key={service.title}
                className="border border-[#E5E5E7] bg-white p-6"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1B4332]/8 text-[#1B4332]">
                  <CheckIcon />
                </span>
                <h3 className="mt-4 font-display text-lg font-medium text-[#1A1A18]">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {service.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border border-[#1B4332]/15 bg-[#1B4332]/5 p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-[#1B4332]">
              <strong className="font-semibold">Farcom non è Invitalia</strong>,
              non è una banca e non eroga il finanziamento. Il nostro ruolo è
              accompagnarti nella consulenza e nel supporto operativo alla
              pratica.
            </p>
          </div>
        </div>
      </section>

      <section id="come-funziona" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Il percorso"
            title="Il percorso Farcom, passo dopo passo"
            description="Un affiancamento organizzato, dalla prima valutazione alla presentazione della domanda."
          />

          <ol className="mt-10 grid gap-0 md:grid-cols-5">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative border-l border-[#E5E5E7] pb-8 pl-6 last:pb-0 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-6 md:pr-4"
              >
                <span className="absolute -left-[13px] top-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4332] text-[10px] font-semibold text-white md:-top-[13px] md:left-0">
                  {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-[#1A1A18]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Domande frequenti"
            title="Le risposte alle domande più comuni"
          />

          <div className="mt-8 divide-y divide-[#E5E5E7] border-y border-[#E5E5E7]">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-[#1A1A18] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 text-[#1B4332] transition-transform duration-200 group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="pb-5 pr-8 text-sm leading-relaxed text-[#4A4A46]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1B4332] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 md:px-8 lg:px-10">
          <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
            Hai un’idea? Parliamone.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Prenota una consulenza con Farcom per valutare la tua idea e capire
            come affrontare la pratica Resto al Sud 2.0.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contatti"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#E69138] px-7 py-3 text-sm font-semibold text-[#1A1A2E] transition-colors hover:bg-[#D67F28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4332] sm:w-auto"
            >
              Richiedi una consulenza
              <ArrowUpRight />
            </Link>
            <a
              href={INVITALIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 border border-white/25 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4332] sm:w-auto"
            >
              Pagina ufficiale Invitalia
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
