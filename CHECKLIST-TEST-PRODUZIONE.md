# Checklist test post-deploy (produzione)

Verifica operativa dopo l’hardening di sicurezza. Segna ogni punto dopo il controllo.

**Ambiente:** https://arredi.onrender.com  
**Data test:** _______________  
**Eseguito da:** _______________

---

## 1. Login admin

- [ ] Apro `/admin` e vedo la pagina di login
- [ ] Login con credenziali valide → accesso alla dashboard
- [ ] Logout funziona; senza sessione, le pagine admin richiedono di nuovo il login
- [ ] Login con password errata → messaggio di errore, nessun accesso
- [ ] (Opzionale) Tentativo di reset password pubblico / URL noti di reset → non disponibile o non funziona (endpoint rimosso)

---

## 2. Preventivi: solo admin

- [ ] **Senza login:** `GET /api/quotes` (o equivalente) → **401/403**, nessuna lista preventivi
- [ ] **Da browser in incognito** sulla sezione admin Preventivi → redirect/blocco login, nessun dato sensibile
- [ ] **Con sessione admin:** lista preventivi visibile in `/admin` (Preventivi)
- [ ] **Form pubblico** `/preventivo`: invio di una richiesta di test → successo (POST pubblico resta consentito)
- [ ] Il nuovo preventivo compare in admin dopo il submit

---

## 3. Log Render (niente 500)

Subito dopo il deploy e dopo i test sopra:

- [ ] Apro i log del servizio su Render (Dashboard → servizio → Logs)
- [ ] Nessun errore **500** ricorrente nelle ultime richieste
- [ ] Nessun crash / restart loop del processo
- [ ] Login e `GET /api/quotes` (autenticato) rispondono in modo stabile (200 o 401 attesi, non 500)

Se compare un 500: annota orario, path e messaggio di log prima di procedere alla sezione 5.

---

## 4. Pagine pubbliche (smoke test)

Controlla che carichino senza errori evidenti (pagina bianca, 404, console rossa bloccante):

- [ ] Home `/`
- [ ] Contatti `/contatti`
- [ ] Chi siamo `/chi-siamo` (o path equivalente in uso)
- [ ] Progetti `/progetti`
- [ ] Showroom `/showroom`
- [ ] Blog `/blog`
- [ ] Preventivo `/preventivo`
- [ ] Navigazione base desktop e mobile (menu funziona)

---

## 5. Se un test fallisce

| Sintomo | Dove guardare | Azione tipica |
|--------|----------------|---------------|
| Login fallisce / sessione non resta | Log Render; env `SESSION_SECRET`, `ADMIN_*`; MongoDB Atlas (utente admin) | Verificare env su Render; controllare che l’utente admin esista; rieseguire seed solo se autorizzato |
| Lista preventivi accessibile senza login | Log Render; route `GET /api/quotes` | Non accettare il deploy: verificare che `requireAdmin` sia attivo e ridistribuire |
| 401 su preventivi anche da admin loggato | Cookie/sessione; CORS/`VITE_API_BASE_URL`; log Render | Controllare dominio, cookie Secure, secret di sessione |
| Errori **500** nei log | Log Render (stack trace); stato MongoDB Atlas | Identificare path e eccezione; verificare connessione DB e variabili env |
| Pagine pubbliche rotte / asset mancanti | Log Render build/deploy; Network tab browser | Verificare che il deploy sia completo; controllare build frontend |
| Form preventivo non invia | Log Render su `POST /api/quotes`; Cloudinary/SMTP se usati | Controllare rate limit, upload, errori applicativi nel log |

**Ordine consigliato:** (1) log Render → (2) env Render → (3) MongoDB Atlas → (4) console browser / Network.

In caso di dubbio o accesso non autorizzato sospetto: non pubblicare workaround; contattare il referente tecnico indicato nel contratto.

---

## Esito

- [ ] Tutti i controlli obbligatori OK → produzione accettata
- [ ] Uno o più controlli falliti → **non accettare** finché non risolti; note:

```
Note:
_______________________________________________
_______________________________________________
```

---

*Checklist operativa post-hardening – Farcom Arredi*
