# Documentazione Tecnica - Farcom Arredi

Questa pagina centralizza tutta la documentazione tecnica del progetto.

## 📚 Indice Documentazione

### 🚀 Guida Rapida
- **[README.md](README.md)** - Guida principale con setup, struttura progetto e deploy
- **[CLIENT_GUIDE.md](CLIENT_GUIDE.md)** - Guida per il cliente sull'uso del pannello admin

### 🔒 Sicurezza
- **[SECURITY.md](SECURITY.md)** - Report completo sulle misure di sicurezza implementate
  - HTTP security headers
  - Error information masking
  - Input validation
  - Rate limiting
  - Future security improvements

### 🔐 Autenticazione
- **[ADMIN_AUTHENTICATION.md](ADMIN_AUTHENTICATION.md)** - Sistema autenticazione admin
  - Configurazione environment variables
  - API endpoints
  - Gestione sessioni
  - Reset password

### 🔧 Backend
- **[BACKEND.md](BACKEND.md)** - Documentazione API backend
  - Architettura backend
  - Setup database MongoDB
  - API endpoints completi
  - Troubleshooting comune

### 🚀 Deploy
- **[RENDER-SETUP.md](RENDER-SETUP.md)** - Istruzioni specifiche per deploy su Render
  - Configurazione unified service
  - Environment variables
  - Troubleshooting deploy

### 📝 Blog
- **[BLOG_README.md](BLOG_README.md)** - Documentazione sistema blog
- **[NOTE_BLOG_API.md](NOTE_BLOG_API.md)** - Note sull'API blog

### 🎯 Note Tecniche
- **[NOTES.md](NOTES.md)** - Note generali e appunti tecnici

## 🏗️ Architettura del Progetto

### Frontend (React + Vite + TypeScript)
```
src/
├── components/          # Componenti React riutilizzabili
├── pages/              # Pagine dell'applicazione
│   ├── admin/         # Pagine pannello admin
│   └── showroom/      # Pagine showroom
├── api/               # Client API
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
└── data.ts            # Dati statici
```

### Backend (Express + TypeScript + MongoDB)
```
server/
├── models/            # Mongoose models
├── routes/            # API routes
├── middleware/        # Express middleware
├── utils/             # Utility functions
└── config/            # Configuration files
```

## 🔐 Variabili d'Ambiente

### Frontend (.env)
```bash
VITE_API_BASE_URL=           # API base URL (vuoto per same-origin)
VITE_CLOUDINARY_CLOUD_NAME=   # Cloudinary cloud name
VITE_CLOUDINARY_UPLOAD_PRESET= # Cloudinary upload preset
```

### Server (.server.env)
```bash
MONGODB_URI=                 # MongoDB connection string
PORT=3002                    # Server port
NODE_ENV=development         # Environment mode
FRONTEND_ORIGIN=             # CORS origin
CLOUDINARY_CLOUD_NAME=       # Cloudinary cloud name
CLOUDINARY_API_KEY=          # Cloudinary API key
CLOUDINARY_API_SECRET=       # Cloudinary API secret
TELEGRAM_BOT_TOKEN=          # Telegram bot token (opzionale)
TELEGRAM_CHAT_ID=            # Telegram chat ID (opzionale)
ADMIN_EMAIL=                 # Admin email
ADMIN_PASSWORD=              # Admin password
ADMIN_NAME=                  # Admin display name
ADMIN_RESET_PASSWORD=        # Password for reset
ADMIN_RESET_CODE=            # Code for password reset
SESSION_SECRET=              # Session encryption secret
```

## 🛡️ Sicurezza Implementata

### Headers di Sicurezza
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
- Content-Security-Policy: Configurato per permettere React/Vite

### Rate Limiting
- **Login**: 20 richieste/15 minuti per IP
- **Quote submissions**: 5 richieste/ora per IP
- **Admin API**: 100 richieste/15 minuti per IP

### Validazione Input
- Tutti gli endpoint hanno validazione tipo e presenza
- Lunghezza massima per stringhe
- Validazione formato email base
- Validazione numerica per prezzi

### Autenticazione
- Bcrypt password hashing (10 salt rounds)
- Session-based authentication con MongoDB store
- HttpOnly, Secure cookies in produzione
- SameSite: lax per CSRF protection

## 🚀 Deployment

### Development
```bash
pnpm install
pnpm run dev
```

### Production
```bash
pnpm install
pnpm run build
pnpm start
```

### Render Deployment
- Build Command: `pnpm install && pnpm run build`
- Start Command: `pnpm start`
- Environment Variables: Configurare tutte le variabili richieste

## 🔍 Monitoring

### Health Check
```bash
curl https://arredi.onrender.com/health
```

Risposta:
```json
{
  "status": "ok",
  "timestamp": "2026-09-22T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": "connected",
  "memory": {
    "used": 45,
    "total": 128
  }
}
```

## 📊 Performance

### Database Indexes
- **User**: email, role
- **Quote**: createdAt, stato, email, settore
- **Product**: slug, activitySector, furnitureType, active, promoActive
- **Project**: sector, sectorId, featured, status, createdAt

### Log Management
- Log dettagliati solo in development
- Log error sempre attivi
- Console.error per errori critici

## 🧪 Testing

### E2E Tests
```bash
pnpm test
```

### TypeScript Check
```bash
cd server && npx tsc --noEmit
```

## 🐛 Troubleshooting

### Problemi Comuni

**MongoDB Connection Failed**
- Verifica MONGODB_URI
- Controlla IP whitelist in MongoDB Atlas
- Assicurati che l'utente database abbia permessi corretti

**Cloudinary Upload Fails**
- Verifica configurazione Cloudinary
- Controlla upload preset settings
- Assicurati che file sia nel formato e dimensione corretti

**Admin Login Fails**
- Verifica che utente admin esista nel database
- Controlla SESSION_SECRET configurato
- Usa script seed:admin per ricreare utente

**Rate Limiting Errors**
- Se ricevi "too many requests", aspetta il periodo di cooldown
- In development, puoi modificare i limiti in `server/middleware/rateLimiter.ts`

## 📞 Supporto Tecnico

Per problemi tecnici:
1. Controlla la documentazione pertinente
2. Verifica i log del server
3. Controlla la console browser per errori frontend
4. Usa l'health check endpoint per verificare lo stato sistema

## 🔄 Aggiornamenti

### Ultimi Miglioramenti (Settembre 2026)
- ✅ Cookie banner GDPR-compliant con pulsante "Rifiuta"
- ✅ Rimozione credenziali hardcoded Telegram
- ✅ Rate limiting su endpoint critici
- ✅ Health check endpoint per monitoring
- ✅ Miglioramento sistema reset password
- ✅ Database indexes per performance
- ✅ Log management per production
- ✅ Documentazione centralizzata

---

**Versione Documentazione**: 1.0  
**Ultimo Aggiornamento**: 22 Settembre 2026  
**Progetto**: Farcom Arredi - Sito Web Aziendale