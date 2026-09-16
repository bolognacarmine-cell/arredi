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

### Risoluzione Problemi

#### I campi tornano vuoti dopo il salvataggio
- **Comportamento normale**: Username e password sono campi write-only per sicurezza. Appariranno vuoti dopo il salvataggio, ma la configurazione è attiva.
- **Se anche gli altri campi tornano vuoti**: Controlla la console del browser per errori di rete o verifica che il server sia attivo.

#### Errore "Missing required SMTP configuration fields"
- Assicurati di aver compilato tutti i campi obbligatori
- Verifica che i campi non contengano solo spazi vuoti
- Controlla che i nomi dei campi corrispondano a quelli attesi dal backend

#### Email di test non funziona
- Verifica che le credenziali SMTP siano corrette
- Controlla che il firewall o il provider SMTP non stia bloccando le connessioni
- Verifica che la porta sia corretta (587 per TLS, 465 per SSL)
- Controlla i log del server per errori dettagliati

#### Le email di notifica non arrivano
- Verifica che la configurazione SMTP sia stata salvata correttamente
- Controlla che il campo "Email notifiche preventivi" sia configurato correttamente
- Verifica nella cartella spam della email di destinazione
- Controlla i log del server per errori di invio

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

### Dipendenze

- `nodemailer` - Libreria per l'invio di email
- MongoDB - Database per la memorizzazione della configurazione SMTP
- SiteConfig collection - Raccolta che contiene la configurazione del sito

### File Coinvolti

- `server/routes/siteConfig.ts` - API endpoints per la configurazione SMTP
- `server/models/SiteConfig.ts` - Modello MongoDB per la configurazione
- `server/utils/email.ts` - Utility per l'invio di email
- `src/pages/admin/AdminSettings.tsx` - Interfaccia admin per la configurazione SMTP
