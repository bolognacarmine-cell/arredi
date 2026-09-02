import mongoose, { Schema, models } from "mongoose"

const SocialLinksSchema = new Schema({
  facebook: {
    type: String,
    default: ""
  },
  instagram: {
    type: String,
    default: ""
  },
  linkedin: {
    type: String,
    default: ""
  }
})

const SeoConfigSchema = new Schema({
  defaultTitle: {
    type: String,
    default: ""
  },
  defaultDescription: {
    type: String,
    default: ""
  }
})

const SiteConfigSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: "default"
  },
  companyName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ""
  },
  socialLinks: {
    type: SocialLinksSchema,
    default: {}
  },
  seo: {
    type: SeoConfigSchema,
    default: {}
  }
}, {
  timestamps: true
})

const SiteConfig = models.SiteConfig || mongoose.model("SiteConfig", SiteConfigSchema)

export default SiteConfig
