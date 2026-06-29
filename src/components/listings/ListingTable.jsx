import { Eye, Check, X, SearchX, Edit } from 'lucide-react';
import ListingStatusBadge from './ListingStatusBadge';
import styles from './ListingTable.module.css';

export default function ListingTable({ listings, onView, onApprove, onReject }) {
  if (!listings || listings.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          <SearchX size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No listings found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Property</th>
            <th className={styles.th}>Host</th>
            <th className={styles.th}>Category</th>
            <th className={styles.th}>Price</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Date Listed</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((property) => (
            <tr key={property.id} className={styles.tr}>
              <td className={styles.td}>
                <div className={styles.propertyCell}>
                  <img src={property.image} alt="" className={styles.thumbnail} />
                  <div className={styles.propertyInfo}>
                    <span className={styles.title}>{property.title.length > 25 ? `${property.title.substring(0,25)}...` : property.title}</span>
                    <span className={styles.location}>{property.location}</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>{property.hostName}</td>
              <td className={styles.td}>{property.category}</td>
              <td className={styles.td}><span className={styles.price}>${property.pricePerNight}</span></td>
              <td className={styles.td}>
                <ListingStatusBadge status={property.status} />
              </td>
              <td className={styles.td}>{property.dateListed}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button 
                    className={styles.iconBtn} 
                    title="View Details"
                    onClick={() => onView(property)}
                  >
                    <Eye size={16} />
                  </button>
                  <button className={styles.iconBtn} title="Edit Listing">
                    <Edit size={16} />
                  </button>
                  {property.status === 'Pending' && (
                    <>
                      <button 
                        className={`${styles.iconBtn} ${styles.success}`} 
                        title="Approve"
                        onClick={() => onApprove(property)}
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className={`${styles.iconBtn} ${styles.danger}`} 
                        title="Reject"
                        onClick={() => onReject(property)}
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
