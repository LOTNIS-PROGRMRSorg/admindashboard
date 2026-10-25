import styles from './ui.module.css';

/** Label / value rows for detail pages. Rows with no value are skipped. */
export default function Facts({ rows }) {
  return (
    <dl className={styles.facts}>
      {rows
        .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
        .map(([label, value]) => (
          <div key={label} style={{ display: 'contents' }}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}
