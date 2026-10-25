import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, ErrorState, Facts, Grid, LoadingState, Page, PageHeader, StatGrid, StatTile } from '../components/ui';
import { colors } from '../theme';
import { formatNumber, money } from '../lib/format';
import { useApi } from '../lib/useApi';

const axis = { fill: colors.textMuted, fontSize: 12 };
const tip = { borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' };

/** Real numbers across the platform — money by month, refunds, payouts, events and reports. */
export default function Analytics() {
  const overview = useApi('/admin/dashboard/overview');
  const refunds = useApi('/admin/refunds/all/summary');
  const payouts = useApi('/admin/payouts/overview');
  const events = useApi('/admin/events/summary');
  const reports = useApi('/admin/reports/summary');
  if (overview.loading)
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  if (overview.error)
    return (
      <Page>
        <ErrorState>{overview.error}</ErrorState>
      </Page>
    );
  const { chart, totals, money: m } = overview.data;
  const cur = m.currency;
  const r = refunds.data,
    p = payouts.data,
    e = events.data,
    rp = reports.data;

  return (
    <Page>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        subtitle="How money, bookings, events and trust are trending across the whole platform."
      />
      <StatGrid>
        <StatTile
          label="Paid by customers (this month)"
          value={money(cur, m.paid_this_month)}
          sub={`Stays ${money(cur, m.stays_this_month)} · Events ${money(cur, m.events_this_month)}`}
        />
        <StatTile
          label="Lotnis earned (this month)"
          value={money(cur, m.commission_this_month)}
          tone="good"
          sub={`${m.commission_trend >= 0 ? '▲' : '▼'} ${Math.abs(m.commission_trend)}% vs last month`}
        />
        <StatTile label="Bookings (6 months)" value={formatNumber(totals.bookings_6m)} />
        <StatTile
          label="Tickets sold · votes cast"
          value={`${formatNumber(totals.tickets_sold)} · ${formatNumber(totals.votes_cast)}`}
        />
      </StatGrid>
      <Grid>
        <Card title="Customers paid, by service">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axis} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tick={axis}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                />
                <Tooltip formatter={(v) => money(cur, v)} contentStyle={tip} />
                <Legend iconType="circle" />
                <Bar isAnimationActive={false} dataKey="stays" name="Stays" stackId="a" fill={colors.chart1} />
                <Bar
                  isAnimationActive={false}
                  dataKey="events"
                  name="Events"
                  stackId="a"
                  fill={colors.chart2}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="What Lotnis earned">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axis} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={axis} />
                <Tooltip formatter={(v) => money(cur, v)} contentStyle={tip} />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="commission"
                  name="Commission"
                  stroke={colors.chart3}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Grid>
      <Grid cols={3}>
        <Card title="Refunds" action={{ label: 'Open', to: '/refunds' }}>
          {r ? (
            <Facts
              rows={[
                ['To decide', `${r.stages.pending.count} · ${money(r.currency, r.stages.pending.amount)}`],
                ['To send', `${r.stages.sending.count} · ${money(r.currency, r.stages.sending.amount)}`],
                ['Sent', `${r.stages.done.count} · ${money(r.currency, r.stages.done.amount)}`],
                ['Still owed', money(r.currency, r.outstanding_amount)],
              ]}
            />
          ) : (
            <LoadingState />
          )}
        </Card>
        <Card title="Payouts" action={{ label: 'Open', to: '/payouts' }}>
          {p ? (
            <Facts
              rows={[
                ['Waiting for release', money(p.currency, p.totals.awaiting_release)],
                ['Due now', money(p.currency, p.totals.due)],
                ['On hold', money(p.currency, p.totals.on_hold)],
                ['Paid out', money(p.currency, p.totals.paid)],
              ]}
            />
          ) : (
            <LoadingState />
          )}
        </Card>
        <Card title="Events and trust" action={{ label: 'Reports', to: '/reports' }}>
          {e && rp ? (
            <Facts
              rows={[
                ['Events on sale', e.live],
                ['Waiting for review', e.pending_review],
                ['Open reports', rp.open],
                ['Urgent reports', rp.urgent],
              ]}
            />
          ) : (
            <LoadingState />
          )}
        </Card>
      </Grid>
    </Page>
  );
}
