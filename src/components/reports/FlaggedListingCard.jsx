import styles from './FlaggedListingCard.module.css';

export default function FlaggedListingCard({ listing }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={listing.image} alt={listing.title} className={styles.image} loading="lazy" />
        <div className={styles.reportsBadge}>
          {listing.reportsCount} Reports
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{listing.title}</h4>
          <span className={`${styles.status} ${
            listing.status === 'Suspended' ? styles.statusSuspended : 
            listing.status === 'Under Review' ? styles.statusReview : styles.statusPending
          }`}>
            {listing.status}
          </span>
        </div>
        
        <p className={styles.host}>Host: <strong>{listing.hostName}</strong></p>
        
        <div className={styles.reasonBox}>
          <span className={styles.reasonLabel}>Flag Reason:</span>
          <p className={styles.reason}>{listing.reason}</p>
        </div>
        
        <p className={styles.lastAction}><strong>Last sample action:</strong> {listing.lastAction}</p>
        <p className={styles.unavailable}>Listing review and suspension are unavailable in this prototype.</p>
      </div>
    </div>
  );
}
