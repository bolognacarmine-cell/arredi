# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blog.e2e.spec.ts >> Blog Page >> should display blog posts
- Location: e2e\blog.e2e.spec.ts:13:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - navigation [ref=e4]:
      - link [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Farcom Società Cooperativa" [ref=e6]
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link "Home" [ref=e9] [cursor=pointer]:
            - /url: /
        - listitem [ref=e10]:
          - link "Settori" [ref=e11] [cursor=pointer]:
            - /url: /settori
        - listitem [ref=e12]:
          - link "Progetti" [ref=e13] [cursor=pointer]:
            - /url: /progetti
        - listitem [ref=e14]:
          - link "Showroom" [ref=e15] [cursor=pointer]:
            - /url: /showroom
        - listitem [ref=e16]:
          - link "Blog" [ref=e17] [cursor=pointer]:
            - /url: /blog
        - listitem [ref=e19]:
          - link "Chi siamo" [ref=e20] [cursor=pointer]:
            - /url: /chi-siamo
        - listitem [ref=e21]:
          - link "Contatti" [ref=e22] [cursor=pointer]:
            - /url: /contatti
      - link "Richiedi preventivo" [ref=e23] [cursor=pointer]:
        - /url: /preventivo
  - generic [ref=e24]:
    - generic [ref=e26]:
      - heading "Blog" [level=1] [ref=e27]
      - paragraph [ref=e28]: Idee, guide e consigli per arredare spazi professionali con stile e funzionalità
    - button "Tutti gli articoli" [ref=e31]
  - contentinfo [ref=e69]:
    - generic [ref=e71]:
      - generic [ref=e72]:
        - paragraph [ref=e73]: Farcom Arredi
        - heading "Hai un progetto da arredare?" [level=2] [ref=e74]
        - paragraph [ref=e75]: Ti aiutiamo a trasformare l'idea in uno spazio su misura, funzionale e riconoscibile per il tuo business.
      - generic [ref=e76]:
        - link "Richiedi preventivo" [ref=e77] [cursor=pointer]:
          - /url: /preventivo
        - link "Scrivici su WhatsApp" [ref=e78] [cursor=pointer]:
          - /url: https://wa.me/393294576079
    - generic [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e82]:
          - link [ref=e83] [cursor=pointer]:
            - /url: /
            - img "Farcom Società Cooperativa" [ref=e84]
          - paragraph [ref=e85]: Progettiamo e realizziamo arredi su misura per barbieri, uffici, negozi, scuole, bar e centri estetici. Seguiamo ogni fase, dal concept iniziale alla consegna finale, con attenzione ai dettagli e alla funzionalità.
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]: Su misura
            - generic [ref=e89]: Produzione dedicata
            - generic [ref=e90]: Supporto diretto
          - generic [ref=e91]:
            - generic [ref=e103]: "5.0"
            - generic [ref=e104]: ·
            - generic [ref=e110]: Google
      - generic [ref=e111]:
        - generic [ref=e112]:
          - heading "Azienda" [level=3] [ref=e113]
          - list [ref=e114]:
            - listitem [ref=e115]:
              - link "Chi siamo" [ref=e116] [cursor=pointer]:
                - /url: /chi-siamo
            - listitem [ref=e117]:
              - link "Progetti" [ref=e118] [cursor=pointer]:
                - /url: /progetti
            - listitem [ref=e119]:
              - link "Preventivo" [ref=e120] [cursor=pointer]:
                - /url: /preventivo
            - listitem [ref=e121]:
              - link "Contatti" [ref=e122] [cursor=pointer]:
                - /url: /contatti
            - listitem [ref=e123]:
              - link "Blog" [ref=e124] [cursor=pointer]:
                - /url: /blog
        - generic [ref=e125]:
          - heading "Settori" [level=3] [ref=e126]
          - list [ref=e127]:
            - listitem [ref=e128]:
              - link "Barbieri & Parrucchieri" [ref=e129] [cursor=pointer]:
                - /url: /settori/barbieri
            - listitem [ref=e130]:
              - link "Uffici" [ref=e131] [cursor=pointer]:
                - /url: /settori/uffici
            - listitem [ref=e132]:
              - link "Negozi" [ref=e133] [cursor=pointer]:
                - /url: /settori/negozi
            - listitem [ref=e134]:
              - link "Scuole" [ref=e135] [cursor=pointer]:
                - /url: /settori/scuole
            - listitem [ref=e136]:
              - link "Bar" [ref=e137] [cursor=pointer]:
                - /url: /settori/bar
            - listitem [ref=e138]:
              - link "Centri Estetici" [ref=e139] [cursor=pointer]:
                - /url: /settori/centri-estetici
        - generic [ref=e140]:
          - heading "Contatti" [level=3] [ref=e141]
          - list [ref=e142]:
            - listitem [ref=e143]:
              - link "Telefono +39 0823 694427" [ref=e144] [cursor=pointer]:
                - /url: tel:+390823694427
                - generic [ref=e149]:
                  - generic [ref=e150]: Telefono
                  - text: +39 0823 694427
            - listitem [ref=e151]:
              - link "WhatsApp +39 329 4576079" [ref=e152] [cursor=pointer]:
                - /url: https://wa.me/393294576079
                - generic [ref=e157]:
                  - generic [ref=e158]: WhatsApp
                  - text: +39 329 4576079
            - listitem [ref=e159]:
              - link "Email farcomsrl@hotmail.com" [ref=e160] [cursor=pointer]:
                - /url: mailto:farcomsrl@hotmail.com
                - generic [ref=e165]:
                  - generic [ref=e166]: Email
                  - text: farcomsrl@hotmail.com
          - paragraph [ref=e167]: Lun-Ven 9:00-13:00 / 15:00-19:00Sabato 9:00-13:00
          - generic [ref=e168]:
            - link "Chiama ora" [ref=e169] [cursor=pointer]:
              - /url: mailto:farcomsrl@hotmail.com
            - link "Scrivici" [ref=e172] [cursor=pointer]:
              - /url: https://wa.me/393294576079
        - generic [ref=e175]:
          - heading "Seguici" [level=3] [ref=e176]
          - generic [ref=e177]:
            - link "Instagram" [ref=e178] [cursor=pointer]:
              - /url: https://www.instagram.com/farcom_arredi/
            - link "Facebook" [ref=e181] [cursor=pointer]:
              - /url: https://www.facebook.com/p/Farcom-arredi-100054867935352/
          - heading "Note legali" [level=3] [ref=e184]
          - generic [ref=e185]:
            - link "Privacy" [ref=e186] [cursor=pointer]:
              - /url: /privacy
            - generic [aria-hidden] [ref=e187]: •
            - link "Cookie" [ref=e188] [cursor=pointer]:
              - /url: /cookie
          - link "Note legali" [ref=e189] [cursor=pointer]:
            - /url: /note-legali
          - generic [ref=e190]:
            - link "farcomsrl@hotmail.com" [ref=e191] [cursor=pointer]:
              - /url: mailto:farcomsrl@hotmail.com
            - generic [ref=e192]: © 2026 Farcom Srl.Arredi su misura per spazi professionali
  - generic [ref=e193]:
    - paragraph [ref=e194]:
      - text: Questo sito utilizza i cookie per migliorare la tua esperienza. Continuando a navigare o cliccando su "Accetta", acconsenti all'uso dei cookie.
      - link "Cookie Policy" [ref=e195] [cursor=pointer]:
        - /url: /cookie
    - button "Accetta" [ref=e196] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Blog Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/blog');
  6  |   });
  7  | 
  8  |   test('should load blog page successfully', async ({ page }) => {
  9  |     await expect(page).toHaveTitle(/Blog/);
  10 |     await expect(page.locator('nav')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should display blog posts', async ({ page }) => {
  14 |     // Wait for posts to load (either from API or static fallback)
  15 |     await page.waitForTimeout(1000);
  16 |     
  17 |     const blogPosts = page.locator('a[href^="/blog/"]');
  18 |     const count = await blogPosts.count();
  19 |     
  20 |     // Should have at least one post (from static fallback if API fails)
> 21 |     expect(count).toBeGreaterThan(0);
     |                   ^ Error: expect(received).toBeGreaterThan(expected)
  22 |   });
  23 | 
  24 |   test('should display post details', async ({ page }) => {
  25 |     await page.waitForTimeout(1000);
  26 |     
  27 |     const firstPost = page.locator('a[href^="/blog/"]').first();
  28 |     await expect(firstPost).toBeVisible();
  29 |     
  30 |     // Check for post title
  31 |     const postTitle = firstPost.locator('h3, h2').first();
  32 |     await expect(postTitle).toBeVisible();
  33 |   });
  34 | 
  35 |   test('should navigate to single blog post', async ({ page }) => {
  36 |     await page.waitForTimeout(1000);
  37 |     
  38 |     const firstPost = page.locator('a[href^="/blog/"]').first();
  39 |     if (await firstPost.count() > 0) {
  40 |       await firstPost.click();
  41 |       await expect(page).toHaveURL(/\/blog\//);
  42 |     }
  43 |   });
  44 | 
  45 |   test('should handle API fallback gracefully', async ({ page }) => {
  46 |     // The blog should work even if API is unavailable (static fallback)
  47 |     await page.waitForTimeout(1000);
  48 |     
  49 |     const blogPosts = page.locator('a[href^="/blog/"]');
  50 |     const count = await blogPosts.count();
  51 |     
  52 |     // Should display posts from static data if API fails
  53 |     expect(count).toBeGreaterThan(0);
  54 |   });
  55 | });
  56 | 
```