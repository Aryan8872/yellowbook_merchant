'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[Global application error]:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground font-sans">
        <div className="max-w-md w-full p-6 rounded-xl border border-destructive/20 bg-card shadow-lg text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while running the application. Please reload the page or try again.
          </p>
          {error?.digest && (
            <div className="text-xs font-mono text-muted-foreground p-2 rounded bg-muted">
              Reference: {error.digest}
            </div>
          )}
          <div className="pt-2">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
