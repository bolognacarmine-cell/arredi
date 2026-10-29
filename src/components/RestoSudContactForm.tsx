import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { submitRestoSudContact } from "../api/restoSudContactApi";
import { useSiteSettings } from "../siteConfig";

const WHATSAPP_MESSAGE =
  "Buongiorno, vorrei informazioni su Resto al Sud 2.0 e un primo contatto per una consulenza.";

const SUCCESS_MESSAGE =
  "Richiesta inviata. Ti ricontatteremo al più presto per un primo contatto. Se la richiesta sarà idonea, potrà essere inoltrata a un commercialista dedicato per una consulenza più approfondita.";

const CONSENT_ERROR =
  "Per inviare la richiesta è necessario acconsentire al trattamento dei tuoi dati.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.\-]{6,50}$/;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  privacy: boolean;
};

type FormErrors = {
  fullName?: string;
  contact?: string;
  email?: string;
  phone?: string;
  message?: string;
  privacy?: string;
  form?: string;
};

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  privacy: false,
};

export default function RestoSudContactForm() {
  const siteConfig = useSiteSettings();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);

  const whatsappUrl = siteConfig.whatsappHref
    ? `${siteConfig.whatsappHref}${siteConfig.whatsappHref.includes("?") ? "&" : "?"}text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    : "";

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined, form: undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();
    const nextErrors: FormErrors = {};

    if (!fullName) {
      nextErrors.fullName = "Inserisci nome e cognome.";
    }

    if (!email && !phone) {
      nextErrors.contact = "Inserisci almeno un’email o un numero di telefono.";
    } else {
      if (email && !EMAIL_PATTERN.test(email)) {
        nextErrors.email = "Inserisci un indirizzo email valido.";
      }
      if (phone && !PHONE_PATTERN.test(phone)) {
        nextErrors.phone = "Inserisci un numero di telefono valido.";
      }
    }

    if (!form.privacy) {
      nextErrors.privacy = CONSENT_ERROR;
    }

    setErrors(nextErrors);

    if (nextErrors.fullName) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.contact || nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }
    if (nextErrors.privacy) {
      privacyRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await submitRestoSudContact({
        fullName,
        email,
        phone,
        message,
        privacyConsent: form.privacy,
      });
      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitted(true);
    } catch (error) {
      setErrors({
        form:
          error instanceof Error && error.message
            ? error.message
            : "Non è stato possibile inviare la richiesta. Riprova tra poco.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-[#1B4332]/15 bg-white p-6 sm:p-8">
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3"
        >
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-white">
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
          </span>
          <p className="text-sm leading-relaxed text-[#1A1A18]">
            {SUCCESS_MESSAGE}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#1B4332]/15 bg-white p-5 sm:p-7">
      <h3 className="font-display text-xl font-medium text-[#1A1A18]">
        Richiedi un primo contatto
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#4A4A46]">
        Compila il modulo per essere ricontattato da Farcom. Dopo un primo
        contatto, la tua richiesta potrà essere inoltrata a un commercialista
        dedicato per una consulenza più approfondita su Resto al Sud 2.0.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="resto-name"
            className="block text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
          >
            Nome e cognome *
          </label>
          <input
            ref={nameRef}
            id="resto-name"
            name="fullName"
            type="text"
            autoComplete="name"
            maxLength={200}
            required
            value={form.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "resto-name-error" : undefined}
            className="mt-1.5 w-full border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] transition-colors focus:border-[#E69138] focus:outline-none focus:ring-2 focus:ring-[#E69138]/20 aria-[invalid=true]:border-red-600"
          />
          {errors.fullName ? (
            <p id="resto-name-error" role="alert" className="mt-1.5 text-xs text-red-700">
              {errors.fullName}
            </p>
          ) : null}
        </div>

        <fieldset
          aria-describedby={
            errors.contact
              ? "resto-contact-error"
              : "resto-contact-hint"
          }
        >
          <legend className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Email oppure telefono *
          </legend>
          <p id="resto-contact-hint" className="mt-1 text-xs text-[#6B7280]">
            Inserisci almeno uno dei due recapiti.
          </p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="resto-email" className="block text-xs text-[#6B7280]">
                Email
              </label>
              <input
                ref={emailRef}
                id="resto-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={254}
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                aria-invalid={Boolean(errors.email || errors.contact)}
                aria-describedby={
                  errors.email
                    ? "resto-email-error"
                    : errors.contact
                      ? "resto-contact-error"
                      : "resto-contact-hint"
                }
                className="mt-1.5 w-full border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] transition-colors focus:border-[#E69138] focus:outline-none focus:ring-2 focus:ring-[#E69138]/20 aria-[invalid=true]:border-red-600"
              />
              {errors.email ? (
                <p id="resto-email-error" role="alert" className="mt-1.5 text-xs text-red-700">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="resto-phone" className="block text-xs text-[#6B7280]">
                Telefono
              </label>
              <input
                ref={phoneRef}
                id="resto-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={50}
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                aria-invalid={Boolean(errors.phone || errors.contact)}
                aria-describedby={
                  errors.phone
                    ? "resto-phone-error"
                    : errors.contact
                      ? "resto-contact-error"
                      : "resto-contact-hint"
                }
                className="mt-1.5 w-full border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] transition-colors focus:border-[#E69138] focus:outline-none focus:ring-2 focus:ring-[#E69138]/20 aria-[invalid=true]:border-red-600"
              />
              {errors.phone ? (
                <p id="resto-phone-error" role="alert" className="mt-1.5 text-xs text-red-700">
                  {errors.phone}
                </p>
              ) : null}
            </div>
          </div>
          {errors.contact ? (
            <p id="resto-contact-error" role="alert" className="mt-2 text-xs text-red-700">
              {errors.contact}
            </p>
          ) : null}
        </fieldset>

        <div>
          <label
            htmlFor="resto-message"
            className="block text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
          >
            Messaggio (facoltativo)
          </label>
          <textarea
            id="resto-message"
            name="message"
            rows={4}
            maxLength={2000}
            value={form.message}
            onChange={(event) => setField("message", event.target.value)}
            className="mt-1.5 w-full resize-y border border-[#E5E5E7] bg-white px-4 py-3 text-sm text-[#1A1A2E] transition-colors focus:border-[#E69138] focus:outline-none focus:ring-2 focus:ring-[#E69138]/20"
          />
        </div>

        <p className="text-xs leading-relaxed text-[#6B7280]">
          I tuoi dati saranno trattati da Farcom esclusivamente per rispondere
          alla tua richiesta di contatto riguardo a Resto al Sud 2.0 e, se
          necessario, per inoltrarla a un commercialista dedicato. Non verranno
          usati per finalità di marketing. Consulta l’{" "}
          <a
            href="/privacy"
            className="font-medium text-[#1B4332] underline decoration-[#E69138] underline-offset-2 hover:text-[#E69138] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2"
          >
            Informativa privacy
          </a>
          .
        </p>

        <div>
          <div className="flex items-start gap-3">
            <input
              ref={privacyRef}
              id="resto-privacy"
              name="privacy"
              type="checkbox"
              required
              checked={form.privacy}
              onChange={(event) => setField("privacy", event.target.checked)}
              aria-invalid={Boolean(errors.privacy)}
              aria-describedby={errors.privacy ? "resto-privacy-error" : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#1B4332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2"
            />
            <label htmlFor="resto-privacy" className="text-xs leading-relaxed text-[#4A4A46]">
              Acconsento al trattamento dei miei dati per essere ricontattato in
              merito alla mia richiesta e, se necessario, all’inoltro della
              richiesta a un commercialista dedicato.
            </label>
          </div>
          {errors.privacy ? (
            <p id="resto-privacy-error" role="alert" className="mt-2 text-xs text-red-700">
              {errors.privacy}
            </p>
          ) : null}
        </div>

        {errors.form ? (
          <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
            {errors.form}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[#E69138] px-6 py-3 text-sm font-semibold text-[#1A1A2E] transition-colors hover:bg-[#D67F28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Invio in corso…" : "Invia richiesta"}
        </button>
      </form>

      {whatsappUrl ? (
        <div className="mt-6 border-t border-[#E5E5E7] pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Preferisci WhatsApp?
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#1B4332]/20 px-5 py-2.5 text-sm font-semibold text-[#1B4332] transition-colors hover:border-[#1B4332]/40 hover:bg-[#1B4332]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2 sm:w-auto"
          >
            Scrivi su WhatsApp
          </a>
          <p className="mt-3 text-[11px] leading-relaxed text-[#6B7280]">
            Proseguendo su WhatsApp comunicherai i tuoi dati anche a
            WhatsApp/Meta secondo le loro condizioni. Consulta la nostra{" "}
            <a
              href="/privacy"
              className="font-medium text-[#1B4332] underline decoration-[#E69138] underline-offset-2 hover:text-[#E69138] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E69138] focus-visible:ring-offset-2"
            >
              Informativa privacy
            </a>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
