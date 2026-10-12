/**
 * Standardized Application Error Codes matching Backend AppErrorCode enum
 */
export const AppErrorCode = {
  // Common / General Errors
  SUCCESS: 'SUCCESS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Authentication & Authorization Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_KEY_INVALID: 'API_KEY_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Database Errors
  DB_UNIQUE_CONSTRAINT_VIOLATION: 'DB_UNIQUE_CONSTRAINT_VIOLATION',
  DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
  DB_FOREIGN_KEY_VIOLATION: 'DB_FOREIGN_KEY_VIOLATION',
  DB_TRANSACTION_FAILED: 'DB_TRANSACTION_FAILED',
  DB_QUERY_INTERPRETATION_ERROR: 'DB_QUERY_INTERPRETATION_ERROR',

  // Domain Business Errors
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  REDEMPTION_CODE_EXPIRED: 'REDEMPTION_CODE_EXPIRED',
  REDEMPTION_CODE_INVALID: 'REDEMPTION_CODE_INVALID',
  REDEMPTION_ALREADY_USED: 'REDEMPTION_ALREADY_USED',
  REDEMPTION_CONCURRENT_LOCK: 'REDEMPTION_CONCURRENT_LOCK',
  INVALID_MERCHANT_PIN: 'INVALID_MERCHANT_PIN',
  OFFER_LIMIT_REACHED: 'OFFER_LIMIT_REACHED',
  GEO_FENCE_MISMATCH: 'GEO_FENCE_MISMATCH',
  IDEMPOTENCY_IN_PROGRESS: 'IDEMPOTENCY_IN_PROGRESS',

  // Network / Client-side synthesized errors
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type AppErrorCodeType = (typeof AppErrorCode)[keyof typeof AppErrorCode];

export interface ErrorDetail {
  title: string;
  message: string;
}

/**
 * Enterprise Error Dictionary mapping error codes to polite, non-technical human copy.
 */
export const ERROR_MESSAGES: Record<string, ErrorDetail> = {
  [AppErrorCode.INTERNAL_SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a moment.',
  },
  [AppErrorCode.NETWORK_ERROR]: {
    title: 'Network Connection Issue',
    message: 'Unable to reach the server. Please check your internet connection.',
  },
  [AppErrorCode.VALIDATION_FAILED]: {
    title: 'Invalid Information',
    message: 'Please review the fields provided and make sure all inputs are valid.',
  },
  [AppErrorCode.BAD_REQUEST]: {
    title: 'Request Failed',
    message: 'The request could not be processed. Please check your input and try again.',
  },
  [AppErrorCode.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
  },
  [AppErrorCode.ROUTE_NOT_FOUND]: {
    title: 'Page Not Found',
    message: 'The requested page or endpoint is not available.',
  },
  [AppErrorCode.CONFLICT]: {
    title: 'Record Already Exists',
    message: 'A conflicting record already exists with the given details.',
  },
  [AppErrorCode.TOO_MANY_REQUESTS]: {
    title: 'Too Many Requests',
    message: 'You are making requests too quickly. Please pause and try again shortly.',
  },
  [AppErrorCode.UNAUTHORIZED]: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again to continue.',
  },
  [AppErrorCode.FORBIDDEN]: {
    title: 'Access Restricted',
    message: 'You do not have permission to perform this action.',
  },
  [AppErrorCode.INVALID_CREDENTIALS]: {
    title: 'Sign In Failed',
    message: 'The email or password entered is incorrect. Please try again.',
  },
  [AppErrorCode.TOKEN_EXPIRED]: {
    title: 'Session Expired',
    message: 'Your login credentials have expired. Please log in again.',
  },
  [AppErrorCode.INSUFFICIENT_PERMISSIONS]: {
    title: 'Permission Denied',
    message: 'Your account does not have sufficient permissions for this operation.',
  },
  [AppErrorCode.DB_UNIQUE_CONSTRAINT_VIOLATION]: {
    title: 'Duplicate Information',
    message: 'A record with this information already exists in the system.',
  },
  [AppErrorCode.DB_RECORD_NOT_FOUND]: {
    title: 'Item Not Found',
    message: 'The item you are attempting to access does not exist.',
  },
  [AppErrorCode.DB_FOREIGN_KEY_VIOLATION]: {
    title: 'Invalid Reference',
    message: 'The selected reference is missing or no longer valid.',
  },
  [AppErrorCode.DB_TRANSACTION_FAILED]: {
    title: 'Database Temporarily Unavailable',
    message: 'We experienced an issue completing this database operation. Please try again.',
  },
  [AppErrorCode.SUBSCRIPTION_REQUIRED]: {
    title: 'Subscription Required',
    message: 'An active membership or subscription is required to unlock this feature.',
  },
  [AppErrorCode.SUBSCRIPTION_EXPIRED]: {
    title: 'Subscription Expired',
    message: 'Your subscription has expired. Please renew to continue.',
  },
  [AppErrorCode.REDEMPTION_CODE_EXPIRED]: {
    title: 'Voucher Expired',
    message: 'This redemption voucher has expired and can no longer be used.',
  },
  [AppErrorCode.REDEMPTION_CODE_INVALID]: {
    title: 'Invalid Voucher',
    message: 'The scanned voucher code is not recognized.',
  },
  [AppErrorCode.REDEMPTION_ALREADY_USED]: {
    title: 'Already Redeemed',
    message: 'This voucher has already been redeemed.',
  },
  [AppErrorCode.REDEMPTION_CONCURRENT_LOCK]: {
    title: 'Redemption in Progress',
    message: 'This redemption is currently being processed. Please wait a moment.',
  },
  [AppErrorCode.INVALID_MERCHANT_PIN]: {
    title: 'Incorrect Staff PIN',
    message: 'The 4-digit staff PIN entered is incorrect.',
  },
  [AppErrorCode.OFFER_LIMIT_REACHED]: {
    title: 'Offer Limit Reached',
    message: 'The maximum redemption limit for this offer has been reached.',
  },
  [AppErrorCode.GEO_FENCE_MISMATCH]: {
    title: 'Location Verification Failed',
    message: 'You must be within the merchant branch location to redeem this offer.',
  },
  [AppErrorCode.IDEMPOTENCY_IN_PROGRESS]: {
    title: 'Processing Request',
    message: 'A request for this operation is currently in progress. Please do not submit again.',
  },
};

const DEFAULT_ERROR: ErrorDetail = {
  title: 'Something went wrong',
  message: 'An unexpected issue occurred. Please try again in a few moments.',
};

/**
 * Checks if a string looks like a raw technical error or stack trace
 */
function isTechnicalErrorString(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return (
    text.includes('<!DOCTYPE') ||
    text.includes('<html') ||
    text.includes('Unexpected token') ||
    text.includes('JSON.parse') ||
    text.includes('prisma.') ||
    text.includes('PrismaClient') ||
    text.includes('at ') ||
    text.includes('SELECT ') ||
    text.includes('INSERT INTO') ||
    text.includes('column "') ||
    text.includes('SyntaxError') ||
    text.includes('TypeError')
  );
}

/**
 * Extracts a safe, human-friendly error detail from any thrown error or API response
 */
export function getSanitizedError(error: any): ErrorDetail & { correlationId?: string; statusCode?: number } {
  const correlationId = error?.correlationId || error?.data?.correlationId;
  const statusCode = error?.statusCode || error?.status;

  // 1. If error has a known AppErrorCode, map it directly
  const errorCode = error?.errorCode || error?.data?.errorCode;
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return {
      ...ERROR_MESSAGES[errorCode],
      correlationId,
      statusCode,
    };
  }

  // 2. Map standard HTTP status codes
  if (statusCode === 401) {
    return { ...ERROR_MESSAGES[AppErrorCode.UNAUTHORIZED], correlationId, statusCode };
  }
  if (statusCode === 403) {
    return { ...ERROR_MESSAGES[AppErrorCode.FORBIDDEN], correlationId, statusCode };
  }
  if (statusCode === 404) {
    return { ...ERROR_MESSAGES[AppErrorCode.NOT_FOUND], correlationId, statusCode };
  }
  if (statusCode === 409) {
    return { ...ERROR_MESSAGES[AppErrorCode.CONFLICT], correlationId, statusCode };
  }
  if (statusCode === 429) {
    return { ...ERROR_MESSAGES[AppErrorCode.TOO_MANY_REQUESTS], correlationId, statusCode };
  }
  if (statusCode >= 500) {
    return { ...ERROR_MESSAGES[AppErrorCode.INTERNAL_SERVER_ERROR], correlationId, statusCode };
  }

  // 3. If error message is clean and not technical, safe to show
  const rawMessage = typeof error === 'string' ? error : error?.message;
  if (rawMessage && typeof rawMessage === 'string' && !isTechnicalErrorString(rawMessage)) {
    return {
      title: 'Action Failed',
      message: rawMessage,
      correlationId,
      statusCode,
    };
  }

  // 4. Fallback for technical strings, HTML tags, or unparsed objects
  return {
    ...DEFAULT_ERROR,
    correlationId,
    statusCode,
  };
}
