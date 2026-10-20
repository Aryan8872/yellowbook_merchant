import { z } from 'zod';

export const createMerchantSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name must be less than 200 characters'),
  contactEmail: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters'),
  contactPhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .max(50, 'PAN number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  vatNumber: z
    .string()
    .max(50, 'VAT number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .url('Invalid logo URL')
    .optional()
    .or(z.literal('')),
  coverUrl: z
    .string()
    .url('Invalid cover URL')
    .optional()
    .or(z.literal('')),
  planId: z.string().optional().or(z.literal('')),
  durationDays: z.coerce.number().min(1).max(3650).optional(),
  isTrial: z.boolean().optional(),
});

export const updateMerchantSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name must be less than 200 characters')
    .optional(),
  contactEmail: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  contactPhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .max(50, 'PAN number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  vatNumber: z
    .string()
    .max(50, 'VAT number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .url('Invalid logo URL')
    .optional()
    .or(z.literal('')),
  coverUrl: z
    .string()
    .url('Invalid cover URL')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['PENDING_REVIEW', 'ACTIVE', 'ARCHIVED', 'SUSPENDED'])
    .optional(),
});

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof updateMerchantSchema>;
