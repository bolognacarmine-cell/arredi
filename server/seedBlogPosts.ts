import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';

dotenv.config();

const blogPosts = [
  {
    title: "Come arredare un salotto piccolo senza rinunciare al comfort",
    slug: "arredare-salotto-piccolo-comfort",
    sectorSlug: "salotto",
    excerpt: "Scopri 7 idee pratiche per arredare un salotto piccolo e renderlo luminoso, accogliente e funzionale senza sacrificare lo stile.",
    content: `<p>Arredare un salotto piccolo può sembrare una sfida, ma con le giuste strategie puoi trasformare uno spazio ridotto in un ambiente accogliente e di stile. Ecco come ottimizzare ogni centimetro senza rinunciare al comfort.</p>
    
    <h2>1. Scegli mobili su misura</h2>
    <p>I mobili su misura sono la soluzione ideale per sfruttare al meglio gli angoli e le pareti del salotto. Un divano ad angolo personalizzato, librerie a parete e tavoli richiudibili ti permettono di massimizzare lo spazio disponibile senza sacrificare la funzionalità.</p>
    
    <h2>2. Opta per colori chiari</h2>
    <p>I colori chiari come il bianco, il beige e il grigio chiaro riflettono la luce naturale e rendono l'ambiente più ampio e luminoso. Puoi aggiungere tocchi di colore con cuscini, tappeti e accessori per dare personalità alla stanza.</p>
    
    <h2>3. Sfrutta la verticale</h2>
    <p>Quando lo spazio a terra è limitato, guarda in alto! Librerie a parete, mensole sospese e armadi verticali ti permettono di sfruttare la verticale per riporre oggetti e decorazioni senza occupare preziosi metri quadri.</p>
    
    <h2>4. Usa specchi strategici</h2>
    <p>Gli specchi posizionati strategicamente possono raddoppiare visivamente lo spazio e riflettere la luce naturale. Posiziona un grande specchio di fronte a una finestra o dietro il divano per creare un effetto di profondità.</p>
    
    <h2>5. Scegli mobili multifunzionali</h2>
    <p>Un tavolo che si trasforma in scrivania, un divano con contenitore integrato, un pouf che funge anche da seduta extra: i mobili multifunzionali sono perfetti per i salotti piccoli perché offrono più soluzioni in un solo elemento.</p>
    
    <h2>6. Mantieni l'ordine</h2>
    <p>Un ambiente organizzato appare automaticamente più spazioso. Usa contenitori eleganti, cestini e scatole per nascondere oggetti e mantenere il salotto sempre in ordine.</p>
    
    <h2>7. Illumina con intelligenza</h2>
    <p>L'illuminazione gioca un ruolo fondamentale nella percezione dello spazio. Usa più punti luce: lampade da terra, lampade da tavolo e strisce LED per creare un'atmosfera accogliente e far sembrare la stanza più grande.</p>
    
    <p>Con questi semplici consigli, puoi trasformare il tuo salotto piccolo in uno spazio confortevole e di stile. La chiave è pianificare con attenzione e scegliere ogni elemento con cura.</p>`,
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
    images: [],
    author: {
      name: "Marco Rossi",
      role: "Interior Designer"
    },
    tags: ["salotto", "arredamento", "spazi piccoli", "design"],
    relatedProductSlugs: ["divani", "tavoli", "librerie"],
    seoTitle: "Arredare Salotto Piccolo: 7 Idee Pratiche per Spazi Confortevoli",
    seoDescription: "Scopri come arredare un salotto piccolo con 7 idee pratiche per renderlo luminoso, accogliente e funzionale senza sacrificare lo stile.",
    isPublished: true
  },
  {
    title: "Cucina moderna: idee per un design funzionale ed elegante",
    slug: "cucina-moderna-design-funzionale-elegante",
    sectorSlug: "cucina",
    excerpt: "Guida completa per progettare una cucina moderna che unisce funzionalità, estetica e tecnologia per rendere la cucina il cuore della casa.",
    content: `<p>La cucina moderna non è solo un luogo dove cucinare, ma il cuore della casa dove si condividono momenti preziosi. Ecco come progettare una cucina che unisce funzionalità, estetica e tecnologia.</p>
    
    <h2>1. Pianifica l'isola centrale</h2>
    <p>L'isola centrale è l'elemento chiave di una cucina moderna. Oltre a offrire spazio extra per la preparazione dei cibi, può fungere da zona pranzo informale e punto di incontro. Assicurati di lasciare almeno 90 cm di spazio intorno per una circolazione comoda.</p>
    
    <h2>2. Scegli elettrodomestici integrati</h2>
    <p>Gli elettrodomestici integrati creano un aspetto uniforme e pulito. Frigorifero, lavastoviglie e forno a incasso si fondono con le ante, creando una linea continua che rende la cucina più elegante e spaziosa.</p>
    
    <h2>3. Opta per materiali di qualità</h2>
    <p>I materiali giusti fanno la differenza. Il quarzo per i piani di lavoro è resistente e facile da pulire, mentre l'acciaio inox aggiunge un tocco moderno. Per le ante, il laminato di alta qualità offre durabilità e stile.</p>
    
    <h2>2. Illuminazione a più livelli</h2>
    <p>Una buona illuminazione è essenziale. Combina luce generale (plafoniere o faretti), luce di lavoro (sotto i pensili) e luce d'atmosfera (strisce LED o lampade decorative) per creare un ambiente versatile e accogliente.</p>
    
    <h2>5. Organizzazione intelligente</h2>
    <p>Le soluzioni di organizzazione moderne includono cestelli estraibili, divisori per cassetti e sistemi a colonna per sfruttare l'altezza. Ogni utensile ha il suo posto, rendendo la cucina efficiente e ordinata.</p>
    
    <h2>6. Colori neutri con accenti</h2>
    <p>Una base di colori neutri come bianco, grigio o beige crea un aspetto timeless. Aggiungi accenti di colore con le maniglie, il backsplash o gli accessori per personalizzare lo spazio senza compromettere l'eleganza.</p>
    
    <h2>7. Tecnologia smart</h2>
    <p>La cucina moderna si evolve con la tecnologia. Elettrodomestici smart, sistemi di illuminazione automatizzati e assistenti vocali rendono la cucina più efficiente e piacevole da usare.</p>
    
    <p>Con questi elementi, la tua cucina diventerà uno spazio funzionale, elegante e perfetto per la vita moderna.</p>`,
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop",
    images: [],
    author: {
      name: "Laura Bianchi",
      role: "Architetto d'Interni"
    },
    tags: ["cucina", "design moderno", "elettrodomestici", "organizzazione"],
    relatedProductSlugs: ["cucine", "elettrodomestici", "pensili"],
    seoTitle: "Cucina Moderna: Guida al Design Funzionale ed Elegante",
    seoDescription: "Scopri come progettare una cucina moderna che unisce funzionalità, estetica e tecnologia per rendere la cucina il cuore della casa.",
    isPublished: true
  },
  {
    title: "Camera da letto: creare un'oasi di relax e benessere",
    slug: "camera-da-letto-oasi-relax-benessere",
    sectorSlug: "camera-da-letto",
    excerpt: "Trasforma la tua camera da letto in un rifugio di pace e relax con questi consigli su colori, illuminazione, tessuti e organizzazione.",
    content: `<p>La camera da letto dovrebbe essere un'oasi di pace dove ricaricare le energie. Ecco come creare un ambiente che favorisce il relax e il benessere.</p>
    
    <h2>1. Scegli colori rilassanti</h2>
    <p>I colori influenzano il nostro umore e il sonno. Opta per tonalità rilassanti come il blu, il verde, il lavanda o il beige caldo. Questi colori favoriscono il relax e aiutano a conciliare il sonno.</p>
    
    <h2>2. Investi in un buon materasso</h2>
    <p>Il materasso è l'elemento più importante della camera da letto. Scegline uno che supporti la tua colonna vertebrale e si adatti alle tue esigenze. Un buon sonno inizia con il giusto supporto.</p>
    
    <h2>3. Illuminazione dimmerabile</h2>
    <p>L'illuminazione gioca un ruolo fondamentale. Usa luci calde e dimmerabili per creare un'atmosfera rilassante. Evita luci fredde o troppo intense prima di andare a dormire.</p>
    
    <h2>4. Tessuti di qualità</h2>
    <p>Le lenzuola, le coperte e i cuscini dovrebbero essere morbidi e confortevoli. Scegli tessuti naturali come il cotone, il lino o la seta per una sensazione di lusso e comfort.</p>
    
    <h2>5. Minimizza il disordine</h2>
    <p>Una camera da letto ordinata favorisce il relax. Usa contenitori sotto il letto, armadi con ante scorrevoli e cestini per mantenere tutto in ordine. Meno disordine significa meno stress.</p>
    
    <h2>6. Aggiungi piante verdi</h2>
    <p>Le piante non solo decorano, ma migliorano la qualità dell'aria e aggiungono un tocco di natura. Scegli varietà che purificano l'aria come la sansevieria o l'aloe vera.</p>
    
    <h2>7. Crea una zona lettura</h2>
    <p>Se lo spazio lo permette, crea un piccolo angolo lettura con una poltrona comoda e una lampada da terra. È perfetto per rilassarsi prima di dormire.</p>
    
    <p>Con questi accorgimenti, la tua camera da letto diventerà un rifugio di pace dove ritrovare energia ogni giorno.</p>`,
    coverImage: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=800&fit=crop",
    images: [],
    author: {
      name: "Marco Rossi",
      role: "Interior Designer"
    },
    tags: ["camera da letto", "relax", "benessere", "sonno"],
    relatedProductSlugs: ["letti", "armadi", "comò"],
    seoTitle: "Camera da Letto: Creare un'Oasi di Relax e Benessere",
    seoDescription: "Trasforma la tua camera da letto in un rifugio di pace e relax con consigli su colori, illuminazione, tessuti e organizzazione.",
    isPublished: true
  },
  {
    title: "Bagno di design: idee per uno spazio lussuoso e funzionale",
    slug: "bagno-design-spazio-lussuoso-funzionale",
    sectorSlug: "bagno",
    excerpt: "Scopri come trasformare il bagno in uno spazio di design lussuoso e funzionale con materiali di pregio, illuminazione e soluzioni intelligenti.",
    content: `<p>Il bagno non è più solo una stanza funzionale, ma uno spazio di benessere e design. Ecco come creare un bagno lussuoso e funzionale.</p>
    
    <h2>1. Materiali di pregio</h2>
    <p>Il marmo, il quarzo e la ceramica di alta qualità trasformano il bagno in uno spazio lussuoso. Questi materiali sono non solo belli, ma anche resistenti e facili da mantenere.</p>
    
    <h2>2. Doccia walk-in</h2>
    <p>La doccia walk-in è la tendenza del momento. Senza piatto doccia o cabina, crea un aspetto moderno e spazioso. Usa lastre di vetro trasparente per mantenere la continuità visiva.</p>
    
    <h2>3. Illuminazione scenografica</h2>
    <p>L'illuminazione può trasformare completamente il bagno. Usa faretti incassati, strisce LED e lampade da parete per creare un'atmosfera rilassante e scenografica.</p>
    
    <h2>4. Vasca freestanding</h2>
    <p>Una vasca freestanding è il pezzo forte di un bagno di design. Posizionala al centro della stanza o sotto una finestra per creare un punto focale elegante.</p>
    
    <h2>5. Rubinetteria design</h2>
    <p>La rubinetteria non deve essere solo funzionale, ma anche un elemento di design. Scegli miscelatori con linee moderne e finiture eleganti come l'ottone o il nero opaco.</p>
    
    <h2>6. Specchi grandi</h2>
    <p>Gli specchi grandi non solo sono pratici, ma ampliano visivamente lo spazio. Un grande specchio sopra il lavabo o una parete intera di specchi crea un effetto wow.</p>
    
    <h2>7. Organizzazione intelligente</h2>
    <p>Usa mensole, cestini e vani nascosti per mantenere il bagno ordinato. Una stanza organizzata appare automaticamente più lussuosa.</p>
    
    <p>Con questi elementi, il tuo bagno diventerà uno spazio di design dove goderti momenti di puro relax.</p>`,
    coverImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=800&fit=crop",
    images: [],
    author: {
      name: "Laura Bianchi",
      role: "Architetto d'Interni"
    },
    tags: ["bagno", "design", "lusso", "wellness"],
    relatedProductSlugs: ["bagni", "rubinetteria", "sanitari"],
    seoTitle: "Bagno di Design: Idee per uno Spazio Lussuoso e Funzionale",
    seoDescription: "Scopri come trasformare il bagno in uno spazio di design lussuoso e funzionale con materiali di pregio, illuminazione e soluzioni intelligenti.",
    isPublished: true
  },
  {
    title: "Ufficio casa: creare un workspace produttivo e confortevole",
    slug: "ufficio-casa-workspace-produttivo-confortevole",
    sectorSlug: "ufficio",
    excerpt: "Guida per progettare un ufficio in casa che favorisce la produttività, il comfort e il benessere lavorando da casa in modo efficiente.",
    content: `<p>Lavorare da casa richiede uno spazio dedicato che favorisca la produttività e il comfort. Ecco come creare il perfetto ufficio in casa.</p>
    
    <h2>1. Scegli la giusta scrivania</h2>
    <p>La scrivania è il cuore del tuo ufficio. Scegline una abbastanza grande per ospitare computer, documenti e accessori, ma proporzionata allo spazio disponibile. Una scrivania regolabile in altezza è ideale per alternare posizione seduta e in piedi.</p>
    
    <h2>2. Investi in una sedia ergonomica</h2>
    <p>La sedia è l'elemento più importante per la tua salute. Scegli una sedia ergonomica con supporto lombare, braccioli regolabili e seduta confortevole. La tua schiena ti ringrazierà.</p>
    
    <h2>3. Illuminazione naturale</h2>
    <p>Posiziona la scrivania vicino a una finestra per sfruttare la luce naturale. La luce del giorno migliora l'umore, aumenta la produttività e riduce l'affaticamento visivo.</p>
    
    <h2>4. Organizzazione verticale</h2>
    <p>Sfrutta le pareti con librerie, mensole e pannelli organizzatori. Libera spazio sulla scrivania e mantieni tutto a portata di mano.</p>
    
    <h2>5. Isolamento acustico</h2>
    <p>Il rumore può distrarre e ridurre la produttività. Usa tappeti, tende e pannelli fonoassorbenti per creare un ambiente tranquillo e concentrato.</p>
    
    <h2>6. Tecnologia adeguata</h2>
    <p>Assicurati di avere tutte le prese elettriche necessarie, una connessione internet stabile e i dispositivi giusti per il tuo lavoro. Un monitor aggiuntivo può migliorare notevolmente la produttività.</p>
    
    <h2>7. Personalizza lo spazio</h2>
    <p>Aggiungi piante, quadri e oggetti che ti ispirano. Uno spazio personalizzato ti motiva e rende il lavoro più piacevole.</p>
    
    <p>Con questi accorgimenti, il tuo ufficio in casa diventerà un spazio produttivo dove lavorare al meglio.</p>`,
    coverImage: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1200&h=800&fit=crop",
    images: [],
    author: {
      name: "Marco Rossi",
      role: "Interior Designer"
    },
    tags: ["ufficio", "home office", "produttività", "design"],
    relatedProductSlugs: ["scrivanie", "sedie", "armadi"],
    seoTitle: "Ufficio Casa: Creare un Workspace Produttivo e Confortevole",
    seoDescription: "Guida per progettare un ufficio in casa che favorisce la produttività, il comfort e il benessere lavorando da casa in modo efficiente.",
    isPublished: true
  },
  {
    title: "Arredamento esterno: creare un outdoor di stile e comfort",
    slug: "arredamento-esterno-outdoor-stile-comfort",
    sectorSlug: "esterno",
    excerpt: "Trasforma il tuo giardino o terrazzo in uno spazio outdoor di stile con mobili resistenti, illuminazione e decorazioni per goderti l'aria aperta.",
    content: `<p>Lo spazio esterno è un'estensione della casa dove godersi momenti di relax all'aria aperta. Ecco come creare un outdoor di stile e comfort.</p>
    
    <h2>1. Scegli mobili resistenti</h2>
    <p>Gli arredi da esterno devono resistere alle intemperie. Opta per materiali come il teak, l'alluminio, il rattan sintetico e i tessuti impermeabili che combinano resistenza e stile.</p>
    
    <h2>2. Crea zone definite</h2>
    <p>Dividi lo spazio in aree funzionali: zona pranzo con tavolo e sedie, zona relax con divani e poltrone, e forse un angolo lettura. Questo rende l'outdoor più vivibile e organizzato.</p>
    
    <h2>3. Illuminazione atmosferica</h2>
    <p>L'illuminazione trasforma l'outsero la sera. Usa luci calde, lanterne, stringhe di luci e faretti per creare un'atmosfera magica e accogliente.</p>
    
    <h2>4. Ombreggiatura intelligente</h2>
    <p>Un pergolato, una tenda da sole o un ombrellone ti permette di godere dello spazio anche nelle giornate più soleggiate. Scegli soluzioni che si integrano con il design complessivo.</p>
    
    <h2>5. Verde e fiori</h2>
    <p>Le piante sono essenziali per un outdoor accogliente. Scegli piante in vaso, fioriere e siepi per creare un'atmosfera naturale e rilassante.</p>
    
    <h2>6. Tessuti e cuscini</h2>
    <p>Cuscini, tappeti e plaid aggiungono comfort e colore. Scegli tessuti resistenti ai raggi UV e all'acqua per mantenere la bellezza nel tempo.</p>
    
    <h2>7. Elementi decorativi</h2>
    <p>Sculture, fontane, vasi e oggetti decorativi personalizzano lo spazio e lo rendono unico. Scegli elementi che riflettano il tuo stile.</p>
    
    <p>Con questi elementi, il tuo spazio esterno diventerà un luogo perfetto per goderti l'aria aperta con stile e comfort.</p>`,
    coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop",
    images: [],
    author: {
      name: "Laura Bianchi",
      role: "Architetto d'Interni"
    },
    tags: ["esterno", "giardino", "terrazzo", "outdoor"],
    relatedProductSlugs: ["arredo esterno", "tavoli da esterno", "sedie da esterno"],
    seoTitle: "Arredamento Esterno: Creare un Outdoor di Stile e Comfort",
    seoDescription: "Trasforma il tuo giardino o terrazzo in uno spazio outdoor di stile con mobili resistenti, illuminazione e decorazioni per goderti l'aria aperta.",
    isPublished: true
  }
];

async function seedBlogPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arredi');
    console.log('Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing blog posts');

    // Insert new posts
    await Post.insertMany(blogPosts);
    console.log('Inserted blog posts');

    console.log('Blog posts seeded successfully!');
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedBlogPosts();
