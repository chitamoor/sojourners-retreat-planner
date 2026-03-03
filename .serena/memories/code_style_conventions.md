# Code Style & Conventions

## Language & Tooling
- TypeScript 5.9 (strict mode via tsconfig.app.json)
- React 19 with functional components and hooks only
- Vite 7 as bundler
- Tailwind CSS 4 for styling (utility classes, no custom CSS beyond index.css)
- ESLint 9 with typescript-eslint, react-hooks, and react-refresh plugins
- No testing framework currently present

## File Structure
- `src/constants.ts` — all magic numbers and contract data; use `as const` for immutability
- `src/types.ts` — all shared TypeScript interfaces
- `src/utils/` — pure functions with no side effects; keep computation out of components
- `src/components/` — one component per file; co-locate internal sub-components in same file
- `src/App.tsx` — root state management; pass props down; use useMemo for derived values

## Naming Conventions
- PascalCase for components and interfaces
- camelCase for functions and variables
- UPPER_SNAKE_CASE for module-level constants
- No `I` prefix for interfaces

## React Patterns
- `useMemo` for expensive derived computations (tiers, summary, headcount)
- `useCallback` for event handlers passed as stable callbacks
- Inline sub-components (`function HeadlineStat`) at bottom of file for small UI pieces
- Props typed inline with `interface Props { ... }` at top of component file

## Tailwind
- Tailwind 4 with `@tailwindcss/vite` plugin (no `tailwind.config.js` file)
- Color palette: `indigo-600` (primary), `slate-*` (neutrals), `emerald` (success), `red` (error/deficit), `amber` (warning)
- `rounded-2xl shadow-sm border border-slate-200 p-6` for card containers
- Responsive: use `sm:`, `md:`, `xl:` prefixes as needed

## No Comments Policy
- Only add comments for non-obvious business logic (e.g., attrition threshold calculation)
- Avoid narrating what code does
- JSDoc-style function comments are used sparingly in utils
