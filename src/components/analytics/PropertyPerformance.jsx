import { Star } from 'lucide-react';
import styles from './PropertyPerformance.module.css';

export default function PropertyPerformance({ data }) {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Properties in sample bookings</h2>
        <p className={styles.subtitle}>Booking counts and listed amounts for the selected range, plus the sample listing rating.</p>
      </header>
      {data.length === 0 ? <div className={styles.emptyState}>No property totals are available for this date range.</div> : (
        <div className={styles.list}>
          {data.map((property) => (
            <article key={property.id} className={styles.item}>
              <div className={styles.imageWrapper}><img src={property.image} alt="" className={styles.image} loading="lazy" /></div>
              <div className={styles.info}>
                <span className={styles.propertyTitle}>{property.title}</span>
                <span className={styles.location}>{property.location}</span>
                <div className={styles.stats}><span>{property.bookings} booking{property.bookings === 1 ? '' : 's'}</span><span><Star size={12} aria-hidden="true" /> Listing rating {property.rating}</span></div>
              </div>
              <div className={styles.metrics}><span className={styles.amount}>${property.listedAmount.toLocaleString('en-US')}</span><span className={styles.amountLabel}>listed amount</span></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
