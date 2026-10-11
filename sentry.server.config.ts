/**
 * Sentry server-side configuration for the merchant web app (Node runtime).
 *
 * Sentry is only enabled when NEXT_PUBLIC_SENTRY_DSN is provided, so local
 * development and preview builds without a DSN are unaffected.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
});
