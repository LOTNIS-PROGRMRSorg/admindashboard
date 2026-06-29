import { MapPin } from 'lucide-react';
import styles from './PopularLocations.module.css';

export default function PopularLocations({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top Destinations</h3>
      </div>
      <div className={styles.list}>
        <div className={`${styles.item} ${styles.listHeader}`}>
          <div className={styles.cell}>Location</div>
          <div className={styles.cell}>Bookings</div>
          <div className={styles.cell}>Revenue</div>
          <div className={styles.cell}>Growth</div>
        </div>
        
        {data.map((location, index) => (
          <div key={location.id} className={styles.item}>
            <div className={`${styles.cell} ${styles.cityCell}`}>
              <span className={`${styles.rankBadge} ${index < 3 ? styles.rankTop : ''}`}>
                {index + 1}
              </span>
              <MapPin size={16} className="text-muted" />
              {location.city}
            </div>
            <div className={styles.cell}>{location.bookings}</div>
            <div className={`${styles.cell} ${styles.revenueCell}`}>{location.revenue}</div>
            <div className={`${styles.cell} ${styles.growthCell}`}>{location.growth}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
