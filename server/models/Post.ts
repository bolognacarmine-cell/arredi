import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  label: string;
  url: string;
}

export interface Post extends Document {
  title: string;
  slug: string;
  sectorSlug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  images?: string[];
  author: Author;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedProductSlugs?: string[];
  /** Meta title (max 60 caratteri). */
  seoTitle?: string;
  /** Meta description (max 160 caratteri; range consigliato 140-155). */
  seoDescription?: string;
  /** URL canonico alternativo; se omesso si usa /blog/<slug>. */
  canonicalUrl?: string;
  /** Immagine Open Graph dedicata; se omessa si usa la copertina. */
  ogImage?: string;
  /** Domande/risposte per lo Schema.org FAQPage. */
  faq: FaqItem[];
  /** Link interni alle pagine di servizio pertinenti. */
  internalLinks: InternalLink[];
  /** Articolo in evidenza in homepage e in cima all'elenco. */
  featured: boolean;
  /** Ordinamento manuale gestito dall'admin (PUT /posts/reorder). */
  order: number;
  isPublished: boolean;
}

const AuthorSchema = new Schema<Author>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String },
});

const FaqSchema = new Schema<FaqItem>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const InternalLinkSchema = new Schema<InternalLink>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PostSchema = new Schema<Post>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    sectorSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    coverImageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    images: {
      type: [String],
      default: [],
    },
    author: {
      type: AuthorSchema,
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    tags: {
      type: [String],
      default: [],
    },
    relatedProductSlugs: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    ogImage: {
      type: String,
      trim: true,
    },
    faq: {
      type: [FaqSchema],
      default: [],
    },
    internalLinks: {
      type: [InternalLinkSchema],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and SEO
// Note: slug already has unique: true which creates an index automatically
PostSchema.index({ sectorSlug: 1 });
PostSchema.index({ publishedAt: -1 });
PostSchema.index({ isPublished: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isPublished: 1, publishedAt: -1 });
PostSchema.index({ isPublished: 1, featured: -1, order: 1 });
// Ricerca per keyword (GET /api/blog/posts?search=) — regex insensibile alle maiuscole,
// nessun index dedicato: l'elenco è già paginato e il volume degli articoli è contenuto.

// Middleware to update updatedAt before save
PostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PostModel: Model<Post> = mongoose.models.Post || mongoose.model<Post>('Post', PostSchema);

export default PostModel;
