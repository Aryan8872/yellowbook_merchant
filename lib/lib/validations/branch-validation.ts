import { z } from 'zod';

const DISTRICTS = ['JHAPA', 'KATHMANDU', 'CHITWAN', 'POKHARA'] as const;

type District = typeof DISTRICTS[number];

export const createBranchSchema = z.object({
  name: z
    .string()
    .min(2, 'Branch name must be at least 2 characters')
    .max(200, 'Branch name must be less than 200 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters'),
  district: z.enum(DISTRICTS, {
    errorMap: () => ({ message: 'Invalid district selected' }),
  }),
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  operatingHours: z
    .record(z.any())
    .optional(),
});

export const updateBranchSchema = z.object({
  name: z
    .string()
    .min(2, 'Branch name must be at least 2 characters')
    .max(200, 'Branch name must be less than 200 characters')
    .optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  district: z.enum(DISTRICTS, {
    errorMap: () => ({ message: 'Invalid district selected' }),
  })
  .optional(),
  lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  operatingHours: z
    .record(z.any())
    .optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
