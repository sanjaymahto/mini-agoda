import { useSyncExternalStore } from 'react';

export type RemoteStatus = 'idle' | 'loading' | 'loaded' | 'failed';

/** Tracks the load status of every federated module, for the MFE inspector. */
const statuses = new Map<string, RemoteStatus>();
const listeners = new Set<() => void>();
let snapshot: [string, RemoteStatus][] = [];

export function markRemote(id: string, status: RemoteStatus) {
  statuses.set(id, status);
  snapshot = [...statuses.entries()];
  listeners.forEach((listener) => listener());
}

export function useRemoteStatuses() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
  );
}
