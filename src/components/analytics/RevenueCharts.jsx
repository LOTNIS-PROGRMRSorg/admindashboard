import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './AnalyticsChart.module.css';

const currency = (value) => `$${Number(value).toLocaleString('en-US')}`;

export default function RevenueCharts({ data }) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>Listed booking amounts</h2>
        <p className={styles.subtitle}>Sum of mock booking amounts grouped by booking date · USD</p>
      </header>
      <div className={styles.chartContainer} role="img" aria-label="Area chart of listed booking amounts across the selected date range">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
            <defs><linearGradient id="analyticsAmountFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" interval="preserveStartEnd" minTickGap={18} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <YAxis width={58} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} tickFormatter={(value) => `$${Number(value).toLocaleString('en-US')}`} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', color: 'var(--color-text-base)' }} formatter={(value) => [currency(value), 'Listed amount']} labelStyle={{ color: 'var(--color-text-muted)' }} />
            <Area type="monotone" dataKey="amount" name="Listed amount" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#analyticsAmountFill)" activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: 'var(--color-bg-surface)', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
