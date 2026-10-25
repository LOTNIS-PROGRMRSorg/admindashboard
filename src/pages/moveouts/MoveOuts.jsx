import { useSearchParams } from 'react-router-dom';
import { Card, CellMain, Chips, DataTable, ErrorState, LoadingState, Page, PageHeader, Pill, StatusPill } from '../../components/ui';
import { formatDateTime } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const FILTERS = [{ key: 'open', label: 'Open' }, { key: 'in_dispute', label: 'In dispute' }, { key: 'notice_given', label: 'Notice given' }, { key: 'moved_out', label: 'Moved out' }, { key: 'settled', label: 'Settled' }, { key: 'all', label: 'All' }];

export default function MoveOuts() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('status') || 'open';
  const { data, error, loading } = useApi(`/admin/exits${filter === 'all' ? '' : `?status=${filter}`}`);
  const cases = data ?? [];
  const disputes = cases.filter((c) => c.has_dispute).length;
  return (
    <Page>
      <PageHeader eyebrow="Accommodation" title="Move-outs" subtitle="Early-departure notices and end-of-stay deposit checks. Guest, host and Lotnis all see the same timeline; you rule on disputes and settle the refund." />
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)' }}><Chips options={FILTERS.map((f) => ({ ...f, label: f.key === 'in_dispute' && disputes ? `${f.label} (${disputes})` : f.label }))} value={filter} onChange={(k) => setParams({ status: k })} /></div>
        {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
          <DataTable rows={cases} rowTo={(c) => `/move-outs/${c.id}`} empty="No move-outs here." columns={[
            { key: 'stay', label: 'Stay', render: (c) => <CellMain title={c.booking?.property?.name} sub={`${c.kind === 'early_departure' ? 'Early departure' : 'Checkout'} · booked to ${c.booking?.end_date}`} /> },
            { key: 'guest', label: 'Guest', render: (c) => c.guest_name || '—' },
            { key: 'host', label: 'Host', render: (c) => c.host_name || '—' },
            { key: 'leaving', label: 'Leaving', render: (c) => c.actual_checkout ?? c.planned_checkout },
            { key: 'status', label: 'Status', render: (c) => <><StatusPill status={c.status} />{c.has_dispute && <> <Pill tone="danger">dispute</Pill></>}</> },
            { key: 'opened', label: 'Opened', render: (c) => formatDateTime(c.created_at) },
          ]} />
        )}
      </Card>
    </Page>
  );
}
