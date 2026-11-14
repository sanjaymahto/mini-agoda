# Booking MFE - :3003

Owned by the **Checkout team**.

| Exposes | Mounted at | Internal routes |
| --- | --- | --- |
| `./BookingApp` | `/booking/*` | `checkout`, `confirmation/:bookingId` |

Features: 2-step checkout (guest details → payment), card validation (Luhn, expiry, CVV), pay-at-hotel, promo codes, price breakdown, price-hold timer, confirmation. Price is always fetched from the API, never from the URL.

```bash
npm run dev -w @mini-agoda/booking  # standalone at http://localhost:3003
```

Contract: [docs/MICRO_FRONTENDS.md](../../docs/MICRO_FRONTENDS.md#booking--appsbooking--3003--checkout-team).
