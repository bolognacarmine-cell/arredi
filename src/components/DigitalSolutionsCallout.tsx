const VIMANTEK_URL = "https://www.vimantek.com/futuro-digitale"

type DigitalSolutionsCalloutProps = {
  variant?: "home" | "sector"
}

export default function DigitalSolutionsCallout({
  variant = "home",
}: DigitalSolutionsCalloutProps) {
  const isHome = variant === "home"

  return (
    <section
      aria-labelledby={`digital-solutions-title-${variant}`}
      className={
        isHome
          ? "relative overflow-hidden bg-[#1A1A2E] text-white"
          : "bg-[#F5F5F7] border-y border-[#E5E5E7]"
      }
      data-bg={isHome ? "#1A1A2E" : "#F5F5F7"}
    >
      <div
        className={`mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:px-16 ${
          isHome
            ? "md:flex-row md:items-center md:justify-between md:gap-10 lg:py-16"
            : "md:flex-row md:items-center md:justify-between md:gap-10"
        }`}
      >
        <div
          className={`max-w-3xl ${
            isHome ? "border-l-2 border-[#E69138] pl-5 sm:pl-7" : ""
          }`}
        >
          <p
            className={`mb-2 inline-flex items-center gap-2 text-xs font-semibold ${
              isHome ? "text-[#E69138]" : "text-[#6B7280]"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0"
            >
              <rect
                x="2.5"
                y="3.5"
                width="15"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7 16.5h6M10 13.5v3M6 7h3m-3 3h5m2-3h1m-1 3h1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            In collaborazione con Vimantek
          </p>
          <h2
            id={`digital-solutions-title-${variant}`}
            className={`font-display font-bold leading-tight ${
              isHome
                ? "text-2xl sm:text-3xl md:text-4xl text-white"
                : "text-xl sm:text-2xl md:text-3xl text-[#1A1A2E]"
            }`}
          >
            {isHome
              ? "Oltre l’arredo: la tua attività anche nel digitale"
              : "La tua attività, anche nel digitale"}
          </h2>
          <p
            className={`mt-3 max-w-2xl text-sm leading-relaxed sm:text-base ${
              isHome ? "text-white/75" : "text-[#4A4A46]"
            }`}
          >
            {isHome
              ? "Farcom progetta e realizza spazi su misura per attività professionali. In collaborazione con Vimantek, può affiancarti anche con soluzioni digitali per gestire, promuovere e migliorare l’esperienza dei tuoi clienti."
              : "Oltre alla progettazione e realizzazione degli arredi, Farcom può supportarti nell’adozione di soluzioni digitali per valorizzare il tuo spazio e semplificare la gestione quotidiana."}
          </p>
        </div>
        <a
          href={VIMANTEK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-12 w-full items-center justify-center bg-[#E69138] px-5 py-3 text-center text-sm font-bold text-[#1A1A2E] shadow-sm transition-colors hover:bg-[#F0A14B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 sm:w-auto ${
            isHome ? "focus-visible:ring-offset-[#1A1A2E]" : "focus-visible:ring-offset-[#F5F5F7]"
          }`}
        >
          Scopri le soluzioni digitali Vimantek
        </a>
      </div>
    </section>
  )
}
