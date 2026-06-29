import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return styles.active;
      case 'pending': return styles.pending;
      case 'suspended': return styles.suspended;
      default: return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
