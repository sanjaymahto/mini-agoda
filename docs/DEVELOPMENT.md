# Development Guide

## Prerequisites

- Node.js **20.19+** (tested on Node 26)
- npm 10+

## Install & run

```bash
npm install
npm run dev          # starts shell + 4 remotes
```

Open **http://localhost:3000**.

| Script                  | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | All 5 Vite dev servers with HMR (colour-coded logs)             |
| `npm run dev:remotes`   | Only the 4 remotes (e.g. when debugging the shell separately)   |
| `npm run build`         | Production build of every app → `apps/*/dist`                   |
| `npm run preview`       | Serve the production builds on the same ports                   |
| `npm start`             | `build` + `preview`                                             |
| `npm run typecheck`     | `tsc --noEmit` in every workspace                               |
| `npm run clean`         | Delete all `dist` folders                                       |

## Working on one MFE

```bash
npm run dev -w @mini-agoda/hotel     # http://localhost:3002
```

Each remote has a standalone harness (`src/bootstrap.tsx`) with a dark dev bar,
sample links and a currency switch, so you can build features **without the
shell**. Routes owned by other MFEs show a placeholder.

To see your MFE inside the real site, also run the shell (`npm run dev -w @mini-agoda/shell`).
Remotes you don't run will show the "temporarily unavailable" card, which is
also a handy way to check fault isolation.

## Demo data

| What           | Value                                   |
| -------------- | --------------------------------------- |
| Demo login     | `demo@miniagoda.com` / `password123`    |
| Test card      | `4242 4242 4242 4242`, any future expiry, any 3-digit CVV |
| Promo codes    | `AGODA10`, `MINI20`, `WELCOME5`         |
| Sample hotels  | `/hotel/h001` (Bangkok), `/hotel/h008` (Singapore) |

## Adding a new micro frontend

Example: a `deals` MFE on port 3005.

1. **Register it** in `packages/vite-config/remotes.js`:
   ```js
   deals: { port: 3005, env: 'DEALS_URL' },
   ```
2. **Scaffold** `apps/deals/` by copying `apps/hotel/` (package.json, index.html, tsconfig, `src/index.ts`, `src/bootstrap.tsx`) and rename the package to `@mini-agoda/deals`.
3. **Expose** something in `apps/deals/vite.config.js`:
   ```js
   export default createConfig({ dirname: import.meta.dirname, name: 'deals', exposes: { './DealsPage': './src/DealsPage.tsx' } });
   ```
4. **Consume** it in the shell:
   - add `'deals'` to `remotes` in `apps/shell/vite.config.js`
   - declare the module in `apps/shell/src/remotes.d.ts`
   - `export const DealsPage = createRemote('deals', 'DealsPage', () => import('deals/DealsPage'));`
   - add `<Route path="/deals" element={<DealsPage />} />` in `App.tsx`
5. Add it to the root `dev`/`build`/`preview` scripts and to the inspector's `OWNERS` map.
6. Document it in [MICRO_FRONTENDS.md](./MICRO_FRONTENDS.md).
7. `npm install` (to link the new workspace) → `npm run dev`.

## Conventions

- **Files:** components in `PascalCase.tsx`, styles alongside as `PascalCase.module.css`.
- **Exposed modules** use a `default` export; internal components use named exports.
- **Data fetching:** `useAsync(() => api.x(...), [deps])` gives you `{ data, error, loading, reload }`.
- **Page titles:** `useDocumentTitle('…')`.
- **Prices:** always `<Price amount={usd} />` or `<Money amount={usd} />`. Never format currency by hand.
- **Notifications:** `toast.success/error/info()`. Never render your own toast UI.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "This section is temporarily unavailable" | That remote's dev server isn't running or crashed - check its coloured log prefix. |
| `Invalid hook call` / two Reacts | Make sure the app's `src/index.ts` only contains `import('./bootstrap')`, and the dependency is listed in `shared` in the vite-config factory. |
| Port already in use | Another process uses 3000-3004. `lsof -i :3001` then kill it (ports are `strictPort`). |
| Remote styles missing in production preview | Rebuild the remote. CSS ships with the exposed module (`bundleAllCSS`). |
| Stale data / weird state | Clear `mini-agoda:*` keys in localStorage. |
