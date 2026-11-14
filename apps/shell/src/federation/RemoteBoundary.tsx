import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, EmptyState } from '@mini-agoda/shared';

interface Props {
  id: string;
  onRetry: () => void;
  fallback?: (retry: () => void) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class RemoteBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you would report to Sentry/Datadog, tagged with the remote id.
    console.error(`[shell] Remote "${this.props.id}" failed`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.props.onRetry);

    return (
      <div className="ma-container" style={{ padding: '32px 20px' }}>
        <div className="ma-card">
          <EmptyState icon="🧩" title="This section is temporarily unavailable" action={<Button onClick={this.props.onRetry}>Retry</Button>}>
            We couldn&apos;t load <code>{this.props.id}</code>. The rest of the site keeps working - please try again in a moment.
            {import.meta.env.DEV && (
              <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 12 }}>{error.message}</pre>
            )}
          </EmptyState>
        </div>
      </div>
    );
  }
}
