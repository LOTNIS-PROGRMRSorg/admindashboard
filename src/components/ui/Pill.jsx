import { statusMeta } from '../../lib/status';
import styles from './ui.module.css';

const TONE = { good: styles.toneGood, warn: styles.toneWarn, danger: styles.toneDanger, info: styles.toneInfo, neutral: styles.toneNeutral, violet: styles.toneViolet };

export function Pill({ tone = 'neutral', children }) {
  return <span className={`${styles.pill} ${TONE[tone] ?? styles.toneNeutral}`}>{children}</span>;
}

/** A pill for any status string, with the dashboard-wide colour and wording. */
export function StatusPill({ status, label }) {
  const m = statusMeta(status);
  return <Pill tone={m.tone}>{label ?? m.label}</Pill>;
}
