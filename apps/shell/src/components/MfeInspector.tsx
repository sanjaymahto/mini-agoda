import { useEffect, useState } from 'react';
import { useRemoteStatuses } from '../federation/registry';
import styles from '../styles/MfeInspector.module.css';

const OWNERS: Record<string, string> = {
  shell: 'Platform team',
  search: 'Discovery team',
  hotel: 'Property team',
  booking: 'Checkout team',
  account: 'Identity team',
};

/**
 * Developer aid: lists every federated module and its status, and can outline
 * each MFE on the page. Toggle with the 🧩 button or Ctrl+Shift+M.
 */
export function MfeInspector() {
  const statuses = useRemoteStatuses();
  const [open, setOpen] = useState(false);
  const [outline, setOutline] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('mfe-outline', outline);
  }, [outline]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') setOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.root}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.title}>Micro frontends</div>
          <div className={styles.row}>
            <span className={`${styles.dot} ${styles.loaded}`} />
            <strong>shell</strong>
            <span className={styles.owner}>{OWNERS.shell}</span>
          </div>
          {statuses.map(([id, status]) => (
            <div key={id} className={styles.row}>
              <span className={`${styles.dot} ${styles[status]}`} title={status} />
              <strong>{id}</strong>
              <span className={styles.owner}>{OWNERS[id.split('/')[0]]}</span>
            </div>
          ))}
          <label className={styles.toggle}>
            <input type="checkbox" checked={outline} onChange={(event) => setOutline(event.target.checked)} />
            Outline MFEs on page
          </label>
        </div>
      )}
      <button className={styles.fab} onClick={() => setOpen((o) => !o)} aria-label="Toggle micro frontend inspector" title="Micro frontend inspector (Ctrl+Shift+M)">
        🧩
      </button>
    </div>
  );
}
