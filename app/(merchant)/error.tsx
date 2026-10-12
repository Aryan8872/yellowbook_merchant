'use client';

import * as React from 'react';
import { ErrorFallback } from '@/components/ui/error-fallback';

export default function MerchantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected merchant segment error to console
    console.error('[Merchant segment error]:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full">
        <ErrorFallback
          error={error}
          title="Unable to load page"
          message="We experienced an issue loading this section of your merchant workspace. Please try again."
          onRetry={reset}
          correlationId={error?.digest}
        />
      </div>
    </div>
  );
}
