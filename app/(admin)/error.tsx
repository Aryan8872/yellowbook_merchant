'use client';

import * as React from 'react';
import { ErrorFallback } from '@/components/ui/error-fallback';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected admin segment error to console
    console.error('[Admin segment error]:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full">
        <ErrorFallback
          error={error}
          title="Admin Panel Error"
          message="We encountered an issue loading this administration view. Please try again or reach out to system engineering."
          onRetry={reset}
          correlationId={error?.digest}
        />
      </div>
    </div>
  );
}
