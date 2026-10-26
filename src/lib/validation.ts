import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(240),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9ഀ-ൿ-]*$/, "Use lowercase letters, numbers and dashes")
    .optional()
    .or(z.literal("")),
  type: z.enum(["NEWS", "EVENT", "ACHIEVEMENT", "REPORT"]),
  excerpt: z.string().trim().max(400).optional().default(""),
  body: z.string().max(100_000).optional().default(""),
  tags: z.string().max(200).optional().default(""),
  featured: z.boolean().default(false),
  publishedAt: z.string().optional().default(""),
  alt: z.string().max(200).optional().default(""),
});
export type PostInput = z.input<typeof postSchema>;

export const teamSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(120),
  designation: z.string().trim().max(120).optional().default(""),
  groupName: z.enum(["GOVERNING", "DISTRICT", "MEDICAL"]),
  phone: z.string().trim().max(30).optional().default(""),
  visible: z.boolean().default(true),
});
export type TeamInput = z.input<typeof teamSchema>;

export const videoSchema = z.object({
  title: z.string().trim().min(2, "Enter a title").max(160),
  youtubeUrl: z
    .string()
    .trim()
    .regex(/(youtu\.be\/|youtube\.com\/)/, "Enter a YouTube link"),
  description: z.string().trim().max(400).optional().default(""),
  featured: z.boolean().default(false),
});
export type VideoInput = z.input<typeof videoSchema>;

export const bannerSchema = z.object({
  title: z.string().trim().min(3, "Enter a headline").max(120),
  subtitle: z.string().trim().max(240).optional().default(""),
  ctaLabel: z.string().trim().max(30).optional().default(""),
  ctaHref: z
    .string()
    .trim()
    .max(300)
    .regex(/^(\/[^\s]*|https?:\/\/[^\s]+)?$/, "Use a path like /contact-us or a full https:// link")
    .optional()
    .default(""),
  active: z.boolean().default(true),
});
export type BannerInput = z.input<typeof bannerSchema>;

export const albumSchema = z.object({ name: z.string().trim().min(2, "Enter an album name").max(80) });

export const publicationSchema = z.object({
  title: z.string().trim().min(3, "Enter a title").max(160),
  category: z.enum(["ANNUAL", "RESCUE", "OTHER"]),
  year: z.coerce.number().int().min(1990).max(2100),
  showInMenu: z.boolean().default(true),
});
export type PublicationInput = z.input<typeof publicationSchema>;

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().default(""),
  topic: z.enum(["VOLUNTEER", "DONATION", "EMERGENCY", "GENERAL"]),
  district: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(4000),
  consent: z.literal(true, { message: "Please tick to continue" }),
  website: z.string().max(0).optional().default(""), // honeypot
});
export type InquiryInput = z.input<typeof inquirySchema>;

export const settingsSchema = z.object({
  orgName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(160),
  founded: z.string().trim().max(10),
  about: z.string().trim().max(1000),
  address: z.string().trim().max(300),
  phone1: z.string().trim().max(30),
  phone2: z.string().trim().max(30),
  phone3: z.string().trim().max(30),
  email: z.string().trim().email("Enter a valid email"),
  whatsapp: z.string().trim().max(20),
  facebook: z.string().trim().max(200),
  youtube: z.string().trim().max(200),
});
export type SettingsInput = z.input<typeof settingsSchema>;
