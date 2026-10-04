---
title: Tech Stack
last_mapped_at: 2026-10-05
---

# STACK.md — Technology Stack

**Analysis Date:** 2026-10-05

## Language & Runtime

| Item | Value |
|------|-------|
| Language | TypeScript 5.x (strict mode) |
| Runtime | Node.js (via Next.js dev server) |
| Module system | ESM (`"type": "module"` in package.json) |
| Target | ES2017 |
| JSX | `react-jsx` transform (no explicit React import needed) |

## Framework

| Item | Value |
|------|-------|
| Framework | **Next.js 16.3.6** (App Router) |
| React | 19.2.8 |
| React DOM | 19.2.8 |

> ⚠️ Next.js 16 is a bleeding-edge release with breaking changes from Next.js 14/15. The `AGENTS.md` file explicitly warns: "This is NOT the Next.js you know — APIs, conventions, and file structure may all differ."

## UI & Styling

| Library | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS v4** | ^4 | Utility-first CSS via `@import "tailwindcss"` |
| **@tailwindcss/postcss** | ^4 | PostCSS integration for Tailwind v4 |
| **tw-animate-css** | ^1.4.0 | CSS animation utilities (`@import "tw-animate-css"`) |
| **shadcn/ui** | ^4.21.1 (pkg: `shadcn`) | Component scaffolding system, style: `base-rhea` |
| **@base-ui/react** | ^1.8.0 | Headless UI primitives (underlying shadcn components) |
| **class-variance-authority** | ^0.7.1 | `cva()` for variant-based component styling |
| **cn** | ^0.4.0 | `cn()` utility re-exported from `lib/utils.ts` |
| **lucide-react** | ^1.52.0 | Icon library (configured in `components.json`) |

**CSS Architecture:**
- CSS variables in `oklch()` color space (light + dark themes)
- Custom design tokens: `--primary`, `--sidebar-*`, `--chart-1..5`, `--radius`
- `@theme inline` block maps tokens to Tailwind CSS custom properties
- Font stack: Space Grotesk (sans), Montserrat (heading), Geist Mono (mono)
- Loaded via `next/font/google` in root layout

**shadcn config** (`components.json`):
```json
{
  "style": "base-rhea",
  "rsc": true,
  "tailwind.css": "app/globals.css",
  "baseColor": "neutral",
  "cssVariables": true,
  "iconLibrary": "lucide"
}
```

## Data & Tables

| Library | Version | Purpose |
|---------|---------|---------|
| **@tanstack/react-table** | ^9.2.6 | Headless table — v9 API (NOT v8) |

**TanStack Table v9 key patterns:**
- Feature registration via `tableFeatures({...})` in `components/merchant/offer/offerTable/data-table-features.ts`
- `useTable(options)` hook (replaces `useReactTable`)
- State accessed as `table.state.pagination` (NOT `table.getState()`)
- Column definitions via `createColumnHelper<Features, TData>()`
- `table.FlexRender` JSX component replaces `flexRender()` function

## Charting

| Library | Version | Purpose |
|---------|---------|---------|
| **recharts** | ^3.10.1 | SVG charts: `BarChart`, `Bar`, `XAxis`, `YAxis`, `ResponsiveContainer` |

## Theming

| Library | Version | Purpose |
|---------|---------|---------|
| **next-themes** | ^0.4.6 | Dark/light/system theme management |

- Theme toggled via keyboard shortcut `d` (implemented in `components/theme-provider.tsx`)
- Theme applied via `.dark` CSS class on `<html>` (`attribute="class"`)

## Build & Tooling

| Tool | Version | Config file |
|------|---------|------------|
| TypeScript | ^5 | `tsconfig.json` |
| ESLint | ^9 | `eslint.config.mjs` |
| Prettier | ^3.9.9 | `.prettierrc` |
| prettier-plugin-tailwindcss | ^0.8.1 | Sorts Tailwind classes |

**TypeScript config highlights:**
- `strict: true`
- `moduleResolution: "bundler"` (Next.js native resolution)
- Path alias: `@/*` → `./*` (project root)
- `skipLibCheck: true`

**Prettier config highlights:**
- No semicolons (`"semi": false`)
- Double quotes (`"singleQuote": false`)
- Tab width: 2 spaces
- Trailing comma: ES5
- Tailwind class sorting enabled

## NPM Scripts

```bash
npm run dev       # next dev (dev server with Turbopack by default in Next.js 16)
npm run build     # next build
npm run start     # next start (production)
npm run lint      # eslint
npm run format    # prettier --write "**/*.{ts,tsx}"
npm run typecheck # tsc --noEmit
```

---
*Stack analysis: 2026-10-05*
