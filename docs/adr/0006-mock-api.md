# ADR 0006 - Mock API inside the shared package

- **Status:** Accepted (temporary until a backend exists)
- **Date:** 2026-11-14

## Context

We need realistic data and behaviour (latency, errors, persistence) before a
backend exists, without each MFE inventing its own fake data.

## Decision

`@mini-agoda/shared` exports an `api` namespace whose functions:

- are **async** with 250-650 ms artificial latency,
- read **deterministic seeded** mock data (hotels, rooms, reviews),
- persist users & bookings in `localStorage`,
- throw typed `ApiError(message, status)`,
- emit domain events (`booking:created`, `booking:cancelled`).

## Consequences

- ✅ Every MFE exercises real loading/error states today.
- ✅ Replacing internals with `fetch()` to a BFF changes **zero** MFE code.
- ⚠️ All "server" logic runs in the browser, so it is **not secure**. That is fine for a demo.
- ⚠️ Data is per-browser; bookings don't follow a user across devices.
