import { AuthTokens, User } from '../types';

export const mockMerchantUser: User = {
  id: 'usr_merchant_9918',
  email: 'admin@himalayangrill.com',
  name: 'The Himalayan Grill & Lounge',
  role: 'MERCHANT_ADMIN',
  isVerified: true,
  isActive: true,
  phone: '+977-9841234567',
  avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&h=120&q=80',
  merchantId: 'merch_ktm_4021',
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: '2026-03-20T10:30:00.000Z',
};

export const mockAuthTokens: AuthTokens = {
  accessToken: 'mock_jwt_access_token_offernepal_merchant_live',
  refreshToken: 'mock_jwt_refresh_token_offernepal_merchant_live',
  expiresIn: 3600,
};

export const mockLoginResponse = {
  success: true,
  data: {
    ...mockAuthTokens,
    user: mockMerchantUser,
  },
  meta: {
    serverTimestamp: new Date().toISOString(),
    isMock: true,
  },
};

export const mockRefreshResponse = {
  success: true,
  data: {
    accessToken: 'mock_jwt_access_token_rotated_' + Date.now(),
    refreshToken: 'mock_jwt_refresh_token_rotated_' + Date.now(),
  },
  meta: {
    isMock: true,
  },
};
