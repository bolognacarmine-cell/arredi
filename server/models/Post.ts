import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface Post extends Document {
  title: string;
  slug: string;
  sectorSlug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  author: Author;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedProductSlugs?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
}

const AuthorSchema = new Schema<Author>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String },
});

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
    },
    seoDescription: {
      type: String,
      trim: true,
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

// Middleware to update updatedAt before save
PostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PostModel: Model<Post> = mongoose.models.Post || mongoose.model<Post>('Post', PostSchema);

export default PostModel;
