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
# Crea file per variabili server
cp .server.env.example .server.env
```

#### Configurazione Server (.server.env)

```bash
# MongoDB Connection (REQUIRED)
MONGODB_URI=replace-with-mongodb-connection-string

# Server Configuration
PORT=3002

# Session Secret (REQUIRED)
SESSION_SECRET=replace-with-a-long-random-secret
```

### 4. Avvia in modalità sviluppo

```bash
pnpm run dev
```

Questo avvia sia il frontend Vite (su http://localhost:8443) che il backend Express (su http://localhost:3002) contemporaneamente.

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
```

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
- **Gestione Progetti**: CRUD progetti con immagini
- **Gestione Preventivi**: Visualizza e gestisci richieste
- **Gestione Showroom**: CRUD prodotti arredamento
- **Gestione Blog**: Creazione e modifica articoli
- **Impostazioni**: Configurazione sito, email, SMTP

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
PORT=3002
NODE_ENV=production
```

### 5. Deploy

Pusha su GitHub e Render farà automaticamente il deploy.

## 🔒 Sicurezza

- **Autenticazione Admin**: Session-based con password hashing
- **CORS**: Configurato per same-origin in produzione
- **Security Headers**: CSP, XSS protection, frame options
- **Input Validation**: Validazione su tutti gli endpoint API
- **Environment Variables**: Tutti i secrets in variabili d'ambiente

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

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verifica che `MONGODB_URI` sia corretto
- Controlla IP whitelist in MongoDB Atlas
- Assicurati che l'utente database abbia permessi corretti

### Admin Login Fails
- Verifica che `SESSION_SECRET` sia configurato
- Controlla che l'utente admin esista nel database

## 📞 Supporto

Per problemi o domande:
- Controlla la documentazione nei file .md
- Verifica i log del server per errori
- Controlla la console browser per errori frontend

## 📄 Licenza

ISC

---

**Sviluppato per Farcom Srl** - Arredamento e Progettazione Interni a Macerata Campania