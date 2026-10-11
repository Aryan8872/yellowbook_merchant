import type { NextConfig } from "next"
// Sentry v11 moved the build wrapper to the /config subpath export.
import { withSentryConfig } from "@sentry/nextjs/config"

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

// When no DSN is configured, skip Sentry wrapping entirely so local dev and
// preview builds keep working unchanged.
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Upload source maps only when explicitly enabled for a release build.
      sourcemaps: {
        disable: process.env.SENTRY_UPLOAD_SOURCEMAPS !== 'true',
      },
      // Do not fail production builds when source-map upload is unavailable.
      telemetry: false,
      silent: true,
    })
  : nextConfig;
