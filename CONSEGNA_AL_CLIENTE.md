# Consegna al cliente – Farcom Arredi

**Sito:** farcomarredi.it  
**Data consegna:** 13 Ottobre 2026  
**Valore indicativo per vendita:** €3.000 + IVA (range prudente €2.800 – €3.200 + IVA)

## Cosa viene consegnato

### 1. Codice sorgente completo
- Repository Git completo (`arredi.git`) con:
  - Frontend: React + Vite + TypeScript + Tailwind CSS v4
  - Backend: Node.js + Express + TypeScript + Mongoose (MongoDB)
  - PWA configurata (vite-plugin-pwa)
  - Ottimizzazioni già applicate (preconnect CDN, gzip, WebP/AVIF, code-splitting route)

**Commit corrente:** `a14bb73` (Perf: preconnect CDN, gzip compression, logo WebP/AVIF, route code-splitting)  
**Tag di sicurezza:** `pre-ottimizzazioni-2026-10-13`  
**Branch backup:** `backup/pre-ottimizzazioni`

### 2. Asset e contenuti
- Font self-hosted (Manrope, WOFF2)
- Video in `public/videos/` (farcom-hero.mp4, showroom.mp4)
- Immagini ottimizzate (AVIF/WebP/PNG)
- Sitemap, robots.txt, llms.txt, manifest PWA

### 3. Dati presenti
- Progetti (29), Prodotti/Showroom (10), Preventivi (11), Blog (6), Media (236), Utenti (1)
- Configurazioni sito, SEO, cookie policy, privacy, note legali

## Accessi da trasferire

### OBBLIGATORI per avviare il sito
1. **Git repository** → trasferire repo a nuovo proprietario (fork/export o invio ZIP + credenziali)
2. **MongoDB Atlas** → trasferire ownership del progetto/database o creare nuovo cluster e migrare dati
3. **Render** (hosting attuale) → trasferire proprietà dell'app `arredi` o migrare su nuovo account. Alternativa: nuovo hosting (Railway/Render/Netlify+Render/Render unico)
4. **Dominio `farcomarredi.it`** → trasferimento da registrar attuale a nuovo proprietario (o cambio DNS su nuovo hosting)

### FACOLTATIVI (se ancora attivi)
- **Cloudinary** (qz1f1z6t) → se utilizzato per upload immagini/admin, trasferire account o aggiornare credenziali
- **Email SMTP / Telegram** (se configurati per notifiche preventivi)

## Variabili d'ambiente da configurare
Vedi file: `server/server.env.example`, `.server.env.example`, `RENDER_ENVIRONMENT_SETUP.md`

Minime necessarie (Render):
- `MONGODB_URI`
- `SESSION_SECRET` (generare nuovo)
- `NODE_ENV=production`
- `FRONTEND_ORIGIN=https://www.farcomarredi.it`

Frontend Cloudinary (se usato):
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## Istruzioni rapide per il nuovo proprietario
1. Clonare repo → `npm install`
2. Configurare env (locale e produzione)
3. Build → `npm run build`
4. Avviare → `npm start` (serve frontend+backend unificati)
5. Aprire `https://<dominio>/admin` e verificare login
6. Verificare `/health` → `{"status":"ok","database":"connected"}`

## Note tecniche
- Build unico: `vite build && tsc -p server`
- Start unico: `npm start` → avvia `server/dist/index.js` (serve anche `dist/` statici)
- Sessioni su MongoDB (persistenti tra riavvii)
- Code-splitting attivo, gzip HTTP attivo, logo in AVIF/WebP

## Ripristino di sicurezza
In caso di problemi: tornare al commit `pre-ottimizzazioni-2026-10-13` con `git reset --hard pre-ottimizzazioni-2026-10-13`.

## Prezzo per la vendita
**€3.000 + IVA** (range prudente €2.800 – €3.200 + IVA). Comprende codice sorgente, asset, contenuti attuali, stato attuale testato.
