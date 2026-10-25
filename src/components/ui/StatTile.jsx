import { Link } from 'react-router-dom';
import styles from './ui.module.css';

/** One number with a label. Pass `to` to make it a shortcut to the page behind it. */
export function StatTile({ label, value, sub, icon: Icon, tone, to }) {
  const cls = `${styles.stat} ${tone === 'warn' ? styles.statWarn : tone === 'danger' ? styles.statDanger : tone === 'good' ? styles.statGood : ''}`;
  const body = (
    <>
      <div className={styles.statTop}>
        <span>{label}</span>
        {Icon && (
          <span className={styles.statIcon}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={styles.statValue}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export const StatGrid = ({ children }) => <div className={styles.stats}>{children}</div>;
