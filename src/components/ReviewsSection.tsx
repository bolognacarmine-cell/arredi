// Sezione "Dicono di noi" — 5 recensioni Google statiche (sostituibile con widget Google)
const GoogleStar = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#E69138"
    aria-hidden="true"
    className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

const GoogleG = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 48 48"
    aria-hidden="true"
    className="w-3.5 h-3.5 shrink-0"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
)

type Review = {
  name: string
  text: string
  date: string
}

// Recensioni reali Google — nomi abbreviati per privacy
// GOOGLE WIDGET SNIPPET: sostituisci `reviews` qui sotto con lo snippet JS di Google Reviews
// (es. widget Elfsight, Google Places API o embeds ufficiale) mantenendo la griglia wrapper.
const reviews: Review[] = [
  {
    name: "Giuseppe C.",
    date: "1 anno fa",
    text: "Il top delle aziende per arredamento. Grande professionalità, anche a distanza di tempo qualsiasi problema può nascere viene risolto con rapidità e serietà.",
  },
  {
    name: "Luigi C.",
    date: "5 anni fa",
    text: "Ho accompagnato mia nipote che doveva arredare il suo centro estetico e Ugo, credo il titolare, è stato al di sopra di tutte le nostre aspettative: amabile, attento, professionale.",
  },
  {
    name: "Luca P.",
    date: "2 mesi fa",
    text: "Se volete arredare uffici o negozi ad alto livello solo qui dovete andare.",
  },
  {
    name: "Manuela L.",
    date: "4 anni fa",
    text: "Qualità e competenza. Staff eccezionale.",
  },
  {
    name: "Max S.",
    date: "4 anni fa",
    text: "Il migliore nella zona di Caserta.",
  },
]

function StarRow() {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1" aria-label="5 stelle su 5">
      <GoogleStar />
      <GoogleStar />
      <GoogleStar />
      <GoogleStar />
      <GoogleStar />
    </div>
  )
}

export default function ReviewsSection() {
  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gray-50 relative">
      {/* Separatore visivo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E69138]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        {/* Header sezione */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <span className="text-[#6B7280] text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold">
            Dicono di noi
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A2E] mt-2 leading-[1.15] sm:leading-tight text-balance">
            Recensioni <span className="text-[#E69138]">Google</span>
          </h2>
          <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base text-[#6B7280] leading-relaxed">
            Alcune opinioni di chi ha lavorato con noi.
          </p>
        </div>

        {/* Griglia recensioni — mobile 1 col, sm 2 col, lg 3 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {reviews.map((r, i) => (
            <article
              key={r.name + i}
              className="group bg-white border border-gray-100 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md hover:shadow-[#E69138]/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3 sm:gap-4"
            >
              {/* Stelle + data */}
              <div className="flex items-start justify-between gap-3">
                <StarRow />
                <span className="text-[11px] sm:text-xs text-[#6B7280] shrink-0 pt-0.5">
                  {r.date}
                </span>
              </div>

              {/* Testo recensione */}
              <p className="text-[15px] sm:text-base leading-[1.65] sm:leading-relaxed text-[#1A1A2E]/90 text-pretty">
                &ldquo;{r.text}&rdquo;
              </p>

              {/* Autore + fonte Google */}
              <div className="mt-auto pt-2 flex items-center gap-2.5 sm:gap-3 border-t border-gray-50">
                <div
                  aria-hidden="true"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#E69138] to-[#F0B46C] text-[#1A1A2E] font-bold text-sm flex items-center justify-center shrink-0"
                >
                  {r.name.charAt(0)}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-[#1A1A2E] truncate">
                    {r.name}
                  </span>
                  <span className="text-[#6B7280]/60 text-sm" aria-hidden="true">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#6B7280] shrink-0">
                    <GoogleG />
                    Google
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
