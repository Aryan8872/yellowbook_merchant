/**
 * Next.js server-side instrumentation hook.
 *
 * Next.js calls register() once before the server starts, which is the correct
 * place to initialize Sentry for the Node.js runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Forwards errors thrown in Server Components, Server Actions and Route Handlers
 * to Sentry, tagged with the route that failed.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional
 */
export const onRequestError = async (
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
  },
  errorContext: { routerKind: string; routePath: string; routeType: string },
) => {
  const Sentry = await import('@sentry/nextjs');

  Sentry.withScope((scope) => {
    scope.setContext('nextjs', {
      routerKind: errorContext.routerKind,
      routePath: errorContext.routePath,
      routeType: errorContext.routeType,
    });
    Sentry.captureRequestError(error, request, errorContext);
  });
};
