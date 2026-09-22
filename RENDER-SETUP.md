# Render Setup - Unified Backend + Frontend Service

## 🎯 Obiettivo
Far girare backend Express + frontend Vite in un unico servizio Render.

## ✅ Modifiche Implementate

### 1. Server Express Modificato (`server/index.ts`)
- ✅ Aggiunto supporto per servire file statici da `dist/` in produzione
- ✅ Configurato SPA routing per React Router
- ✅ Ottimizzato cache per file statici (1 anno)
- ✅ Protezione CORS corretta per same-origin

### 2. Package.json Aggiornato
- ✅ Script `build` ora compila sia frontend che backend
- ✅ Script `start` avvia il server Express compilato
- ✅ Dipendenze backend spostate nel package.json principale
- ✅ TypeScript e tsx aggiunti come devDependencies

### 3. Environment Variables
- ✅ `VITE_API_BASE_URL` vuoto in produzione (same-origin)
- ✅ `FRONTEND_ORIGIN` configurato per same-origin

## 🚀 Configurazione Render

### Build Command
```
npm install && npm run build
```

### Start Command
```
npm start
```

### Environment Variables (Render)
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://soniaianos1980_db_user:09TC80VbN2mD9jew@cluster0.uvcxexx.mongodb.net/arredi?retryWrites=true&w=majority

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration (same origin)
FRONTEND_ORIGIN=https://arredi.onrender.com

# Frontend Configuration
VITE_API_BASE_URL=  # Empty for same-origin

# Cloudinary (CRITICAL for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t
VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads

# Session Secret (CRITICAL for admin authentication)
SESSION_SECRET=your_secure_random_session_secret_here

# Admin Credentials
ADMIN_EMAIL=admin@farcom.local
ADMIN_PASSWORD=Farcom2026
ADMIN_NAME=Admin Farcom
```

## 🔄 Flusso di Richieste

### API Requests
- `https://arredi.onrender.com/api/media` → Express API
- `https://arredi.onrender.com/api/projects` → Express API
- Tutte le route `/api/*` vengono gestite dal backend

### Frontend Requests
- `https://arredi.onrender.com/` → File statici da `dist/`
- `https://arredi.onrender.com/progetti` → `dist/index.html` (SPA routing)
- Tutte le route non-API servono file statici

### Frontend API Calls
- In produzione: `fetch('/api/media')` (same-origin)
- In sviluppo: `fetch('http://localhost:3001/api/media')`

## 🧪 Testing Locale

### 1. Avvio in Modalità Sviluppo
```bash
# Terminal 1: Frontend development
npm run dev

# Terminal 2: Backend development  
npm run server:dev
```

### 2. Avvio in Modalità Produzione (Locale)
```bash
# Build frontend + backend
npm run build

# Avvia server che serve anche frontend
npm start
```

## ⚠️ Note Importanti

1. **MongoDB URI**: Già configurato con le tue credenziali
2. **Environment Variables**: Devi aggiornare `VITE_API_BASE_URL` su Render
3. **Deploy**: Render rebuild automatico dopo le modifiche
4. **Frontend URL**: Rimane `https://arredi.onrender.com`

## 🎯 Prossimi Passi

1. **Push su GitHub** delle modifiche
2. **Aggiornare Render**:
   - Cambia Start command in `npm start`
   - Aggiorna environment variables
3. **Testare** il deploy su Render
4. **Verificare** che API e frontend funzionino insieme

## 🔍 Verifica Post-Deploy

1. **Health Check**: `https://arredi.onrender.com/health`
2. **API Test**: `https://arredi.onrender.com/api/media`
3. **Frontend**: `https://arredi.onrender.com/`
4. **API Calls**: Controlla network tab per chiamate API

## 🚨 Troubleshooting

### Se il frontend non carica:
- Verifica che `dist/` sia stato creato correttamente
- Controlla i log Render per errori di build

### Se le API non rispondono:
- Verifica MONGODB_URI in environment variables
- Controlla che MongoDB sia accessibile
- Controlla i log per errori di connessione

### Se ci sono errori CORS:
- Verifica FRONTEND_ORIGIN environment variable
- In produzione con same-origin, CORS non dovrebbe essere un problema

### Se il caricamento immagini fallisce ("Upload Cloudinary fallito"):
- **CRITICAL**: Verifica che le seguenti variabili d'ambiente siano impostate su Render:
  - `VITE_CLOUDINARY_CLOUD_NAME=qz1f1z6t`
  - `VITE_CLOUDINARY_UPLOAD_PRESET=farcom-uploads`
- Controlla la console del browser per errori di configurazione Cloudinary
- Verifica che l'upload preset "farcom-uploads" sia configurato nel dashboard Cloudinary
- Controlla i log per errori di rete durante l'upload

### Se l'autenticazione admin non funziona (401 errors):
- Verifica che `SESSION_SECRET` sia impostato su Render
- Controlla che le credenziali admin siano corrette
- Verifica che MongoDB sia accessibile per lo storage delle sessioni
- Controlla i log per errori di sessione
