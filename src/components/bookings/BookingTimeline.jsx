import styles from './BookingTimeline.module.css';

export default function BookingTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className={styles.event} style={{ color: 'var(--color-text-muted)' }}>No timeline events recorded.</p>;
  }

  return (
    <div className={styles.timelineContainer}>
      {timeline.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <span className={styles.time}>{item.time}</span>
          <span className={styles.event}>{item.event}</span>
        </div>
      ))}
    </div>
  );
}
