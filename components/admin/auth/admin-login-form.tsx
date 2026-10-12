'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      if (!result.success) {
        setError(result.message || 'Invalid credentials. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Role-based redirect: ADMIN → /admin/dashboard
      window.location.assign('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate. Please check your network.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-border/60 shadow-xl shadow-black/10 dark:shadow-black/30 bg-card/90 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="lg:hidden mx-auto h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-2">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Admin Sign In
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your administrator credentials to access the platform control panel
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="admin-email">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@offernepal.com"
                className="pl-9 text-sm"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-9 pr-9 text-sm"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            id="admin-login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full font-bold shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Sign In to Admin Panel
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          Admin accounts are provisioned internally.{' '}
          <a
            href="mailto:engineering@offernepal.com"
            className="text-indigo-500 font-medium hover:underline"
          >
            Contact engineering for access
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
