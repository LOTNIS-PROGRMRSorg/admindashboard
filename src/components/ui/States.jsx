import { Loader2 } from 'lucide-react';
import Notice from './Notice';
import styles from './ui.module.css';

export function EmptyState({ icon, children, action }) {
  return <div className={styles.empty}>{icon}<span>{children}</span>{action}</div>;
}
export function LoadingState({ children = 'Loading…' }) {
  return <div className={styles.empty} aria-busy="true"><Loader2 size={22} className="spin" /><span>{children}</span></div>;
}
export function ErrorState({ children }) {
  return <Notice tone="danger">{children}</Notice>;
}
