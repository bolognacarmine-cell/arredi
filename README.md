# Farcom Arredi - Sito Web e Pannello Admin

Sito web aziendale per Farcom Srl, azienda di arredamento e progettazione interni a Macerata Campania, con pannello di amministrazione per gestione progetti, preventivi, showroom e blog.

## 🏛️ Architettura del Progetto

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **Backend**: Express.js + TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Image Storage**: Cloudinary
- **Deploy**: Render (unified service)

## 📋 Prerequisiti

- Node.js >= 18.0.0
- pnpm >= 10.34.3
- MongoDB Atlas account (per database di produzione)
- Cloudinary account (per upload immagini)

## 🚀 Quick Start

### 1. Clona il repository

```bash
git clone <repository-url>
cd arredi
```

### 2. Installa le dipendenze

```bash
pnpm install
```

### 3. Configura le variabili d'ambiente

Crea i file di configurazione environment:

```bash
# Crea file per variabili frontend
cp frontend.env.example .env

# Crea file per variabili server
cp server.env.example .server.env
```

#### Configurazione Frontend (.env)

```bash
# API Configuration
VITE_API_BASE_URL=  # Lascia vuoto per same-origin in produzione
```

#### Configurazione Server (.server.env)

```bash
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arredi?retryWrites=true&w=majority

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:8443

# Cloudinary (REQUIRED per upload immagini)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Telegram Bot Configuration (opzionale - per notifiche preventivi)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Admin User Configuration
ADMIN_EMAIL=admin@farcom.local
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_NAME=Admin Farcom

# Admin Reset Password (opzionale)
ADMIN_RESET_PASSWORD=Farcom2026

# Session Secret (REQUIRED)
SESSION_SECRET=your_secure_random_session_secret_here
```

### 4. Avvia in modalità sviluppo

```bash
pnpm run dev
```

Questo avvia sia il frontend Vite (su http://localhost:8443) che il backend Express (su http://localhost:3002) contemporaneamente.

### 5. Crea l'utente admin

```bash
cd server
npm run seed:admin
```

Questo crea l'utente admin usando le credenziali configurate in `.server.env`.

**⚠️ Password Requirements:** La password admin deve rispettare i seguenti requisiti di sicurezza:
- Minimo 8 caratteri
- Almeno una lettera maiuscola
- Almeno una lettera minuscola
- Almeno un numero
- Almeno un carattere speciale (!@#$%^&*())

Esempio valido: `Farcom2026!`

## 🏗️ Struttura del Progetto

```
arredi/
├── server/                      # Backend Express
│   ├── index.ts               # Entry point server
│   ├── db.ts                  # Connessione MongoDB
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Project.ts
│   │   ├── Quote.ts
│   │   ├── Media.ts
│   │   ├── Post.ts
│   │   └── SiteConfig.ts
│   ├── routes/                # API routes
│   │   ├── admin.ts
│   │   ├── products.ts
│   │   ├── projects.ts
│   │   ├── quotes.ts
│   │   ├── media.ts
│   │   ├── blog.ts
│   │   └── siteConfig.ts
│   ├── middleware/            # Express middleware
│   │   └── requireAdmin.ts
│   ├── utils/                 # Utility functions
│   │   ├── email.ts
│   │   └── telegram.ts
│   └── seedAdmin.ts           # Script creazione admin
├── src/                        # Frontend React
│   ├── components/            # React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── CookieBanner.tsx
│   │   └── ...
│   ├── pages/                 # Page components
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   ├── Quote.tsx
│   │   ├── admin/            # Admin pages
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ...
│   │   └── showroom/         # Showroom pages
│   ├── api/                   # API client functions
│   │   ├── productsApi.ts
│   │   ├── projectsApi.ts
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   └── useAdminAuth.tsx
│   ├── lib/                   # Utility libraries
│   │   └── cloudinary/
│   ├── data.ts                # Static data
│   ├── App.tsx                # Main app component
│   └── main.tsx               # React entry point
├── index.html                  # HTML template
├── vite.config.ts             # Vite configuration
├── package.json               # Project dependencies
└── .server.env.example        # Environment variables template
```

## 🔧 Script Disponibili

```bash
# Sviluppo
pnpm run dev              # Avvia frontend + backend in sviluppo
pnpm run build            # Build frontend + backend
pnpm start                # Avvia server in produzione

# Server specifici
cd server
npm run dev               # Solo backend sviluppo
npm run build             # Build backend TypeScript
npm start                 # Avvia backend produzione
npm run seed:admin        # Crea utente admin
```

## 🔐 Autenticazione Admin

### Accesso Pannello Admin

1. Naviga a `http://localhost:8443/admin/login`
2. Usa le credenziali configurate in `.server.env`:
   - Email: `ADMIN_EMAIL` (default: admin@farcom.local)
   - Password: `ADMIN_PASSWORD`

### Reset Password Admin

Se dimentichi la password, usa l'endpoint di reset:

```bash
curl -X POST http://localhost:3002/api/admin/reset-admin-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@farcom.local", "resetCode": "buongiorno"}'
```

La password verrà resettata al valore di `ADMIN_RESET_PASSWORD`.

## 📦 Funzionalità Principali

### Frontend Pubblico
- **Homepage**: Hero section, settore showcase, CTA
- **Progetti**: Portfolio progetti completati con galleria
- **Showroom**: Catalogo prodotti arredamento
- **Preventivi**: Form richiesta preventivo con upload file
- **Blog**: Articoli e news aziendali
- **Contatti**: Informazioni e form contatti
- **Pagine Legali**: Privacy, Cookie, Note legali

### Pannello Admin
- **Dashboard**: Overview statistiche
- **Gestione Progetti**: CRUD progetti con immagini
- **Gestione Preventivi**: Visualizza e gestisci richieste
- **Gestione Showroom**: CRUD prodotti arredamento
- **Gestione Blog**: Creazione e modifica articoli
- **Impostazioni**: Configurazione sito, email, SMTP
- **Media Library**: Gestione immagini Cloudinary

## 🚢 Deploy su Render

### 1. Prepara il repository

Assicurati che tutte le variabili d'ambiente siano configurate nelle Environment Variables di Render.

### 2. Configura Build Command

```
pnpm install && pnpm run build
```

### 3. Configura Start Command

```
pnpm start
```

### 4. Environment Variables (Render)

Configura queste variabili nel pannello Render:

```bash
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your_secure_secret
ADMIN_EMAIL=admin@farcom.local
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin Farcom
ADMIN_RESET_PASSWORD=Farcom2026
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TELEGRAM_BOT_TOKEN=your_bot_token (opzionale)
TELEGRAM_CHAT_ID=your_chat_id (opzionale)
NODE_ENV=production
```

### 5. Deploy

Pusha su GitHub e Render farà automaticamente il deploy.

## 🔒 Sicurezza

- **Autenticazione Admin**: Session-based con bcrypt password hashing
- **CORS**: Configurato per same-origin in produzione
- **Security Headers**: CSP, XSS protection, frame options
- **Input Validation**: Validazione su tutti gli endpoint API
- **Environment Variables**: Tutti i secrets in variabili d'ambiente

Per dettagli completi sulla sicurezza, vedi `SECURITY.md`.

## 🧪 Testing

Il progetto include test E2E con Playwright. Per eseguire i test:

```bash
pnpm test
```

## 🔍 Health Check

Per verificare lo stato del server e della connessione database:

```bash
curl http://localhost:3002/health
```

Risposta esempio:
```json
{
  "status": "ok",
  "timestamp": "2026-09-22T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": "connected",
  "memory": {
    "used": 45,
    "total": 128
  }
}
```

In produzione, usa: `https://arredi.onrender.com/health`

## 📚 Documentazione Aggiuntiva

Per una documentazione completa e centralizzata, consulta **[DOCUMENTATION.md](DOCUMENTATION.md)** che include:

- `SECURITY.md` - Dettagli sicurezza e hardening
- `BACKEND.md` - Documentazione API backend
- `ADMIN_AUTHENTICATION.md` - Sistema autenticazione admin
- `RENDER-SETUP.md` - Istruzioni deploy specifiche Render
- `CLIENT_GUIDE.md` - Guida per il cliente sul pannello admin
- Altri documenti tecnici e note

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verifica che `MONGODB_URI` sia corretto
- Controlla IP whitelist in MongoDB Atlas
- Assicurati che l'utente database abbia permessi corretti

### Cloudinary Upload Fails
- Verifica che `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, e `CLOUDINARY_API_SECRET` siano configurati
- Controlla che l'upload preset sia configurato come "Unsigned"

### Admin Login Fails
- Verifica che l'utente admin esista nel database
- Controlla che `SESSION_SECRET` sia configurato
- Usa lo script `seed:admin` per ricreare l'utente admin

## 📞 Supporto

Per problemi o domande:
- Controlla la documentazione nei file .md
- Verifica i log del server per errori
- Controlla la console browser per errori frontend

## 📄 Licenza

ISC

---

**Sviluppato per Farcom Srl** - Arredamento e Progettazione Interni a Macerata Campania