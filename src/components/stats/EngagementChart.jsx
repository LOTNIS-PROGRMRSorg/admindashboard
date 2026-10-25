import { formatDate } from '../../lib/format';
import styles from './EngagementChart.module.css';

/** Views (light) and clicks (dark) per day — plain bars, no chart library needed. */
export function EngagementChart({ days = [] }) {
  if (!days.length) return <p className={styles.none}>No visits recorded in this period yet.</p>;
  const max = Math.max(1, ...days.map((d) => d.views));
  return (
    <div className={styles.chart} role="img" aria-label={`Views per day, highest ${max}`}>
      {days.map((d) => (
        <div key={d.day} className={styles.col} title={`${formatDate(d.day)}: ${d.views} views, ${d.clicks} clicks`}>
          <span className={styles.bar} style={{ height: `${Math.max(3, (d.views / max) * 100)}%` }}><span className={styles.click} style={{ height: `${d.views ? Math.min(100, (d.clicks / d.views) * 100) : 0}%` }} /></span>
        </div>
      ))}
    </div>
  );
}

/** views → clicks → bookings, with the share that carried on to the next step. */
export function Funnel({ steps }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <ol className={styles.funnel}>
      {steps.map((s, i) => (
        <li key={s.label}>
          <div className={styles.funnelBar} style={{ width: `${Math.max(4, (s.value / top) * 100)}%` }} />
          <span>{s.label}</span><b>{s.value.toLocaleString()}</b>
          {i > 0 && steps[i - 1].value > 0 && <small>{Math.round((s.value / steps[i - 1].value) * 100)}% of the step before</small>}
        </li>
      ))}
    </ol>
  );
}
