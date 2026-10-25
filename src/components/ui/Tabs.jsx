import styles from './ui.module.css';

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((t) => (
        <button key={t.key} role="tab" aria-selected={value === t.key} className={`${styles.tab} ${value === t.key ? styles.tabOn : ''}`} onClick={() => onChange(t.key)}>
          {t.label}{t.badge ? <span className={styles.badge}>{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Chips({ options, value, onChange }) {
  return <div className={styles.toolbar}>{options.map((o) => <button key={o.key} className={`${styles.chip} ${value === o.key ? styles.chipOn : ''}`} onClick={() => onChange(o.key)}>{o.label}</button>)}</div>;
}
