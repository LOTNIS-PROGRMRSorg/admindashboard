import { CalendarDays, CircleDollarSign, CreditCard, Calculator } from 'lucide-react';
import styles from './AnalyticsSummary.module.css';

const formatAmount = (value) => `$${Number(value || 0).toLocaleString('en-US')}`;

export default function AnalyticsSummary({ data }) {
  const cards = [
    { label: 'Booking records', value: data.bookingCount.toLocaleString('en-US'), detail: 'Created in selected date range', icon: CalendarDays },
    { label: 'Listed booking amounts', value: formatAmount(data.listedAmount), detail: 'Sum of record amount fields', icon: CircleDollarSign },
    { label: 'Paid booking records', value: data.paidCount.toLocaleString('en-US'), detail: 'Payment status marked Paid', icon: CreditCard },
    { label: 'Average listed amount', value: formatAmount(data.averageAmount), detail: 'Across matching booking records', icon: Calculator },
  ];

  return (
    <section className={styles.grid} aria-label="Summary of sample booking records">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <article className={styles.card} key={label}>
          <div className={styles.cardHeader}><span className={styles.title}>{label}</span><span className={styles.icon}><Icon size={18} /></span></div>
          <p className={styles.value}>{value}</p>
          <p className={styles.detail}>{detail}</p>
        </article>
      ))}
    </section>
  );
}
