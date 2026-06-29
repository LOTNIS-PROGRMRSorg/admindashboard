import React from 'react';
import styles from './ModerationTimeline.module.css';

export default function ModerationTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className={styles.empty}>No timeline events found.</p>;
  }

  return (
    <div className={styles.timeline}>
      {events.map((event, index) => (
        <div key={index} className={styles.event}>
          <div className={`${styles.dot} ${styles['dot' + event.type]}`}></div>
          <div className={styles.content}>
            <p className={styles.action}>{event.action}</p>
            <span className={styles.date}>
              {new Date(event.date).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
