import styles from './components.module.css';

const STEPS = ['Your details', 'Payment', 'Confirmation'];

export function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className={styles.steps} aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const index = i + 1;
        const state = index < current ? styles.stepDone : index === current ? styles.stepCurrent : '';
        return (
          <li key={label} className={`${styles.step} ${state}`} aria-current={index === current ? 'step' : undefined}>
            <span className={styles.stepNumber}>{index < current ? '✓' : index}</span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
