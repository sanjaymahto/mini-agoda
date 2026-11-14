import styles from './Pagination.module.css';

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button className={styles.page} disabled={page === 1} onClick={() => onChange(page - 1)}>
        ‹ Prev
      </button>
      {pages.map((p) => (
        <button key={p} className={`${styles.page} ${p === page ? styles.current : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button className={styles.page} disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Next ›
      </button>
    </nav>
  );
}
