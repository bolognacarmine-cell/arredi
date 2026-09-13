# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: showroom.e2e.spec.ts >> Showroom Page >> should load showroom page successfully
- Location: e2e\showroom.e2e.spec.ts:8:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Showroom/
Received string:  "Figma Make App"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    11 × locator resolved to <html lang="en" translate="no">…</html>
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
- main:
  - text: Catalogo
  - heading "Showroom arredi professionali" [level=1]
  - paragraph: Una selezione curata di arredi realizzati su misura per barberie, parrucchieri, uffici, scuole e attività speciali. Qualità artigianale e design italiano.
  - heading "Filtra prodotti" [level=2]
  - paragraph: 16 di 16 prodotti
  - text: 🔎
  - textbox "Cerca per nome prodotto…"
  - combobox:
    - option "Tutti i settori" [selected]
    - option "Barberie e parrucchieri"
    - option "Uffici"
    - option "Negozi / Retail"
    - option "Scuole / Istituti"
    - option "Altro"
  - combobox:
    - option "Tutte le tipologie" [selected]
    - option "Banconi reception"
    - option "Postazioni taglio"
    - option "Specchiere retroilluminate"
    - option "Zone attesa"
    - option "Armadiature"
    - option "Lavandini integrati"
    - option "Vetrine espositive"
    - option "Sedute operative"
    - option "Postazioni trucco / styling"
    - option "Illuminazione tecnica per arredo"
    - option "Elementi modulari per arredo"
    - option "Altro"
    - option "Scrivanie e postazioni"
    - option "Reception e banconi ingresso"
    - option "Librerie e scaffalature"
    - option "Sale riunioni"
    - option "Pareti divisorie"
    - option "Armadi ufficio"
    - option "Lounge e aree relax"
    - option "Cassettiere"
    - option "Illuminazione tecnica per ufficio"
    - option "Banchi cassa"
    - option "Scaffalature espositive"
    - option "Manichini e supporti"
    - option "Camerini"
    - option "Vetrine"
    - option "Banconi servizio"
    - option "Insegne e arredi esterni"
    - option "Illuminazione commerciale"
    - option "Banchi e sedie ergonomiche"
    - option "Librerie aula"
    - option "Lavagne integrate"
    - option "Spogliatoi"
    - option "Mense e refettori"
    - option "Arredi aula magna"
    - option "Spazi gioco"
    - option "Armadiature scolastiche"
    - option "Reception e banconi ingresso scuola"
  - checkbox "Solo in offerta"
  - text: Solo in offerta
  - link "Bancone reception premium rovere -10% Uffici Reception e banconi ingresso Bancone reception premium rovere Bancone reception in rovere canaletto, finitura opaca, struttura metallo verniciato bronzo, top in quarzo. Adatto a uffici e studi professionali. 4890 € 4401 € Dettagli →":
    - /url: /showroom/bancone-reception-premium-rovere-p01
    - img "Bancone reception premium rovere"
    - text: "-10% Uffici Reception e banconi ingresso"
    - heading "Bancone reception premium rovere" [level=3]
    - paragraph: Bancone reception in rovere canaletto, finitura opaca, struttura metallo verniciato bronzo, top in quarzo. Adatto a uffici e studi professionali.
    - text: 4890 € 4401 € Dettagli →
  - link "Postazione taglio Duo luce LED -15% Barberie e parrucchieri Postazioni taglio Postazione taglio Duo luce LED Postazione taglio 2 posti con specchiera retroilluminata LED integrata, mensole in vetro temperato e presa aria/energia per stazione. 3200 € 2720 € Dettagli →":
    - /url: /showroom/postazione-taglio-duo-luce-led-p02
    - img "Postazione taglio Duo luce LED"
    - text: "-15% Barberie e parrucchieri Postazioni taglio"
    - heading "Postazione taglio Duo luce LED" [level=3]
    - paragraph: Postazione taglio 2 posti con specchiera retroilluminata LED integrata, mensole in vetro temperato e presa aria/energia per stazione.
    - text: 3200 € 2720 € Dettagli →
  - link "Specchiera retroilluminata oval 120 300€ OFF Barberie e parrucchieri Specchiere retroilluminate Specchiera retroilluminata oval 120 Specchiera da parete cornice alluminio spazzolato, illuminazione perimetrale LED 3000K, anti-appannamento integrato. 690 € 390 € Dettagli →":
    - /url: /showroom/specchiera-retroilluminata-oval-120-p03
    - img "Specchiera retroilluminata oval 120"
    - text: 300€ OFF Barberie e parrucchieri Specchiere retroilluminate
    - heading "Specchiera retroilluminata oval 120" [level=3]
    - paragraph: Specchiera da parete cornice alluminio spazzolato, illuminazione perimetrale LED 3000K, anti-appannamento integrato.
    - text: 690 € 390 € Dettagli →
  - link "Divano attesa modular 3 posti -8% Poliambulatorio privato Zone attesa Divano attesa modular 3 posti Sistema modulare per zone attesa con sedute removibili, rivestimento antimacchia, piedini in metallo bronzo. 1950 € 1794 € Dettagli →":
    - /url: /showroom/divano-attesa-modular-3-posti-p04
    - img "Divano attesa modular 3 posti"
    - text: "-8% Poliambulatorio privato Zone attesa"
    - heading "Divano attesa modular 3 posti" [level=3]
    - paragraph: Sistema modulare per zone attesa con sedute removibili, rivestimento antimacchia, piedini in metallo bronzo.
    - text: 1950 € 1794 € Dettagli →
  - link "Armadio barbiere 6 ante mirror -12% Barberie e parrucchieri Armadiature Armadio barbiere 6 ante mirror Armadiatura con ante a specchio, vani a giorno, cassettiera interna e porta attrezzi per barbieri. 2780 € 2446 € Dettagli →":
    - /url: /showroom/armadio-barbiere-6-ante-mirror-p05
    - img "Armadio barbiere 6 ante mirror"
    - text: "-12% Barberie e parrucchieri Armadiature"
    - heading "Armadio barbiere 6 ante mirror" [level=3]
    - paragraph: Armadiatura con ante a specchio, vani a giorno, cassettiera interna e porta attrezzi per barbieri.
    - text: 2780 € 2446 € Dettagli →
  - link "Lavandino ceramica white + mobile -15% Barberie e parrucchieri Lavandini integrati Lavandino ceramica white + mobile Lavandino integrato in ceramica con miscelatore alto, mobile base in laminato anticalcare, ruote per spostamento. 1450 € 1233 € Dettagli →":
    - /url: /showroom/lavandino-ceramica-white-mobile-p06
    - img "Lavandino ceramica white + mobile"
    - text: "-15% Barberie e parrucchieri Lavandini integrati"
    - heading "Lavandino ceramica white + mobile" [level=3]
    - paragraph: Lavandino integrato in ceramica con miscelatore alto, mobile base in laminato anticalcare, ruote per spostamento.
    - text: 1450 € 1233 € Dettagli →
  - link "Vetrina espositiva L200 LED -8% Showroom forniture speciali Vetrine Vetrina espositiva L200 LED Vetrina a tutta altezza con ante in vetro, LED interni 4000K e ripiani regolabili in vetro temperato. 2190 € 2015 € Dettagli →":
    - /url: /showroom/vetrina-espositiva-l200-led-p07
    - img "Vetrina espositiva L200 LED"
    - text: "-8% Showroom forniture speciali Vetrine"
    - heading "Vetrina espositiva L200 LED" [level=3]
    - paragraph: Vetrina a tutta altezza con ante in vetro, LED interni 4000K e ripiani regolabili in vetro temperato.
    - text: 2190 € 2015 € Dettagli →
  - link "Poltrona operativa ergonomica -20% Uffici Sedute operative Poltrona operativa ergonomica Seduta ergonomica con supporto lombare, rotelle parquet, braccioli regolabili e reclinazione schienale. 720 € 576 € Dettagli →":
    - /url: /showroom/poltrona-operativa-ergonomica-p08
    - img "Poltrona operativa ergonomica"
    - text: "-20% Uffici Sedute operative"
    - heading "Poltrona operativa ergonomica" [level=3]
    - paragraph: Seduta ergonomica con supporto lombare, rotelle parquet, braccioli regolabili e reclinazione schienale.
    - text: 720 € 576 € Dettagli →
  - link "Scrivania direzionale Top in legno -12% Uffici Scrivanie e postazioni Scrivania direzionale Top in legno Top 180x90 in rovere, struttura in metallo verniciato, cassettiera mobile con 3 cassetti inclusa. 1690 € 1487 € Dettagli →":
    - /url: /showroom/scrivania-direzionale-top-in-legno-p09
    - img "Scrivania direzionale Top in legno"
    - text: "-12% Uffici Scrivanie e postazioni"
    - heading "Scrivania direzionale Top in legno" [level=3]
    - paragraph: Top 180x90 in rovere, struttura in metallo verniciato, cassettiera mobile con 3 cassetti inclusa.
    - text: 1690 € 1487 € Dettagli →
  - link "Libreria scaffale scuola 3 ripiani Scuole / Istituti Librerie aula Libreria scaffale scuola 3 ripiani Sistema a scaffalature in metallo e legno, 3 ripiani regolabili, carico 80kg per ripiano. 590 € Dettagli →":
    - /url: /showroom/libreria-scaffale-scuola-3-ripiani-p10
    - img "Libreria scaffale scuola 3 ripiani"
    - text: Scuole / Istituti Librerie aula
    - heading "Libreria scaffale scuola 3 ripiani" [level=3]
    - paragraph: Sistema a scaffalature in metallo e legno, 3 ripiani regolabili, carico 80kg per ripiano.
    - text: 590 € Dettagli →
  - link "Faretto LED tecnico per postazioni -15% Barberie e parrucchieri Illuminazione tecnica per arredo Faretto LED tecnico per postazioni Illuminazione tecnica orientabile 36W su binario, CRI 90, temperatura colore 4000K, ideale per postazioni taglio. 280 € 238 € Dettagli →":
    - /url: /showroom/faretto-led-tecnico-per-postazioni-p11
    - img "Faretto LED tecnico per postazioni"
    - text: "-15% Barberie e parrucchieri Illuminazione tecnica per arredo"
    - heading "Faretto LED tecnico per postazioni" [level=3]
    - paragraph: Illuminazione tecnica orientabile 36W su binario, CRI 90, temperatura colore 4000K, ideale per postazioni taglio.
    - text: 280 € 238 € Dettagli →
  - link "Sistema reception modulare custom Residenza universitaria Elementi modulari per arredo Sistema reception modulare custom Composizione custom banconi + colonne + vetrine per hall. Configurabile su misura con finiture premium. 8900 € Dettagli →":
    - /url: /showroom/sistema-reception-modulare-custom-p12
    - img "Sistema reception modulare custom"
    - text: Residenza universitaria Elementi modulari per arredo
    - heading "Sistema reception modulare custom" [level=3]
    - paragraph: Composizione custom banconi + colonne + vetrine per hall. Configurabile su misura con finiture premium.
    - text: 8900 € Dettagli →
  - link "Banco scuola singolo con contenitore -5% Scuole / Istituti Banchi e sedie ergonomiche Banco scuola singolo con contenitore Banco operativo per scuola con piano in laminato antigraffio, contenitore sotto-piano e gancio zaino. 340 € 323 € Dettagli →":
    - /url: /showroom/banco-scuola-singolo-con-contenitore-p13
    - img "Banco scuola singolo con contenitore"
    - text: "-5% Scuole / Istituti Banchi e sedie ergonomiche"
    - heading "Banco scuola singolo con contenitore" [level=3]
    - paragraph: Banco operativo per scuola con piano in laminato antigraffio, contenitore sotto-piano e gancio zaino.
    - text: 340 € 323 € Dettagli →
  - link "Postazione trucco professionale Barberie e parrucchieri Postazioni trucco / styling Postazione trucco professionale Postazione styling con specchiera ring-light integrata, piano ampio, vani porta trucchi e presa multipla. 1850 € Dettagli →":
    - /url: /showroom/postazione-trucco-professionale-p14
    - img "Postazione trucco professionale"
    - text: Barberie e parrucchieri Postazioni trucco / styling
    - heading "Postazione trucco professionale" [level=3]
    - paragraph: Postazione styling con specchiera ring-light integrata, piano ampio, vani porta trucchi e presa multipla.
    - text: 1850 € Dettagli →
  - link "Cassettiera sicurezza 4 cassetti -12% Uffici Cassettiere Cassettiera sicurezza 4 cassetti Armadietto a 4 cassetti con serratura centralizzata, struttura in metallo, finitura antimpronta. 480 € 422 € Dettagli →":
    - /url: /showroom/cassettiera-sicurezza-4-cassetti-p15
    - img "Cassettiera sicurezza 4 cassetti"
    - text: "-12% Uffici Cassettiere"
    - heading "Cassettiera sicurezza 4 cassetti" [level=3]
    - paragraph: Armadietto a 4 cassetti con serratura centralizzata, struttura in metallo, finitura antimpronta.
    - text: 480 € 422 € Dettagli →
  - link "Sedia attesa impilabile premium Sedute impilabili per sale attesa pubbliche Tribunale e uffici pubblici Sedia attesa impilabile premium Sedia per zona attesa con struttura in metallo, seduta in tessuto tecnico, impilabile fino a 8 pezzi. 210 € Dettagli →":
    - /url: /showroom/sedia-attesa-impilabile-premium-p16
    - img "Sedia attesa impilabile premium"
    - text: Sedute impilabili per sale attesa pubbliche Tribunale e uffici pubblici
    - heading "Sedia attesa impilabile premium" [level=3]
    - paragraph: Sedia per zona attesa con struttura in metallo, seduta in tessuto tecnico, impilabile fino a 8 pezzi.
    - text: 210 € Dettagli →
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
  3  | test.describe('Showroom Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/showroom');
  6  |   });
  7  | 
  8  |   test('should load showroom page successfully', async ({ page }) => {
> 9  |     await expect(page).toHaveTitle(/Showroom/);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  10 |     await expect(page.locator('nav')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should display showroom items', async ({ page }) => {
  14 |     // Wait for items to load
  15 |     await page.waitForTimeout(1000);
  16 |     
  17 |     // Look for showroom items (could be cards, images, etc.)
  18 |     const items = page.locator('img, .card, [class*="product"], [class*="item"]');
  19 |     const count = await items.count();
  20 |     
  21 |     // Should have at least some content
  22 |     expect(count).toBeGreaterThan(0);
  23 |   });
  24 | 
  25 |   test('should display filters if present', async ({ page }) => {
  26 |     // Check for filter elements (optional, may not exist)
  27 |     const filters = page.locator('select, [class*="filter"], [class*="category"]');
  28 |     const hasFilters = await filters.count() > 0;
  29 |     
  30 |     if (hasFilters) {
  31 |       await expect(filters.first()).toBeVisible();
  32 |     }
  33 |   });
  34 | 
  35 |   test('should navigate to item detail if clickable', async ({ page }) => {
  36 |     await page.waitForTimeout(1000);
  37 |     
  38 |     // Look for clickable items
  39 |     const clickableItem = page.locator('a[href]').first();
  40 |     const count = await clickableItem.count();
  41 |     
  42 |     if (count > 0) {
  43 |       await clickableItem.click();
  44 |       // Should navigate somewhere
  45 |       const url = page.url();
  46 |       expect(url).not.toBe('http://localhost:8443/showroom');
  47 |     }
  48 |   });
  49 | });
  50 | 
```