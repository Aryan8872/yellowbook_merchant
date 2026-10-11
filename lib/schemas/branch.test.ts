import { describe, it, expect } from 'vitest'
import {
  branchSchema,
  createBranchSchema,
  updateBranchSchema,
} from '@/lib/schemas/branch'

/** A valid full branch record, used as the baseline for each case. */
const validBranch = {
  id: 'branch-1',
  merchantId: 'merchant-1',
  name: 'Thamel',
  address: '123 Thamel Marg',
  city: 'Kathmandu',
  phone: '+9779801234567',
  lat: 27.7152,
  lng: 85.3123,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('branchSchema', () => {
  it('accepts a complete valid branch record', () => {
    const result = branchSchema.safeParse(validBranch)
    expect(result.success).toBe(true)
  })

  it('accepts optional operatingHours and geofenceRadius', () => {
    const result = branchSchema.safeParse({
      ...validBranch,
      operatingHours: { monday: '09:00-18:00' },
      geofenceRadius: 150,
    })
    expect(result.success).toBe(true)
  })

  it.each([
    ['name', { name: '' }],
    ['address', { address: '' }],
    ['city', { city: '' }],
    ['phone', { phone: '' }],
  ])('rejects an empty %s', (_field, override) => {
    const result = branchSchema.safeParse({ ...validBranch, ...override })
    expect(result.success).toBe(false)
  })

  it('rejects a latitude outside -90..90', () => {
    expect(branchSchema.safeParse({ ...validBranch, lat: 91 }).success).toBe(false)
    expect(branchSchema.safeParse({ ...validBranch, lat: -91 }).success).toBe(false)
    expect(branchSchema.safeParse({ ...validBranch, lat: 90 }).success).toBe(true)
    expect(branchSchema.safeParse({ ...validBranch, lat: -90 }).success).toBe(true)
  })

  it('rejects a longitude outside -180..180', () => {
    expect(branchSchema.safeParse({ ...validBranch, lng: 181 }).success).toBe(false)
    expect(branchSchema.safeParse({ ...validBranch, lng: -181 }).success).toBe(false)
    expect(branchSchema.safeParse({ ...validBranch, lng: 180 }).success).toBe(true)
    expect(branchSchema.safeParse({ ...validBranch, lng: -180 }).success).toBe(true)
  })

  it('rejects a geofenceRadius below the 50 m floor', () => {
    expect(
      branchSchema.safeParse({ ...validBranch, geofenceRadius: 49 }).success,
    ).toBe(false)
  })

  it('rejects a geofenceRadius above the 5000 m ceiling', () => {
    expect(
      branchSchema.safeParse({ ...validBranch, geofenceRadius: 5001 }).success,
    ).toBe(false)
  })

  it('accepts a geofenceRadius at both boundaries', () => {
    expect(
      branchSchema.safeParse({ ...validBranch, geofenceRadius: 50 }).success,
    ).toBe(true)
    expect(
      branchSchema.safeParse({ ...validBranch, geofenceRadius: 5000 }).success,
    ).toBe(true)
  })
})

describe('createBranchSchema', () => {
  const validCreate = {
    name: 'Thamel',
    address: '123 Thamel Marg',
    city: 'Kathmandu',
    phone: '9801234567',
    lat: 27.7152,
    lng: 85.3123,
  }

  it('accepts a minimal valid create payload', () => {
    expect(createBranchSchema.safeParse(validCreate).success).toBe(true)
  })

  it('accepts a phone number with the +977 prefix', () => {
    expect(
      createBranchSchema.safeParse({ ...validCreate, phone: '+9779801234567' }).success,
    ).toBe(true)
  })

  it('accepts a 10-digit local number without a country code', () => {
    expect(
      createBranchSchema.safeParse({ ...validCreate, phone: '9801234567' }).success,
    ).toBe(true)
  })

  it.each(['12345', '98012345678901', 'abcdefghi', '980-123-456'])(
    'rejects the malformed phone number %s',
    (phone) => {
      expect(createBranchSchema.safeParse({ ...validCreate, phone }).success).toBe(false)
    },
  )

  it('does not require server-owned fields', () => {
    const parsed = createBranchSchema.parse(validCreate)
    expect(parsed).not.toHaveProperty('id')
    expect(parsed).not.toHaveProperty('isActive')
  })

  it('reports the Nepal phone message for a bad number', () => {
    const result = createBranchSchema.safeParse({ ...validCreate, phone: '123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === 'Invalid Nepal phone number'),
      ).toBe(true)
    }
  })

  it('reports a specific message for an out-of-range latitude', () => {
    const result = createBranchSchema.safeParse({ ...validCreate, lat: 95 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes('Latitude must be between'),
        ),
      ).toBe(true)
    }
  })
})

describe('updateBranchSchema', () => {
  it('accepts an empty object because every field is optional', () => {
    expect(updateBranchSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update containing only isActive', () => {
    expect(updateBranchSchema.safeParse({ isActive: false }).success).toBe(true)
  })

  it('still enforces the phone format when a phone is supplied', () => {
    expect(updateBranchSchema.safeParse({ phone: '123' }).success).toBe(false)
    expect(updateBranchSchema.safeParse({ phone: '9801234567' }).success).toBe(true)
  })

  it('still enforces non-empty strings when a name is supplied', () => {
    expect(updateBranchSchema.safeParse({ name: '' }).success).toBe(false)
    expect(updateBranchSchema.safeParse({ name: 'Patan' }).success).toBe(true)
  })

  it('still enforces the geofence bounds when a radius is supplied', () => {
    expect(updateBranchSchema.safeParse({ geofenceRadius: 10 }).success).toBe(false)
    expect(updateBranchSchema.safeParse({ geofenceRadius: 200 }).success).toBe(true)
  })
})
