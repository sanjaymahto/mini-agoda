# @mini-agoda/vite-config

`createConfig({ dirname, name, exposes?, remotes? })` returns the Vite config used by every app: Module Federation (shared singletons), React plugin, MFE-prefixed CSS Modules, fixed ports, CORS, `server.origin`, absolute `base` for remotes in production.

`remotes.js` is the registry of names → ports → env-overridable URLs.

See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md#31-the-shared-config-factory) and [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md).
