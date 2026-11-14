import { Button, EmptyState, useDocumentTitle } from '@mini-agoda/shared';

export function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="ma-container" style={{ padding: '48px 20px' }}>
      <div className="ma-card">
        <EmptyState icon="🧳" title="We couldn't find that page" action={<Button to="/">Back to home</Button>}>
          The page you are looking for may have moved, or the link might be broken.
        </EmptyState>
      </div>
    </div>
  );
}
