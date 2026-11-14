# @mini-agoda/shared

The cross-team contract, loaded as a **Module Federation singleton** so every MFE shares one instance.

| Module | Exports |
| --- | --- |
| `types.ts` | Hotel, Room, Review, Booking, User, SearchCriteria, … |
| `api/` | `api.searchHotels`, `api.getHotel`, `api.createBooking`, … (mock, async, localStorage) |
| `store.ts` | `useAuth`, `useCurrency`, `useWishlist`, `setCurrentUser`, `setCurrency`, `toggleWishlist` |
| `events.ts` | `eventBus.emit/on`, `toast.success/error/info` |
| `hooks.ts` | `useAsync`, `useDocumentTitle`, `useDebouncedValue`, `useClickOutside` |
| `utils/` | currency, dates, pricing, URL params, validation |
| `ui/` | Button, Price, Money, ScoreBadge, StarRating, SmartImage, Modal, Badge, Spinner, Skeleton, EmptyState, ErrorState, WishlistButton, StandaloneLayout |
| `styles.css` | design tokens (`--ma-*`) + base styles |

Import from the package root only: `import { api, Price } from '@mini-agoda/shared'`.

See [docs/DATA_MODEL.md](../../docs/DATA_MODEL.md) and [docs/COMMUNICATION.md](../../docs/COMMUNICATION.md).
