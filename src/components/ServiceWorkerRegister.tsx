import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Registra il service worker per PWA e offline capability
 *
 * Strategia "Zero-cache-stale":
 * 1. registerType: 'autoUpdate' in vite.config → scarica nuovo SW in background
 * 2. Al termine download (installing state) → registration.waiting.postMessage({ type: 'SKIP_WAITING' })
 * 3. Alla presa di controllo (controllerchange) → window.location.reload() IMMEDIATO
 *
 * Questo elimina il problema "sul PC vedo le modifiche / sul mobile no"
 * tipico delle PWA dove SW resta in attesa di "skipWaiting" esplicito.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered:', registration.scope)

            // --- 1) Nuova versione SW trovata: forza skip-waiting SUBITO ---
            registration.addEventListener('updatefound', () => {
              const installingSW = registration.installing
              if (!installingSW) return
              console.log('[PWA] Nuova versione trovata, installazione in corso…')
              installingSW.addEventListener('statechange', () => {
                if (
                  installingSW.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // Nuovo SW installato: chiedi di attivarlo ORA (skip-waiting)
                  console.log('[PWA] Installata, SKIP_WAITING + ricarica automatica…')
                  installingSW.postMessage({ type: 'SKIP_WAITING' })
                  // Fallback extra-safe: se il SW non reagisce entro 1,5s,
                  // invia messaggio anche al waiting (pattern duale di vite-plugin-pwa)
                  setTimeout(() => {
                    if (registration.waiting) {
                      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                    }
                  }, 1500)
                }
              })
            })

            // --- 2) Se c'è già un waiting SW all'avvio: forziamo attivazione ---
            if (registration.waiting && navigator.serviceWorker.controller) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }

            // --- 3) Nuovo SW ha preso il controllo: reload immediato ---
            let refreshing = false
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              if (refreshing) return
              refreshing = true
              console.log('[PWA] Nuovo SW attivo → ricarico la pagina.')
              window.location.reload()
            })

            // --- 4) Check periodico ogni 10 minuti (utile per mobile in background) ---
            try {
              setInterval(
                () => {
                  registration.update().catch(() => {})
                },
                10 * 60 * 1000,
              )
            } catch {
              /* setInterval non disponibile */
            }
          })
          .catch((registrationError) => {
            console.log('[PWA] SW registration failed:', registrationError)
          })
      })
    }
  }, [])

  return null
}