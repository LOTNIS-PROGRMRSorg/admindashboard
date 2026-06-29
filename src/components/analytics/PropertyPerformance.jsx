import { Star } from 'lucide-react';
import styles from './PropertyPerformance.module.css';

export default function PropertyPerformance({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top Performing Properties</h3>
      </div>
      <div className={styles.list}>
        {data.map((property) => (
          <div key={property.id} className={styles.item}>
            <div className={styles.imageWrapper}>
              <img src={property.image} alt={property.title} className={styles.image} />
            </div>
            
            <div className={styles.info}>
              <span className={styles.propertyTitle}>{property.title}</span>
              <div className={styles.stats}>
                <span>{property.bookings} Bookings</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Star size={12} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
                  {property.rating}
                </span>
              </div>
            </div>

            <div className={styles.metrics}>
              <span className={styles.revenue}>{property.revenue}</span>
              <span className={styles.occupancy}>{property.occupancy} Occ.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
