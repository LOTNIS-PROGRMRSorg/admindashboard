import { Eye, SearchX } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import styles from './BookingTable.module.css';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00.000Z`));
}

export default function BookingTable({ bookings, onView, hasActiveFilters, onClearFilters }) {
  if (!bookings.length) {
    return (
      <div className={styles.emptyState}>
        <SearchX size={34} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No bookings match these filters</h3>
        <p>{hasActiveFilters ? 'Try changing your search or clearing the selected filters.' : 'There are no bookings in the sample dataset.'}</p>
        {hasActiveFilters && <button type="button" className={styles.clearButton} onClick={onClearFilters}>Clear filters</button>}
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead><tr>
          <th scope="col">Booking ID</th><th scope="col">Guest</th><th scope="col">Property / host</th>
          <th scope="col">Stay dates</th><th scope="col">Guests</th><th scope="col">Amount</th>
          <th scope="col">Booking status</th><th scope="col">Payment</th><th scope="col">View</th>
        </tr></thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td><span className={styles.bookingId}>{booking.id}</span><span className={styles.bookingDate}>Booked {formatDate(booking.bookingDate)}</span></td>
              <td>
                <div className={styles.guestCell}>
                  <div className={styles.avatar} aria-hidden="true">{booking.guestAvatar || booking.guestName?.charAt(0) || '?'}</div>
                  <div className={styles.guestInfo}><span className={styles.guestName}>{booking.guestName}</span><span className={styles.guestEmail}>{booking.guestEmail}</span></div>
                </div>
              </td>
              <td><div className={styles.propertyInfo}><span className={styles.propertyName}>{booking.propertyName}</span><span className={styles.hostName}>Host: {booking.hostName}</span></div></td>
              <td><div className={styles.dates}><span>In {formatDate(booking.checkInDate)}</span><span>Out {formatDate(booking.checkOutDate)}</span></div></td>
              <td>{booking.guestsCount}</td>
              <td><span className={styles.amount}>${Number(booking.totalAmount).toLocaleString('en-US')}</span></td>
              <td><BookingStatusBadge status={booking.bookingStatus} /></td>
              <td><PaymentStatusBadge status={booking.paymentStatus} /></td>
              <td><button type="button" className={styles.iconBtn} aria-label={`View booking ${booking.id}`} onClick={() => onView(booking)}><Eye size={17} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
