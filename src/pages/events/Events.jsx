import { useSearchParams } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { Card, CellMain, Chips, DataTable, ErrorState, Input, LoadingState, Page, PageHeader, StatGrid, StatTile, StatusPill } from '../../components/ui';
import { formatDateTime, money } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const STATUSES = [
  { key: 'pending_review', label: 'In review' }, { key: 'published', label: 'On sale' }, { key: '', label: 'All' },
  { key: 'draft', label: 'Draft' }, { key: 'rejected', label: 'Rejected' }, { key: 'suspended', label: 'Suspended' }, { key: 'cancelled', label: 'Cancelled' },
];
const LIMIT = 15;

/** Every event on the platform: approve first events, see the numbers, and open any one for the whole story. */
export default function Events() {
  const [params, setParams] = useSearchParams();
  const status = params.has('status') ? params.get('status') : 'pending_review';
  const query = params.get('query') || '', page = Number(params.get('page') || 1);
  const set = (patch) => { const next = new URLSearchParams(params); Object.entries(patch).forEach(([k, v]) => (v !== undefined && v !== null ? next.set(k, v) : next.delete(k))); if (!('page' in patch)) next.delete('page'); setParams(next, { replace: true }); };
  const summary = useApi('/admin/events/summary');
  const list = useApi(`/admin/events?${new URLSearchParams({ ...(status && { status }), ...(query && { query }), page, limit: LIMIT })}`);
  const s = summary.data;

  return (
    <Page>
      <PageHeader eyebrow="Events" title="Events" subtitle="A new host's first event is approved here; trusted hosts publish automatically. Open an event for every sale, scan, vote, refund, report and visit." />
      {summary.error && <ErrorState>{summary.error}</ErrorState>}
      <StatGrid>
        <StatTile label="Waiting for review" value={s?.pending_review ?? '—'} sub={`${s?.live ?? 0} on sale now`} tone={s?.pending_review ? 'warn' : undefined} icon={Ticket} to="?status=pending_review" />
        <StatTile label="Tickets sold" value={s?.tickets_sold?.toLocaleString() ?? '—'} sub={`${s?.events_total ?? 0} events`} />
        <StatTile label="Ticket sales" value={money('GHS', s?.ticket_gross)} sub={`Votes ${money('GHS', s?.vote_gross)}`} />
        <StatTile label="Lotnis commission" value={money('GHS', s?.commission)} sub={`${money('GHS', s?.refunded)} refunded`} tone="good" />
        <StatTile label="Refund requests" value={s?.refund_requests_pending ?? '—'} sub="waiting for a decision" tone={s?.refund_requests_pending ? 'warn' : undefined} to="/refunds?service=event&stage=pending" />
      </StatGrid>
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={STATUSES.map((x) => ({ ...x, label: `${x.label}${s?.by_status?.[x.key] ? ` (${s.by_status[x.key]})` : ''}` }))} value={status} onChange={(v) => set({ status: v })} />
          <Input placeholder="Search title, city or venue" defaultValue={query} onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() || undefined })} style={{ maxWidth: 320 }} />
        </div>
        {list.loading ? <LoadingState /> : list.error ? <ErrorState>{list.error}</ErrorState> : (
          <DataTable rows={list.data?.data ?? []} total={list.data?.total} page={page} limit={LIMIT} onPage={(p) => set({ page: String(p) })} rowTo={(e) => `/events/${e.id}`}
            empty={status === 'pending_review' ? 'No events are waiting for review.' : 'No events match.'}
            columns={[
              { key: 'title', label: 'Event', render: (e) => <CellMain title={e.title} sub={`${e.venue_name}, ${e.city}`} /> },
              { key: 'host', label: 'Host', render: (e) => e.host_name || '—' },
              { key: 'when', label: 'When', render: (e) => formatDateTime(e.starts_at) },
              { key: 'status', label: 'Status', render: (e) => <StatusPill status={e.status} /> },
              { key: 'sold', label: 'Sold / scanned', render: (e) => `${e.stats.tickets_sold} / ${e.stats.tickets_scanned}` },
              { key: 'gross', label: 'Sales', render: (e) => <strong>{money(e.currency, e.stats.gross)}</strong> },
              { key: 'commission', label: 'Commission', render: (e) => money(e.currency, e.stats.commission) },
              { key: 'refunds', label: 'Refund requests', render: (e) => e.stats.refund_requests_pending || '—' },
            ]} />
        )}
      </Card>
    </Page>
  );
}
