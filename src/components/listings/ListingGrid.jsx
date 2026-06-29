import { SearchX } from 'lucide-react';
import PropertyCard from './PropertyCard';
import styles from './ListingGrid.module.css';

export default function ListingGrid({ listings, onView, onApprove, onReject }) {
  if (!listings || listings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <SearchX size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No listings found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {listings.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          onView={onView}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
