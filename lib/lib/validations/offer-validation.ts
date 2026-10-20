import { z } from 'zod';

export const createOfferSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  terms: z
    .string()
    .min(10, 'Terms must be at least 10 characters')
    .max(1000, 'Terms must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  categoryId: z
    .string()
    .min(1, 'Category is required'),
  estimatedSavingsNpr: z
    .number()
    .min(0, 'Estimated savings must be positive'),
  originalPriceNpr: z
    .number()
    .min(0, 'Original price must be positive')
    .optional(),
  discountPercentage: z
    .number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage must be at most 100')
    .optional(),
  coverImage: z
    .string()
    .url('Invalid cover image URL')
    .optional()
    .or(z.literal('')),
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  highlights: z
    .array(z.string().max(50, 'Each highlight must be less than 50 characters'))
    .max(5, 'Maximum 5 highlights allowed')
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  isFeatured: z
    .boolean()
    .optional(),
  availabilityJson: z
    .record(z.any())
    .optional(),
  validFrom: z
    .string()
    .datetime('Invalid valid from date')
    .optional()
    .or(z.literal('')),
  validUntil: z
    .string()
    .datetime('Invalid valid until date')
    .optional()
    .or(z.literal('')),
});

export const updateOfferSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  terms: z
    .string()
    .min(10, 'Terms must be at least 10 characters')
    .max(1000, 'Terms must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  categoryId: z
    .string()
    .optional(),
  estimatedSavingsNpr: z
    .number()
    .min(0, 'Estimated savings must be positive')
    .optional(),
  originalPriceNpr: z
    .number()
    .min(0, 'Original price must be positive')
    .optional(),
  discountPercentage: z
    .number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage must be at most 100')
    .optional(),
  coverImage: z
    .string()
    .url('Invalid cover image URL')
    .optional()
    .or(z.literal('')),
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  highlights: z
    .array(z.string().max(50, 'Each highlight must be less than 50 characters'))
    .max(5, 'Maximum 5 highlights allowed')
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  isFeatured: z
    .boolean()
    .optional(),
  availabilityJson: z
    .record(z.any())
    .optional(),
  validFrom: z
    .string()
    .datetime('Invalid valid from date')
    .optional()
    .or(z.literal('')),
  validUntil: z
    .string()
    .datetime('Invalid valid until date')
    .optional()
    .or(z.literal('')),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
