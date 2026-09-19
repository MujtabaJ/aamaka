import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(4000),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().max(80).optional(),
});

export const addressSchema = z.object({
  label: z.string().max(40).default("Home"),
  fullName: z.string().min(2).max(80),
  phone: z.string().min(7).max(30),
  line1: z.string().min(4).max(160),
  line2: z.string().max(160).optional(),
  city: z.string().min(2).max(80),
  province: z.string().min(2).max(80),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(80).default("Pakistan"),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  paymentMethod: z.enum(["cod", "bank_transfer", "card", "jazzcash", "easypaisa"]),
  notes: z.string().max(500).optional(),
  address: addressSchema.optional(),
});

export const songSchema = z.object({
  title: z.string().min(1),
  titleSd: z.string().optional(),
  artistId: z.string().min(1),
  genreId: z.string().optional(),
  albumId: z.string().optional(),
  language: z.string().default("Sindhi"),
  accessType: z.string().default("preview"),
  lyrics: z.string().optional(),
  shortDescription: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().min(1),
  pricePaisa: z.number().int().nonnegative(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(32),
  type: z.enum(["percent", "fixed"]),
  value: z.number().int().positive(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(8).max(2000),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(72),
});
