# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preventivo.e2e.spec.ts >> Preventivo Page >> should load preventivo page successfully
- Location: e2e\preventivo.e2e.spec.ts:8:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Preventivo/
Received string:  "Figma Make App"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    12 × locator resolved to <html lang="en" translate="no">…</html>
       - unexpected value "Figma Make App"

```

```yaml
- banner:
  - navigation:
    - link "Farcom Società Cooperativa":
      - /url: /
      - img "Farcom Società Cooperativa"
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "Settori":
          - /url: /settori
      - listitem:
        - link "Progetti":
          - /url: /progetti
      - listitem:
        - link "Showroom":
          - /url: /showroom
      - listitem:
        - link "Blog":
          - /url: /blog
      - listitem:
        - link "Chi siamo":
          - /url: /chi-siamo
      - listitem:
        - link "Contatti":
          - /url: /contatti
    - link "Richiedi preventivo":
      - /url: /preventivo
- text: Sopralluogo gratuito
- heading "Richiedi un preventivo" [level=1]
- paragraph: Compila il modulo e ti ricontatteremo entro 24 ore. Il sopralluogo e la prima consulenza sono sempre gratuiti e senza impegno.
- group "Dati di contatto":
  - text: Dati di contatto Nome *
  - textbox
  - text: Cognome *
  - textbox
  - text: Azienda / Attività
  - textbox
  - text: Email *
  - textbox
  - text: Telefono *
  - textbox
- group "Dettaglio progetto":
  - text: Dettaglio progetto Settore *
  - combobox:
    - option "Seleziona settore" [selected]
    - option "Barbieri & Parrucchieri"
    - option "Uffici"
    - option "Negozi"
    - option "Scuole"
    - option "Bar"
    - option "Centri Estetici"
  - text: Metratura approssimativa (m²)
  - spinbutton "es. 40"
  - text: Tipo di arredi richiesti
  - textbox "es. banco reception, postazioni, specchiere…"
  - text: Descrizione del progetto
  - textbox "Raccontaci la tua idea, le dimensioni dello spazio, i materiali preferiti, i tempi previsti…"
  - text: Allega planimetria / foto (opzionale) 📎 Trascina qui i file o sfoglia JPG, PNG, PDF – max 10MB
- checkbox "Ho letto e accetto la Privacy Policy e acconsento al trattamento dei dati personali per finalità commerciali. *"
- text: Ho letto e accetto la
- link "Privacy Policy":
  - /url: /privacy
- text: e acconsento al trattamento dei dati personali per finalità commerciali. *
- button "Invia richiesta"
- contentinfo:
  - paragraph: Farcom Arredi
  - heading "Hai un progetto da arredare?" [level=2]
  - paragraph: Ti aiutiamo a trasformare l'idea in uno spazio su misura, funzionale e riconoscibile per il tuo business.
  - link "Richiedi preventivo":
    - /url: /preventivo
  - link "Scrivici su WhatsApp":
    - /url: https://wa.me/393294576079
  - link "Farcom Società Cooperativa":
    - /url: /
    - img "Farcom Società Cooperativa"
  - paragraph: Progettiamo e realizziamo arredi su misura per barbieri, uffici, negozi, scuole, bar e centri estetici. Seguiamo ogni fase, dal concept iniziale alla consegna finale, con attenzione ai dettagli e alla funzionalità.
  - text: Su misura Produzione dedicata Supporto diretto 5.0 · Google
  - heading "Azienda" [level=3]
  - list:
    - listitem:
      - link "Chi siamo":
        - /url: /chi-siamo
    - listitem:
      - link "Progetti":
        - /url: /progetti
    - listitem:
      - link "Preventivo":
        - /url: /preventivo
    - listitem:
      - link "Contatti":
        - /url: /contatti
    - listitem:
      - link "Blog":
        - /url: /blog
  - heading "Settori" [level=3]
  - list:
    - listitem:
      - link "Barbieri & Parrucchieri":
        - /url: /settori/barbieri
    - listitem:
      - link "Uffici":
        - /url: /settori/uffici
    - listitem:
      - link "Negozi":
        - /url: /settori/negozi
    - listitem:
      - link "Scuole":
        - /url: /settori/scuole
    - listitem:
      - link "Bar":
        - /url: /settori/bar
    - listitem:
      - link "Centri Estetici":
        - /url: /settori/centri-estetici
  - heading "Contatti" [level=3]
  - list:
    - listitem:
      - link "Telefono +39 0823 694427":
        - /url: tel:+390823694427
    - listitem:
      - link "WhatsApp +39 329 4576079":
        - /url: https://wa.me/393294576079
    - listitem:
      - link "Email farcomsrl@hotmail.com":
        - /url: mailto:farcomsrl@hotmail.com
  - paragraph: Lun-Ven 9:00-13:00 / 15:00-19:00 Sabato 9:00-13:00
  - link "Chiama ora":
    - /url: mailto:farcomsrl@hotmail.com
  - link "Scrivici":
    - /url: https://wa.me/393294576079
  - heading "Seguici" [level=3]
  - link "Instagram":
    - /url: https://www.instagram.com/farcom_arredi/
    - img
  - link "Facebook":
    - /url: https://www.facebook.com/p/Farcom-arredi-100054867935352/
    - img
  - heading "Note legali" [level=3]
  - link "Privacy":
    - /url: /privacy
  - link "Cookie":
    - /url: /cookie
  - link "Note legali":
    - /url: /note-legali
  - link "farcomsrl@hotmail.com":
    - /url: mailto:farcomsrl@hotmail.com
  - text: © 2026 Farcom Srl. Arredi su misura per spazi professionali
- paragraph:
  - text: Questo sito utilizza i cookie per migliorare la tua esperienza. Continuando a navigare o cliccando su "Accetta", acconsenti all'uso dei cookie.
  - link "Cookie Policy":
    - /url: /cookie
- button "Accetta"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Preventivo Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/preventivo');
  6  |   });
  7  | 
  8  |   test('should load preventivo page successfully', async ({ page }) => {
> 9  |     await expect(page).toHaveTitle(/Preventivo/);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  10 |     await expect(page.locator('nav')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should display preventivo form', async ({ page }) => {
  14 |     const form = page.locator('form');
  15 |     await expect(form).toBeVisible();
  16 |   });
  17 | 
  18 |   test('should have required form fields', async ({ page }) => {
  19 |     // Check for common form fields
  20 |     const nameInput = page.locator('input[type="text"], input[name*="name"], input[name*="nome"]');
  21 |     const emailInput = page.locator('input[type="email"], input[name*="email"]');
  22 |     const messageTextarea = page.locator('textarea');
  23 |     
  24 |     // At least some of these should be present
  25 |     const hasName = await nameInput.count() > 0;
  26 |     const hasEmail = await emailInput.count() > 0;
  27 |     const hasMessage = await messageTextarea.count() > 0;
  28 |     
  29 |     expect(hasName || hasEmail || hasMessage).toBeTruthy();
  30 |   });
  31 | 
  32 |   test('should have submit button', async ({ page }) => {
  33 |     const submitButton = page.locator('button[type="submit"], input[type="submit"]');
  34 |     await expect(submitButton.first()).toBeVisible();
  35 |   });
  36 | 
  37 |   test('should show validation for empty required fields', async ({ page }) => {
  38 |     const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
  39 |     await submitButton.click();
  40 |     
  41 |     // Wait for validation to appear
  42 |     await page.waitForTimeout(500);
  43 |     
  44 |     // Check for validation messages or form not submitting
  45 |     const url = page.url();
  46 |     expect(url).toContain('/preventivo');
  47 |   });
  48 | 
  49 |   test('should fill and submit form (mock)', async ({ page }) => {
  50 |     // Find input fields
  51 |     const nameInput = page.locator('input[type="text"], input[name*="name"], input[name*="nome"]').first();
  52 |     const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
  53 |     const messageTextarea = page.locator('textarea').first();
  54 |     
  55 |     // Fill if they exist
  56 |     if (await nameInput.count() > 0) {
  57 |       await nameInput.fill('Test User');
  58 |     }
  59 |     if (await emailInput.count() > 0) {
  60 |       await emailInput.fill('test@example.com');
  61 |     }
  62 |     if (await messageTextarea.count() > 0) {
  63 |       await messageTextarea.fill('This is a test message for E2E testing');
  64 |     }
  65 |     
  66 |     const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
  67 |     await submitButton.click();
  68 |     
  69 |     // Wait for submission
  70 |     await page.waitForTimeout(2000);
  71 |     
  72 |     // Check for success message or redirect
  73 |     const url = page.url();
  74 |     const hasSuccessMessage = await page.locator('text=/successo|grazie|inviato/i').count() > 0;
  75 |     
  76 |     // Either shows success message or stays on page with validation
  77 |     expect(hasSuccessMessage || url.includes('/preventivo')).toBeTruthy();
  78 |   });
  79 | });
  80 | 
```