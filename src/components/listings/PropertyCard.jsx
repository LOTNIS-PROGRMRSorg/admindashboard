import { Star, MapPin, Check, X, Eye } from 'lucide-react';
import ListingStatusBadge from './ListingStatusBadge';
import styles from './PropertyCard.module.css';

export default function PropertyCard({ property, onView, onApprove, onReject }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={property.image} alt={property.title} className={styles.image} loading="lazy" />
        <div className={styles.badgeOverlay}>
          <ListingStatusBadge status={property.status} />
        </div>
        {property.featured && (
          <div className={styles.featuredBadge}>Featured</div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3 className={styles.title} title={property.title}>
            {property.title.length > 28 ? `${property.title.substring(0, 28)}...` : property.title}
          </h3>
          <div className={styles.rating}>
            <Star size={14} className={styles.starIcon} />
            {property.rating}
          </div>
        </div>
        
        <div className={styles.location}>
          <MapPin size={14} />
          {property.location}
        </div>

        <div className={styles.metadata}>
          <span>{property.category}</span>
          <span>{property.bookingsCount} bookings · {property.id}</span>
        </div>
        
        <div className={styles.details}>
          <div><span className={styles.price}>${property.pricePerNight}</span> / night</div>
          <div className={styles.host}>Hosted by {property.hostName}</div>
        </div>
        
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.btnView}`} onClick={() => onView(property)}>
            <Eye size={16} /> View
          </button>
          
          {property.status === 'Pending' && (
            <>
              <button type="button" className={`${styles.btn} ${styles.btnApprove}`} onClick={() => onApprove(property)}>
                <Check size={16} /> Approve
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnReject}`} onClick={() => onReject(property)}>
                <X size={16} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
