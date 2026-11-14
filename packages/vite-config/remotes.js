/**
 * Single source of truth for where every micro frontend lives.
 *
 * Each URL can be overridden at build time with an environment variable,
 * e.g. `SEARCH_URL=https://search.cdn.example.com npm run build`.
 */
export const REMOTES = {
  shell: { port: 3000, env: 'SHELL_URL' },
  search: { port: 3001, env: 'SEARCH_URL' },
  hotel: { port: 3002, env: 'HOTEL_URL' },
  booking: { port: 3003, env: 'BOOKING_URL' },
  account: { port: 3004, env: 'ACCOUNT_URL' },
};

export function remoteUrl(name) {
  const remote = REMOTES[name];
  if (!remote) throw new Error(`Unknown micro frontend "${name}"`);
  const base = process.env[remote.env] || `http://localhost:${remote.port}`;
  return base.replace(/\/$/, '');
}

/** Builds the Module Federation `remotes` option for the given container names. */
export function federatedRemotes(names) {
  return Object.fromEntries(
    names.map((name) => [
      name,
      { type: 'module', name, entry: `${remoteUrl(name)}/remoteEntry.js`, entryGlobalName: name, shareScope: 'default' },
    ]),
  );
}
