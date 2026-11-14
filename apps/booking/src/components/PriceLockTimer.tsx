import { useEffect, useState } from 'react';
import styles from './components.module.css';

/** Classic OTA urgency banner - purely cosmetic, the mock API never expires prices. */
export function PriceLockTimer({ minutes }: { minutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className={`${styles.timer} ${secondsLeft === 0 ? styles.timerExpired : ''}`} role="timer">
      {secondsLeft > 0 ? (
        <>
          ⏱️ We&apos;re holding your price for{' '}
          <strong>
            {mm}:{ss}
          </strong>
        </>
      ) : (
        <>Your price hold has expired - prices may have changed, but you can still complete the booking.</>
      )}
    </div>
  );
}
