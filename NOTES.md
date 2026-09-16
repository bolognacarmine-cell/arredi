# NOTES - Configurazione SMTP

## Configurazione SMTP per Notifiche Email

### Panoramica
Il sistema supporta l'invio automatico di email di notifica quando i clienti inviano preventivi tramite il form pubblico. La configurazione SMTP viene gestita dal pannello admin.

### Campi SMTP Obbligatori
Per configurare il sistema di invio email, sono richiesti i seguenti campi:

- **Host SMTP** - Server hostname (es. smtp.office365.com, smtp.gmail.com)
- **Porta** - Porta del server SMTP (tipicamente 587 per TLS, 465 per SSL)
- **Username** - Username di autenticazione SMTP (es. farcomsrl@hotmail.com)
- **Password** - Password di autenticazione SMTP
- **Email mittente** - Indirizzo email da cui vengono inviate le email (es. farcomsrl@hotmail.com)
- **Nome mittente** - Nome visualizzato come mittente (es. "Arredi Farcom")

### Campi SMTP Opzionali
- **Email notifiche preventivi** - Indirizzo email per le notifiche al proprietario (se non configurato, usa farcomsrl@hotmail.com come fallback)

### Istruzioni di Configurazione

1. Accedi al pannello admin: https://arredi.onrender.com/admin/impostazioni
2. Seleziona la tab "Email"
3. Compila tutti i campi obbligatori:
   - Host SMTP: `smtp.office365.com`
   - Porta: `587`
   - Username: `farcomsrl@hotmail.com`
   - Password: (la tua password SMTP)
   - Email mittente: `farcomsrl@hotmail.com`
   - Nome mittente: `Arredi Farcom`
4. (Opzionale) Compila l'email notifiche preventivi se diversa da farcomsrl@hotmail.com
5. Clicca su "Salva configurazione SMTP"
6. Verifica la configurazione cliccando su "Invia email di test"

### Sicurezza

- **Password write-only**: La password SMTP viene salvata in modo sicuro e non viene mai mostrata nel frontend. Dopo il salvataggio, il campo password apparirà vuoto, ma la configurazione rimarrà attiva.
- **Username write-only**: Anche lo username SMTP viene trattato come campo sensibile e non viene mostrato dopo il salvataggio.
- **Non esporre credenziali**: Non condividere mai le credenziali SMTP con terze parti.

### Comportamento delle Notifiche Email

Quando un cliente invia un preventivo tramite il form pubblico:

1. **Il preventivo viene salvato nel database** - Questo avviene indipendentemente dalla configurazione email
2. **Le email di notifica vengono inviate in background** - Non bloccano l'esperienza dell'utente
3. **Vengono inviate due email:**
   - **Email dettagliata** a farcomsrl@hotmail.com con tutti i dettagli del preventivo
   - **Email di notifica** all'indirizzo configurato (o fallback a farcomsrl@hotmail.com)

### Logging delle Notifiche Email

Il sistema logga dettagliatamente il processo di invio email per i preventivi:

- `[Quote Notification] Starting quote notification process for: {email}` - Inizio processo
- `[Quote Notification] Sending detailed email to: {destination}` - Invio email dettagliata
- `[Quote Notification] Sending notification email to: {owner}` - Invio email notifica
- `[Quote Notification] Detailed email result: SUCCESS/FAILED {error}` - Risultato email dettagliata
- `[Quote Notification] Notification email result: SUCCESS/FAILED {error}` - Risultato email notifica
- `[Quotes] Quote notification emails sent successfully` - Successo completo
- `[Quotes] Failed to send quote notification emails` - Fallimento con configurazione incompleta
- `[Quotes] Error sending quote notification emails: {error}` - Errore imprevisto

### Verifica Funzionamento Email Preventivi

Per verificare che le email di notifica funzionino correttamente:

1. **Configurare SMTP** nell'admin panel (Settings > Email)
2. **Testare la configurazione** con "Invia email di test"
3. **Inviare un preventivo** dal form pubblico
4. **Controllare i log del server** per vedere i messaggi `[Quote Notification]`
5. **Verificare la ricezione** delle email su farcomsrl@hotmail.com

Se le email non arrivano:
- Controlla i log del server per errori specifici
- Usa "Debug configurazione" per verificare che la configurazione sia completa
- Verifica che le credenziali SMTP siano corrette
- Controlla la cartella spam della email di destinazione

### Risoluzione Problemi

#### I campi tornano vuoti dopo il salvataggio
- **Comportamento normale**: Username e password sono campi write-only per sicurezza. Appariranno vuoti dopo il salvataggio, ma la configurazione è attiva.
- **Se anche gli altri campi tornano vuoti**: Controlla la console del browser per errori di rete o verifica che il server sia attivo.

#### Errore "Missing required SMTP configuration fields"
- Assicurati di aver compilato tutti i campi obbligatori
- Verifica che i campi non contengano solo spazi vuoti
- Controlla che i nomi dei campi corrispondano a quelli attesi dal backend

#### Email di test non funziona
Il sistema ora fornisce messaggi di errore più specifici per aiutare nel debug:

**Errore di autenticazione SMTP:**
- Messaggio: "Errore di autenticazione SMTP: verifica username e password."
- Cosa controllare:
  - Username e password SMTP sono corretti
  - Per Gmail, potrebbe essere necessaria una "App Password" invece della password normale
  - Per Office 365, verifica che l'account non abbia l'autenticazione a 2 fattori che blocca le app
  - Controlla che il username sia nel formato corretto (es. farcomsrl@hotmail.com)

**Errore di connessione SMTP:**
- Messaggio: "Impossibile connettersi al server SMTP: verifica host e porta."
- Cosa controllare:
  - Host SMTP è corretto (es. smtp.office365.com, smtp.gmail.com)
  - Porta è corretta (587 per TLS, 465 per SSL)
  - Firewall o provider non sta bloccando le connessioni
  - Server SMTP è accessibile dalla rete del server

**Errore di configurazione incompleta:**
- Messaggio: "Configurazione SMTP incompleta: mancano i campi..."
- Cosa controllare:
  - Tutti i campi obbligatori sono compilati
  - Usa il pulsante "Debug configurazione" per vedere quali campi mancano

**Errore TLS/SSL:**
- Messaggio: "Errore di sicurezza SMTP: verifica configurazione TLS/SSL e porta."
- Cosa controllare:
  - Porta corretta per il tipo di connessione (587 per TLS, 465 per SSL)
  - Certificati SSL del server SMTP sono validi

#### Debug configurazione SMTP
Il pulsante "Debug configurazione" nell'admin panel mostra:
- Stato di ogni campo della configurazione SMTP
- Indica se la configurazione è completa
- Mostra i valori salvati (esclusi password e username per sicurezza)
- Timestamp dell'ultima verifica

Utilizza questa funzione per verificare che la configurazione sia salvata correttamente nel database.

#### Le email di notifica non arrivano
- Verifica che la configurazione SMTP sia stata salvata correttamente
- Controlla che il campo "Email notifiche preventivi" sia configurato correttamente
- Verifica nella cartella spam della email di destinazione
- Controlla i log del server per errori di invio
- Usa "Debug configurazione" per verificare lo stato della configurazione

### Configurazione Esempio per Office 365

```
Host SMTP: smtp.office365.com
Porta: 587
Username: farcomsrl@hotmail.com
Password: (tua password)
Email mittente: farcomsrl@hotmail.com
Nome mittente: Arredi Farcom
Email notifiche preventivi: (opzionale)
```

### Configurazione Esempio per Gmail

```
Host SMTP: smtp.gmail.com
Porta: 587
Username: tuoaccount@gmail.com
Password: (password app o password account)
Email mittente: tuoaccount@gmail.com
Nome mittente: Arredi Farcom
Email notifiche preventivi: (opzionale)
```

### Note Importanti

- **Non modificare il layout o il flusso visibile**: Le correzioni riguardano solo il salvataggio e il caricamento della configurazione.
- **Non hardcodare valori di default**: La configurazione deve persistere nel DB e non essere sovrascritta da valori predefiniti.
- **La configurazione rimane attiva**: Una volta salvata, la configurazione rimane attiva finché non viene modificata dall'admin.
- **Graceful degradation**: Il sistema funziona perfettamente anche senza configurazione SMTP (le email semplicemente non vengono inviate).
- **Logging migliorato**: Il sistema ora logga dettagliatamente gli errori SMTP sul server per facilitare il debug, senza esporre informazioni sensibili al frontend.
- **Messaggi di errore specifici**: Il frontend mostra messaggi di errore mirati in base al tipo di problema (autenticazione, connessione, configurazione, ecc.).

### API Endpoints per Debug

#### GET /api/site-config/smtp/debug (Admin only)
Restituisce informazioni dettagliate sulla configurazione SMTP attuale senza esporre password o username:

```json
{
  "configuration": {
    "smtpHost": {
      "value": "smtp.office365.com",
      "configured": true,
      "description": "SMTP server host"
    },
    "smtpPort": {
      "value": "587",
      "configured": true,
      "description": "SMTP server port"
    },
    "smtpUsername": {
      "configured": true,
      "description": "SMTP username"
    },
    "smtpPassword": {
      "configured": true,
      "description": "SMTP password (write-only, never shown)"
    },
    "smtpFrom": {
      "value": "farcomsrl@hotmail.com",
      "configured": true,
      "description": "From email address"
    },
    "smtpFromName": {
      "value": "Arredi Farcom",
      "configured": true,
      "description": "From name"
    },
    "quoteNotificationEmail": {
      "value": "farcomsrl@hotmail.com",
      "configured": true,
      "description": "Email for quote notifications"
    }
  },
  "complete": true,
  "timestamp": "2026-09-16T10:30:00.000Z"
}
```

Questo endpoint è utile per verificare che la configurazione sia salvata correttamente nel database senza dover accedere direttamente al DB.

### Dipendenze

- `nodemailer` - Libreria per l'invio di email
- MongoDB - Database per la memorizzazione della configurazione SMTP
- SiteConfig collection - Raccolta che contiene la configurazione del sito

### File Coinvolti

- `server/routes/siteConfig.ts` - API endpoints per la configurazione SMTP
- `server/models/SiteConfig.ts` - Modello MongoDB per la configurazione
- `server/utils/email.ts` - Utility per l'invio di email
- `src/pages/admin/AdminSettings.tsx` - Interfaccia admin per la configurazione SMTP
