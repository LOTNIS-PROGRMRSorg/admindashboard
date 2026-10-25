import { BadgeCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card, CellMain, Chips, DataTable, ErrorState, Input, LoadingState, Page, PageHeader, StatGrid, StatTile, StatusPill, Toolbar } from '../../components/ui';
import { formatDate, titleCase } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const STATUS = [{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'under_review', label: 'In review' }, { key: 'verified', label: 'Verified' }, { key: 'rejected', label: 'Rejected' }, { key: 'suspended', label: 'Suspended' }];
const LIMIT = 15;

export default function Hosts() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '', query = params.get('query') || '', page = Number(params.get('page') || 1);
  const set = (patch) => { const next = new URLSearchParams(params); Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k))); if (!('page' in patch)) next.delete('page'); setParams(next, { replace: true }); };
  const { data, error, loading } = useApi('/admin/hosts');
  const all = Array.isArray(data) ? data : [];
  const count = (s) => all.filter((h) => h.verification_status === s).length;
  const term = query.toLowerCase();
  const rows = all.filter((h) => (!status || h.verification_status === status) && (!term || [h.display_name, h.legal_first_name, h.legal_last_name, h.city].some((v) => String(v ?? '').toLowerCase().includes(term))));

  return (
    <Page>
      <PageHeader eyebrow="People" title="Hosts" subtitle="Review applications, then open a host for everything they run: listings, events, money, payout accounts and reports." />
      <StatGrid>
        <StatTile label="Verified hosts" value={count('verified')} icon={BadgeCheck} tone="good" to="?status=verified" />
        <StatTile label="Waiting for review" value={count('pending') + count('under_review')} tone={count('pending') + count('under_review') ? 'warn' : undefined} to="?status=pending" />
        <StatTile label="Rejected" value={count('rejected')} to="?status=rejected" />
        <StatTile label="Suspended" value={count('suspended')} tone={count('suspended') ? 'danger' : undefined} to="?status=suspended" />
      </StatGrid>
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={STATUS} value={status} onChange={(v) => set({ status: v })} />
          <Toolbar><Input placeholder="Search name or city" defaultValue={query} onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() })} style={{ minWidth: 260 }} /></Toolbar>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
          <DataTable rows={rows.slice((page - 1) * LIMIT, page * LIMIT)} total={rows.length} page={page} limit={LIMIT} onPage={(p) => set({ page: String(p) })} rowTo={(h) => `/hosts/${h.user_id}`} empty="No hosts match."
            columns={[
              { key: 'name', label: 'Host', render: (h) => <CellMain title={h.display_name} sub={[h.legal_first_name, h.legal_last_name].filter(Boolean).join(' ')} /> },
              { key: 'type', label: 'Type', render: (h) => titleCase(h.account_type) },
              { key: 'city', label: 'City', render: (h) => h.city || '—' },
              { key: 'applied', label: 'Applied', render: (h) => formatDate(h.submitted_at || h.created_at) },
              { key: 'status', label: 'Status', render: (h) => <StatusPill status={h.verification_status === 'verified' ? 'verified' : h.verification_status} /> },
            ]} />
        )}
      </Card>
    </Page>
  );
}
