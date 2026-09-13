# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.e2e.spec.ts >> Home Page >> should display CTA section
- Location: e2e\home.e2e.spec.ts:34:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="/preventivo"]')
Expected: visible
Error: strict mode violation: locator('a[href="/preventivo"]') resolved to 6 elements:
    1) <a translate="no" href="/preventivo" data-discover="true" class="hidden lg:inline-flex items-center gap-2 bg-[#E69138] text-[#1A1A2E] text-sm font-semibold px-5 py-2.5 hover:bg-[#D67F28] hover:scale-105 hover:shadow-lg hover:shadow-[#E69138]/30 transition-all duration-300 ease-out">Richiedi preventivo</a> aka getByRole('navigation').getByRole('link', { name: 'Richiedi preventivo' })
    2) <a href="/preventivo" data-discover="true" aria-label="Richiedi un preventivo gratuito" class="group relative inline-flex items-center justify-center min-h-[40px] sm:min-h-[44px] md:min-h-[48px] bg-[#E69138] text-[#1A1A2E] text-[11px] sm:text-xs md:text-sm font-semibold px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 overflow-hidden shadow-lg shadow-[#E69138]/20 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover …>…</a> aka getByLabel('Richiedi un preventivo')
    3) <a href="/preventivo" data-discover="true" class="inline-flex items-center justify-center min-h-[44px] sm:min-h-[48px] bg-[#E69138] text-[#1A1A2E] text-xs sm:text-sm font-semibold px-4 sm:px-5 md:px-6 lg:px-7 py-2.5 sm:py-3 md:py-4 hover:bg-[#D67F28] hover:shadow-xl hover:shadow-[#E69138]/40 transition-all duration-300 ease-out glow-pulse magnetic-hover w-full sm:w-auto">Richiedi un preventivo gratuito</a> aka getByText('Richiedi un preventivo gratuito')
    4) <a href="/preventivo" data-discover="true" class="inline-flex items-center justify-center min-h-[44px] sm:min-h-[48px] bg-[#E69138] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#1A1A2E] transition-all duration-300 hover:bg-[#f0a14b] hover:shadow-lg hover:shadow-[#E69138]/20 w-full sm:w-auto">Richiedi preventivo</a> aka getByRole('contentinfo').getByRole('link', { name: 'Richiedi preventivo' })
    5) <a href="/preventivo" data-discover="true" class="flex items-center min-h-[36px] sm:min-h-[40px] -mx-2 px-2 text-xs sm:text-sm text-white/72 hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm transition-colors">Preventivo</a> aka locator('#footer-accordion-azienda').getByText('Preventivo')
    6) <a href="/preventivo" data-discover="true" class="flex items-center min-h-[36px] sm:min-h-[40px] -mx-2 px-2 text-xs sm:text-sm text-white/72 hover:text-[#E69138] hover:bg-white/[0.04] rounded-sm transition-colors">Preventivo</a> aka getByRole('link', { name: 'Preventivo', exact: true })

Call log:
  - Expect "toBeVisible" locator('a[href="/preventivo"]') with timeout 5000ms
  - waiting for locator('a[href="/preventivo"]')

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
        - listitem [ref=e11]:
          - link "Settori" [ref=e12] [cursor=pointer]:
            - /url: /settori
        - listitem [ref=e13]:
          - link "Progetti" [ref=e14] [cursor=pointer]:
            - /url: /progetti
        - listitem [ref=e15]:
          - link "Showroom" [ref=e16] [cursor=pointer]:
            - /url: /showroom
        - listitem [ref=e17]:
          - link "Blog" [ref=e18] [cursor=pointer]:
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
    - region "Sezione introduttiva" [ref=e26]:
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]:
              - generic [ref=e34]: Arredi su misura
              - heading "Progettazione tecnica e artigianalità premium." [level=1] [ref=e41]
            - generic [ref=e43]:
              - paragraph [ref=e44]: "Trasformiamo spazi commerciali in ambienti che comunicano fiducia: dal concept 3D ai disegni esecutivi, fino alla posa in opera. Tempi certi, materiali certificati, finiture impeccabili."
              - generic [ref=e45]:
                - link "Richiedi un preventivo gratuito" [ref=e46] [cursor=pointer]:
                  - /url: /preventivo
                  - generic [ref=e48]: Richiedi un preventivo
                - link "Vedi i progetti" [ref=e51] [cursor=pointer]:
                  - /url: /progetti
                  - generic [ref=e52]: Guarda i progetti
              - paragraph [ref=e53]: Risposta entro 24h lavorative. Nessun impegno.
              - generic [ref=e54]:
                - generic [ref=e57]:
                  - text: 25+ anni
                  - generic [ref=e58]: · esperienza reale
                - generic [ref=e61]:
                  - text: FSC/CE
                  - generic [ref=e62]: · materiali certificati
                - generic [ref=e65]:
                  - text: Tempi certi
                  - generic [ref=e66]: · consegna puntuale
          - generic [ref=e72]:
            - heading "Un processo chiaro, zero sorprese" [level=2] [ref=e76]
            - list [ref=e77]:
              - listitem [ref=e78]:
                - generic [ref=e80]: Sopralluogo e briefing (obiettivi, flussi, budget)
              - listitem [ref=e81]:
                - generic [ref=e83]: Render 3D + disegni esecutivi
              - listitem [ref=e84]:
                - generic [ref=e86]: Produzione, installazione e post-vendita
            - generic [ref=e87]:
              - generic [ref=e88]: "Obiettivo: impatto visivo + conversione"
              - link "Parla con noi →" [ref=e89] [cursor=pointer]:
                - /url: /contatti
        - generic: Scroll
    - generic [ref=e90]:
      - generic [ref=e92]:
        - generic [ref=e93]:
          - text: Settori di attività
          - heading "Ogni spazio ha la sua storia da raccontare" [level=2] [ref=e95]: Ogni spazio ha la suastoria da raccontare
        - paragraph [ref=e96]: "Quattro settori, un'unica filosofia: progettazione attenta, materiali di qualità, esecuzione impeccabile."
      - generic [ref=e97]:
        - 'link "Barbieri & Parrucchieri Barbieri & Parrucchieri Arredi che trasformano il salone in un''esperienza: banconi sartoriali, postazioni taglio ergonomiche, zone attesa raffinate. Scopri di più →" [ref=e98] [cursor=pointer]':
          - /url: /settori/barbieri
          - img "Barbieri & Parrucchieri" [ref=e100]
          - generic [ref=e102]:
            - heading "Barbieri & Parrucchieri" [level=3] [ref=e103]
            - paragraph [ref=e104]: "Arredi che trasformano il salone in un'esperienza: banconi sartoriali, postazioni taglio ergonomiche, zone attesa raffinate."
            - generic [ref=e105]: Scopri di più →
        - 'link "Uffici Uffici Spazi di lavoro progettati per aumentare produttività e benessere: scrivanie su misura, librerie, reception e sale riunioni. Scopri di più →" [ref=e106] [cursor=pointer]':
          - /url: /settori/uffici
          - img "Uffici" [ref=e108]
          - generic [ref=e110]:
            - heading "Uffici" [level=3] [ref=e111]
            - paragraph [ref=e112]: "Spazi di lavoro progettati per aumentare produttività e benessere: scrivanie su misura, librerie, reception e sale riunioni."
            - generic [ref=e113]: Scopri di più →
        - 'link "Negozi Negozi Visual merchandising e funzionalità in un unico progetto: scaffali, espositori, banchi cassa e allestimenti che valorizzano i prodotti. Scopri di più →" [ref=e114] [cursor=pointer]':
          - /url: /settori/negozi
          - img "Negozi" [ref=e116]
          - generic [ref=e118]:
            - heading "Negozi" [level=3] [ref=e119]
            - paragraph [ref=e120]: "Visual merchandising e funzionalità in un unico progetto: scaffali, espositori, banchi cassa e allestimenti che valorizzano i prodotti."
            - generic [ref=e121]: Scopri di più →
        - 'link "Scuole Scuole Ambienti educativi pensati per la crescita: banchi e sedute ergonomiche, librerie, spogliatoi e spazi multifunzionali. Scopri di più →" [ref=e122] [cursor=pointer]':
          - /url: /settori/scuole
          - img "Scuole" [ref=e124]
          - generic [ref=e126]:
            - heading "Scuole" [level=3] [ref=e127]
            - paragraph [ref=e128]: "Ambienti educativi pensati per la crescita: banchi e sedute ergonomiche, librerie, spogliatoi e spazi multifunzionali."
            - generic [ref=e129]: Scopri di più →
        - 'link "Bar Bar Spazi conviviali progettati per l''esperienza: banconi su misura, illuminazione d''atmosfera, zone accoglienza e aree servizio funzionali. Scopri di più →" [ref=e130] [cursor=pointer]':
          - /url: /settori/bar
          - img "Bar" [ref=e132]
          - generic [ref=e134]:
            - heading "Bar" [level=3] [ref=e135]
            - paragraph [ref=e136]: "Spazi conviviali progettati per l'esperienza: banconi su misura, illuminazione d'atmosfera, zone accoglienza e aree servizio funzionali."
            - generic [ref=e137]: Scopri di più →
        - 'link "Centri Estetici Centri Estetici Ambienti di benessere pensati per il relax: accoglienza raffinata, cabine trattamento, area relax e esposizione prodotti curata. Scopri di più →" [ref=e138] [cursor=pointer]':
          - /url: /settori/centri-estetici
          - img "Centri Estetici" [ref=e140]
          - generic [ref=e142]:
            - heading "Centri Estetici" [level=3] [ref=e143]
            - paragraph [ref=e144]: "Ambienti di benessere pensati per il relax: accoglienza raffinata, cabine trattamento, area relax e esposizione prodotti curata."
            - generic [ref=e145]: Scopri di più →
    - generic [ref=e148]:
      - generic [ref=e149]:
        - generic [ref=e150]:
          - text: Portfolio
          - heading "Progetti in evidenza" [level=2] [ref=e152]
        - link "Vedi tutti i progetti →" [ref=e153] [cursor=pointer]:
          - /url: /progetti
      - generic [ref=e154]:
        - link "The Craft Barbershop Barbieri The Craft Barbershop Milano · 2024 Progetto completo per un barbershop di fascia alta nel centro di Milano. Bancone reception in noce canaletto con piano in ottone, 4 postazioni taglio con specchiere retroilluminate, zona attesa con sedute su misura in pelle naturale. Vedi progetto →" [ref=e155] [cursor=pointer]:
          - /url: /progetti/barber-milano
          - generic [ref=e156]:
            - img "The Craft Barbershop" [ref=e157]
            - generic [ref=e158]: Barbieri
          - generic [ref=e159]:
            - heading "The Craft Barbershop" [level=3] [ref=e160]
            - paragraph [ref=e161]: Milano · 2024
            - paragraph [ref=e162]: Progetto completo per un barbershop di fascia alta nel centro di Milano. Bancone reception in noce canaletto con piano in ottone, 4 postazioni taglio con specchiere retroilluminate, zona attesa con sedute su misura in pelle naturale.
            - generic [ref=e163]: Vedi progetto →
        - link "Studio Legale Marchetti Uffici Studio Legale Marchetti Torino · 2024 Arredamento completo per uno studio legale in un palazzo liberty. Librerie su misura dal pavimento al soffitto, scrivania direzionale in rovere, sala riunioni con tavolo in marmo Calacatta. Vedi progetto →" [ref=e164] [cursor=pointer]:
          - /url: /progetti/studio-legale-torino
          - generic [ref=e165]:
            - img "Studio Legale Marchetti" [ref=e166]
            - generic [ref=e167]: Uffici
          - generic [ref=e168]:
            - heading "Studio Legale Marchetti" [level=3] [ref=e169]
            - paragraph [ref=e170]: Torino · 2024
            - paragraph [ref=e171]: Arredamento completo per uno studio legale in un palazzo liberty. Librerie su misura dal pavimento al soffitto, scrivania direzionale in rovere, sala riunioni con tavolo in marmo Calacatta.
            - generic [ref=e172]: Vedi progetto →
        - link "Atelier Rossi Negozi Atelier Rossi Firenze · 2023 Boutique di abbigliamento artigianale nel cuore di Firenze. Espositori in ferro verniciato a polvere e legno di frassino, banco cassa circolare, camerini con tende in velluto. Vedi progetto →" [ref=e173] [cursor=pointer]:
          - /url: /progetti/boutique-firenze
          - generic [ref=e174]:
            - img "Atelier Rossi" [ref=e175]
            - generic [ref=e176]: Negozi
          - generic [ref=e177]:
            - heading "Atelier Rossi" [level=3] [ref=e178]
            - paragraph [ref=e179]: Firenze · 2023
            - paragraph [ref=e180]: Boutique di abbigliamento artigianale nel cuore di Firenze. Espositori in ferro verniciato a polvere e legno di frassino, banco cassa circolare, camerini con tende in velluto.
            - generic [ref=e181]: Vedi progetto →
        - link "Liceo Artistico Morandi Scuole Liceo Artistico Morandi Bologna · 2023 Ristrutturazione delle aule e degli spazi comuni del Liceo Artistico Morandi. Banchi modulari in betulla, librerie aula in metallo e legno, arredo mensa in faggio naturale. Vedi progetto →" [ref=e182] [cursor=pointer]:
          - /url: /progetti/liceo-bologna
          - generic [ref=e183]:
            - img "Liceo Artistico Morandi" [ref=e184]
            - generic [ref=e185]: Scuole
          - generic [ref=e186]:
            - heading "Liceo Artistico Morandi" [level=3] [ref=e187]
            - paragraph [ref=e188]: Bologna · 2023
            - paragraph [ref=e189]: Ristrutturazione delle aule e degli spazi comuni del Liceo Artistico Morandi. Banchi modulari in betulla, librerie aula in metallo e legno, arredo mensa in faggio naturale.
            - generic [ref=e190]: Vedi progetto →
        - link "Salon Vogue Roma Barbieri Salon Vogue Roma Roma · 2023 Salone di parrucchieri con 8 postazioni lavoro, zona shampoo con 4 lavandini integrati e reception panoramica. Vedi progetto →" [ref=e191] [cursor=pointer]:
          - /url: /progetti/salon-roma
          - generic [ref=e192]:
            - img "Salon Vogue Roma" [ref=e193]
            - generic [ref=e194]: Barbieri
          - generic [ref=e195]:
            - heading "Salon Vogue Roma" [level=3] [ref=e196]
            - paragraph [ref=e197]: Roma · 2023
            - paragraph [ref=e198]: Salone di parrucchieri con 8 postazioni lavoro, zona shampoo con 4 lavandini integrati e reception panoramica.
            - generic [ref=e199]: Vedi progetto →
        - link "Innovation Hub Liguria Uffici Innovation Hub Liguria Genova · 2024 Hub per startup con spazi coworking modulari, sala conferenze da 50 posti, phone booth acustici su misura. Vedi progetto →" [ref=e200] [cursor=pointer]:
          - /url: /progetti/startup-hub-genova
          - generic [ref=e201]:
            - img "Innovation Hub Liguria" [ref=e202]
            - generic [ref=e203]: Uffici
          - generic [ref=e204]:
            - heading "Innovation Hub Liguria" [level=3] [ref=e205]
            - paragraph [ref=e206]: Genova · 2024
            - paragraph [ref=e207]: Hub per startup con spazi coworking modulari, sala conferenze da 50 posti, phone booth acustici su misura.
            - generic [ref=e208]: Vedi progetto →
    - generic [ref=e211]:
      - generic [ref=e212]:
        - text: Dicono di noi
        - heading "Recensioni Google" [level=2] [ref=e213]
        - paragraph [ref=e214]: Alcune opinioni di chi ha lavorato con noi.
      - generic [ref=e215]:
        - article [ref=e216]:
          - generic [ref=e217]:
            - generic "5 stelle su 5" [ref=e218]
            - generic [ref=e229]: 1 anno fa
          - paragraph [ref=e230]: “Il top delle aziende per arredamento. Grande professionalità, anche a distanza di tempo qualsiasi problema può nascere viene risolto con rapidità e serietà.”
          - generic [ref=e231]:
            - generic [aria-hidden] [ref=e232]: G
            - generic [ref=e233]:
              - generic [ref=e234]: Giuseppe C.
              - generic [aria-hidden] [ref=e235]: ·
              - generic [ref=e236]: Google
        - article [ref=e242]:
          - generic [ref=e243]:
            - generic "5 stelle su 5" [ref=e244]
            - generic [ref=e255]: 5 anni fa
          - paragraph [ref=e256]: "“Ho accompagnato mia nipote che doveva arredare il suo centro estetico e Ugo, credo il titolare, è stato al di sopra di tutte le nostre aspettative: amabile, attento, professionale.”"
          - generic [ref=e257]:
            - generic [aria-hidden] [ref=e258]: L
            - generic [ref=e259]:
              - generic [ref=e260]: Luigi C.
              - generic [aria-hidden] [ref=e261]: ·
              - generic [ref=e262]: Google
        - article [ref=e268]:
          - generic [ref=e269]:
            - generic "5 stelle su 5" [ref=e270]
            - generic [ref=e281]: 2 mesi fa
          - paragraph [ref=e282]: “Se volete arredare uffici o negozi ad alto livello solo qui dovete andare.”
          - generic [ref=e283]:
            - generic [aria-hidden] [ref=e284]: L
            - generic [ref=e285]:
              - generic [ref=e286]: Luca P.
              - generic [aria-hidden] [ref=e287]: ·
              - generic [ref=e288]: Google
        - article [ref=e294]:
          - generic [ref=e295]:
            - generic "5 stelle su 5" [ref=e296]
            - generic [ref=e307]: 4 anni fa
          - paragraph [ref=e308]: “Qualità e competenza. Staff eccezionale.”
          - generic [ref=e309]:
            - generic [aria-hidden] [ref=e310]: M
            - generic [ref=e311]:
              - generic [ref=e312]: Manuela L.
              - generic [aria-hidden] [ref=e313]: ·
              - generic [ref=e314]: Google
        - article [ref=e320]:
          - generic [ref=e321]:
            - generic "5 stelle su 5" [ref=e322]
            - generic [ref=e333]: 4 anni fa
          - paragraph [ref=e334]: “Il migliore nella zona di Caserta.”
          - generic [ref=e335]:
            - generic [aria-hidden] [ref=e336]: M
            - generic [ref=e337]:
              - generic [ref=e338]: Max S.
              - generic [aria-hidden] [ref=e339]: ·
              - generic [ref=e340]: Google
    - generic [ref=e346]:
      - generic [ref=e348]:
        - text: Come lavoriamo
        - heading "Il nostro processo" [level=2] [ref=e349]
      - generic [ref=e350]:
        - generic [ref=e351]:
          - generic [ref=e352]:
            - generic [ref=e353]: ✦
            - generic [ref=e355]: "01"
          - heading "Progettazione" [level=3] [ref=e356]
          - paragraph [ref=e357]: Ascoltiamo le tue esigenze e trasformiamo l'idea in un progetto tecnico dettagliato, con render 3D e disegni costruttivi.
        - generic [ref=e358]:
          - generic [ref=e359]:
            - generic [ref=e360]: ◈
            - generic [ref=e362]: "02"
          - heading "Realizzazione" [level=3] [ref=e363]
          - paragraph [ref=e364]: Produzione artigianale nel nostro laboratorio a Bologna, con materiali selezionati e lavorazioni a regola d'arte.
        - generic [ref=e365]:
          - generic [ref=e366]:
            - generic [ref=e367]: ⬡
            - generic [ref=e369]: "03"
          - heading "Installazione" [level=3] [ref=e370]
          - paragraph [ref=e371]: Posa in opera rapida e precisa da parte del nostro team. Rispettiamo i tempi concordati e lasciamo il cantiere pulito.
        - generic [ref=e372]:
          - generic [ref=e373]:
            - generic [ref=e374]: ◇
            - generic [ref=e376]: "04"
          - heading "Post-vendita" [level=3] [ref=e377]
          - paragraph [ref=e378]: "Supporto e manutenzione nel tempo. Gli arredi su misura meritano cura: siamo presenti anche dopo la consegna."
    - generic [ref=e381]:
      - generic [ref=e382]:
        - text: Perché sceglierci
        - heading "La differenza artigianale" [level=2] [ref=e383]
      - generic [ref=e384]:
        - generic [ref=e385]:
          - heading "25 anni di esperienza" [level=3] [ref=e386]
          - paragraph [ref=e387]: Dal 1999 realizziamo arredi per professionisti esigenti.
        - generic [ref=e388]:
          - heading "100% made in Italy" [level=3] [ref=e389]
          - paragraph [ref=e390]: Ogni pezzo è progettato e costruito nel nostro laboratorio di Bologna.
        - generic [ref=e391]:
          - heading "Materiali certificati" [level=3] [ref=e392]
          - paragraph [ref=e393]: Legni FSC, vernici a bassa emissione, ferramenta di qualità superiore.
        - generic [ref=e394]:
          - heading "Tempi certi" [level=3] [ref=e395]
          - paragraph [ref=e396]: Consegnamo nei tempi pattuiti. Sempre. È una questione di rispetto.
    - generic [ref=e399]:
      - generic [ref=e400]:
        - generic [ref=e401]: 500+
        - generic [ref=e402]: Progetti realizzati
      - generic [ref=e403]:
        - generic [ref=e404]: "25"
        - generic [ref=e405]: Anni di attività
      - generic [ref=e406]:
        - generic [ref=e407]: "4"
        - generic [ref=e408]: Settori serviti
      - generic [ref=e409]:
        - generic [ref=e410]: 98%
        - generic [ref=e411]: Clienti soddisfatti
    - generic [ref=e412]:
      - heading "Hai un'idea per il tuo spazio? Parliamone." [level=2] [ref=e415]: Hai un'idea per il tuo spazio?Parliamone.
      - generic [ref=e416]:
        - link "Richiedi un preventivo gratuito" [ref=e417] [cursor=pointer]:
          - /url: /preventivo
        - link "Contattaci" [ref=e418] [cursor=pointer]:
          - /url: /contatti
  - contentinfo [ref=e419]:
    - generic [ref=e421]:
      - generic [ref=e422]:
        - paragraph [ref=e423]: Farcom Arredi
        - heading "Hai un progetto da arredare?" [level=2] [ref=e424]
        - paragraph [ref=e425]: Ti aiutiamo a trasformare l'idea in uno spazio su misura, funzionale e riconoscibile per il tuo business.
      - generic [ref=e426]:
        - link "Richiedi preventivo" [ref=e427] [cursor=pointer]:
          - /url: /preventivo
        - link "Scrivici su WhatsApp" [ref=e428] [cursor=pointer]:
          - /url: https://wa.me/393294576079
    - generic [ref=e430]:
      - generic [ref=e431]:
        - generic [ref=e432]:
          - link [ref=e433] [cursor=pointer]:
            - /url: /
            - img "Farcom Società Cooperativa" [ref=e434]
          - paragraph [ref=e435]: Progettiamo e realizziamo arredi su misura per barbieri, uffici, negozi, scuole, bar e centri estetici. Seguiamo ogni fase, dal concept iniziale alla consegna finale, con attenzione ai dettagli e alla funzionalità.
        - generic [ref=e436]:
          - generic [ref=e437]:
            - generic [ref=e438]: Su misura
            - generic [ref=e439]: Produzione dedicata
            - generic [ref=e440]: Supporto diretto
          - generic [ref=e441]:
            - generic [ref=e453]: "5.0"
            - generic [ref=e454]: ·
            - generic [ref=e460]: Google
      - generic [ref=e461]:
        - generic [ref=e462]:
          - heading "Azienda" [level=3] [ref=e463]
          - list [ref=e464]:
            - listitem [ref=e465]:
              - link "Chi siamo" [ref=e466] [cursor=pointer]:
                - /url: /chi-siamo
            - listitem [ref=e467]:
              - link "Progetti" [ref=e468] [cursor=pointer]:
                - /url: /progetti
            - listitem [ref=e469]:
              - link "Preventivo" [ref=e470] [cursor=pointer]:
                - /url: /preventivo
            - listitem [ref=e471]:
              - link "Contatti" [ref=e472] [cursor=pointer]:
                - /url: /contatti
            - listitem [ref=e473]:
              - link "Blog" [ref=e474] [cursor=pointer]:
                - /url: /blog
        - generic [ref=e475]:
          - heading "Settori" [level=3] [ref=e476]
          - list [ref=e477]:
            - listitem [ref=e478]:
              - link "Barbieri & Parrucchieri" [ref=e479] [cursor=pointer]:
                - /url: /settori/barbieri
            - listitem [ref=e480]:
              - link "Uffici" [ref=e481] [cursor=pointer]:
                - /url: /settori/uffici
            - listitem [ref=e482]:
              - link "Negozi" [ref=e483] [cursor=pointer]:
                - /url: /settori/negozi
            - listitem [ref=e484]:
              - link "Scuole" [ref=e485] [cursor=pointer]:
                - /url: /settori/scuole
            - listitem [ref=e486]:
              - link "Bar" [ref=e487] [cursor=pointer]:
                - /url: /settori/bar
            - listitem [ref=e488]:
              - link "Centri Estetici" [ref=e489] [cursor=pointer]:
                - /url: /settori/centri-estetici
        - generic [ref=e490]:
          - heading "Contatti" [level=3] [ref=e491]
          - list [ref=e492]:
            - listitem [ref=e493]:
              - link "Telefono +39 0823 694427" [ref=e494] [cursor=pointer]:
                - /url: tel:+390823694427
                - generic [ref=e499]:
                  - generic [ref=e500]: Telefono
                  - text: +39 0823 694427
            - listitem [ref=e501]:
              - link "WhatsApp +39 329 4576079" [ref=e502] [cursor=pointer]:
                - /url: https://wa.me/393294576079
                - generic [ref=e507]:
                  - generic [ref=e508]: WhatsApp
                  - text: +39 329 4576079
            - listitem [ref=e509]:
              - link "Email farcomsrl@hotmail.com" [ref=e510] [cursor=pointer]:
                - /url: mailto:farcomsrl@hotmail.com
                - generic [ref=e515]:
                  - generic [ref=e516]: Email
                  - text: farcomsrl@hotmail.com
          - paragraph [ref=e517]: Lun-Ven 9:00-13:00 / 15:00-19:00Sabato 9:00-13:00
          - generic [ref=e518]:
            - link "Chiama ora" [ref=e519] [cursor=pointer]:
              - /url: mailto:farcomsrl@hotmail.com
            - link "Scrivici" [ref=e522] [cursor=pointer]:
              - /url: https://wa.me/393294576079
        - generic [ref=e525]:
          - heading "Seguici" [level=3] [ref=e526]
          - generic [ref=e527]:
            - link "Instagram" [ref=e528] [cursor=pointer]:
              - /url: https://www.instagram.com/farcom_arredi/
            - link "Facebook" [ref=e531] [cursor=pointer]:
              - /url: https://www.facebook.com/p/Farcom-arredi-100054867935352/
          - heading "Note legali" [level=3] [ref=e534]
          - generic [ref=e535]:
            - link "Privacy" [ref=e536] [cursor=pointer]:
              - /url: /privacy
            - generic [aria-hidden] [ref=e537]: •
            - link "Cookie" [ref=e538] [cursor=pointer]:
              - /url: /cookie
          - link "Note legali" [ref=e539] [cursor=pointer]:
            - /url: /note-legali
          - generic [ref=e540]:
            - link "farcomsrl@hotmail.com" [ref=e541] [cursor=pointer]:
              - /url: mailto:farcomsrl@hotmail.com
            - generic [ref=e542]: © 2026 Farcom Srl.Arredi su misura per spazi professionali
  - generic [ref=e543]:
    - paragraph [ref=e544]:
      - text: Questo sito utilizza i cookie per migliorare la tua esperienza. Continuando a navigare o cliccando su "Accetta", acconsenti all'uso dei cookie.
      - link "Cookie Policy" [ref=e545] [cursor=pointer]:
        - /url: /cookie
    - button "Accetta" [ref=e546] [cursor=pointer]
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
  9  |     await expect(page).toHaveTitle(/Farcom/);
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
> 39 |     await expect(preventivoLink).toBeVisible();
     |                                  ^ Error: expect(locator).toBeVisible() failed
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