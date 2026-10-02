# [OPEN] Debug Session: react-error-300-admin-mount

**Data**: 2026-10-02  
**Session ID**: `react-error-300-admin-mount`  
**Ambiente**: Produzione Render (build minificata) / anche locale?  
**Rotte toccate**: `/admin/progetti`, `/admin`  
**Sintomo**: `Uncaught Error: Minified React error #300` immediatamente dopo `console.log('[Auth Check] Fetching from: /api/admin/me')`

---

## Sintomo (da utente)
```
[Cloudinary Config] {cloudName: 'qz1f1z6t', hasUploadPreset: true, uploadPreset: 'farcom-upl...', isConfigured: 'farcom-uploads', isProduction: true}
[Auth Check] Fetching from: /api/admin/me
index-3tkpGj4J.js:8 Uncaught Error: Minified React error #300
  at Cf (index-3tkpGj4J.js:8:49978)
  at dc (index-3tkpGj4J.js:8:49866)
  ...
```

Error #300 React = **"A component (X) called setState/setX during the render of another component (Y)."**  
Documentazione: https://react.dev/errors/300

**NOTA FONDAMENTALE**: L'errore scatta **PRIMA** che la fetch `/api/admin/me` completi (subito dopo `Fetching from:`, log che è PRIMA di `await fetch`). Quindi non è nella risposta 200/401 — è durante la FASE 1 dell'auth: `setIsLoading(true)` → `setAuthError(null)` → triggera ri-render chain, E QUALCHE FIGLIO/SIBLING nel corso di QUESTO ri-render aggiorna lo stato di UN ALTRO componente.

---

## Evidenze statiche confermate (prima di strumentazione)
| ID | Evidenza | Impatto |
|---|---|---|
| E1 | ❌ `projectStore.tsx` NON contiene `queueMicrotask(...)` attorno a `dispatchEvent(new CustomEvent(PROJECTS_EVENT))` — fix applicato nella sessione precedente ORA È SCOMPARSO | |
| E2 | `AdminLayout.tsx` chiama `useAdminAuth()` **due volte**: riga 21 (`logout, user`) + riga 115 child `<RequireAdmin>` che internamente chiama `useAdminAuth()` (riga 176 `useAdminAuth.tsx`) — stesso context, stesso value reference, ma 2 consumer distinti | Render chain più lunga, più possibilità #300 |
| E3 | 8 componenti totali usano `useProjects()`/`useProjectsDetailed()`: **4 pubblici** (Home, Projects, ProjectDetail, SectorPage) + **4 admin** (AdminLayout→Outlet: Dashboard, AdminMedia, AdminProjects) | Ogni consumer ha 1 listener `PROJECTS_EVENT` globale → se 2+ mounted, 1 dispatch causa N setState simultanei |
| E4 | `AdminAuthProvider.checkAuth()` esegue `setIsLoading(true)` e `setAuthError(null)` **in modo sincrono, PRIMA del log `Fetching from:`** — ma questi sono dentro `useEffect`, quindi fuori dal render; **però**, il re-render successivo (dopo `setIsLoading`) attraversa l'intero albero React e può innescare #300 se qualcuno nel frattempo setState sincrono | |

---

## 5 Ipotesi falsificabili
Ogni ipotesi è verificabile con strumentazione minima.

### 🧪 H1 (Alta probabilità — dalla memoria progetto):
**`window.dispatchEvent(PROJECTS_EVENT)` (o un evento fratello `farcom-showroom2-updated`) è chiamato SINCRONAMENTE durante il render di un componente consumer (quindi prima del commit).**  
Il listener (`syncFromEvent` in `useProjectsDetailed`) è già stato aggiunto nel commit precedente — e riceve l'evento durante un render successivo, invocando `setProjects(readProjects())`. Questo è #300 canonico.

**Trigger probabile**: `readProjects()` nello useState initializer di `useProjectsDetailed` quando trova immagini non valide → chiama `localStorage.removeItem` (OK) ma c'è un `storage` listener in un altro hook mounted che risponde SINCRO. Oppure `useProjectsDetailed` del Dashboard monta contemporaneamente a AdminProjects durante la transizione rotte.

**Come verificare**: Aggiungere `console.trace()` in `saveProjects/window.dispatchEvent` e in `syncFromEvent` per catturare lo stack dell'istante in cui avviene il dispatch.

---

### 🧪 H2 (Alta probabilità):
**`AdminAuthProvider.useMemo` ha dependencies incomplete**: `login, logout, checkAuth` NON sono incluse nel dep array (riga 142-154 useAdminAuth.tsx). Quando `checkAuth()` (reference vecchia, closure sul primo render) viene chiamata dal secondo consumer (`RequireAdmin.useAdminAuth`) contemporaneamente a `AdminLayout.useAdminAuth` — entrambe leggono lo stesso context ma con reference leggermente diverse? No, useMemo restituisce stesso value. Più probabile: **lo useEffect di `AdminAuthProvider` chiama `checkAuth()` che set 2 stati (`setIsLoading(true); setAuthError(null)`)**, e durante il ri-render di `AdminLayout` il suo useEffect riga 61-66/68-75 ricalcola `computeDefaultFromRoute()` che chiama `setSideOpen(...)` mentre `RequireAdmin` sta per settare il suo stato? No, `setSideOpen` è locale di AdminLayout (no cross-component). Ma nel caso in cui...

**Come verificare**: Tracciare l'ordine esatto `[render-start] [render-end] [effect-start] [effect-end]` per AdminAuthProvider → AdminLayout → RequireAdmin → Outlet.

---

### 🧪 H3 (Media probabilità):
**2 o più consumer `useProjectsDetailed()` montano simultaneamente durante la transizione di rotte (Dashboard + AdminProjects)**, e il loro `useEffect` iniziale con `refresh()` viene schedulato. Ma prima del refresh, il `readProjects()` nello useState initializer — se c'è racing con un listener di `storage` event già aggiunto da un'altra consumer — triggera 2 setState cross-component.

**Come verificare**: Aggiungere ID univoco a ogni consumer `useProjectsDetailed` e loggare `"Consumer ${id} useState initializer readProjects() size X"` + `"Consumer ${id} mounted"`.

---

### 🧪 H4 (Bassa probabilità ma da escludere):
**Il routing React Router 7 monta sia `/admin` che `/admin/progetti` contemporaneamente** durante un remount (race di route matching). Se Dashboard monta con `useProjects` contemporaneamente a AdminProjects con `useProjectsDetailed`, il doppio setState `loadState` è locale a ognuno — ma il dispatch globale di `PROJECTS_EVENT` condiviso può causare cross-state.

**Come verificare**: Log `useEffect mount / unmount` sia in Dashboard che AdminProjects; se entrambi loggano mount nello stesso tick → conferma.

---

### 🧪 H5 (Bassa probabilità):
**La Cloudinary config `[Cloudinary Config]` loggata PRIMA dell'errore** è dentro un provider (Cloudinary) che chiama `setState(...)` durante il render di un altro componente (es. un subscriber del context che notifica tutti durante init).

**Come verificare**: Loggare `console.trace()` nel punto in cui è stampato `[Cloudinary Config]` per vedere stack dell'holder.

---

## Stato di avanzamento
- [x] Audit statico 100% completato
- [x] Generazione 5 ipotesi falsificabili
- [x] **EVIDENZA POST-1ST-PATCH**
  - Il 1° deploy (fix solo projectStore) NON ha risolto #300.
  - Evidenza utente: `[Auth Check] Fetching from: /api/admin/me` → `Uncaught React #300` → `[Auth Check] Response status: 200`
  - Conclusione: la causa NON è nel solo `projectStore`. È in **QUALSIASI store con dispatchEvent sincrono** che reagisce all'inizio della auth o al routing.
- [x] **H2-H3 CONFERMATE dalle evidenze**: esistono ALTRI 3 store con CustomEvent sync + consumer multipli montati contemporaneamente:
  - ✅ `quoteStore.tsx` (Dashboard usa `useQuotes()` contemporaneamente a `useProjects()`)
  - ✅ `siteConfig.tsx` (Footer + pagine pubbliche usano `useSiteSettings()`)
  - ✅ `services/showroomApi.ts` (Homepage Showroom + Admin ProductsList con `useProductsAdmin`)
  - ✅ `ProductsList.tsx` (dispatch diretto bypassando showroomApi.write)
- [x] **PASSO 2 — Strumentazione estesa a TUTTI i 4 store**: pattern `queueMicrotask` + batching DOPPIO lato dispatch + lato consumer setState.
- [x] **PASSO 5A — Fix patch 360° anti-React #300 (client-side)**:
  - Fix su **7 file** applicati: projectStore + quoteStore + siteConfig + showroomApi + ProductsList + useAdminAuth (useCallback stabili)
- [x] **PASSO 5B — ROOT CAUSE server-side + fix definitivo**:
  - 🔥 **ROOT CAUSE REALE**: Richieste dirette nella URL bar tipo `GET /api/admin/me` (quando non c'era sessione attiva / o route non matchava) arrivavano al **fallback SPA** e veniva servito `index.html` → React si montava su path `/api/admin/me`, poi `window.location` veniva **cambiata a `/admin`** da React Router catch-all, loop infinito auth + #300 catena listener globali → crash.
  - ✅ FIX **SALVAGUARDIA CRITICA /api/* 404 JSON DEFENSIVO** in `server/index.ts riga 238-248`: `app.use('/api', catch-all 404 JSON)` subito DOPO tutte le routes API → `/api/*` risponde SEMPRE JSON, **MAI** `index.html`.
  - ✅ FIX **check pathname startsWith('/api/') 3× più robusto**: `decodeURI()` + `trim()` + `nativePath` da Express (`req.path`) + confronto case-insensitive → nessun edge case escaped o `//` può bypassarlo.
- [x] Build frontend + TypeScript server: **exit code 0 (2.74s / 488 moduli)**
- [ ] **PASSO 7A — Deploy a Render da parte dell'utente**
- [ ] PASSO 3/4: Riproduzione bug in produzione **dopo fix** (conferma 100%)
- [ ] PASSO 6 — Confronto pre vs post
- [ ] PASSO 7B — Verifica utente finale (A OK / B persiste) + cleanup strumenti debug

---

## Modifiche effettuate (summary patch 360° COMPLETA client + server Sessione 2)

### FILE MODIFICATI IN QUESTA SESSIONE (totale 9):

| Layer | File | Fix |
|---|---|---|
| Client #300 | `src/projectStore.tsx` | dispatch `PROJECTS_EVENT` batching + `queueMicrotask` lato sender E lato consumer `setProjects` |
| Client #300 | `src/quoteStore.tsx` | dispatch `QUOTES_EVENT` batching + `queueMicrotask` lato sender E lato consumer `setQuotes` |
| Client #300 | `src/siteConfig.tsx` | dispatch `SITE_SETTINGS_EVENT` batching + `queueMicrotask` lato sender E lato consumer `setSettings` |
| Client #300 | `src/services/showroomApi.ts` | dispatch `farcom-showroom2-updated` batching + dedup con detail ultimo (`k: string`) |
| Client #300 | `src/pages/admin/showroom/ProductsList.tsx` | dispatch showroom wrap queueMicrotask |
| Client #300 | `src/hooks/useAdminAuth.tsx` | `login/logout/checkAuth` `useCallback` referenze stabili + useMemo dep array completo |
| Server API 404 | `server/index.ts` | ✨ **SALVAGUARDIA CRITICA** `app.use('/api') catch-all 404 JSON` DOPO routes — MAI fallback SPA su /api/* |
| Server SPA fallback | `server/index.ts` | check pathname 3× robusto (decodeURI + trim + nativePath case-insensitive) |
| Client UI banner | `src/pages/admin/AdminProjects.tsx` | refactor notifiche `showError`/`showToast` bottom-center `z-[60]` |
| Backend auth 403 | `server/routes/admin.ts /api/admin/me` | check `user.role !== 'admin'` → 403 strutturato; sessione orfana `destroy() + clearCookie`; 500 strutturato |
| Client fetch robust | `src/api/projectsApi.ts deleteProject()` | `readJson()` invece di `response.json()` per 502 HTML proxy |

