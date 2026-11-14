# ADR 0001 - Runtime composition with Module Federation

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

We want separate teams to own Search, Hotel, Booking and Account and to deploy
them independently, while customers see one fast, seamless website.

## Options considered

| Option | Independent deploy | Single React tree | Shared deps | Notes |
| --- | --- | --- | --- | --- |
| Build-time packages (npm libs) | ❌ shell must rebuild | ✅ | ✅ | Simple, but a release train |
| iframes | ✅ | ❌ | ❌ | Strong isolation, poor UX (scroll, modals, routing, a11y) |
| Web Components / single-spa | ✅ | ⚠️ multiple roots | ⚠️ manual | Framework-agnostic, more glue |
| **Module Federation** | ✅ | ✅ | ✅ singletons | Runtime loading of ES modules |

## Decision

Use **Module Federation 2** (`@module-federation/vite`). The shell is the host;
each domain is a remote exposing React components. React, React DOM, React
Router and `@mini-agoda/shared` are shared singletons.

## Consequences

- ✅ Ship a remote without touching the shell.
- ✅ One router, one React, so links, context and portals work across MFEs.
- ⚠️ Shared singletons must stay version-compatible across all apps.
- ⚠️ Need error boundaries around every remote (see `createRemote`).
