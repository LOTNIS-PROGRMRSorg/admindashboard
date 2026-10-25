import styles from './ui.module.css';

const TONE = { info: styles.noticeInfo, good: styles.noticeGood, warn: styles.noticeWarn, danger: styles.noticeDanger };

export default function Notice({ tone = 'info', icon, children }) {
  return (
    <div className={`${styles.notice} ${TONE[tone]}`} role={tone === 'danger' ? 'alert' : undefined}>
      {icon}
      <span>{children}</span>
    </div>
  );
}
