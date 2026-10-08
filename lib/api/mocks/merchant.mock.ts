import { BankPayoutDetails, MerchantProfile, NotificationSettings } from '@/lib/merchant/types';

export const mockMerchantProfile: MerchantProfile = {
  id: 'mock-merchant-id',
  name: 'The Himalayan Grill & Lounge',
  description: 'A premium dining experience with authentic Himalayan cuisine',
  logoUrl: 'https://example.com/logo.png',
  coverUrl: 'https://example.com/cover.png',
  contactEmail: 'contact@himalayan.com',
  contactPhone: '+977-9801234567',
  websiteUrl: 'https://himalayan.com.np',
  registrationNumber: '12345',
  vatNumber: 'VAT123',
  status: 'ACTIVE',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockBankPayoutDetails: BankPayoutDetails = {
  bankName: 'Nabil Bank Ltd.',
  accountHolderName: 'Himalayan Hospitality & Culinary Ventures Pvt. Ltd.',
  accountNumber: '01901017500293',
  branchName: 'Durbar Marg Branch, Kathmandu',
  payoutSchedule: 'Bi-weekly Automated Settlement (1st & 15th)',
  isVerified: true,
};

export const mockNotificationSettings: NotificationSettings = {
  emailDailyDigest: true,
  emailHighValueAlerts: true,
  emailSettlementUpdates: true,
  marketingUpdates: false,
};
