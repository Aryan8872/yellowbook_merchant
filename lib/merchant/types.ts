export interface MerchantProfile {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  registrationNumber?: string;
  vatNumber?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankPayoutDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchName: string;
  payoutSchedule: string;
  isVerified: boolean;
}

export interface NotificationSettings {
  emailDailyDigest: boolean;
  emailHighValueAlerts: boolean;
  emailSettlementUpdates: boolean;
  marketingUpdates: boolean;
}
