export type Sector = {
  id: string;
  label: string;
  description: string;
  heroImage: string;
  items: string[];
  color: string;
};

export type Project = {
  id: string;
  title: string;
  sector: string;
  sectorId: string;
  location: string;
  year: number;
  client?: string;
  description: string;
  image: string;
  gallery: string[];
  tags: string[];
  materials: string;
};

export const SECTORS: Sector[] = [
  {
    id: "barbieri",
    label: "Barbieri & Parrucchieri",
    description: "Arredi che trasformano il salone in un'esperienza: banconi sartoriali, postazioni taglio ergonomiche, zone attesa raffinate.",
    heroImage: "https://images.unsplash.com/photo-1781925856343-c97d0d44f94c?w=1400&h=700&fit=crop&auto=format",
    items: ["Banconi reception", "Postazioni taglio", "Specchiere retroilluminate", "Zone attesa", "Armadiature", "Lavandini integrati", "Vetrine espositive"],
    color: "#2D4A3E",
  },
  {
    id: "uffici",
    label: "Uffici",
    description: "Spazi di lavoro progettati per aumentare produttività e benessere: scrivanie su misura, librerie, reception e sale riunioni.",
    heroImage: "https://images.unsplash.com/photo-1715593949273-09009558300a?w=1400&h=700&fit=crop&auto=format",
    items: ["Scrivanie e postazioni", "Reception e banconi ingresso", "Librerie e scaffalature", "Sale riunioni", "Pareti divisorie", "Armadi ufficio", "Lounge e aree relax"],
    color: "#2C3E50",
  },
  {
    id: "negozi",
    label: "Negozi",
    description: "Visual merchandising e funzionalità in un unico progetto: scaffali, espositori, banchi cassa e allestimenti che valorizzano i prodotti.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=700&fit=crop&auto=format",
    items: ["Banchi cassa", "Scaffalature espositive", "Manichini e supporti", "Camerini", "Vetrine", "Banconi servizio", "Insegne e arredi esterni"],
    color: "#3D2B1F",
  },
  {
    id: "scuole",
    label: "Scuole",
    description: "Ambienti educativi pensati per la crescita: banchi e sedute ergonomiche, librerie, spogliatoi e spazi multifunzionali.",
    heroImage: "https://images.unsplash.com/photo-1602145095452-aba06946ed05?w=1400&h=700&fit=crop&auto=format",
    items: ["Banchi e sedie ergonomiche", "Librerie aula", "Lavagne integrate", "Spogliatoi", "Mense e refettori", "Arredi aula magna", "Spazi gioco"],
    color: "#1A3A4A",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "barber-milano",
    title: "The Craft Barbershop",
    sector: "Barbieri & Parrucchieri",
    sectorId: "barbieri",
    location: "Milano",
    year: 2024,
    client: "The Craft Milano",
    description: "Progetto completo per un barbershop di fascia alta nel centro di Milano. Bancone reception in noce canaletto con piano in ottone, 4 postazioni taglio con specchiere retroilluminate, zona attesa con sedute su misura in pelle naturale.",
    image: "https://images.unsplash.com/photo-1759134198561-e2041049419c?w=800&h=600&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1759134198561-e2041049419c?w=1200&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1781925856343-c97d0d44f94c?w=1200&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1778676688264-2a5db8886ab3?w=1200&h=800&fit=crop&auto=format",
    ],
    tags: ["Bancone", "Specchiere", "Zona attesa"],
    materials: "Noce canaletto, ottone satinato, pelle naturale conciata al vegetale",
  },
  {
    id: "studio-legale-torino",
    title: "Studio Legale Marchetti",
    sector: "Uffici",
    sectorId: "uffici",
    location: "Torino",
    year: 2024,
    client: "Studio Marchetti & Associati",
    description: "Arredamento completo per uno studio legale in un palazzo liberty. Librerie su misura dal pavimento al soffitto, scrivania direzionale in rovere, sala riunioni con tavolo in marmo Calacatta.",
    image: "https://images.unsplash.com/photo-1715593949273-09009558300a?w=800&h=600&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1715593949273-09009558300a?w=1200&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1704655295066-681e61ecca6b?w=1200&h=800&fit=crop&auto=format",
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
    description: "Boutique di abbigliamento artigianale nel cuore di Firenze. Espositori in ferro verniciato a polvere e legno di frassino, banco cassa circolare, camerini con tende in velluto.",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format",
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
    description: "Ristrutturazione delle aule e degli spazi comuni del Liceo Artistico Morandi. Banchi modulari in betulla, librerie aula in metallo e legno, arredo mensa in faggio naturale.",
    image: "https://images.unsplash.com/photo-1567746455504-cb3213f8f5b8?w=800&h=600&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1567746455504-cb3213f8f5b8?w=1200&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1602145095452-aba06946ed05?w=1200&h=800&fit=crop&auto=format",
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
    description: "Salone di parrucchieri con 8 postazioni lavoro, zona shampoo con 4 lavandini integrati e reception panoramica.",
    image: "https://images.unsplash.com/photo-1772113207667-5cc45ad9ecec?w=800&h=600&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1772113207667-5cc45ad9ecec?w=1200&h=800&fit=crop&auto=format",
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
    description: "Hub per startup con spazi coworking modulari, sala conferenze da 50 posti, phone booth acustici su misura.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&auto=format",
    ],
    tags: ["Coworking", "Conferenze", "Phone booth"],
    materials: "Multistrato marino, feltro acustico, laminato HPL",
  },
];
