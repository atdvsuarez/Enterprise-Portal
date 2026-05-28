# Run Locally — Bid Intelligence (Cummins Aftermarket)

This is a **pnpm monorepo**. The Bid Intelligence app lives at `artifacts/bid-intelligence/` and is a pure React + Vite + TypeScript SPA with **mock data only** (no backend required to run it).

> You must clone and install the whole monorepo — `bid-intelligence` depends on the workspace package `@workspace/api-client-react`, so the standalone artifact folder won't work on its own.

---

## 1. Prerequisites

| Tool        | Version             | Install                                   |
| ----------- | ------------------- | ----------------------------------------- |
| **Node.js** | **24.x** (24.13+)   | https://nodejs.org/ or `nvm install 24`   |
| **pnpm**    | **9.x or 10.x**     | `npm install -g pnpm` or via Corepack     |
| Git         | any                 | https://git-scm.com/                      |

Check versions:

```bash
node -v   # should print v24.x
pnpm -v   # should print 9.x or 10.x
```

> `npm install` and `yarn install` are blocked by a `preinstall` hook — you **must** use pnpm.

---

## 2. Clone & install

```bash
git clone <repo-url> bid-intelligence-monorepo
cd bid-intelligence-monorepo
pnpm install
```

The first install will take a few minutes because of the supply-chain safety setting `minimumReleaseAge: 1440` (1-day) in `pnpm-workspace.yaml`. This is intentional — please don't disable it.

---

## 3. Run the dev server

```bash
pnpm --filter @workspace/bid-intelligence run dev
```

By default Vite serves on **http://localhost:5173**.

Optional env vars (mostly only needed in Replit):

| Var         | Default  | Purpose                                                |
| ----------- | -------- | ------------------------------------------------------ |
| `PORT`      | `5173`   | Override the dev server port.                          |
| `BASE_PATH` | `/`      | URL base path (set to `/` for local; leave unset).     |

Example with custom port:

```bash
PORT=3000 pnpm --filter @workspace/bid-intelligence run dev
```

---

## 4. Other useful commands

Run from the repo root:

```bash
# Typecheck just the bid-intelligence app
pnpm --filter @workspace/bid-intelligence run typecheck

# Typecheck the entire workspace (libs + all artifacts)
pnpm run typecheck

# Production build (outputs to artifacts/bid-intelligence/dist/public)
pnpm --filter @workspace/bid-intelligence run build

# Preview the production build locally
pnpm --filter @workspace/bid-intelligence run serve
```

---

## 5. Project layout (what you actually edit)

Everything frontend-facing lives under `artifacts/bid-intelligence/src/`:

```
artifacts/bid-intelligence/src/
├── App.tsx                       # Wouter routes + role-based guards
├── main.tsx                      # Vite entry
├── index.css                     # Tailwind v4 theme + Cummins palette
├── lib/
│   └── role.tsx                  # Role context (default: "daily")
├── data/
│   ├── types.ts                  # Bid / LineItem / Role types + USERS
│   └── mock.ts                   # All mock bids (single source of truth)
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Dialog, Table, …)
│   ├── sidebar/Sidebar.tsx       # Role-aware nav
│   └── topbar/Topbar.tsx         # "View as" role switcher
└── pages/
    ├── Dashboard.tsx             # DailyDashboard + AdminDashboard
    ├── BidMonitor.tsx            # Queue table with source/status filters
    ├── ResponseWorkbench.tsx     # AI draft + line items + Send-in-Outlook (.eml)
    ├── AIWorkbench.tsx           # "Insights Chat" page
    └── …                         # Other admin/scout/AE pages
```

---

## 6. Stack summary

- **React 18** + **TypeScript 5.9** + **Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + **shadcn/ui** (Radix primitives)
- **Wouter** for routing
- **Sonner** for toasts
- **Recharts** for charts
- **Lucide React** for icons
- All data is mocked in `src/data/mock.ts` — there is **no backend call** in this app.

---

## 7. Roles (top-right "View as" dropdown)

The app persists the selected role in `localStorage` under `bid-intel-role`. Default is **Daily Bids Team**. Other roles (Admin / Scout / AE) unlock additional pages. To reset, clear that key in DevTools.

---

## 8. Troubleshooting

### Windows: `@tailwindcss/oxide` "Cannot find native binding"

Full error looks like:

```
Error: Cannot find native binding. npm has a bug related to optional dependencies …
  at …\node_modules\.pnpm\@tailwindcss+oxide@4.x.x\node_modules\@tailwindcss\oxide\index.js
```

This is a known pnpm + Tailwind v4 issue on Windows where the platform-specific native binary (`@tailwindcss/oxide-win32-x64-msvc`) isn't linked into the isolated store. Fix in this order:

1. **Make sure you're on pnpm ≥ 9.12** (older versions handle optional deps poorly on Windows):
   ```powershell
   pnpm -v
   npm install -g pnpm@latest
   ```

2. **Clean reinstall** from the repo root (PowerShell):
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force pnpm-lock.yaml
   pnpm install
   ```
   (Or in Git Bash: `rm -rf node_modules pnpm-lock.yaml && pnpm install`.)

3. **If it still fails**, force pnpm to hoist native binaries. Create a file named `.npmrc` in the repo root with:
   ```
   node-linker=hoisted
   public-hoist-pattern[]=*@tailwindcss/oxide*
   ```
   Then re-run the clean reinstall in step 2. Do **not** commit the `.npmrc` — it's a local workaround.

4. **Last resort** — install the Windows binary explicitly in the artifact:
   ```powershell
   pnpm --filter @workspace/bid-intelligence add -D @tailwindcss/oxide-win32-x64-msvc
   ```

### Other issues

- **"Use pnpm instead"** — you ran `npm install` or `yarn install`. Use `pnpm install`.
- **Port already in use** — set `PORT=<free port>` before the dev command (PowerShell: `$env:PORT=3000; pnpm --filter @workspace/bid-intelligence run dev`).
- **Module not found `@workspace/api-client-react`** — you only cloned the `artifacts/bid-intelligence` folder. Clone the full monorepo and run `pnpm install` from the root.
- **Type errors only in the editor** — restart the TS server in your IDE. Trust `pnpm run typecheck` over the editor.
