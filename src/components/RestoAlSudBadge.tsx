import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cookie_consent_accepted";
const COOKIE_CONSENT_EVENT = "farcom:cookie-consent";
const PROMO_URL = "https://www.invitalia.it/incentivi-e-strumenti/resto-al-sud-20";

/**
 * Badge promozionale fisso in basso a destra.
 * - z-40: sopra il contenuto, sotto navbar (z-50), cookie banner e modali.
 * - Si alza temporaneamente quando il cookie banner occupa la parte bassa.
 * - Nascosto nell'area /admin per non interferire con la gestione.
 */
export default function RestoAlSudBadge() {
  const { pathname } = useLocation();
  const [cookieBannerVisible, setCookieBannerVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COOKIE_CONSENT_KEY) === null;
  });

  useEffect(() => {
    const onConsent = () => setCookieBannerVisible(false);
    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) {
        setCookieBannerVisible(event.newValue === null);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={PROMO_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Incentivi per avviare la tua attività"
      aria-label="Resto al Sud 2.0 — Incentivi per avviare la tua attività (si apre in una nuova scheda)"
      className={[
        "group fixed right-3 sm:right-5 z-40 inline-flex min-h-[44px] items-center gap-2 sm:gap-2.5",
        "rounded-xl border border-[#1B4332]/15 bg-white/95 px-3 py-2 sm:px-4 sm:py-2.5",
        "text-[#1A1A2E] shadow-[0_4px_20px_rgba(26,26,46,0.12)] backdrop-blur",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-[#E69138]/60 hover:shadow-[0_8px_26px_rgba(26,26,46,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2",
        cookieBannerVisible
          ? "bottom-80 sm:bottom-52 xl:bottom-6"
          : "bottom-3 sm:bottom-5 xl:right-6",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1B4332] text-[#E69138] transition-colors duration-200 group-hover:bg-[#2D6A4F]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M12 21V11" />
          <path d="M12 11C12 7 9 4 5 4c0 4 3 7 7 7Z" />
          <path d="M12 14c0-3 2.5-6 6-6 0 3-2.5 6-6 6Z" />
        </svg>
      </span>

      <span className="flex min-w-0 flex-col pr-0.5">
        <span className="whitespace-nowrap text-xs font-semibold leading-tight sm:text-[13px]">
          Resto al Sud 2.0
        </span>
        <span className="hidden whitespace-nowrap text-[10px] font-medium leading-tight text-[#6B7280] sm:block">
          Incentivi per avviare la tua attività
        </span>
      </span>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 shrink-0 text-[#1B4332]/45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#E69138]"
      >
        <path d="M7 17 17 7" />
        <path d="M8 7h9v9" />
      </svg>
    </a>
  );
}
