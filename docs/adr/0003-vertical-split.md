# ADR 0003 - Split micro frontends vertically by user journey

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

MFEs can be split **horizontally** (header team, card team, button team) or
**vertically** (each team owns a business capability end-to-end).

## Decision

Split by the booking funnel:

| Stage    | MFE      | Team      |
| -------- | -------- | --------- |
| Discover | search   | Discovery |
| Evaluate | hotel    | Property  |
| Book     | booking  | Checkout  |
| Manage   | account  | Identity  |

The shell owns only cross-cutting chrome. One deliberate **fragment**
(`account/UserMenu`) shows that a team can also own a widget inside someone
else's page.

## Consequences

- ✅ Most features touch one MFE → one team, one deploy.
- ✅ Clear ownership of URLs (`/booking/*` = Checkout team).
- ⚠️ Some UI duplication (e.g. small hotel cards in search, wishlist and
  similar hotels). We accept it to avoid coupling, and promote a component to
  the shared UI kit only when it is truly generic.
