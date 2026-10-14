import styles from './ModerationTimeline.module.css';

export default function ModerationTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className={styles.empty}>No timeline events are included in this sample report.</p>;
  }

  return (
    <div className={styles.timeline}>
      {events.map((event, index) => (
        <div key={index} className={styles.event}>
          <div className={`${styles.dot} ${styles['dot' + event.type]}`}></div>
          <div className={styles.content}>
            <p className={styles.action}>{event.action}</p>
            <span className={styles.date}>
              {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(event.date))} UTC
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
