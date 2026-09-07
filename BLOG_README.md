# Blog Section - Arredi

## Panoramica

La sezione Blog è stata aggiunta al sito arredi.onrender.com per aumentare il traffico organico tramite contenuti SEO-ottimizzati su arredamento e design d'interni.

## Struttura del Progetto

### Backend

- **`server/models/Post.ts`** - Schema Mongoose per i post del blog
  - Campi: title, slug, sectorSlug, excerpt, content, coverImage, images, author, tags, relatedProductSlugs, seoTitle, seoDescription, isPublished
  - Indici su: slug, sectorSlug, publishedAt, isPublished

- **`server/routes/blog.ts`** - API REST per il blog
  - `GET /api/blog/posts` - Lista post pubblicati con filtri (sectorSlug, page, limit)
  - `GET /api/blog/posts/:slug` - Singolo post per slug
  - `GET /api/blog/sectors` - Lista settori con conteggio post
  - `POST /api/blog/posts` - Crea nuovo post (admin)
  - `PUT /api/blog/posts/:id` - Aggiorna post (admin)
  - `DELETE /api/blog/posts/:id` - Elimina post (admin)

- **`server/seedBlogPosts.ts`** - Script per popolare il database con post di esempio
  - 6 post SEO-ottimizzati per: salotto, cucina, camera-da-letto, bagno, ufficio, esterno

### Frontend

- **`src/api/blogApi.ts`** - Client API per il blog
  - Funzioni: getPosts(), getPostBySlug(), getSectors(), createPost(), updatePost(), deletePost()
  - Helper: generateSlug() per generare slug SEO-friendly dai titoli
  - Gestione fallback quando API non disponibile (Render)

- **`src/pages/Blog.tsx`** - Pagina lista blog (/blog)
  - Griglia di card post con filtri per settore
  - Pagination
  - Design coerente con il resto del sito

- **`src/pages/BlogPost.tsx`** - Pagina dettaglio post (/blog/:slug)
  - Breadcrumb, meta tags dinamici, schema.org JSON-LD
  - Box autore, tags, post correlati
  - CTA verso prodotti/settori

### Integrazione

- **`src/App.tsx`** - Route aggiunte: `/blog` e `/blog/:slug`
- **`src/components/Navbar.tsx`** - Link "Blog" aggiunto al menu principale
- **`src/components/Footer.tsx`** - Link "Blog" aggiunto alla sezione Azienda (mobile e desktop)

## Configurazione MongoDB

Assicurati di avere la variabile d'ambiente configurata:

```env
MONGODB_URI=mongodb://localhost:27017/arredi  # per sviluppo locale
# oppure la tua stringa di connessione MongoDB Atlas per produzione
```

## Esecuzione Seed Data

Per popolare il database con i post di esempio:

```bash
# Assicurati che MongoDB sia in esecuzione
npx tsx server/seedBlogPosts.ts
```

Questo creerà 6 post SEO-ottimizzati divisi per settore.

## Come Aggiungere Nuovi Post

### Via API (per admin)

Usa le funzioni in `src/api/blogApi.ts`:

```typescript
import { createPost, generateSlug } from './api/blogApi';

const newPost = {
  title: "Come arredare un soggiorno moderno",
  slug: generateSlug("Come arredare un soggiorno moderno"), // "arredare-soggiorno-moderno"
  sectorSlug: "salotto",
  excerpt: "Scopri le migliori idee per...",
  content: "<p>Contenuto HTML...</p>",
  coverImage: "https://...",
  author: { name: "Nome Autore", role: "Ruolo" },
  tags: ["salotto", "design", "moderno"],
  relatedProductSlugs: ["divani", "tavoli"],
  seoTitle: "Titolo SEO ottimizzato",
  seoDescription: "Descrizione SEO 140-160 caratteri",
  isPublished: true
};

await createPost(newPost);
```

### Direttamente nel Database

Connetti al tuo database MongoDB e inserisci un documento nella collezione `posts`.

## Gestione Slug e Settori

### Slug

- Generati automaticamente con `generateSlug()` da `src/api/blogApi.ts`
- Regole: lowercase, solo lettere/numeri/trattini, max 60 caratteri
- Rimuove stop words italiane (il, la, i, gli, le, un, una, in, con, per, da, a, su, di, del, della, dei, degli, delle, e, o, ma, perché, come, che, non)
- Esempio: "Come arredare un salotto piccolo" → "arredare-salotto-piccolo"

### Settori

I settori corrispondono alle categorie del sito:
- `salotto` - Salotto
- `cucina` - Cucina
- `camera-da-letto` - Camera da Letto
- `bagno` - Bagno
- `ufficio` - Ufficio
- `esterno` - Esterno

## Ottimizzazione SEO

### Titoli

- Chiari, con beneficio o soluzione
- Includi keyword principale
- Esempio: "Come arredare un salotto piccolo senza rinunciare al comfort"

### Meta Description

- 140-160 caratteri
- Include keyword e invito all'azione
- Esempio: "Scopri 7 idee pratiche per arredare un salotto piccolo e renderlo luminoso e accogliente."

### Struttura Contenuto

- Introduzione che descrive problema/obiettivo
- Sezioni con H2/H3
- Liste puntate/numerate per consigli pratici
- Immagini con alt descrittivi
- Conclusione con CTA verso collezioni
- Lunghezza: 800-1200 parole per post pillar, 500-800 per articoli specifici

### Schema.org

La pagina dettaglio include automaticamente JSON-LD per Article con:
- headline, description, image
- author, datePublished, dateModified

## Deploy su Render

1. Assicurati che `MONGODB_URI` sia configurato nelle variabili d'ambiente Render
2. Esegui lo script seed dopo il deploy (o manualmente via shell)
3. Verifica che le API rispondano correttamente
4. Testa le pagine blog su https://arredi.onrender.com/blog

## Note Importanti

- Le API client hanno fallback quando `VITE_API_BASE_URL` non è configurato (Render)
- I post non pubblicati (`isPublished: false`) non sono visibili nel frontend
- Le immagini usano URL esterni (es. Unsplash) - sostituisci con le tue immagini
- Il contenuto supporta HTML per formattazione avanzata
