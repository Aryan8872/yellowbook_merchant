import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  role: z.enum(['USER', 'MERCHANT_ADMIN', 'MERCHANT_STAFF', 'ADMIN'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  merchantId: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  role: z
    .enum(['USER', 'MERCHANT_ADMIN', 'MERCHANT_STAFF', 'ADMIN'], {
      errorMap: () => ({ message: 'Invalid role selected' }),
    })
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  merchantId: z.string().optional().or(z.literal('')),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
