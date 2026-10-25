import { Users as UsersIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card, CellMain, Chips, DataTable, ErrorState, Input, LoadingState, Page, PageHeader, Pill, StatGrid, StatTile, StatusPill, Toolbar } from '../../components/ui';
import { formatDate } from '../../lib/format';
import { useApi } from '../../lib/useApi';

const ROLES = [{ key: '', label: 'Everyone' }, { key: 'Guest', label: 'Guests' }, { key: 'Host', label: 'Hosts' }, { key: 'Admin', label: 'Admins' }];
const LIMIT = 15;

export default function Users() {
  const [params, setParams] = useSearchParams();
  const role = params.get('role') || '', query = params.get('query') || '', page = Number(params.get('page') || 1);
  const set = (patch) => { const next = new URLSearchParams(params); Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k))); if (!('page' in patch)) next.delete('page'); setParams(next, { replace: true }); };
  const { data, error, loading } = useApi('/admin/users?limit=200');
  const stats = useApi('/admin/users/stats');
  const all = data?.users ?? [];
  const term = query.toLowerCase();
  const rows = all.filter((u) => (!role || u.role.toLowerCase().startsWith(role.toLowerCase())) && (!term || [u.fullName, u.email, u.phone].some((v) => String(v ?? '').toLowerCase().includes(term))));
  const s = stats.data;

  return (
    <Page>
      <PageHeader eyebrow="People" title="Users" subtitle="Everyone with a Lotnis account — guests, hosts and admins. Open a person for their bookings, tickets, reports and refunds." />
      <StatGrid>
        <StatTile label="People" value={s?.totalUsers?.value ?? all.length} icon={UsersIcon} />
        <StatTile label="Active" value={s?.activeUsers?.value ?? '—'} tone="good" />
        <StatTile label="Suspended" value={s?.suspendedUsers?.value ?? '—'} tone={s?.suspendedUsers?.value ? 'danger' : undefined} />
        <StatTile label="New this month" value={s?.newThisMonth?.value ?? '—'} />
      </StatGrid>
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={ROLES} value={role} onChange={(v) => set({ role: v })} />
          <Toolbar><Input placeholder="Search name, email or phone" defaultValue={query} onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() })} style={{ minWidth: 280 }} /></Toolbar>
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
          <DataTable rows={rows.slice((page - 1) * LIMIT, page * LIMIT)} total={rows.length} page={page} limit={LIMIT} onPage={(p) => set({ page: String(p) })} rowTo={(u) => `/users/${u.id}`} empty="Nobody matches."
            columns={[
              { key: 'name', label: 'Person', render: (u) => <CellMain title={u.fullName} sub={u.email} /> },
              { key: 'role', label: 'Role', render: (u) => <Pill tone={u.role === 'Guest' ? 'neutral' : u.role === 'Host' ? 'info' : 'violet'}>{u.role}</Pill> },
              { key: 'status', label: 'Status', render: (u) => <StatusPill status={String(u.status).toLowerCase().replace(/ /g, '_')} label={u.status} /> },
              { key: 'bookings', label: 'Bookings', render: (u) => u.bookingsCount },
              { key: 'listings', label: 'Listings', render: (u) => u.listingsCount || '—' },
              { key: 'joined', label: 'Joined', render: (u) => formatDate(u.joinedDate) },
            ]} />
        )}
      </Card>
    </Page>
  );
}
