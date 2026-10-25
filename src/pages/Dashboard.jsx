import {
  Banknote, BadgeCheck, Building2, CalendarCheck, FileWarning, LogOut, Ticket, Trophy, Undo2, Users, Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, ErrorState, LoadingState, Page, PageHeader, Split, StatGrid, StatTile } from '../components/ui';
import { colors } from '../theme';
import { formatNumber, money, formatDateTime } from '../lib/format';
import { useApi } from '../lib/useApi';
import styles from './Dashboard.module.css';

const ACTIVITY_ICON = { booking: CalendarCheck, ticket: Ticket, vote: Trophy, report: FileWarning };

// What is waiting on an admin, and where to go to deal with it.
const QUEUE = [
  { key: 'listing_approvals', label: 'Listings to approve', to: '/listings?approval=pending', icon: Building2 },
  { key: 'host_applications', label: 'Host applications', to: '/hosts', icon: BadgeCheck },
  { key: 'event_reviews', label: 'Events to review', to: '/events?status=pending_review', icon: Ticket },
  { key: 'refunds_to_decide', label: 'Refunds to decide', to: '/refunds?stage=pending', icon: Undo2, hot: true },
  { key: 'refunds_to_send', label: 'Refunds to send', to: '/refunds?stage=sending', icon: Undo2 },
  { key: 'payouts_due_count', label: 'Payouts ready to send', to: '/payouts', icon: Wallet },
  { key: 'reports_open', label: 'Open reports', to: '/reports?status=open', icon: FileWarning, hot: true },
  { key: 'move_outs', label: 'Move-outs in progress', to: '/move-outs', icon: LogOut },
];

/** The whole platform at a glance: who is here, what is selling, where the money is, and what needs you. */
export default function Dashboard() {
  const { data, error, loading } = useApi('/admin/dashboard/overview');
  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><ErrorState>Unable to load the dashboard: {error}</ErrorState></Page>;
  const { totals, money: m, chart, queue, activity } = data;
  const cur = m.currency;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const waiting = QUEUE.filter((q) => queue[q.key] > 0);

  return (
    <Page>
      <PageHeader eyebrow={today} title="Platform overview" subtitle="Everything happening across stays, events and money — and what needs a decision from you." />

      <StatGrid>
        <StatTile label="People" value={formatNumber(totals.users)} icon={Users} to="/users" sub={`${formatNumber(totals.verified_hosts)} verified hosts`} />
        <StatTile label="Live listings" value={formatNumber(totals.live_listings)} icon={Building2} to="/listings" sub={`${formatNumber(totals.bookings_6m)} bookings in 6 months`} />
        <StatTile label="Live events" value={formatNumber(totals.live_events)} icon={Ticket} to="/events" sub={`${formatNumber(totals.tickets_sold)} tickets · ${formatNumber(totals.votes_cast)} votes`} />
        <StatTile label="Lotnis earned this month" value={money(cur, m.commission_this_month)} icon={Banknote} tone="good"
          sub={`${m.commission_trend >= 0 ? '▲' : '▼'} ${Math.abs(m.commission_trend)}% vs last month`} />
      </StatGrid>

      <StatGrid>
        <StatTile label="Customers paid this month" value={money(cur, m.paid_this_month)} sub={`Stays ${money(cur, m.stays_this_month)} · Events ${money(cur, m.events_this_month)}`} />
        <StatTile label="Payouts ready" value={money(cur, m.payouts_due)} icon={Wallet} to="/payouts" tone={m.payouts_due > 0 ? 'warn' : undefined} sub="Owed to hosts now" />
        <StatTile label="Payouts on hold" value={money(cur, m.payouts_held)} to="/payouts?bucket=on_hold" tone={m.payouts_held > 0 ? 'danger' : undefined} sub="Paused by a report or an admin" />
        <StatTile label="Refunded to date" value={money(cur, m.refunded_total)} icon={Undo2} to="/refunds?stage=done" />
      </StatGrid>

      <Split>
        <Card title="Money in, last 6 months" action={{ label: 'Analytics', to: '/analytics' }}>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fill: colors.textMuted, fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip formatter={(v) => money(cur, v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }} />
                <Legend iconType="circle" />
                <Bar isAnimationActive={false} dataKey="stays" name="Stays" stackId="a" fill={colors.chart1} />
                <Bar isAnimationActive={false} dataKey="events" name="Events" stackId="a" fill={colors.chart2} radius={[4, 4, 0, 0]} />
                <Bar isAnimationActive={false} dataKey="commission" name="Lotnis earned" fill={colors.chart3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Needs you">
          {waiting.length === 0 ? <p className={styles.allClear}>All clear — nothing is waiting on you.</p> : (
            <div className={styles.queueList}>
              {waiting.map((q) => (
                <Link key={q.key} to={q.to} className={styles.queueRow}>
                  <span className={styles.queueLabel}>{q.label}</span>
                  <span className={`${styles.queueCount} ${q.hot ? styles.queueCountHot : styles.queueCountWarn}`}>{queue[q.key]}</span>
                </Link>
              ))}
              {queue.reports_urgent > 0 && <Link to="/reports?severity=urgent" className={styles.queueRow}><span className={styles.queueLabel}>Urgent reports</span><span className={`${styles.queueCount} ${styles.queueCountHot}`}>{queue.reports_urgent}</span></Link>}
            </div>
          )}
        </Card>
      </Split>

      <Card title="Latest activity">
        <div className={styles.activity}>
          {activity.length === 0 && <p className={styles.allClear} style={{ color: 'var(--color-text-muted)' }}>Nothing yet.</p>}
          {activity.map((a) => {
            const Icon = ACTIVITY_ICON[a.kind] ?? CalendarCheck;
            const row = (
              <>
                <span className={styles.activityIcon}><Icon size={16} /></span>
                <span><span className={styles.activityText}>{a.text}</span><br /><span className={styles.activityWhen}>{formatDateTime(a.at)}</span></span>
                {a.amount != null && <span className={styles.activityAmount}>{money(a.currency, a.amount)}</span>}
              </>
            );
            return a.to ? <Link key={a.id} to={a.to} className={styles.activityRow}>{row}</Link> : <div key={a.id} className={styles.activityRow}>{row}</div>;
          })}
        </div>
      </Card>
    </Page>
  );
}
