import styles from './BookingTable.module.css';
import { Link } from 'react-router-dom';

export default function BookingTable({ bookings = [], viewAllTo }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed': return styles.statusConfirmed;
      case 'Pending': return styles.statusPending;
      case 'Completed': return styles.statusCompleted;
      case 'Cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Recent bookings</h3>
          <p className={styles.subtitle}>Latest reservations in the sample dataset</p>
        </div>
        {viewAllTo && <Link className={styles.viewAll} to={viewAllTo}>View bookings <span aria-hidden="true">→</span></Link>}
      </div>
      {bookings.length === 0 ? (
        <div className={styles.emptyState}>There are no recent bookings to show.</div>
      ) : <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Guest</th>
              <th className={styles.th}>Property</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className={styles.tr}>
                <td className={styles.td}>
                  <span className={styles.guestName}>{booking.guest}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.property}>{booking.property}</span>
                </td>
                <td className={styles.td}>{booking.date}</td>
                <td className={styles.td}>{booking.amount}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
