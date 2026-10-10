export interface Branch {
  id: string
  merchantId: string
  name: string
  address: string
  city?: string
  district?: string
  phone: string
  lat: number
  lng: number
  isActive: boolean
  createdAt: string
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  geofenceRadius?: number
}

export interface CreateBranchDto {
  name: string
  address: string
  city?: string
  district?: string
  lat: number
  lng: number
  phone: string
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  geofenceRadius?: number
}

export interface UpdateBranchDto {
  name?: string
  address?: string
  city?: string
  district?: string
  lat?: number
  lng?: number
  phone?: string
  isActive?: boolean
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  geofenceRadius?: number
}
