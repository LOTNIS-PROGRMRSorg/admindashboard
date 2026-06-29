import styles from './ListingStatusBadge.module.css';

export default function ListingStatusBadge({ status }) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return styles.approved;
      case 'pending': return styles.pending;
      case 'rejected': 
      case 'suspended': return styles.rejected;
      case 'featured': return styles.featured;
      default: return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
