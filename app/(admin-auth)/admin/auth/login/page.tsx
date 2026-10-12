import React, { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/auth/admin-login-form';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Admin Sign In — OfferNepal',
  description: 'Sign in to the OfferNepal platform administration panel',
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
