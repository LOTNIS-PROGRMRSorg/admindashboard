import { notificationTone, timeAgo } from '../../lib/notifications';
import styles from './NotificationItem.module.css';

export default function NotificationItem({ notification, onClick }) {
  const unread = !notification.read_at;
  return (
    <button
      type="button"
      className={`${styles.item} ${unread ? styles.unread : ''} ${styles[notificationTone(notification.type)] || ''}`}
      onClick={() => onClick(notification)}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.body}>
        <span className={styles.title}>{notification.title}</span>
        {notification.body && (
          <span className={styles.text} style={{ display: 'block' }}>
            {notification.body}
          </span>
        )}
        <span className={styles.time} style={{ display: 'block' }}>
          {timeAgo(notification.created_at)}
        </span>
      </span>
    </button>
  );
}
