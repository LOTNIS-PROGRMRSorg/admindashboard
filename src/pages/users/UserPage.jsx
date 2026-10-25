import { Link, useParams } from 'react-router-dom';
import { Card, DataTable, ErrorState, Facts, LoadingState, Page, PageHeader, Pill, Split, Stack, StatusPill } from '../../components/ui';
import { formatDate, formatDateTime, money, titleCase } from '../../lib/format';
import { useApi } from '../../lib/useApi';

/** One person on their own page: account, host status, and everything they've booked, bought, reported or been refunded. */
export default function UserPage() {
  const { id } = useParams();
  const { data: d, error, loading } = useApi(`/admin/users/${id}`);
  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><PageHeader back={{ to: '/users', label: 'All users' }} title="Person" /><ErrorState>{error}</ErrorState></Page>;
  const { profile: p, host, admin_role: adminRole, bookings, orders, reports_filed: reports, refunds } = d;

  return (
    <Page>
      <PageHeader back={{ to: '/users', label: 'All users' }} eyebrow="Person" title={<>{p.name} {adminRole && <Pill tone="violet">{titleCase(adminRole)}</Pill>}{host && <Pill tone="info">Host</Pill>}</>} subtitle={p.email} />
      <Split>
        <Stack>
          <Card title={`Stays booked (${bookings.length})`} flush>
            <DataTable rows={bookings} rowTo={(b) => `/bookings/${b.id}`} empty="No bookings." columns={[
              { key: 'p', label: 'Property', render: (b) => b.property?.name ?? '—' },
              { key: 'd', label: 'Stay', render: (b) => `${formatDate(b.start_date)} → ${formatDate(b.end_date)}` },
              { key: 'a', label: 'Total', render: (b) => money(b.currency_snapshot, b.final_amount) },
              { key: 's', label: 'Status', render: (b) => <StatusPill status={b.status} /> },
            ]} />
          </Card>
          <Card title={`Tickets & votes bought (${orders.length})`} flush>
            <DataTable rows={orders} rowTo={(o) => (o.event ? `/events/${o.event.id}` : '/events')} empty="No event purchases." columns={[
              { key: 'e', label: 'Event', render: (o) => o.event?.title ?? '—' },
              { key: 'k', label: 'For', render: (o) => (o.kind === 'vote' ? 'Votes' : 'Tickets') },
              { key: 'a', label: 'Paid', render: (o) => money(o.currency, o.total) },
              { key: 's', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
            ]} />
          </Card>
          <Card title={`Reports they filed (${reports.length})`} flush>
            <DataTable rows={reports} rowTo={(r) => `/reports/${r.id}`} empty="None." columns={[
              { key: 'c', label: 'About', render: (r) => titleCase(r.category) }, { key: 't', label: 'Type', render: (r) => titleCase(r.target_type) },
              { key: 'w', label: 'When', render: (r) => formatDate(r.created_at) }, { key: 's', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]} />
          </Card>
        </Stack>
        <Stack>
          <Card title="Account">
            <Facts rows={[['Email', p.email], ['Phone', p.phone], ['Joined', formatDateTime(p.created_at)], ['Email verified', p.email_verified ? 'Yes' : 'No']]} />
          </Card>
          {host && (
            <Card title="Host" action={{ label: 'Open host', to: `/hosts/${id}` }}>
              <Facts rows={[['Business', host.display_name], ['Status', <StatusPill key="s" status={host.verification_status === 'verified' ? 'verified' : host.verification_status} />], ['Type', titleCase(host.account_type)], ['City', host.city]]} />
            </Card>
          )}
          <Card title={`Refunds (${refunds.length})`}>
            {refunds.length === 0 ? <span style={{ color: 'var(--color-text-muted)' }}>None.</span> : refunds.map((r) => <Link key={r.id} to={`/refunds/accommodation/${r.id}`} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{money(r.currency, r.refund_amount)}</span><StatusPill status={r.status} /></Link>)}
          </Card>
        </Stack>
      </Split>
    </Page>
  );
}
