import { Link } from 'react-router-dom';
import styles from './ui.module.css';

/** A bordered box with an optional title row. `flush` removes padding so a table can run edge to edge. */
export default function Card({ title, icon, action, flush, children, className = '' }) {
  return (
    <section className={`${styles.card} ${flush ? styles.cardFlush : ''} ${className}`}>
      {(title || action) && (
        <div className={`${styles.cardHead} ${flush ? styles.cardHeadFlush : ''}`}>
          <h2 className={styles.cardTitle}>
            {icon}
            {title}
          </h2>
          {action &&
            (action.to ? (
              <Link className={styles.cardLink} to={action.to}>
                {action.label}
              </Link>
            ) : (
              action
            ))}
        </div>
      )}
      {children}
    </section>
  );
}

export const Grid = ({ cols = 2, children }) => (
  <div className={`${styles.grid} ${cols === 3 ? styles.grid3 : styles.grid2}`}>{children}</div>
);
export const Split = ({ children }) => <div className={styles.split}>{children}</div>;
export const Stack = ({ children }) => <div className={styles.stack}>{children}</div>;
