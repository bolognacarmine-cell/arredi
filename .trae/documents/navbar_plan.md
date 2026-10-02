# Miglioramento Navigazione Hide-on-Scroll + Floating Piano di Implementazione

## Repository Research

### Stato attuale (conclusioni)

- **Componente Navbar condiviso**: `src/components/Navbar.tsx`, montato una sola volta in [App.tsx L43](file:///home/a/Projects/arredi/src/App.tsx#L43), prima di `<Routes>`. Non renderizza se `pathname.startsWith("/admin")` — escluso correttamente dal pannello admin.
- **Link del menu attuali** (array `links` Navbar.tsx L5-L19): `Home / Settori / Progetti / Showroom / Blog / Chi siamo / Contatti` + CTA `Richiedi preventivo` a destra. **Corrispondono ESATTAMENTE alle richieste utente** → nessuna modifica a link/testi.
- **Comportamento odierno**:
  - Booleano `scrolled`: dopo scrollY > `hero.offsetHeight - 150` (fallback: 50px senza hero), aggiunge `bg-[#FAFAFA]/95 backdrop-blur border-b`.
  - Stato `open` per hamburger mobile (bottoncino 3 linee con animazione, menù a discesa con `backdrop-blur`).
  - Nessun hide-on-scroll-down: **rimane sempre fixed top-0 z-50**, potenzialmente coprendo contenuti.
- **Design tokens** riusabili in `src/index.css :root`:
  - `--header-height`: 80px xs → 112px lg (già responsive, usato in `main { padding-top }` e `scroll-margin-top`)
  - `--background: #FAFAFA`; `--foreground: #1A1A2E`; `--accent: #E69138`; `--border: #E5E5E7`
  - `--primary: #1A1A2E`
- **Hook già disponibile**: `usePrefersReducedMotion()` in `src/hooks/usePrefersReducedMotion.ts` (usa `matchMedia`, default `false` se SSR).
- **Pagine pubbliche**: Home, Settori (list/details), Progetti (list/details), Showroom, Blog (list/post), Chi siamo, Contatti, Quote. Quasi tutte hanno pt-24 o `main { padding-top: var(--header-height) }` → il contenuto NON andrà perso quando il menu è nascosto/riapparso.
- **Nessuna dipendenza esterna da aggiungere**: React Router già incluso, `useEffect/useState/useRef/useLocation` standard.

### Problemi attuali che il piano risolve
1. Menu "sempre fisso" copre titoli/sezioni durante scroll.
2. Nessuna gestione direzione scroll (down=nascondi, up=mostra).
3. Nessuna area sensibile top per "hover-riemerge" desktop.
4. Nessuna distinzione "in cima → sempre visibile", "metà pagina → floating pill".
5. Focus tastiera può finire su elementi sotto menu nascosto (senza `pointer-events:none`).
6. Menu mobile hamburger potrebbe perdere stato `aria-controls`.

---

## Files and Modules

| File | Tipo modifica | Cosa |
|---|---|---|
| `src/components/Navbar.tsx` | **Edit principale** | Refactor logica hide/show, floating pill, hover-trigger area, focus trigger, accessibilità. |
| `src/index.css` | **Edit minore** | Aggiungere 1-2 classi utilities se servono (es. `navbar-hidden` o `@keyframes fade-slide-in`). |
| `src/hooks/*` | **Nessun nuovo file** | Riutilizzo `usePrefersReducedMotion` già esistente; logica diretta in Navbar. |

Nessun nuovo file creato, nessuna dipendenza esterna installata.

---

## Implementation Steps (dipendenza ordinata)

### Step 1 — Refactor stato interno + hook scroll
**File:** `src/components/Navbar.tsx`

Aggiungere variabili stato (oltre `scrolled` e `open` già esistenti):
- `visible: boolean` (default `true`)
- `touchTriggerActive: boolean` (default `false`)
- `lastScrollY: number` (ref, non stato — evita re-render ogni pixel)
- `rafId: number | null` (ref, throttle via requestAnimationFrame)
- `atTop: boolean` (scrollY < 32px → visibilità forzata)

Logica scroll handler (wrappata in `requestAnimationFrame` **e debounced cambio stato ogni ~80ms per evitare flip/flop**):
1. Leggi `window.scrollY` → delta = `current - lastScrollY.current`
2. Aggiorna `lastScrollY.current = current`
3. `atTop = current < 32`
4. `scrolled = current > (heroHeight ? heroHeight - 150 : 120)` (logica esistente corretta)
5. **DIREZIONE:**
   - SE `atTop === true` → `visible = true` + `touchTriggerActive = false` (SIEMPRE visibile in cima)
   - ALTRIMENTI SE `open === true` (hamburger mobile aperto) → `visible = true` (non nascondere MAI se utente ha menu mobile aperto — requirement implicito sicurezza UX)
   - ALTRIMENTI SE delta > +6 (scroll GIÙ, soglia per evitare micro-flip) → `visible = false` (nascondi)
   - ALTRIMENTI SE delta < -4 (scroll SU) → `visible = true` (mostra)
   - ALTRIMENTI → stato invariato (soglia isteresi 6/4px per non tremare)

Mount/Unmount:
- `window.addEventListener("scroll", handler, { passive: true })`
- `addEventListener("resize", recalcHeroHeight)` opzionale (heroHeight già calcolato)
- Cleanup removeEventListener e `cancelAnimationFrame(rafId.current)` in return cleanup useEffect.

### Step 2 — Hover trigger area (desktop top zone)
**File:** `src/components/Navbar.tsx` → JSX

Aggiungere un `<div>` "trigger invisibile" **posizionato fixed top-0 left-0 right-0 h-[18px] z-[49]** (sotto la navbar, ma cattura mouseenter nella prima striscia superiore centrale).

Eventi:
- `onMouseEnter={() => !atTop && !reducedMotion && setVisible(true)}` (Solo se non siamo in cima: in cima è già visibile di default.)
- Attenzione: il trigger NON deve esserci in mobile (`hidden md:block`) → touch user usa scroll-up.

Aggiungere anche un listener **focus da tastiera**:
- `useEffect` con focus detection in `document`: se `activeElement` discende da `<nav>` e `visible === false`, forzare `visible = true`. Così utente tastiera che tabba su link del menu non ha elementi invisibili.

### Step 3 — Animazioni fluide e UX "floating pill" quando nascosto poi ricompare a metà pagina
**File:** `src/components/Navbar.tsx` `<header>` classname + style

Rendere transizioni fluide secondo requirement:
- Stato TOP della pagina (atTop=true): il menu appare come prima (stesso design, piena larghezza, eventualmente un padding extra per renderlo "più evidente" in home hero: aggiungere `shadow-[0_1px_0_0_rgba(0,0,0,0.03)]` sopra hero trasparente + logo un pelo più grande? NO — identità visiva invariata: solo aumentare leggermente contrasto text-link quando atTop+non scrolled, cioè link visibili sopra il video hero. Usare `text-[#FFFFFF]` sul testo menu **solo se atTop && !scrolled** (sopra video hero scuro) e ripristinare i colori esistenti (`text-[#6B7280] hover:text-[#1A1A2E]`) quando atTop=false O scrolled=true. **Questo risolve il requisito 1 "Rendi più evidente nella parte iniziale Home" senza alterare color palette/logo.**
- Nascondere menu (visible=false): NON `display:none`, ma `transform: translateY(-110%)` + `opacity: 0` + `pointer-events: none` + `transition: opacity 280ms ease, transform 360ms cubic-bezier(.2,.8,.2,1)`. Tutte le transizioni usano durate diverse per opacità e traslazione, più elegante.
- Mostrare menu (visible=true): `transform: translateY(0)`, `opacity: 1`, `pointer-events: auto`.
- **Quando riappare A METÀ PAGINA (visible=true && !atTop):** Aggiungere classe wrapper "floating pill": `top: max(8px, env(safe-area-inset-top))` (non perfettamente attaccato in alto ma 8px sotto), `left-1/2 -translate-x-1/2` (CENTRATO), width auto `max-w-[calc(100%-2rem)]`, padding `px-1.5`, radius `rounded-[999px]`, background `bg-white/95 backdrop-blur` e `shadow-[0_6px_20px_-6px_rgba(0,0,0,0.15)]`. Il logo rimane (stessa identità) ma il layout diventa **centrato e fluttuante** a metà pagina come da requisito 3 "…elemento flottante…parte centrale superiore".
- Quando si torna in cima (atTop=true): tornare a layout full-width `left-0 right-0`, no pill, no center translate → layout identico originale.
- **prefers-reduced-motion**: override `transition: none !important` + set visible immediatamente senza threshold 6px. Riutilizzare hook `usePrefersReducedMotion()`.

### Step 4 — Mobile hamburger: correzioni a11y + stato
**File:** `src/components/Navbar.tsx` riga 110 e 122.

Correzioni minime ad accessibilità:
- Bottone hamburger: aggiungere `aria-controls="mobile-menu"` e `id="mobile-menu-toggle"`.
- Container menu mobile: aggiungere `id="mobile-menu"` + `role="menu"` se non c'è + `aria-hidden={!open}`.
- Su mobile la "floating pill" NON si applica al menu mobile aperto: se `open=true` → `visible` SEMPRE true e layout full-width (non pill centrale).
- I pointer-events sul `<header>` sono `pointer-events: auto` in ogni caso se hamburger è aperto.
- Quando menu mobile si chiude (`open` diventa false), attendere 300ms poi permettere hide-on-scroll (già gestito da stato `open` usato nella logica direzione scroll Step 1).

### Step 5 — Controlli layout responsive + z-index
- z-index: `<header>` rimane `z-50`. Trigger hover area `z-[49]` (sotto header). Nessun cambiamento agli altri `z-[9999]` custom cursor.
- Home ha contenuti con `id="settori"`, `id="progetti"`, etc con `scroll-margin-top: calc(var(--header-height) + 24px)` già esistente in index.css riga 68. **NON cambiare**: quando menu è pill floating width minore o è nascosto, il `scroll-margin-top` esistente fornisce abbastanza spazio da non coprire titoli.
- Mobile/tablet (<1024px): floating pill NON si applica → full-width. Solo hide-on-scroll + hamburger come da specifica.
- Viewport 320px: verifica che 7 link (in mobile menu list) non sforino (oggi hanno `h-10 sm:h-12`, flex-col, quindi OK).

### Step 6 — Check finale no-regression contenuti
- Verificare che su **pagine NON-home** (Settori, Progetti, Showroom, Blog, Chi siamo, Contatti) dove non c'è `<div id="hero">`, il fallback della variabile `scrolled` venga usato (oggi: `scrolled = window.scrollY > 50`); va bene, adattare `scrolled` soglia minima a `96px` per usare più spazio sopra il contenuto ma senza nascondere prima.

---

## Dependencies and Considerations

- **Nessuna nuova dipendenza npm**. Tutta logica nativa React/Window.
- **Hook esistenti**: riuso `usePrefersReducedMotion` → importarlo in Navbar.
- **`useLocation`** già importato in Navbar per route `/admin` check e active link → OK.
- **Compagnia con cookie banner e scroll-to-top**: questi hanno `z-?` (CookieBanner è probabilmente `z-50+`, ScrollToTop `z-40`): la navbar `z-50` va bene.
- **Resize heroHeight dinamico**: nel codice odierno si calcola una volta al mount + onScroll. Aggiungere `ResizeObserver` su hero se presente (opzionale, utile ma non bloccante) oppure refresh su `orientationchange`/resize.
- **Rischio micro-flip in iOS Safari 17 momentum scroll**: l'isteresi 6/4px + il debounce ~80ms evitano che l'overscroll elastico nasconda e riappaia il menu a caso. Come aggiunta: se `scrollY < document.documentElement.scrollHeight - window.innerHeight - 50` (non fondo pagina) e overscroll up negativo → non triggerare nascondi.
- **`window` SSR**: tutto dentro useEffect che gira solo lato client, quindi `typeof window !== 'undefined'` checks ridondanti ma non vietati.

---

## Validation

Dopo implementazione, eseguire:

| Check | Strumento | Esito atteso |
|---|---|---|
| 1. TypeScript no errori | `GetDiagnostics` su `src/components/Navbar.tsx` + `src/index.css` | 0 errori |
| 2. Build completa | `npm run build` (vite build + tsc server) | Exit 0 |
| 3. 7 link identici + CTA | Ispezionare `<Navbar>` in DevTools Elements | Home/Settori/Progetti/Showroom/Blog/Chi siamo/Contatti + Richiedi preventivo invariati |
| 4. Scenario scroll home (DevTools) | Manuale: | a. Inizio pagina → menu VISIBILE, testo link contrasto alto su hero scuro. <br> b. Scroll giù 300px → menu scompare, transizione fluida (no scatto). <br> c. Scroll su 100px → menu riappare come FLOATING PILL centrato. <br> d. Tornare in cima (scrollY<32) → menu torna full-width classico. <br> e. Mouse muove verso striscia top a metà pagina → menu riappare (trigger hover). |
| 5. pointer-events check | Nascosto: `getComputedStyle(header).pointerEvents === 'none'` / visibile: `'auto'` | Si comporta come atteso |
| 6. Focus tastiera | Menu nascosto, fare Tab finché focus non arriva al primo link del menu (nascosto) → menu deve riapparire | OK |
| 7. prefers-reduced-motion | DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`: scomparsa/ricomparsa istantanea, no transizione | OK |
| 8. Mobile hamburger + viewport 320px | DevTools device toolbar iPhone SE → click hamburger: slide-down tutti 7 link visibili, close click funziona; scroll giù menu scompare, scroll su riappare full-width | OK |
| 9. Nessuna pagina route cambiata | Mano: tutte pagine pubbliche caricano col loro layout invariato | OK |

---

## Risks

| Rischio | Mitigazione |
|---|---|
| **Menu nascosto diventa inaccessibile tastiera / screen reader** | Step 2: focus detection + `pointer-events: auto` sempre? No: meglio il focus listener per forzare visible. Aggiungere `aria-hidden = !visible` sul `nav`. |
| **Floating pill "sposta" layout o salta durante transizione top/full-width** | Usare `transform: translate(-50%, 0)` con `will-change: transform`; su atTop è 0 transform. La pill non modifica flusso (sempre position: fixed). Nessun layout shift percepito. |
| **Home hero trasparente: link scuri su video scuro?** | Requisito 1 "evidente": applico text-white *solo* quando atTop && !scrolled (sopra hero scuro), quindi il contrasto resta alto. Quando scrolled torna colori standard (bg-[#FAFAFA]/95 quindi sfondo chiaro + testo scuro). |
| **iOS Safari momentum scatta nascondi/mostra ripetuto** | Isteresi + soglie 6px/4px; inoltre se scrollY cambia velocemente (> 300px/s) non cambio stato nel batch. Anche RAF nativo limita a 60fps. |
| **Stato `visible` true/false flip/flop 1 pixel** | Debounce con `setTimeout(changeVisible, 80)` dentro RAF: se entro 80ms scroll cambia più volte direzione, l'ultimo decreta. Previene oscillazioni. |
| **Route admin non toccate** | `isAdmin` early return `null` già nel codice, non cambiato → AdminLayout ha navbar interna. |
