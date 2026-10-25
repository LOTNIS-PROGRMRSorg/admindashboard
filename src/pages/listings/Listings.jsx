import { Building2 } from 'lucide-react';
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
import { formatDate, money, titleCase } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const APPROVAL = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'approved', label: 'Live' },
  { key: 'rejected', label: 'Rejected' },
];
const LIMIT = 15;

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const approval = params.get('approval') || '',
    query = params.get('query') || '',
    page = Number(params.get('page') || 1);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };
  const stats = useApi('/admin/properties/stats');
  const list = useApi(`/admin/properties?${new URLSearchParams({ limit: 200 })}`);
  const all = list.data?.properties ?? [];
  const term = query.toLowerCase();
  const rows = all.filter(
    (p) =>
      (!approval || p.approval_status === approval) &&
      (!term ||
        [p.name, p.owner_name, p.city, p.sub_type].some((v) =>
          String(v ?? '')
            .toLowerCase()
            .includes(term),
        )),
  );
  const s = stats.data ?? {};

  return (
    <Page>
      <PageHeader
        eyebrow="Accommodation"
        title="Listings"
        subtitle="Approve new spaces, and open any listing for its host, bookings, visits and reports."
      />
      {stats.error && <ErrorState>{stats.error}</ErrorState>}
      <StatGrid>
        <StatTile
          label="All listings"
          value={Object.values(s).reduce((a, n) => a + (Number(n) || 0), 0)}
          icon={Building2}
        />
        <StatTile label="Live" value={s.approved ?? 0} tone="good" to="?approval=approved" />
        <StatTile
          label="Waiting for approval"
          value={(s.pending ?? 0) + (s.under_review ?? 0)}
          tone={(s.pending ?? 0) + (s.under_review ?? 0) ? 'warn' : undefined}
          to="?approval=pending"
        />
        <StatTile label="Rejected" value={s.rejected ?? 0} to="?approval=rejected" />
      </StatGrid>
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={APPROVAL} value={approval} onChange={(v) => set({ approval: v })} />
          <Toolbar>
            <Input
              placeholder="Search name, host or city"
              defaultValue={query}
              onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() })}
              style={{ minWidth: 280 }}
            />
          </Toolbar>
        </div>
        {list.loading ? (
          <LoadingState />
        ) : list.error ? (
          <ErrorState>{list.error}</ErrorState>
        ) : (
          <DataTable
            rows={rows.slice((page - 1) * LIMIT, page * LIMIT)}
            total={rows.length}
            page={page}
            limit={LIMIT}
            onPage={(p) => set({ page: String(p) })}
            rowTo={(p) => `/listings/${p.id}`}
            empty="No listings match."
            columns={[
              {
                key: 'name',
                label: 'Listing',
                render: (p) => (
                  <CellMain
                    title={p.name}
                    sub={`${titleCase(p.sub_type || p.category)} · ${[p.city, p.country].filter(Boolean).join(', ')}`}
                  />
                ),
              },
              { key: 'host', label: 'Host', render: (p) => p.owner_name || '—' },
              {
                key: 'price',
                label: 'Price',
                render: (p) => (p.price != null ? `${money(p.currency, p.price)} / ${p.pricing_period ?? ''}` : '—'),
              },
              {
                key: 'status',
                label: 'Status',
                render: (p) => (
                  <>
                    <StatusPill status={p.approval_status} />
                    {p.is_paused && (
                      <>
                        {' '}
                        <StatusPill status="paused" />
                      </>
                    )}
                  </>
                ),
              },
              { key: 'bookings', label: 'Bookings', render: (p) => p.bookingsCount ?? 0 },
              { key: 'listed', label: 'Listed', render: (p) => formatDate(p.submitted_at || p.created_at) },
            ]}
          />
        )}
      </Card>
    </Page>
  );
}
