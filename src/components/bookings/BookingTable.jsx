import { Eye, SearchX } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import styles from './BookingTable.module.css';

export default function BookingTable({ bookings, onView }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyState}>
          <SearchX size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No bookings found</h3>
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
            <th className={styles.th}>Booking ID</th>
            <th className={styles.th}>Guest</th>
            <th className={styles.th}>Property & Host</th>
            <th className={styles.th}>Dates</th>
            <th className={styles.th}>Stay</th>
            <th className={styles.th}>Amount</th>
            <th className={styles.th}>Booking Status</th>
            <th className={styles.th}>Payment Status</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className={styles.tr}>
              <td className={styles.td}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{booking.id}</span>
              </td>
              <td className={styles.td}>
                <div className={styles.guestCell}>
                  <div className={styles.avatar}>{booking.guestAvatar}</div>
                  <div className={styles.guestInfo}>
                    <span className={styles.guestName}>{booking.guestName}</span>
                    <span className={styles.guestEmail}>{booking.guestEmail}</span>
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.propertyInfo}>
                  <span className={styles.propertyName} title={booking.propertyName}>
                    {booking.propertyName.length > 20 ? `${booking.propertyName.substring(0, 20)}...` : booking.propertyName}
                  </span>
                  <span className={styles.hostName}>by {booking.hostName}</span>
                </div>
              </td>
              <td className={styles.td}>
                <div className={styles.dates}>
                  <span className={styles.dateIn}>{booking.checkInDate}</span>
                  <span className={styles.dateOut}>{booking.checkOutDate}</span>
                </div>
              </td>
              <td className={styles.td}>{booking.stayLabel}</td>
              <td className={styles.td}><span className={styles.amount}>{booking.currency} {Number(booking.totalAmount).toLocaleString()}</span></td>
              <td className={styles.td}>
                <BookingStatusBadge status={booking.bookingStatus} />
              </td>
              <td className={styles.td}>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button 
                    className={styles.iconBtn} 
                    title="View Details"
                    onClick={() => onView(booking)}
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
