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
- [x] **PASSO 2 — Strumentazione**: Aggiunta
  - ✅ P1: `projectStore.saveProjects / resetProjects → dispatchEvent` → **`queueMicrotask + _batchedProjectsDispatch()` (batching anti-#300)**
  - ✅ P2: `useProjectsDetailed → syncFromEvent / onStorage` → **`queueMicrotask(...)` prima di ogni `setProjects(...)` (doppia protezione)**
  - ✅ P3: `AdminAuthProvider.checkAuth` → **`useCallback` stabile + incluso in useMemo deps (no re-render finti)**
  - ✅ Debug counter consumer: `_consumerCounter`, tracce `console.debug('[useProjectsDetailed]', consumerId, 'mounted|unmounted|refresh')`
- [x] **PASSO 5 — Fix H1+H2+H3 (ad alta confidenza dalla memoria della sessione precedente)**
- [x] Build frontend + TypeScript server: **exit code 0**
- [ ] **PASSO 7A — Deploy a Render da parte dell'utente**
- [ ] PASSO 3/4 successiva: Riproduzione bug in produzione **dopo fix** (conferma H1 o nuova evidenza)
- [ ] PASSO 6 — Confronto pre vs post
- [ ] PASSO 7B — Verifica utente finale (A OK, B persiste) / cleanup strumenti

---

## Modifiche effettuate (summary patch applicato)

### 1. `src/projectStore.tsx`
**File originale** (dopo merge, fix precedente scomparso):
- ❌ `saveProjects()`: `window.dispatchEvent(...)` SINCRONO → possibile trigger #300
- ❌ `resetProjects()`: idem
- ❌ `useProjectsDetailed().syncFromEvent()`: `setProjects(readProjects())` SINCRONO da listener
- ❌ `onStorage`: idem

**Dopo patch**:
- ✅ `_batchedProjectsDispatch()`: **`queueMicrotask` + guard `_pendingDispatch`** (dedup + post-render scheduling)
- ✅ `saveProjects()` e `resetProjects()` → usano `_batchedProjectsDispatch()`
- ✅ `syncFromEvent()`: **`queueMicrotask(() => setProjects(readProjects()))`** prima di setState
- ✅ `onStorage`: idem
- ✅ Aggiunti `_consumerCounter` monotono, `useMemo(() => 'p${++_consumerCounter}', [])` per tracciare quanti hook mounted (H3/H4 testing)
- ✅ Tracce `console.debug('[useProjectsDetailed]', consumerId, ...)` su mount/unmount/refresh

### 2. `src/hooks/useAdminAuth.tsx`
- ✅ `checkAuth`, `login`, `logout` convertiti in **`useCallback`** con dep array minimali
  - `checkAuth` → `[]` (useState setter e `getApiUrl` sono referenze stabili)
  - `login` → `[]`
  - `logout` → `[navigate]` (navigate da React Router è stabile)
- ✅ Inclusi `[login, logout, checkAuth]` nel dep array di `useMemo` del value del context
  - Prima: dep array incompleto → valore memoizzato NON cambiava quando le funzioni cambiavano reference (ok casuale, perché le funzioni avevano closure corretta ma reference nuova ogni render)
  - Ora: referenze stabili da useCallback + dichiarate in deps → **corretto + no rischio #300 da valore context che cambia ad ogni render indipendentemente da user/isLoading/authError**

### 3. Invariati
- ❤️ Appena modificati in sessione corrente: `src/pages/admin/AdminProjects.tsx`, `src/api/projectsApi.ts`, `server/routes/admin.ts` → toccati 0 volte in questo fix #300
- ❤️ `AdminLayout.tsx`: lasciato invariato (doppio consumer `useAdminAuth` non è la causa principale; le referenze stabili lo rendono innocuo)
