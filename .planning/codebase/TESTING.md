---
title: Testing
last_mapped_at: 2026-10-05
---

# TESTING.md — Test Structure & Practices

**Analysis Date:** 2026-10-05

## Current State

> **No tests exist.** The codebase has zero test files. No testing framework is installed.

## Evidence

- No `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx` files found
- No test directories (`__tests__/`, `tests/`, `e2e/`)
- No test dependencies in `package.json`:
  - No Jest, Vitest, Mocha, or similar
  - No `@testing-library/react`, `@testing-library/user-event`
  - No Playwright, Cypress, or other E2E framework
- No test scripts in `package.json` (`npm test` is not defined)

## Lint & Type Checking (Current Quality Gates)

The only quality automation currently in place:

```bash
npm run typecheck    # tsc --noEmit — full type safety check
npm run lint         # eslint — code quality and Next.js best practices
```

**TypeScript** (`strict: true`) acts as a light form of contract testing:
- Catches type mismatches at compile time
- Enforces API contracts between components (e.g., `DataTable` props)
- Prevents common bugs like wrong prop types, missing fields

**ESLint** config extends `next/core-web-vitals` and `next/typescript`:
- Core Web Vitals rules (performance)
- TypeScript-specific lint rules
- Next.js app router conventions

## Recommended Testing Setup (When Ready)

Given the tech stack (Next.js 16, React 19, TypeScript), the recommended approach:

### Unit / Component Tests
```bash
# Recommended: Vitest + Testing Library
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

Priority test targets:
- `components/merchant/offer/offerTable/data-table.tsx` — core logic, pagination state, sorting
- `components/merchant/offer/offerTable/column.tsx` — column rendering, action handlers
- `lib/types/offer.ts` — type validation (Zod schema when added)
- `hooks/use-mobile.ts` — breakpoint detection

### E2E Tests
```bash
# Recommended: Playwright
npm install -D @playwright/test
```

Priority flows:
- Merchant login → dashboard render
- Table pagination, sorting, search
- Sidebar collapse/expand

### Testing Conventions to Establish
- Test files colocated with source: `data-table.test.tsx` next to `data-table.tsx`
- Or central `__tests__/` directory — decide before writing first test
- Mock TanStack Table with static data, not full feature registration

---
*Testing analysis: 2026-10-05*
