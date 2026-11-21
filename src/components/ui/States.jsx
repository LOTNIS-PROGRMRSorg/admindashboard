import { Loader2 } from 'lucide-react';
import Notice from './Notice';
import styles from './ui.module.css';

export function EmptyState({ icon, children, action }) {
  return (
    <div className={styles.empty}>
      {icon}
      <span>{children}</span>
      {action}
    </div>
  );
}
export function LoadingState({ children = 'Loading…' }) {
  return (
    <div className={styles.empty} aria-busy="true">
      <Loader2 size={22} className="spin" />
      <span>{children}</span>
    </div>
  );
}
/** An error message; pass `onRetry` (e.g. useApi's `reload`) to offer a Try again button. */
export function ErrorState({ children, onRetry }) {
  return (
    <Notice tone="danger">
      <span className={styles.errorRow}>
        <span>{children}</span>
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            Try again
          </button>
        )}
      </span>
    </Notice>
  );
}
