/**
 * Route Guards for Client-Side Role-Based Access Control
 * 
 * This module provides React components and hooks for protecting
 * routes and components based on user roles and permissions.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole, hasPermission, hasAllPermissions, hasAnyPermission } from './permissions';
import { useAuthStore } from '@/lib/auth/auth-store';

/**
 * Higher-Order Component to wrap a component with role protection
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function RoleGuardedComponent(props: P) {
    const { user, isInitialized } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!isInitialized) return;

      if (!user) {
        router.push('/merchant/auth/login');
        return;
      }

      const userRole = user.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        // Redirect based on role
        if (userRole === UserRole.ADMIN) {
          router.push('/admin/dashboard');
        } else if (userRole === UserRole.MERCHANT_ADMIN || userRole === UserRole.MERCHANT_STAFF) {
          router.push('/merchant/dashboard');
        } else {
          router.push('/');
        }
      }
    }, [user, isInitialized, router]);

    if (!isInitialized || !user) {
      return <div>Loading...</div>;
    }

    const userRole = user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
}

/**
 * Hook to check if current user has required role
 */
export function useRoleGuard(allowedRoles: UserRole[]): { authorized: boolean; loading: boolean } {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return { authorized: false, loading: true };
  }

  if (!user) {
    return { authorized: false, loading: false };
  }

  const userRole = user.role as UserRole;
  const authorized = allowedRoles.includes(userRole);

  return { authorized, loading: false };
}

/**
 * Hook to check if current user has specific permission
 */
export function usePermission(permission: string): { hasAccess: boolean; loading: boolean } {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return { hasAccess: false, loading: true };
  }

  if (!user) {
    return { hasAccess: false, loading: false };
  }

  const userRole = user.role as UserRole;
  const hasAccess = hasPermission(userRole, permission as any);

  return { hasAccess, loading: false };
}

/**
 * Hook to check if current user has all specified permissions
 */
export function useAllPermissions(permissions: string[]): { hasAccess: boolean; loading: boolean } {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return { hasAccess: false, loading: true };
  }

  if (!user) {
    return { hasAccess: false, loading: false };
  }

  const userRole = user.role as UserRole;
  const hasAccess = hasAllPermissions(userRole, permissions as any);

  return { hasAccess, loading: false };
}

/**
 * Hook to check if current user has any of the specified permissions
 */
export function useAnyPermission(permissions: string[]): { hasAccess: boolean; loading: boolean } {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return { hasAccess: false, loading: true };
  }

  if (!user) {
    return { hasAccess: false, loading: false };
  }

  const userRole = user.role as UserRole;
  const hasAccess = hasAnyPermission(userRole, permissions as any);

  return { hasAccess, loading: false };
}

/**
 * Server-side role check function (for use in Server Components)
 * Note: This requires the user to be passed from a server component
 */
export function requireRole(user: any, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  const userRole = user.role as UserRole;
  return allowedRoles.includes(userRole);
}

/**
 * Redirect utility for role-based redirects
 */
export function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.MERCHANT_ADMIN:
    case UserRole.MERCHANT_STAFF:
      return '/merchant/dashboard';
    case UserRole.USER:
    default:
      return '/';
  }
}
