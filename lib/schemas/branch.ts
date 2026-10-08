import { z } from 'zod'

const timeRegex = /^\d{2}:\d{2}$/
const phoneRegex = /^(\+977)?[0-9]{9,10}$/

export const branchSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  isActive: z.boolean(),
  createdAt: z.string(),
  operatingHours: z.any().optional(),
  geofenceRadius: z.number().min(50).max(5000).optional(),
})

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone is required').regex(phoneRegex, 'Invalid Nepal phone number'),
  lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  operatingHours: z.any().optional(),
  geofenceRadius: z.number().min(50).max(5000).optional(),
})

export const updateBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  phone: z.string().min(1, 'Phone is required').regex(phoneRegex, 'Invalid Nepal phone number').optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  isActive: z.boolean().optional(),
  operatingHours: z.any().optional(),
  geofenceRadius: z.number().min(50).max(5000).optional(),
})

export type CreateBranchInput = z.infer<typeof createBranchSchema>
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>
