import { defineConfig } from "vitest/config"
import path from "node:path"

/**
 * Vitest configuration for the OfferNepal merchant/admin web app.
 *
 * Unit and component tests only. End-to-end behaviour is not covered here --
 * this runner never starts a Next.js server.
 *
 * Note: no `@vitejs/plugin-react` -- Vitest transforms TSX with esbuild, and
 * adding that plugin drags in `@babel/core@8`, which conflicts with the
 * `@babel/core@7` already required transitively by `shadcn`.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    // Never let Vitest try to run Next's own generated artefacts.
    exclude: [
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
    restoreMocks: true,
  },
  resolve: {
    // Mirrors the "@/*" -> "./*" mapping declared in tsconfig.json.
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
