import { Branch } from '@/lib/types/branch';

const MERCHANT_ID = 'merch_ktm_4021';

export const mockBranches: Branch[] = [
  {
    id: 'branch_001',
    merchantId: MERCHANT_ID,
    name: 'Thamel Flagship',
    address: 'Jyatha Marg, Thamel',
    city: 'Kathmandu',
    phone: '+977-9841234567',
    lat: 27.7172,
    lng: 85.3123,
    isActive: true,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'branch_002',
    merchantId: MERCHANT_ID,
    name: 'Patan Outlet',
    address: 'Mangal Bazar, Lalitpur',
    city: 'Lalitpur',
    phone: '+977-9851234567',
    lat: 27.6727,
    lng: 85.3240,
    isActive: true,
    createdAt: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'branch_003',
    merchantId: MERCHANT_ID,
    name: 'Bhaktapur Heritage',
    address: 'Sukuldhoka, Bhaktapur',
    city: 'Bhaktapur',
    phone: '+977-9811234567',
    lat: 27.6723,
    lng: 85.4298,
    isActive: false,
    createdAt: '2026-09-20T14:30:00.000Z',
  },
];
