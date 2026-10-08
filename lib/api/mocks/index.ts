import { mockLoginResponse, mockMerchantUser, mockRefreshResponse } from './auth.mock';
import { mockBankPayoutDetails, mockMerchantProfile, mockNotificationSettings } from './merchant.mock';
import { mockBranches } from './branch.mock';
import { Branch } from '@/lib/types/branch';

export interface MockHandler {
  (params?: any): any;
}

const mockRegistry: Record<string, Record<string, MockHandler>> = {
  '/api/v1/auth/login': {
    POST: (body) => ({
      ...mockLoginResponse,
      data: {
        ...mockLoginResponse.data,
        user: {
          ...mockMerchantUser,
          email: body?.email || mockMerchantUser.email,
        },
      },
    }),
  },
  '/api/v1/auth/refresh': {
    POST: () => mockRefreshResponse,
  },
  '/api/v1/auth/logout': {
    POST: () => ({ success: true, message: 'Logged out successfully' }),
  },
  '/api/v1/auth/me': {
    GET: () => ({ success: true, data: mockMerchantUser }),
  },
  '/api/v1/merchant/profile': {
    GET: () => ({ success: true, data: mockMerchantProfile }),
    PUT: (body) => ({ success: true, data: { ...mockMerchantProfile, ...body } }),
  },
  '/api/v1/merchant/payout': {
    GET: () => ({ success: true, data: mockBankPayoutDetails }),
    PUT: (body) => ({ success: true, data: { ...mockBankPayoutDetails, ...body } }),
  },
  '/api/v1/merchant/notifications': {
    GET: () => ({ success: true, data: mockNotificationSettings }),
    PUT: (body) => ({ success: true, data: { ...mockNotificationSettings, ...body } }),
  },
};

// In-memory mutable copy for mock mutations during a dev session
let _branches: Branch[] = [...mockBranches];

export function getMockResponse(endpoint: string, method: string = 'GET', body?: any): any | null {
  // Normalize endpoint URL by stripping query strings and base URL if present
  const cleanEndpoint = endpoint.split('?')[0].replace(/^https?:\/\/[^/]+/, '');
  const methodUpper = method.toUpperCase();

  // Exact registry match first
  const endpointMocks = mockRegistry[cleanEndpoint];
  if (endpointMocks && endpointMocks[methodUpper]) {
    return endpointMocks[methodUpper](body);
  }

  // Fallback for general auth routes
  if (cleanEndpoint.includes('/auth/me')) {
    return { success: true, data: mockMerchantUser };
  }

  // --- Branch pattern matching ---
  // GET /api/v1/merchants/:merchantId/branches
  if (/\/api\/v1\/merchants\/[^/]+\/branches$/.test(cleanEndpoint) && methodUpper === 'GET') {
    return { success: true, data: _branches };
  }
  // POST /api/v1/merchants/:merchantId/branches
  if (/\/api\/v1\/merchants\/[^/]+\/branches$/.test(cleanEndpoint) && methodUpper === 'POST') {
    const newBranch: Branch = {
      id: `branch_${Date.now()}`,
      merchantId: body?.merchantId ?? 'merch_ktm_4021',
      name: body?.name ?? 'New Branch',
      address: body?.address ?? '',
      city: body?.city ?? '',
      phone: body?.phone ?? '',
      lat: body?.lat ?? 27.7172,
      lng: body?.lng ?? 85.3240,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    _branches = [..._branches, newBranch];
    return { success: true, data: newBranch };
  }
  // PUT /api/v1/merchants/branches/:branchId
  if (/\/api\/v1\/merchants\/branches\/[^/]+$/.test(cleanEndpoint) && methodUpper === 'PUT') {
    const branchId = cleanEndpoint.split('/').pop();
    _branches = _branches.map((b) => (b.id === branchId ? { ...b, ...body } : b));
    const updated = _branches.find((b) => b.id === branchId);
    return updated ? { success: true, data: updated } : null;
  }
  // DELETE /api/v1/merchants/branches/:branchId
  if (/\/api\/v1\/merchants\/branches\/[^/]+$/.test(cleanEndpoint) && methodUpper === 'DELETE') {
    const branchId = cleanEndpoint.split('/').pop();
    _branches = _branches.filter((b) => b.id !== branchId);
    return { success: true, data: null };
  }

  return null;
}
