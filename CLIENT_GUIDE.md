# Guida per il Cliente - Pannello Admin Farcom Arredi

Questa guida ti aiuterà a gestire il sito web Farcom Arredi attraverso il pannello di amministrazione.

## 🔐 Accesso al Pannello Admin

### URL di Accesso
- **Produzione**: `https://arredi.onrender.com/admin`
- **Sviluppo**: `http://localhost:8443/admin`

### Credenziali di Accesso
Le tue credenziali di accesso sono state fornite durante la configurazione iniziale. Se le hai dimenticate, contatta il supporto tecnico.

**⚠️ IMPORTANTE**: Non condividere le tue credenziali con persone non autorizzate.

### Requisiti Password

Per motivi di sicurezza, la password deve rispettare i seguenti requisiti:

- **Minimo 8 caratteri**
- **Almeno una lettera maiuscola** (A-Z)
- **Almeno una lettera minuscola** (a-z)
- **Almeno un numero** (0-9)
- **Almeno un carattere speciale** (!@#$%^&*())

**Esempio di password valida:** `Farcom2026!`

Il sistema mostra un feedback immediato mentre digiti la password, indicando se è valida o quali requisiti mancano.

## 📊 Dashboard

La dashboard ti mostra una panoramica del sito:
- Statistiche sui progetti pubblicati
- Numero di preventivi ricevuti
- Stato del sistema

## 🏗️ Gestione Progetti

### Come Aggiungere un Nuovo Progetto

1. Accedi al pannello admin
2. Clicca su "Progetti" nel menu laterale
3. Clicca su "Nuovo Progetto"
4. Compila i campi:
   - **Titolo**: Nome del progetto (es. "Ristrutturazione Bar Milano")
   - **Settore**: Seleziona il settore (es. "Barbieri & Parrucchieri")
   - **Località**: Città o zona del progetto
   - **Anno**: Anno di realizzazione
   - **Cliente**: Nome del cliente
   - **Descrizione**: Descrizione dettagliata del progetto
   - **Immagini**: Carica le immagini del progetto (usa Cloudinary)
   - **Tag**: Parole chiave per la ricerca
   - **Materiali**: Materiali utilizzati
   - **Stato**: Seleziona "completato" per progetti finiti
   - **In evidenza**: Attiva per mostrare il progetto in homepage

5. Clicca "Salva"

### Come Modificare un Progetto Esistente

1. Vai su "Progetti"
2. Clicca sul progetto da modificare
3. Apporta le modifiche desiderate
4. Clicca "Salva"

### Come Eliminare un Progetto

1. Vai su "Progetti"
2. Clicca sul progetto da eliminare
3. Clicca "Elimina" e conferma

**⚠️ ATTENZIONE**: L'eliminazione è irreversibile.

## 📝 Gestione Preventivi

### Visualizzare i Preventivi Ricevuti

1. Clicca su "Preventivi" nel menu laterale
2. Vedrai una lista di tutte le richieste ricevute
3. Clicca su un preventivo per vedere i dettagli

### Stato dei Preventivi

I preventivi possono avere questi stati:
- **Nuovo**: Richiesta appena ricevuta
- **Contattato**: Cliente contattato
- **Chiuso**: Preventivo conclusato

### Come Cambiare lo Stato

1. Apri il preventivo
2. Clicca sul pulsante dello stato desiderato
3. Il sistema registra automaticamente chi ha cambiato lo stato e quando

### Contattare il Cliente

Ogni preventivo include:
- Nome e cognome del cliente
- Email e telefono
- Dettagli del progetto
- Eventuali allegati (immagini, documenti PDF)

Per contattare il cliente, usa le informazioni fornite nel preventivo.

### WhatsApp Quick Reply

Per ogni preventivo è disponibile un link WhatsApp per contattare rapidamente il cliente con un messaggio precompilato.

## 🛍️ Gestione Showroom

### Aggiungere un Nuovo Prodotto

1. Clicca su "Showroom" → "Prodotti"
2. Clicca "Nuovo Prodotto"
3. Compila i campi:
   - **Nome**: Nome del prodotto
   - **Descrizione**: Descrizione dettagliata
   - **Settore attività**: Seleziona il settore
   - **Tipo arredamento**: Seleziona la categoria
   - **Prezzo base**: Prezzo del prodotto
   - **Immagini**: Carica le immagini del prodotto
   - **SKU**: Codice prodotto (opzionale)
   - **Attivo**: Attiva per mostrare il prodotto nel catalogo

4. Clicca "Salva"

### Gestire Promozioni

Puoi creare promozioni sui prodotti:
- **Promozione attiva**: Attiva/disattiva la promozione
- **Tipo sconto**: Percentuale o importo fisso
- **Valore sconto**: Valore dello sconto
- **Date promozione**: Inizio e fine promozione
- **Testo promozionale**: Testo da mostrare ai clienti

## 📰 Gestione Blog

### Pubblicare un Nuovo Articolo

1. Clicca su "Blog" nel menu
2. Clicca "Nuovo Articolo"
3. Compila i campi:
   - **Titolo**: Titolo dell'articolo
   - **Slug**: URL dell'articolo (generato automaticamente dal titolo)
   - **Settore**: Seleziona il settore (opzionale)
   - **Estratto**: Breve descrizione per la lista articoli
   - **Contenuto**: Testo completo dell'articolo
   - **Immagine copertina**: Carica un'immagine
   - **Pubblicato**: Attiva per pubblicare l'articolo

4. Clicca "Salva"

### Modificare un Articolo

1. Vai su "Blog"
2. Clicca sull'articolo da modificare
3. Apporta le modifiche
4. Clicca "Salva"

## ⚙️ Impostazioni

### Configurazione Generale

Nella sezione "Impostazioni" puoi modificare:
- Informazioni aziendali
- Contatti
- Social media links
- Testi del sito

### Configurazione Email

Per ricevere notifiche email quando ricevi preventivi:

1. Vai su "Impostazioni" → "Email"
2. Compila i campi SMTP:
   - **Host**: Server SMTP (es. smtp.gmail.com)
   - **Porta**: Porta SMTP (es. 587 per TLS, 465 per SSL)
   - **Username**: Email SMTP
   - **Password**: Password SMTP
   - **Email mittente**: Email da cui inviare le notifiche
   - **Nome mittente**: Nome da mostrare nelle email
3. Clicca "Salva configurazione SMTP"
4. Clicca "Invia email di test" per verificare

### Notifiche Telegram

Se configurato, riceverai notifiche Telegram quando arriva un nuovo preventivo. Contatta il supporto tecnico per la configurazione.

## 🖼️ Media Library

La Media Library ti permette di:
- Caricare nuove immagini
- Cercare immagini esistenti
- Selezionare immagini per progetti, prodotti, blog
- Organizzare immagini per categoria

### Caricare Nuove Immagini

1. Clicca su "Media" nel menu (se abilitato)
2. Clicca "Carica immagine"
3. Seleziona il file dal tuo computer
4. Specifica categoria e titolo
5. Clicca "Carica"

## 💡 Consigli Utili

### Best Practices per i Progetti
- Usa immagini di alta qualità (minimo 1200px larghezza)
- Scrivi descrizioni dettagliate per migliorare SEO
- Aggiungi tag pertinenti per facilitare la ricerca
- Mantieni i progetti "in evidenza" aggiornati

### Best Practices per i Preventivi
- Rispondi ai preventivi entro 24 ore
- Aggiorna lo stato regolarmente
- Usa le note per tracciare i follow-up
- Controlla gli allegati prima di contattare il cliente

### Best Practices per il Blog
- Pubblica articoli regolarmente per migliorare SEO
- Usa titoli accattivanti e descrittivi
- Includi immagini nei tuoi articoli
- Scrivi contenuti rilevanti per i tuoi clienti

## 🔒 Sicurezza

### Password
- Usa una password forte
- Cambia la password regolarmente
- Non usare la stessa password su altri siti

### Sessione
- La sessione admin scade dopo 24 ore
- Fai logout quando finisci di lavorare
- Non lasciare il browser aperto sul pannello admin

### Backup
- Il sistema crea automaticamente backup delle modifiche
- I backup sono salvati nella cartella `src/data.backups/`
- In caso di errore, puoi ripristinare da un backup

## 🆘 Troubleshooting

### Problemi comuni

**Non riesco a fare login**
- Verifica che email e password siano corretti
- Contatta il supporto se hai dimenticato le credenziali

**Le immagini non si caricano**
- Verifica che Cloudinary sia configurato
- Controlla che il file non sia troppo grande (max 8MB)
- Assicurati che il formato sia supportato (JPG, PNG, WebP)

**Le modifiche non appaiono sul sito**
- Aspetta qualche minuto per il refresh della cache
- Controlla che la modifica sia stata salvata correttamente
- In produzione, il sito si aggiorna automaticamente dopo pochi minuti

### Contattare il Supporto

Se riscontri problemi non risolti in questa guida:
- Contatta il supporto tecnico
- Fornisci dettagli specifici del problema
- Includi screenshot se possibile

## 📞 Contatti Supporto

Per assistenza tecnica:
- Email: [inserire email supporto]
- Telefono: [inserire numero supporto]

---

**Versione**: 1.0  
**Ultimo aggiornamento**: Settembre 2026  
**Sviluppato per**: Farcom Srl