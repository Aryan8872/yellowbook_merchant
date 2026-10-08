/**
 * OfferNepal Merchant Portal — Standard API Envelope & DTOs
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
  meta?: Record<string, any>;
}

export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  data?: any;

  constructor(message: string, statusCode: number = 500, errorCode?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.data = data;
  }
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'MERCHANT_ADMIN' | 'MERCHANT_STAFF' | 'ADMIN' | 'USER';
  isVerified: boolean;
  isActive: boolean;
  phone?: string | null;
  avatarUrl?: string | null;
  merchantId?: string | null;
  createdAt: string;
  updatedAt?: string;
}
