import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from './ChartCard.module.css';

export default function ChartCard({ title, subtitle, data, showBookings = false }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {!hasData ? (
        <div className={styles.emptyState}>No chart data is available yet.</div>
      ) : (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 2, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={9} />
              <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} width={48} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
              {showBookings && <YAxis yAxisId="bookings" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} width={38} />}
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', color: 'var(--color-text-base)' }}
                labelStyle={{ color: 'var(--color-text-muted)' }}
                itemStyle={{ color: 'var(--color-text-base)' }}
                formatter={(value, name) => [name === 'revenue' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(), name === 'revenue' ? 'Revenue' : 'Bookings']}
              />
              {showBookings && <Legend verticalAlign="top" align="right" height={28} iconType="circle" formatter={(value) => <span style={{ color: 'var(--color-text-muted)' }}>{value === 'revenue' ? 'Revenue' : 'Bookings'}</span>} />}
              <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="var(--color-primary)" fillOpacity={0.12} activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: 'var(--color-bg-surface)', strokeWidth: 2 }} />
              {showBookings && <Line yAxisId="bookings" type="monotone" dataKey="bookings" name="bookings" stroke="var(--color-warning)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-warning)', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
