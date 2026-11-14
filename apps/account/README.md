# Account MFE - :3004

Owned by the **Identity team**.

| Exposes | Mounted at | Internal routes |
| --- | --- | --- |
| `./AccountApp` | `/account/*` | `login`, `signup`, `trips`, `wishlist`, `profile` |
| `./UserMenu` | shell header (fragment) | - |

Features: mock sign in/up (demo: `demo@miniagoda.com` / `password123`), protected routes with safe redirects, profile editing, trips (upcoming/past/cancelled + cancellation), wishlist.

```bash
npm run dev -w @mini-agoda/account  # standalone at http://localhost:3004
```

Contract: [docs/MICRO_FRONTENDS.md](../../docs/MICRO_FRONTENDS.md#account--appsaccount--3004--identity-team).
