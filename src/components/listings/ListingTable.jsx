import { Eye, Check, X, SearchX } from 'lucide-react';
import ListingStatusBadge from './ListingStatusBadge';
import styles from './ListingTable.module.css';

export default function ListingTable({ listings, onView, onApprove, onReject, hasActiveFilters, onClearFilters }) {
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
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead><tr>
          <th scope="col">Property</th><th scope="col">Host</th><th scope="col">Category</th>
          <th scope="col">Price / night</th><th scope="col">Rating</th><th scope="col">Bookings</th>
          <th scope="col">Status</th><th scope="col">Listed</th><th scope="col">Actions</th>
        </tr></thead>
        <tbody>
          {listings.map((property) => (
            <tr key={property.id}>
              <td>
                <div className={styles.propertyCell}>
                  <img src={property.image} alt="" className={styles.thumbnail} loading="lazy" />
                  <div className={styles.propertyInfo}>
                    <span className={styles.title}>{property.title}{property.featured && <span className={styles.featured}> · Featured</span>}</span>
                    <span className={styles.location}>{property.location} · {property.id}</span>
                  </div>
                </div>
              </td>
              <td>{property.hostName}</td>
              <td>{property.category}</td>
              <td><span className={styles.price}>${property.pricePerNight}</span></td>
              <td>{property.rating}</td>
              <td>{property.bookingsCount}</td>
              <td><ListingStatusBadge status={property.status} /></td>
              <td>{property.dateListed}</td>
              <td>
                <div className={styles.actions}>
                  <button type="button" className={styles.iconBtn} aria-label={`View ${property.title}`} onClick={() => onView(property)}><Eye size={16} /></button>
                  {property.status === 'Pending' && <>
                    <button type="button" className={`${styles.iconBtn} ${styles.success}`} aria-label={`Approve ${property.title}`} onClick={() => onApprove(property)}><Check size={16} /></button>
                    <button type="button" className={`${styles.iconBtn} ${styles.danger}`} aria-label={`Reject ${property.title}`} onClick={() => onReject(property)}><X size={16} /></button>
                  </>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
