import styles from './PaymentStatusBadge.module.css';

export default function PaymentStatusBadge({ status }) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return styles.paid;
      case 'partially paid':
      case 'refund pending': return styles.partiallyPaid;
      case 'refund failed': return styles.failed;
      case 'unpaid': return styles.default;
      case 'failed': return styles.failed;
      case 'refunded': return styles.refunded;
      default: return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
