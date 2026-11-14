import { lazy, Suspense, useState, type ComponentType, type ReactNode } from 'react';
import { Spinner } from '@mini-agoda/shared';
import { RemoteBoundary } from './RemoteBoundary';
import { markRemote } from './registry';

interface RemoteOptions {
  /** Shown while the remote's code is downloading. */
  loading?: ReactNode;
  /** Replaces the default error card (useful for small header widgets). */
  errorFallback?: (retry: () => void) => ReactNode;
}

/**
 * Wraps a federated module in Suspense + an error boundary so that a remote
 * which is down, slow or throwing never takes the whole site with it.
 *
 *   const HotelPage = createRemote('hotel', 'HotelPage', () => import('hotel/HotelPage'));
 */
export function createRemote<P extends object>(
  scope: string,
  module: string,
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: RemoteOptions = {},
) {
  const id = `${scope}/${module}`;
  const load = () => {
    markRemote(id, 'loading');
    return loader().then(
      (mod) => {
        markRemote(id, 'loaded');
        return mod;
      },
      (error) => {
        markRemote(id, 'failed');
        throw error;
      },
    );
  };

  // Created once per module so navigation between pages doesn't re-suspend.
  let LazyComponent = lazy(load);

  function RemoteComponent(props: P) {
    const [attempt, setAttempt] = useState(0);
    const retry = () => {
      LazyComponent = lazy(load);
      setAttempt((n) => n + 1);
    };

    return (
      <RemoteBoundary key={attempt} id={id} onRetry={retry} fallback={options.errorFallback}>
        <Suspense fallback={options.loading ?? <Spinner label={`Loading ${scope}…`} />}>
          <div data-mfe={scope} style={{ display: 'contents' }}>
            <LazyComponent {...props} />
          </div>
        </Suspense>
      </RemoteBoundary>
    );
  }

  RemoteComponent.displayName = `Remote(${id})`;
  return RemoteComponent;
}
