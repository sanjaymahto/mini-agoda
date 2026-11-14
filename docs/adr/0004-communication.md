# ADR 0004 - Cross-MFE communication: URL → store → events

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

MFEs need to hand off context (dates, selected room), share session state
(user, currency, wishlist) and react to each other's actions (booking made).

## Decision

1. **URL query params** for anything page-scoped or shareable. Built/parsed only via shared helpers.
2. **Shared stores** (`useSyncExternalStore`, persisted to localStorage) for a *small, fixed* set of app-wide state.
3. **Typed DOM event bus** (`window` `CustomEvent`s, `mini-agoda:` prefix) for notifications.
4. **Never** import code from another MFE, and never pass functions or objects between MFEs via props.

No Redux/Zustand: the needs are small, and a global state library shared
across teams tends to become a hidden coupling point.

## Consequences

- ✅ Deep links & reloads work everywhere.
- ✅ Each channel is typed (`SearchCriteria`, `MfeEventMap`).
- ✅ Stores sync across browser tabs for free (`storage` event).
- ⚠️ URL params are a public contract and must be versioned carefully.
