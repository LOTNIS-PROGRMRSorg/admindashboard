import styles from './BookingStatusBadge.module.css';

export default function BookingStatusBadge({ status }) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return styles.confirmed;
      case 'pending': return styles.pending;
      case 'cancelled': return styles.cancelled;
      case 'completed': return styles.completed;
      case 'ongoing': return styles.ongoing;
      default: return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
