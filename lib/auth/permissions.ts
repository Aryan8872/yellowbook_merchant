/**
 * Role-Based Access Control (RBAC) Permissions
 * 
 * This module defines the permission system for the OfferNepal platform.
 * Permissions are organized by resource and action, and roles are mapped
 * to sets of permissions.
 */

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MERCHANT_ADMIN = 'MERCHANT_ADMIN',
  MERCHANT_STAFF = 'MERCHANT_STAFF',
  USER = 'USER',
}

/**
 * Permission strings for the system
 * Format: resource.action (e.g., 'admin.users.read')
 */
export const PERMISSIONS = {
  // Admin permissions
  'admin.users.read': 'View all users',
  'admin.users.write': 'Create/edit/delete users',
  'admin.merchants.read': 'View all merchants',
  'admin.merchants.write': 'Approve/reject/edit merchants',
  'admin.offers.read': 'View all offers',
  'admin.offers.write': 'Moderate any offer',
  'admin.analytics.read': 'View platform analytics',
  'admin.system.read': 'View system configuration',
  'admin.system.write': 'Edit system configuration',

  // Merchant permissions
  'merchant.profile.read': 'View merchant profile',
  'merchant.profile.write': 'Edit merchant profile',
  'merchant.branches.read': 'View merchant branches',
  'merchant.branches.write': 'Create/edit/delete branches',
  'merchant.offers.read': 'View merchant offers',
  'merchant.offers.write': 'Create/edit/delete offers',
  'merchant.redemptions.read': 'View merchant redemptions',
  'merchant.analytics.read': 'View merchant analytics',

  // Merchant staff permissions
  'staff.offers.read': 'View merchant offers',
  'staff.redemptions.read': 'View merchant redemptions',
  'staff.redemptions.write': 'Verify redemptions',
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.keys(PERMISSIONS) as Permission[],
  [UserRole.MERCHANT_ADMIN]: [
    'merchant.profile.read',
    'merchant.profile.write',
    'merchant.branches.read',
    'merchant.branches.write',
    'merchant.offers.read',
    'merchant.offers.write',
    'merchant.redemptions.read',
    'merchant.analytics.read',
  ],
  [UserRole.MERCHANT_STAFF]: [
    'staff.offers.read',
    'staff.redemptions.read',
    'staff.redemptions.write',
  ],
  [UserRole.USER]: [],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = new Set(ROLE_PERMISSIONS[role] ?? []);
  return permissions.every((perm) => rolePermissions.has(perm));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  const rolePermissions = new Set(ROLE_PERMISSIONS[role] ?? []);
  return permissions.some((perm) => rolePermissions.has(perm));
}

/**
 * Get required permissions for a route
 * Returns null if route is public
 */
export function getRequiredPermissions(pathname: string): Permission[] | null {
  // Admin routes
  if (pathname.startsWith('/admin')) {
    return Object.keys(PERMISSIONS).filter((p) => p.startsWith('admin.')) as Permission[];
  }

  // Merchant routes
  if (pathname.startsWith('/merchant')) {
    return Object.keys(PERMISSIONS).filter((p) => p.startsWith('merchant.')) as Permission[];
  }

  // Public routes
  return null;
}

/**
 * Get required role for a route
 * Returns null if route is public
 */
export function getRequiredRole(pathname: string): UserRole | null {
  // Admin routes require ADMIN role
  if (pathname.startsWith('/admin')) {
    return UserRole.ADMIN;
  }

  // Merchant routes require MERCHANT_ADMIN or MERCHANT_STAFF
  if (pathname.startsWith('/merchant') && !pathname.startsWith('/merchant/auth')) {
    return UserRole.MERCHANT_ADMIN; // Will be checked against both MERCHANT_ADMIN and MERCHANT_STAFF
  }

  // Public routes
  return null;
}
