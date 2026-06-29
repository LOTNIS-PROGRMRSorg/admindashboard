import styles from './BookingTable.module.css';

export default function BookingTable({ bookings }) {
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
        <h3 className={styles.title}>Recent Bookings</h3>
        <button className={styles.viewAll}>View all</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
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
      </div>
    </div>
  );
}
