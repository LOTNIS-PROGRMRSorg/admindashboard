import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button, Card, CellMain, Chips, DataTable, ErrorState, Input, LoadingState, Page, PageHeader, StatGrid, StatTile, StatusPill, Toolbar } from '../../components/ui';
import { formatDate, money, personName } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const STATUS = [{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'active', label: 'Staying' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }];
const LIMIT = 15;

// What actually happened to the money: a refund row takes precedence over the booking's status.
const paymentOf = (b) => (b.refund ? (b.refund.status === 'processed' ? 'refunded' : b.refund.status === 'failed' ? 'failed' : 'pending') : ['confirmed', 'active', 'completed'].includes(b.status) ? 'paid' : null);

export default function Bookings() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '', query = params.get('query') || '', page = Number(params.get('page') || 1);
  const set = (patch) => { const next = new URLSearchParams(params); Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k))); if (!('page' in patch)) next.delete('page'); setParams(next, { replace: true }); };
  const { data, error, loading } = useApi('/admin/bookings?limit=200');
  const tx = useApi('/admin/bookings/transactions');
  const all = data?.data ?? data ?? [];
  const term = query.toLowerCase();
  const rows = all.filter((b) => (!status || b.status === status || (status === 'cancelled' && b.status === 'no_show')) && (!term || [b.id, personName(b.renter), b.property?.name, b.owner_name].some((v) => String(v ?? '').toLowerCase().includes(term))));
  const month = new Date();
  const fees = (tx.data ?? []).filter((t) => { const d = new Date(t.created_at); return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear(); }).reduce((a, t) => a + (t.platform_fee || 0), 0);

  const exportCsv = () => {
    const csv = ['Booking,Guest,Property,Host,Check-in,Check-out,Currency,Amount,Status', ...rows.map((b) => [b.id, `"${personName(b.renter)}"`, `"${b.property?.name ?? ''}"`, `"${b.owner_name ?? ''}"`, b.start_date, b.end_date, b.currency_snapshot, b.final_amount, b.status].join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'lotnis_bookings.csv'; a.click();
  };

  return (
    <Page>
      <PageHeader eyebrow="Accommodation" title="Bookings" subtitle="Every stay reservation. Open one for the guest, host, payouts, refund, move-out and any reports."><Button onClick={exportCsv}><Download size={16} /> Export CSV</Button></PageHeader>
      <StatGrid>
        <StatTile label="Bookings" value={all.length} />
        <StatTile label="Confirmed or staying" value={all.filter((b) => ['confirmed', 'active', 'completed'].includes(b.status)).length} tone="good" />
        <StatTile label="Cancelled" value={all.filter((b) => ['cancelled', 'no_show'].includes(b.status)).length} />
        <StatTile label="Lotnis fees this month" value={money(tx.data?.[0]?.currency || 'GHS', fees)} tone="good" />
      </StatGrid>
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={STATUS} value={status} onChange={(v) => set({ status: v })} />
          <Toolbar><Input placeholder="Search guest, property, host or booking ID" defaultValue={query} onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() })} style={{ minWidth: 300 }} /></Toolbar>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
          <DataTable rows={rows.slice((page - 1) * LIMIT, page * LIMIT)} total={rows.length} page={page} limit={LIMIT} onPage={(p) => set({ page: String(p) })} rowTo={(b) => `/bookings/${b.id}`} empty="No bookings match."
            columns={[
              { key: 'guest', label: 'Guest', render: (b) => <CellMain title={personName(b.renter)} sub={b.renter?.email} /> },
              { key: 'property', label: 'Property', render: (b) => <CellMain title={b.property?.name ?? '—'} sub={b.owner_name ? `Host: ${b.owner_name}` : null} /> },
              { key: 'stay', label: 'Stay', render: (b) => `${formatDate(b.start_date)} → ${formatDate(b.end_date)}` },
              { key: 'amount', label: 'Total', render: (b) => <strong>{money(b.currency_snapshot, b.final_amount)}</strong> },
              { key: 'status', label: 'Status', render: (b) => <StatusPill status={b.status} /> },
              { key: 'pay', label: 'Money', render: (b) => (paymentOf(b) ? <StatusPill status={paymentOf(b)} /> : '—') },
            ]} />
        )}
      </Card>
    </Page>
  );
}
