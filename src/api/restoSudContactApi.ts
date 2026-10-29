import { getApiUrl } from "../lib/apiConfig";

export interface RestoSudContactPayload {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  privacyConsent: boolean;
}

export async function submitRestoSudContact(
  payload: RestoSudContactPayload,
): Promise<void> {
  const apiUrl = getApiUrl("/api/resto-sud-contact");

  if (
    apiUrl.startsWith("http://") &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(apiUrl)
  ) {
    throw new Error("La richiesta deve essere inviata tramite una connessione sicura.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "omit",
  });

  let result: { success?: boolean; message?: string } | null = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.message || "Non è stato possibile inviare la richiesta. Riprova tra poco.",
    );
  }
}
