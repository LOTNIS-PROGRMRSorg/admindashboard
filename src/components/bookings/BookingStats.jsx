import { CalendarDays, CheckCircle, Clock3, XCircle } from 'lucide-react';
import styles from './BookingStats.module.css';

export default function BookingStats({ bookings }) {
  const cards = [
    { label: 'Bookings in sample', value: bookings.length, icon: CalendarDays, tone: 'neutral' },
    { label: 'Confirmed', value: bookings.filter((item) => item.bookingStatus === 'Confirmed').length, icon: CheckCircle, tone: 'success' },
    { label: 'Pending', value: bookings.filter((item) => item.bookingStatus === 'Pending').length, icon: Clock3, tone: 'warning' },
    { label: 'Cancelled', value: bookings.filter((item) => item.bookingStatus === 'Cancelled').length, icon: XCircle, tone: 'danger' },
  ];

  return (
    <section className={styles.statsGrid} aria-label="Booking counts from sample data">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article className={styles.card} key={label}>
          <div className={`${styles.icon} ${styles[tone]}`}><Icon size={19} /></div>
          <div><p className={styles.label}>{label}</p><p className={styles.value}>{value}</p></div>
        </article>
      ))}
    </section>
  );
}
