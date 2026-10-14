import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './AnalyticsChart.module.css';

export default function BookingGrowthChart({ data }) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>Bookings created</h2>
        <p className={styles.subtitle}>Number of mock booking records grouped by booking date</p>
      </header>
      <div className={styles.chartContainer} role="img" aria-label="Bar chart of booking records across the selected date range">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" interval="preserveStartEnd" minTickGap={18} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <YAxis allowDecimals={false} width={32} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', color: 'var(--color-text-base)' }} formatter={(value) => [Number(value).toLocaleString('en-US'), 'Booking records']} labelStyle={{ color: 'var(--color-text-muted)' }} cursor={{ fill: 'var(--color-bg-subtle)' }} />
            <Bar dataKey="bookings" name="Booking records" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
