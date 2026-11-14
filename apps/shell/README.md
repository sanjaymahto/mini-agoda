# Shell (host) - :3000

Owned by the **Platform team**. Composes all remotes; contains no business pages.

- **Routes:** `/` → search/HomePage · `/search` → search/SearchPage · `/hotel/:hotelId` → hotel/HotelPage · `/booking/*` → booking/BookingApp · `/account/*` → account/AccountApp · `*` → NotFound
- **Header fragment:** account/UserMenu
- **Key files:** `src/App.tsx` (routes), `src/federation/createRemote.tsx` (lazy + Suspense + error boundary), `src/remotes.d.ts` (types of exposed modules), `src/components/MfeInspector.tsx`

```bash
npm run dev -w @mini-agoda/shell
```

See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md).
