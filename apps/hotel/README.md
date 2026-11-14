# Hotel MFE - :3002

Owned by the **Property team**.

| Exposes | Mounted at |
| --- | --- |
| `./HotelPage` | `/hotel/:hotelId` |

Features: gallery + lightbox, overview, stay editor, rooms & rates (capacity/availability checks), facilities, reviews (breakdown, traveller filter, paging), location, policies, similar hotels. *Reserve* navigates to `/booking/checkout?hotelId&roomId&…`.

```bash
npm run dev -w @mini-agoda/hotel    # standalone at http://localhost:3002
```

Contract: [docs/MICRO_FRONTENDS.md](../../docs/MICRO_FRONTENDS.md#hotel--appshotel--3002--property-team).
