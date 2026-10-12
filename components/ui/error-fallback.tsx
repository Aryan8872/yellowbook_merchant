'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSanitizedError } from '@/lib/utils/error-messages';

export interface ErrorFallbackProps {
  error?: unknown;
  title?: string;
  message?: string;
  correlationId?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  title,
  message,
  correlationId: propCorrelationId,
  onRetry,
  compact = false,
  className,
}: ErrorFallbackProps) {
  const [copied, setCopied] = React.useState(false);

  // Extract clean, sanitized details from error if provided
  const sanitized = error ? getSanitizedError(error) : null;
  const displayTitle = title || sanitized?.title || 'Something went wrong';
  const displayMessage =
    message ||
    sanitized?.message ||
    'We were unable to complete this action. Please try again or contact support.';
  const displayCorrelationId = propCorrelationId || sanitized?.correlationId;

  const handleCopy = () => {
    if (!displayCorrelationId || typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(displayCorrelationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center justify-between gap-3 p-3.5 rounded-lg border border-destructive/20 bg-destructive/5 text-sm',
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <div className="truncate">
            <span className="font-medium text-foreground mr-1.5">{displayTitle}:</span>
            <span className="text-muted-foreground">{displayMessage}</span>
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2.5 text-xs shrink-0"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card role="alert" className={cn('border-destructive/20 bg-destructive/5 shadow-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{displayTitle}</CardTitle>
            <CardDescription className="text-sm mt-0.5">{displayMessage}</CardDescription>
          </div>
        </div>
      </CardHeader>

      {(displayCorrelationId || onRetry) && (
        <CardContent className="pt-0 pb-3 flex flex-col gap-2">
          {displayCorrelationId && (
            <div className="flex items-center justify-between p-2 rounded bg-background/60 border text-xs">
              <span className="text-muted-foreground">Reference ID:</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-foreground">{displayCorrelationId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={handleCopy}
                  title="Copy reference ID"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}

      {onRetry && (
        <CardFooter className="pt-0">
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
