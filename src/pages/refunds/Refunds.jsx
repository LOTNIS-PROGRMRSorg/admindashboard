import { Undo2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CellMain,
  Chips,
  DataTable,
  ErrorState,
  Input,
  LoadingState,
  Page,
  PageHeader,
  StatGrid,
  StatTile,
  StatusPill,
  Toolbar,
} from '../../components/ui';
import { formatDate, money } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const STAGES = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'To decide' },
  { key: 'sending', label: 'To send' },
  { key: 'failed', label: 'Failed' },
  { key: 'done', label: 'Sent' },
  { key: 'declined', label: 'Declined' },
];
const SERVICES = [
  { key: '', label: 'Everything' },
  { key: 'accommodation', label: 'Stays' },
  { key: 'event', label: 'Events' },
];
const LIMIT = 20;

/** Every refund on the platform — stays and event tickets — in one queue with one set of stages. */
export default function Refunds() {
  const [params, setParams] = useSearchParams();
  const stage = params.get('stage') || '',
    service = params.get('service') || '',
    query = params.get('query') || '',
    page = Number(params.get('page') || 1);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const summary = useApi('/admin/refunds/all/summary');
  const list = useApi(
    `/admin/refunds/all?${new URLSearchParams({ ...(stage && { stage }), ...(service && { service }), ...(query && { query }), page, limit: LIMIT })}`,
  );
  const s = summary.data;

  return (
    <Page>
      <PageHeader
        eyebrow="Money out"
        title="Refunds"
        subtitle="Stay cancellations and event ticket refunds, together. Open one to decide it, record the transfer or see exactly why the amount is what it is."
      />
      {s && (
        <StatGrid>
          <StatTile
            label="To decide"
            value={s.stages.pending.count}
            sub={money(s.currency, s.stages.pending.amount)}
            tone={s.stages.pending.count ? 'warn' : undefined}
            to="?stage=pending"
            icon={Undo2}
          />
          <StatTile
            label="To send"
            value={s.stages.sending.count}
            sub={money(s.currency, s.stages.sending.amount)}
            tone={s.stages.sending.count ? 'warn' : undefined}
            to="?stage=sending"
          />
          <StatTile
            label="Failed"
            value={s.stages.failed.count}
            sub={money(s.currency, s.stages.failed.amount)}
            tone={s.stages.failed.count ? 'danger' : undefined}
            to="?stage=failed"
          />
          <StatTile
            label="Sent to date"
            value={money(s.currency, s.stages.done.amount)}
            sub={`${s.stages.done.count} refunds`}
            tone="good"
            to="?stage=done"
          />
          <StatTile
            label="Still owed"
            value={money(s.currency, s.outstanding_amount)}
            sub={`Stays ${money(s.currency, s.services.accommodation.outstanding)} · Events ${money(s.currency, s.services.event.outstanding)}`}
          />
        </StatGrid>
      )}
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={STAGES} value={stage} onChange={(v) => set({ stage: v })} />
          <Toolbar>
            <Chips options={SERVICES} value={service} onChange={(v) => set({ service: v })} />
            <Input
              placeholder="Search title, person or reference"
              defaultValue={query}
              onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() })}
              style={{ minWidth: 260 }}
            />
          </Toolbar>
        </div>
        {list.loading ? (
          <LoadingState />
        ) : list.error ? (
          <ErrorState>{list.error}</ErrorState>
        ) : (
          <DataTable
            rows={list.data?.data ?? list.data ?? []}
            total={list.total ?? list.data?.total}
            page={page}
            limit={LIMIT}
            onPage={(p) => set({ page: String(p) })}
            rowTo={(r) => `/refunds/${r.service}/${r.id}`}
            empty="No refunds match."
            columns={[
              {
                key: 'title',
                label: 'For',
                render: (r) => <CellMain title={r.title} sub={r.service === 'event' ? 'Event tickets' : 'Stay'} />,
              },
              {
                key: 'customer',
                label: 'Who',
                render: (r) => (
                  <CellMain title={r.customer ?? '—'} sub={r.counterparty ? `Host: ${r.counterparty}` : null} />
                ),
              },
              { key: 'reason', label: 'Why' },
              { key: 'created_at', label: 'Requested', render: (r) => formatDate(r.created_at) },
              { key: 'stage', label: 'Stage', render: (r) => <StatusPill status={r.stage} /> },
              {
                key: 'amount',
                label: 'Amount',
                align: 'right',
                render: (r) => <strong>{money(r.currency, r.amount)}</strong>,
              },
            ]}
          />
        )}
      </Card>
    </Page>
  );
}
