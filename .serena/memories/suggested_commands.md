# Suggested Commands

## Development
```bash
# Start dev server (Vite HMR)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Preview production build
npm run preview

# Lint (ESLint)
npm run lint
```

## Environment variables (optional auth)
```bash
VITE_APP_USERNAME=admin
VITE_APP_PASSWORD=yourpassword
```
Set these in a `.env.local` file at project root to enable the password gate.

## System utilities (Darwin/macOS)
```bash
git status
git diff
git log --oneline -10
ls -la
cd /path/to/dir
open http://localhost:5173   # open Vite dev server in browser
```
