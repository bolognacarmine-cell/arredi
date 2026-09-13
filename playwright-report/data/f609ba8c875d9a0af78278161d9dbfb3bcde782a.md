# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.e2e.spec.ts >> Navigation >> mobile menu should toggle
- Location: e2e\navigation.e2e.spec.ts:99:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav div').filter({ hasText: /Home|Settori/ }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('nav div').filter({ hasText: /Home|Settori/ }).first() with timeout 5000ms
  - waiting for locator('nav div').filter({ hasText: /Home|Settori/ }).first()

```

```yaml
- banner:
  - navigation:
    - link "Farcom Società Cooperativa":
      - /url: /
      - img "Farcom Società Cooperativa"
    - button "Chiudi menu" [expanded]
  - link "Home":
    - /url: /
  - link "Settori":
    - /url: /settori
  - link "Progetti":
    - /url: /progetti
  - link "Showroom":
    - /url: /showroom
  - link "Blog":
    - /url: /blog
  - link "Chi siamo":
    - /url: /chi-siamo
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
  - text: Su misura Produzione dedicata Supporto diretto
  - button "Settori"
  - region:
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
  - button "Azienda"
  - region:
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
  - button "Contatti"
  - region:
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
    - link "WhatsApp":
      - /url: https://wa.me/393294576079
  - button "Social & Legal"
  - region:
    - link "Instagram":
      - /url: https://www.instagram.com/farcom_arredi/
      - img
    - link "Facebook":
      - /url: https://www.facebook.com/p/Farcom-arredi-100054867935352/
      - img
    - link "Privacy":
      - /url: /privacy
    - link "Cookie":
      - /url: /cookie
    - link "Note legali":
      - /url: /note-legali
    - text: © 2026 Farcom Srl.
- paragraph:
  - text: Questo sito utilizza i cookie per migliorare la tua esperienza. Continuando a navigare o cliccando su "Accetta", acconsenti all'uso dei cookie.
  - link "Cookie Policy":
    - /url: /cookie
- button "Accetta"
```

# Test source

```ts
  11  |   });
  12  | 
  13  |   test('should display logo', async ({ page }) => {
  14  |     const logo = page.locator('a[href="/"] img').first();
  15  |     await expect(logo).toBeVisible();
  16  |   });
  17  | 
  18  |   test('should navigate to home from logo', async ({ page }) => {
  19  |     await page.goto('/settori');
  20  |     const logo = page.locator('a[href="/"] img').first();
  21  |     await logo.click();
  22  |     
  23  |     await expect(page).toHaveURL('/');
  24  |   });
  25  | 
  26  |   test('should navigate to Settori page', async ({ page }) => {
  27  |     const settoriLink = page.locator('a[href="/settori"]');
  28  |     await expect(settoriLink).toBeVisible();
  29  |     await settoriLink.click();
  30  |     
  31  |     await expect(page).toHaveURL('/settori');
  32  |   });
  33  | 
  34  |   test('should navigate to Progetti page', async ({ page }) => {
  35  |     const progettiLink = page.locator('a[href="/progetti"]');
  36  |     await expect(progettiLink).toBeVisible();
  37  |     await progettiLink.click();
  38  |     
  39  |     await expect(page).toHaveURL('/progetti');
  40  |   });
  41  | 
  42  |   test('should navigate to Showroom page', async ({ page }) => {
  43  |     const showroomLink = page.locator('a[href="/showroom"]');
  44  |     await expect(showroomLink).toBeVisible();
  45  |     await showroomLink.click();
  46  |     
  47  |     await expect(page).toHaveURL('/showroom');
  48  |   });
  49  | 
  50  |   test('should navigate to Blog page', async ({ page }) => {
  51  |     const blogLink = page.locator('a[href="/blog"]');
  52  |     await expect(blogLink).toBeVisible();
  53  |     await blogLink.click();
  54  |     
  55  |     await expect(page).toHaveURL('/blog');
  56  |   });
  57  | 
  58  |   test('should navigate to Chi siamo page', async ({ page }) => {
  59  |     const chiSiamoLink = page.locator('a[href="/chi-siamo"]');
  60  |     await expect(chiSiamoLink).toBeVisible();
  61  |     await chiSiamoLink.click();
  62  |     
  63  |     await expect(page).toHaveURL('/chi-siamo');
  64  |   });
  65  | 
  66  |   test('should navigate to Contatti page', async ({ page }) => {
  67  |     const contattiLink = page.locator('a[href="/contatti"]');
  68  |     await expect(contattiLink).toBeVisible();
  69  |     await contattiLink.click();
  70  |     
  71  |     await expect(page).toHaveURL('/contatti');
  72  |   });
  73  | 
  74  |   test('should navigate to Preventivo page', async ({ page }) => {
  75  |     const preventivoLink = page.locator('a[href="/preventivo"]');
  76  |     await expect(preventivoLink).toBeVisible();
  77  |     await preventivoLink.click();
  78  |     
  79  |     await expect(page).toHaveURL('/preventivo');
  80  |   });
  81  | 
  82  |   test('should display footer', async ({ page }) => {
  83  |     const footer = page.locator('footer');
  84  |     await expect(footer).toBeVisible();
  85  |   });
  86  | 
  87  |   test('should have working footer links', async ({ page }) => {
  88  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  89  |     
  90  |     const footerLink = page.locator('footer a').first();
  91  |     await expect(footerLink).toBeVisible();
  92  |     await footerLink.click();
  93  |     
  94  |     // Should navigate somewhere
  95  |     const url = page.url();
  96  |     expect(url).not.toBe('http://localhost:8443/');
  97  |   });
  98  | 
  99  |   test('mobile menu should toggle', async ({ page }) => {
  100 |     // Set mobile viewport
  101 |     await page.setViewportSize({ width: 375, height: 667 });
  102 |     
  103 |     const menuButton = page.locator('button[aria-label*="Menu"], button[aria-label*="menu"]');
  104 |     await expect(menuButton).toBeVisible();
  105 |     
  106 |     // Open menu
  107 |     await menuButton.click();
  108 |     
  109 |     // Check if mobile menu is visible
  110 |     const mobileMenu = page.locator('nav div').filter({ hasText: /Home|Settori/ });
> 111 |     await expect(mobileMenu.first()).toBeVisible();
      |                                      ^ Error: expect(locator).toBeVisible() failed
  112 |     
  113 |     // Close menu
  114 |     await menuButton.click();
  115 |   });
  116 | 
  117 |   test('should scroll to sections on home page', async ({ page }) => {
  118 |     const hero = page.locator('#hero');
  119 |     await expect(hero).toBeVisible();
  120 |     
  121 |     // Scroll down
  122 |     await page.evaluate(() => window.scrollTo(0, 500));
  123 |     await page.waitForTimeout(500);
  124 |     
  125 |     const scrollY = await page.evaluate(() => window.scrollY);
  126 |     expect(scrollY).toBeGreaterThan(0);
  127 |   });
  128 | });
  129 | 
```