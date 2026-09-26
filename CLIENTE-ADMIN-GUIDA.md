# Guida operativa – Pannello Admin

Breve guida per l’operatore Farcom Arredi: accesso, recupero password e sicurezza.

---

## 1. Accesso al pannello

**URL (produzione):**  
https://arredi.onrender.com/admin

1. Apri l’URL nel browser.
2. Inserisci email e password.
3. Clicca Accedi.

**Credenziali iniziali** (da cambiare subito dopo il primo accesso):

| Campo    | Valore iniziale                          |
|----------|------------------------------------------|
| Email    | `admin@farcom.local`                     |
| Password | quella comunicata in fase di consegna    |

> Dopo il primo accesso, chiedi al supporto tecnico di aggiornare la password admin (non esiste un form pubblico di reset). Conserva la nuova password in un posto sicuro.

**Logout:** usa “Esci” / Logout quando hai finito. Non lasciare la sessione aperta su PC condivisi.

---

## 2. Recupero password

**Non esiste un reset password pubblico** (né link “password dimenticata”, né email automatica).

Se non riesci più ad accedere:

1. Contatta il supporto tecnico (sezione 4).
2. Il ripristino avviene **solo lato server**: aggiornamento utente admin nel database MongoDB e/o riesecuzione dello script di seed (`seed:admin`) con le variabili `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Riceverai le nuove credenziali in modo sicuro; cambia subito la password operativa dopo il ripristino.

Non tentare workaround o condivisioni di accesso: l’unico canale ufficiale è il supporto tecnico.

---

## 3. Sicurezza essenziale

- **Cambia la password iniziale** appena possibile e usane una forte (lunga, unica, non riutilizzata altrove).
- **Non condividere** email/password admin con colleghi non autorizzati; se serve un secondo operatore, chiedilo al supporto.
- **Non salvare** le credenziali in chat, email in chiaro o file condivisi non protetti.
- In caso di sospetto accesso non autorizzato o credenziali esposte: avvisa subito il supporto e richiedi il reset password via DB/seed.
- Problemi di login dopo un cambio password: verifica di usare l’email corretta (`admin@farcom.local` salvo diversa indicazione) e contatta il supporto se persiste.

---

## 4. Supporto tecnico

Per problemi di accesso, recupero password, errori del pannello o dubbi operativi:

- Per assistenza tecnica, rivolgersi al referente tecnico indicato nel contratto.
- **Cosa indicare:** URL usato, messaggio di errore (screenshot se possibile), orario del problema.

Per l’uso quotidiano dei contenuti (progetti, preventivi, blog, showroom) vedi anche `CLIENT_GUIDE.md`.

---

*Documento operativo per il cliente – Farcom Arredi – Settembre 2026*
