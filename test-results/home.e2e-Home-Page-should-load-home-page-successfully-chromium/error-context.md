# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.e2e.spec.ts >> Home Page >> should load home page successfully
- Location: e2e\home.e2e.spec.ts:8:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Farcom/
Received string:  "Figma Make App"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    10 × locator resolved to <html lang="en" translate="no">…</html>
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
- region "Sezione introduttiva":
  - text: Arredi su misura
  - heading "Progettazione tecnica e artigianalità premium." [level=1]
  - paragraph: "Trasformiamo spazi commerciali in ambienti che comunicano fiducia: dal concept 3D ai disegni esecutivi, fino alla posa in opera. Tempi certi, materiali certificati, finiture impeccabili."
  - link "Richiedi un preventivo gratuito":
    - /url: /preventivo
    - text: Richiedi un preventivo
    - img
  - link "Vedi i progetti":
    - /url: /progetti
    - text: Guarda i progetti
  - paragraph: Risposta entro 24h lavorative. Nessun impegno.
  - text: 25+ anni · esperienza reale FSC/CE · materiali certificati Tempi certi · consegna puntuale
  - heading "Un processo chiaro, zero sorprese" [level=2]
  - list:
    - listitem: Sopralluogo e briefing (obiettivi, flussi, budget)
    - listitem: Render 3D + disegni esecutivi
    - listitem: Produzione, installazione e post-vendita
  - text: "Obiettivo: impatto visivo + conversione"
  - link "Parla con noi →":
    - /url: /contatti
  - text: Scroll
- text: Settori di attività
- heading "Ogni spazio ha la sua storia da raccontare" [level=2]
- paragraph: "Quattro settori, un'unica filosofia: progettazione attenta, materiali di qualità, esecuzione impeccabile."
- 'link "Barbieri & Parrucchieri Barbieri & Parrucchieri Arredi che trasformano il salone in un''esperienza: banconi sartoriali, postazioni taglio ergonomiche, zone attesa raffinate. Scopri di più →"':
  - /url: /settori/barbieri
  - img "Barbieri & Parrucchieri"
  - heading "Barbieri & Parrucchieri" [level=3]
  - paragraph: "Arredi che trasformano il salone in un'esperienza: banconi sartoriali, postazioni taglio ergonomiche, zone attesa raffinate."
  - text: Scopri di più →
- 'link "Uffici Uffici Spazi di lavoro progettati per aumentare produttività e benessere: scrivanie su misura, librerie, reception e sale riunioni. Scopri di più →"':
  - /url: /settori/uffici
  - img "Uffici"
  - heading "Uffici" [level=3]
  - paragraph: "Spazi di lavoro progettati per aumentare produttività e benessere: scrivanie su misura, librerie, reception e sale riunioni."
  - text: Scopri di più →
- 'link "Negozi Negozi Visual merchandising e funzionalità in un unico progetto: scaffali, espositori, banchi cassa e allestimenti che valorizzano i prodotti. Scopri di più →"':
  - /url: /settori/negozi
  - img "Negozi"
  - heading "Negozi" [level=3]
  - paragraph: "Visual merchandising e funzionalità in un unico progetto: scaffali, espositori, banchi cassa e allestimenti che valorizzano i prodotti."
  - text: Scopri di più →
- 'link "Scuole Scuole Ambienti educativi pensati per la crescita: banchi e sedute ergonomiche, librerie, spogliatoi e spazi multifunzionali. Scopri di più →"':
  - /url: /settori/scuole
  - img "Scuole"
  - heading "Scuole" [level=3]
  - paragraph: "Ambienti educativi pensati per la crescita: banchi e sedute ergonomiche, librerie, spogliatoi e spazi multifunzionali."
  - text: Scopri di più →
- 'link "Bar Bar Spazi conviviali progettati per l''esperienza: banconi su misura, illuminazione d''atmosfera, zone accoglienza e aree servizio funzionali. Scopri di più →"':
  - /url: /settori/bar
  - img "Bar"
  - heading "Bar" [level=3]
  - paragraph: "Spazi conviviali progettati per l'esperienza: banconi su misura, illuminazione d'atmosfera, zone accoglienza e aree servizio funzionali."
  - text: Scopri di più →
- 'link "Centri Estetici Centri Estetici Ambienti di benessere pensati per il relax: accoglienza raffinata, cabine trattamento, area relax e esposizione prodotti curata. Scopri di più →"':
  - /url: /settori/centri-estetici
  - img "Centri Estetici"
  - heading "Centri Estetici" [level=3]
  - paragraph: "Ambienti di benessere pensati per il relax: accoglienza raffinata, cabine trattamento, area relax e esposizione prodotti curata."
  - text: Scopri di più →
- text: Portfolio
- heading "Progetti in evidenza" [level=2]
- link "Vedi tutti i progetti →":
  - /url: /progetti
- link "The Craft Barbershop Barbieri The Craft Barbershop Milano · 2024 Progetto completo per un barbershop di fascia alta nel centro di Milano. Bancone reception in noce canaletto con piano in ottone, 4 postazioni taglio con specchiere retroilluminate, zona attesa con sedute su misura in pelle naturale. Vedi progetto →":
  - /url: /progetti/barber-milano
  - img "The Craft Barbershop"
  - text: Barbieri
  - heading "The Craft Barbershop" [level=3]
  - paragraph: Milano · 2024
  - paragraph: Progetto completo per un barbershop di fascia alta nel centro di Milano. Bancone reception in noce canaletto con piano in ottone, 4 postazioni taglio con specchiere retroilluminate, zona attesa con sedute su misura in pelle naturale.
  - text: Vedi progetto →
- link "Studio Legale Marchetti Uffici Studio Legale Marchetti Torino · 2024 Arredamento completo per uno studio legale in un palazzo liberty. Librerie su misura dal pavimento al soffitto, scrivania direzionale in rovere, sala riunioni con tavolo in marmo Calacatta. Vedi progetto →":
  - /url: /progetti/studio-legale-torino
  - img "Studio Legale Marchetti"
  - text: Uffici
  - heading "Studio Legale Marchetti" [level=3]
  - paragraph: Torino · 2024
  - paragraph: Arredamento completo per uno studio legale in un palazzo liberty. Librerie su misura dal pavimento al soffitto, scrivania direzionale in rovere, sala riunioni con tavolo in marmo Calacatta.
  - text: Vedi progetto →
- link "Atelier Rossi Negozi Atelier Rossi Firenze · 2023 Boutique di abbigliamento artigianale nel cuore di Firenze. Espositori in ferro verniciato a polvere e legno di frassino, banco cassa circolare, camerini con tende in velluto. Vedi progetto →":
  - /url: /progetti/boutique-firenze
  - img "Atelier Rossi"
  - text: Negozi
  - heading "Atelier Rossi" [level=3]
  - paragraph: Firenze · 2023
  - paragraph: Boutique di abbigliamento artigianale nel cuore di Firenze. Espositori in ferro verniciato a polvere e legno di frassino, banco cassa circolare, camerini con tende in velluto.
  - text: Vedi progetto →
- link "Liceo Artistico Morandi Scuole Liceo Artistico Morandi Bologna · 2023 Ristrutturazione delle aule e degli spazi comuni del Liceo Artistico Morandi. Banchi modulari in betulla, librerie aula in metallo e legno, arredo mensa in faggio naturale. Vedi progetto →":
  - /url: /progetti/liceo-bologna
  - img "Liceo Artistico Morandi"
  - text: Scuole
  - heading "Liceo Artistico Morandi" [level=3]
  - paragraph: Bologna · 2023
  - paragraph: Ristrutturazione delle aule e degli spazi comuni del Liceo Artistico Morandi. Banchi modulari in betulla, librerie aula in metallo e legno, arredo mensa in faggio naturale.
  - text: Vedi progetto →
- link "Salon Vogue Roma Barbieri Salon Vogue Roma Roma · 2023 Salone di parrucchieri con 8 postazioni lavoro, zona shampoo con 4 lavandini integrati e reception panoramica. Vedi progetto →":
  - /url: /progetti/salon-roma
  - img "Salon Vogue Roma"
  - text: Barbieri
  - heading "Salon Vogue Roma" [level=3]
  - paragraph: Roma · 2023
  - paragraph: Salone di parrucchieri con 8 postazioni lavoro, zona shampoo con 4 lavandini integrati e reception panoramica.
  - text: Vedi progetto →
- link "Innovation Hub Liguria Uffici Innovation Hub Liguria Genova · 2024 Hub per startup con spazi coworking modulari, sala conferenze da 50 posti, phone booth acustici su misura. Vedi progetto →":
  - /url: /progetti/startup-hub-genova
  - img "Innovation Hub Liguria"
  - text: Uffici
  - heading "Innovation Hub Liguria" [level=3]
  - paragraph: Genova · 2024
  - paragraph: Hub per startup con spazi coworking modulari, sala conferenze da 50 posti, phone booth acustici su misura.
  - text: Vedi progetto →
- text: Dicono di noi
- heading "Recensioni Google" [level=2]
- paragraph: Alcune opinioni di chi ha lavorato con noi.
- article:
  - text: 1 anno fa
  - paragraph: “Il top delle aziende per arredamento. Grande professionalità, anche a distanza di tempo qualsiasi problema può nascere viene risolto con rapidità e serietà.”
  - text: Giuseppe C. Google
- article:
  - text: 5 anni fa
  - paragraph: "“Ho accompagnato mia nipote che doveva arredare il suo centro estetico e Ugo, credo il titolare, è stato al di sopra di tutte le nostre aspettative: amabile, attento, professionale.”"
  - text: Luigi C. Google
- article:
  - text: 2 mesi fa
  - paragraph: “Se volete arredare uffici o negozi ad alto livello solo qui dovete andare.”
  - text: Luca P. Google
- article:
  - text: 4 anni fa
  - paragraph: “Qualità e competenza. Staff eccezionale.”
  - text: Manuela L. Google
- article:
  - text: 4 anni fa
  - paragraph: “Il migliore nella zona di Caserta.”
  - text: Max S. Google
- text: Come lavoriamo
- heading "Il nostro processo" [level=2]
- text: ✦ 01
- heading "Progettazione" [level=3]
- paragraph: Ascoltiamo le tue esigenze e trasformiamo l'idea in un progetto tecnico dettagliato, con render 3D e disegni costruttivi.
- text: ◈ 02
- heading "Realizzazione" [level=3]
- paragraph: Produzione artigianale nel nostro laboratorio a Bologna, con materiali selezionati e lavorazioni a regola d'arte.
- text: ⬡ 03
- heading "Installazione" [level=3]
- paragraph: Posa in opera rapida e precisa da parte del nostro team. Rispettiamo i tempi concordati e lasciamo il cantiere pulito.
- text: ◇ 04
- heading "Post-vendita" [level=3]
- paragraph: "Supporto e manutenzione nel tempo. Gli arredi su misura meritano cura: siamo presenti anche dopo la consegna."
- text: Perché sceglierci
- heading "La differenza artigianale" [level=2]
- heading "25 anni di esperienza" [level=3]
- paragraph: Dal 1999 realizziamo arredi per professionisti esigenti.
- heading "100% made in Italy" [level=3]
- paragraph: Ogni pezzo è progettato e costruito nel nostro laboratorio di Bologna.
- heading "Materiali certificati" [level=3]
- paragraph: Legni FSC, vernici a bassa emissione, ferramenta di qualità superiore.
- heading "Tempi certi" [level=3]
- paragraph: Consegnamo nei tempi pattuiti. Sempre. È una questione di rispetto.
- text: 500+ Progetti realizzati 25 Anni di attività 4 Settori serviti 98% Clienti soddisfatti
- heading "Hai un'idea per il tuo spazio? Parliamone." [level=2]
- link "Richiedi un preventivo gratuito":
  - /url: /preventivo
- link "Contattaci":
  - /url: /contatti
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
  3  | test.describe('Home Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('should load home page successfully', async ({ page }) => {
> 9  |     await expect(page).toHaveTitle(/Farcom/);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  10 |     await expect(page.locator('nav')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should display hero section', async ({ page }) => {
  14 |     const hero = page.locator('#hero');
  15 |     await expect(hero).toBeVisible();
  16 |   });
  17 | 
  18 |   test('should display sectors section', async ({ page }) => {
  19 |     const sectorsSection = page.locator('section').filter({ hasText: 'Settori di attività' });
  20 |     await expect(sectorsSection).toBeVisible();
  21 |     
  22 |     const sectorCards = page.locator('a[href^="/settori/"]');
  23 |     await expect(sectorCards.first()).toBeVisible();
  24 |   });
  25 | 
  26 |   test('should display featured projects', async ({ page }) => {
  27 |     const projectsSection = page.locator('section').filter({ hasText: 'Progetti in evidenza' });
  28 |     await expect(projectsSection).toBeVisible();
  29 |     
  30 |     const projectCards = page.locator('a[href^="/progetti/"]');
  31 |     await expect(projectCards.first()).toBeVisible();
  32 |   });
  33 | 
  34 |   test('should display CTA section', async ({ page }) => {
  35 |     const ctaSection = page.locator('section').filter({ hasText: 'Hai un\'idea per il tuo spazio?' });
  36 |     await expect(ctaSection).toBeVisible();
  37 |     
  38 |     const preventivoLink = page.locator('a[href="/preventivo"]');
  39 |     await expect(preventivoLink).toBeVisible();
  40 |   });
  41 | 
  42 |   test('should navigate to sectors from home', async ({ page }) => {
  43 |     const firstSectorLink = page.locator('a[href^="/settori/"]').first();
  44 |     await firstSectorLink.click();
  45 |     
  46 |     await expect(page).toHaveURL(/\/settori\//);
  47 |   });
  48 | 
  49 |   test('should navigate to projects from home', async ({ page }) => {
  50 |     const firstProjectLink = page.locator('a[href^="/progetti/"]').first();
  51 |     await firstProjectLink.click();
  52 |     
  53 |     await expect(page).toHaveURL(/\/progetti\//);
  54 |   });
  55 | });
  56 | 
```