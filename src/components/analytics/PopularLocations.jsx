import { MapPin } from 'lucide-react';
import styles from './PopularLocations.module.css';

export default function PopularLocations({ data }) {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Locations in sample bookings</h2>
        <p className={styles.subtitle}>Grouped from matching listing locations in the selected date range.</p>
      </header>
      {data.length === 0 ? <div className={styles.emptyState}>No location totals are available for this date range.</div> : (
        <div className={styles.list}>
          <div className={`${styles.item} ${styles.listHeader}`}><div>Location</div><div>Bookings</div><div>Listed amount</div></div>
          {data.map((location, index) => (
            <div key={location.city} className={styles.item}>
              <div className={`${styles.cell} ${styles.cityCell}`}><span className={`${styles.rankBadge} ${index < 3 ? styles.rankTop : ''}`}>{index + 1}</span><MapPin size={15} aria-hidden="true" />{location.city}</div>
              <div className={styles.cell}>{location.bookings}</div>
              <div className={`${styles.cell} ${styles.amountCell}`}>${location.listedAmount.toLocaleString('en-US')}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
