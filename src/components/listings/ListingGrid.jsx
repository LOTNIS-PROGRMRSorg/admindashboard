import { SearchX } from 'lucide-react';
import PropertyCard from './PropertyCard';
import styles from './ListingGrid.module.css';

export default function ListingGrid({ listings, onView, onApprove, onReject, hasActiveFilters, onClearFilters }) {
  if (!listings.length) {
    return (
      <div className={styles.emptyState}>
        <SearchX size={34} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No listings match these filters</h3>
        <p>{hasActiveFilters ? 'Try a different search or clear the selected filters.' : 'There are no listings in the sample data yet.'}</p>
        {hasActiveFilters && <button type="button" className={styles.clearButton} onClick={onClearFilters}>Clear filters</button>}
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      {listings.map((property) => <PropertyCard key={property.id} property={property} onView={onView} onApprove={onApprove} onReject={onReject} />)}
    </div>
  );
}
