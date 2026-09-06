export type Sector = {
  id: string
  label: string
  description: string
  heroImage: string
  heroImageCloudinaryPublicId?: string
  items: string[]
  color: string
}

export type Project = {
  id: string
  title: string
  sector: string
  sectorId: string
  location: string
  year: number
  client?: string
  description: string
  image: string
  imageCloudinaryPublicId?: string
  gallery: string[]
  galleryCloudinaryPublicIds?: string[]
  tags: string[]
  materials: string
  status?: "bozza" | "in lavorazione" | "completato"
  featured?: boolean
  seo?: {
    metaTitle: string
    metaDescription: string
    slug: string
  }
}

export const SECTORS: Sector[] = [
  {
    id: "barbieri",
    label: "Barbieri & Parrucchieri",
    description:
      "Arredi che trasformano il salone in un'esperienza: banconi sartoriali, postazioni taglio ergonomiche, zone attesa raffinate.",
    heroImage:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=600&fit=crop",
    items: [
      "Banconi reception",
      "Postazioni taglio",
      "Specchiere retroilluminate",
      "Zone attesa",
      "Armadiature",
      "Lavandini integrati",
      "Vetrine espositive",
    ],
    color: "#2D4A3E",
  },
  {
    id: "uffici",
    label: "Uffici",
    description:
      "Spazi di lavoro progettati per aumentare produttività e benessere: scrivanie su misura, librerie, reception e sale riunioni.",
    heroImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    items: [
      "Scrivanie e postazioni",
      "Reception e banconi ingresso",
      "Librerie e scaffalature",
      "Sale riunioni",
      "Pareti divisorie",
      "Armadi ufficio",
      "Lounge e aree relax",
    ],
    color: "#2C3E50",
  },
  {
    id: "negozi",
    label: "Negozi",
    description:
      "Visual merchandising e funzionalità in un unico progetto: scaffali, espositori, banchi cassa e allestimenti che valorizzano i prodotti.",
    heroImage:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop",
    items: [
      "Banchi cassa",
      "Scaffalature espositive",
      "Manichini e supporti",
      "Camerini",
      "Vetrine",
      "Banconi servizio",
      "Insegne e arredi esterni",
    ],
    color: "#3D2B1F",
  },
  {
    id: "scuole",
    label: "Scuole",
    description:
      "Ambienti educativi pensati per la crescita: banchi e sedute ergonomiche, librerie, spogliatoi e spazi multifunzionali.",
    heroImage:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop",
    items: [
      "Banchi e sedie ergonomiche",
      "Librerie aula",
      "Lavagne integrate",
      "Spogliatoi",
      "Mense e refettori",
      "Arredi aula magna",
      "Spazi gioco",
    ],
    color: "#1A3A4A",
  },
  {
    id: "bar",
    label: "Bar",
    description:
      "Spazi conviviali progettati per l'esperienza: banconi su misura, illuminazione d'atmosfera, zone accoglienza e aree servizio funzionali.",
    heroImage:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    items: [
      "Banconi bar",
      "Illuminazione design",
      "Zone clienti",
      "Sedute e tavoli",
      "Magazzino e cantina",
      "Banco esposizione",
      "Arredi esterni",
    ],
    color: "#8B4513",
  },
  {
    id: "centri-estetici",
    label: "Centri Estetici",
    description:
      "Ambienti di benessere pensati per il relax: accoglienza raffinata, cabine trattamento, area relax e esposizione prodotti curata.",
    heroImage:
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop",
    items: [
      "Reception e accoglienza",
      "Cabine trattamento",
      "Area relax",
      "Esposizione prodotti",
      "Lavandini e postazioni",
      "Armadiature",
      "Illuminazione soft",
    ],
    color: "#D4A574",
  },
]

export const PROJECTS: Project[] = [
  {
    id: "barber-milano",
    title: "The Craft Barbershop",
    sector: "Barbieri & Parrucchieri",
    sectorId: "barbieri",
    location: "Milano",
    year: 2024,
    client: "The Craft Milano",
    description:
      "Progetto completo per un barbershop di fascia alta nel centro di Milano. Bancone reception in noce canaletto con piano in ottone, 4 postazioni taglio con specchiere retroilluminate, zona attesa con sedute su misura in pelle naturale.",
    image: "/barber-farcom.jpg",imageCloudinaryPublicId: "farcom/progetti/davinci____image1_utilizza_l_immagine_allegata_come_riferi-png",gallery: [
      "/barber-farcom.jpg",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&h=800&fit=crop",
    ],
    galleryCloudinaryPublicIds: ["farcom/progetti/arredo-2-jpg"],
tags: ["Bancone", "Specchiere", "Zona attesa"],
    materials:
      "Noce canaletto, ottone satinato, pelle naturale conciata al vegetale",
  },
  {
    id: "studio-legale-torino",
    title: "Studio Legale Marchetti",
    sector: "Uffici",
    sectorId: "uffici",
    location: "Torino",
    year: 2024,
    client: "Studio Marchetti & Associati",
    description:
      "Arredamento completo per uno studio legale in un palazzo liberty. Librerie su misura dal pavimento al soffitto, scrivania direzionale in rovere, sala riunioni con tavolo in marmo Calacatta.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop",
    ],
    tags: ["Librerie", "Scrivania", "Sala riunioni"],
    materials: "Rovere massello, marmo Calacatta, pelle bordeaux",
  },
  {
    id: "boutique-firenze",
    title: "Atelier Rossi",
    sector: "Negozi",
    sectorId: "negozi",
    location: "Firenze",
    year: 2023,
    client: "Atelier Rossi",
    description:
      "Boutique di abbigliamento artigianale nel cuore di Firenze. Espositori in ferro verniciato a polvere e legno di frassino, banco cassa circolare, camerini con tende in velluto.",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop",
    ],
    tags: ["Espositori", "Banco cassa", "Camerini"],
    materials: "Ferro verniciato, frassino naturale, velluto antracite",
  },
  {
    id: "liceo-bologna",
    title: "Liceo Artistico Morandi",
    sector: "Scuole",
    sectorId: "scuole",
    location: "Bologna",
    year: 2023,
    description:
      "Ristrutturazione delle aule e degli spazi comuni del Liceo Artistico Morandi. Banchi modulari in betulla, librerie aula in metallo e legno, arredo mensa in faggio naturale.",
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=800&fit=crop",
    ],
    tags: ["Banchi", "Librerie", "Mensa"],
    materials: "Betulla certificata FSC, acciaio verniciato, faggio naturale",
  },
  {
    id: "salon-roma",
    title: "Salon Vogue Roma",
    sector: "Barbieri & Parrucchieri",
    sectorId: "barbieri",
    location: "Roma",
    year: 2023,
    description:
      "Salone di parrucchieri con 8 postazioni lavoro, zona shampoo con 4 lavandini integrati e reception panoramica.",
    image: "/barber-farcom1.jpg",
    gallery: [
      "/barber-farcom1.jpg",
    ],
    tags: ["Postazioni", "Lavandini", "Reception"],
    materials: "Laccato opaco bianco, acciaio inox, vetro fumé",
  },
  {
    id: "startup-hub-genova",
    title: "Innovation Hub Liguria",
    sector: "Uffici",
    sectorId: "uffici",
    location: "Genova",
    year: 2024,
    description:
      "Hub per startup con spazi coworking modulari, sala conferenze da 50 posti, phone booth acustici su misura.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    ],
    tags: ["Coworking", "Conferenze", "Phone booth"],
    materials: "Multistrato marino, feltro acustico, laminato HPL",
  },
  {
    id: "cocktail-bar-napoli",
    title: "Cocktail Bar Vesuvio",
    sector: "Bar",
    sectorId: "bar",
    location: "Napoli",
    year: 2024,
    description:
      "Cocktail bar nel centro storico con bancone in marmo Carrara, illuminazione design, zona clienti elegante e magazzino ottimizzato.",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&h=800&fit=crop",
    ],
    tags: ["Bancone", "Illuminazione", "Zona clienti"],
    materials: "Marmo Carrara, ottone, legno di noce, vetro",
  },
  {
    id: "wine-bar-firenze",
    title: "Enoteca Il Gusto",
    sector: "Bar",
    sectorId: "bar",
    location: "Firenze",
    year: 2023,
    description:
      "Wine bar con scaffali bottiglie a vista, banco degustazione in rovere, zona relax e vetrina espositiva.",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&h=800&fit=crop",
    ],
    tags: ["Scaffali", "Banco degustazione", "Vetrina"],
    materials: "Rovere massello, ferro verniciato, vetro",
  },
  {
    id: "spa-roma",
    title: "Spa Relax Roma",
    sector: "Centri Estetici",
    sectorId: "centri-estetici",
    location: "Roma",
    year: 2024,
    description:
      "Centro estetico di lusso con reception raffinata, 4 cabine trattamento, area relax con illuminazione soft e esposizione prodotti curata.",
    image:
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop",
    ],
    tags: ["Reception", "Cabine", "Area relax"],
    materials: "Marmo beige, legno chiaro, tessuti premium",
  },
  {
    id: "beauty-center-milano",
    title: "Beauty Center Milano",
    sector: "Centri Estetici",
    sectorId: "centri-estetici",
    location: "Milano",
    year: 2023,
    description:
      "Centro estetico moderno con reception minimalista, cabine trattamento attrezzate, area relax e banco esposizione prodotti.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop",
    ],
    tags: ["Reception", "Cabine", "Esposizione"],
    materials: "Laminato bianco, acciaio inox, led integrati",
  },
]
