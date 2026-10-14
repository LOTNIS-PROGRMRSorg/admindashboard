import { Building2, CheckCircle, Clock3, XCircle, PauseCircle } from 'lucide-react';
import styles from './ListingStats.module.css';

export default function ListingStats({ listings }) {
  const stats = [
    { label: 'Listings in sample', value: listings.length, icon: Building2, tone: 'neutral' },
    { label: 'Approved', value: listings.filter((item) => item.status === 'Approved').length, icon: CheckCircle, tone: 'success' },
    { label: 'Pending review', value: listings.filter((item) => item.status === 'Pending').length, icon: Clock3, tone: 'warning' },
    { label: 'Rejected', value: listings.filter((item) => item.status === 'Rejected').length, icon: XCircle, tone: 'danger' },
    { label: 'Suspended', value: listings.filter((item) => item.status === 'Suspended').length, icon: PauseCircle, tone: 'neutral' },
  ];

  return (
    <section className={styles.statsGrid} aria-label="Listing counts from sample data">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <article className={styles.card} key={label}>
          <div className={`${styles.icon} ${styles[tone]}`}><Icon size={19} /></div>
          <div>
            <p className={styles.label}>{label}</p>
            <p className={styles.value}>{value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
