# Task Completion Checklist

After completing any coding task in this project, do the following:

1. **TypeScript check** — `npm run build` (runs `tsc -b` + Vite build). Fix any type errors before finishing.
2. **Lint** — `npm run lint`. Resolve ESLint warnings/errors.
3. **Manual review** — Verify the feature works visually in the browser with `npm run dev`.
4. **No tests** — There is no test suite; rely on TypeScript and manual verification.
5. **Constants only in constants.ts** — Never hard-code room rates, taxes, or contract figures inside components; always reference `CONTRACT` or `DEFAULTS` from `src/constants.ts`.
6. **Derived data in utils** — Any new computation should go in `src/utils/pricing.ts` as a pure function, not inline in components.
