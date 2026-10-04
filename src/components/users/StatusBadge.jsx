import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'verified': return styles.active;
      case 'pending':
      case 'under_review':
      case 'changes_required': return styles.pending;
      case 'suspended':
      case 'rejected': return styles.suspended;
      default: return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass(status)}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
