# ADR 0005 - Scoped CSS Modules + global design tokens

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

Five independently built bundles render into **one document**. Unscoped CSS
from one team could restyle another team's page.

## Decision

- Global CSS is limited to **design tokens** (`--ma-*` custom properties), a
  reset, and a handful of `ma-*` utilities (`ma-container`, `ma-card`,
  `ma-input`, …) in `packages/shared/src/styles/global.css`, loaded once by the shell.
- All component styles use **CSS Modules**, with generated class names
  **prefixed by the MFE name** (`hotel__RoomList__card` in dev,
  `hotel_x8Jk2a` in prod), configured centrally in the Vite factory.

## Consequences

- ✅ Zero cross-MFE style collisions by construction.
- ✅ Re-theming = change tokens in one file.
- ✅ No CSS-in-JS runtime cost.
- ⚠️ Teams must resist adding global selectors. Reviewers should check for it.
