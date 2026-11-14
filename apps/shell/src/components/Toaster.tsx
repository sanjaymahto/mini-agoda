import { useEffect, useState } from 'react';
import { eventBus, type MfeEventMap } from '@mini-agoda/shared';
import styles from '../styles/Toaster.module.css';

type Toast = MfeEventMap['ui:toast'] & { id: number };

/** Any MFE can show a notification with `toast.success(...)` - only the shell renders them. */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 0;
    const push = (toast: MfeEventMap['ui:toast']) => {
      const id = ++nextId;
      setToasts((list) => [...list.slice(-3), { ...toast, id }]);
      setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500);
    };

    const offs = [
      eventBus.on('ui:toast', push),
      eventBus.on('auth:changed', ({ user }) => push({ message: user ? `Welcome, ${user.firstName}!` : 'You have been signed out', type: 'info' })),
      eventBus.on('booking:created', ({ booking }) => push({ message: `Booking ${booking.id} confirmed 🎉`, type: 'success' })),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  return (
    <div className={styles.region} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type ?? 'info']}`} role="status">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
