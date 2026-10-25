import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, CellMain, DataTable, ErrorState, Facts, LoadingState, Notice, Page, PageHeader, Pill, Split, Stack, StatGrid, StatTile, StatusPill, Tabs } from '../../components/ui';
import { FieldDialog } from '../../components/modals';
import { formatDate, money, titleCase } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import HostReview from './HostReview';

const TABS = [{ key: 'overview', label: 'Overview' }, { key: 'review', label: 'Application' }, { key: 'listings', label: 'Listings & events' }, { key: 'reports', label: 'Reports' }];

/** A host on their own page: who they are, what they run, what they are owed, what has been said about them — and the review. */
export default function HostPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview';
  const { data: d, error, loading, reload } = useApi(`/admin/hosts/${id}/overview`);
  const [dialog, setDialog] = useState(null);
  const [problem, setProblem] = useState('');
  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><PageHeader back={{ to: '/hosts', label: 'All hosts' }} title="Host" /><ErrorState>{error}</ErrorState></Page>;

  const { profile, host, properties, events, bookings_received: bookings, money: m, reports_about: reports, payout_methods: methods } = d;
  const status = host.verification_status;
  const change = async (next, reason) => { setProblem(''); try { await send(`/admin/hosts/${host.id}/status`, 'PATCH', { status: next, reason: reason || undefined }); setDialog(null); reload(); } catch (e) { setProblem(e.message); throw e; } };
  const startReview = async () => { try { await send(`/admin/hosts/${host.id}/start-review`, 'POST'); reload(); } catch (e) { setProblem(e.message); } };

  return (
    <Page>
      <PageHeader back={{ to: '/hosts', label: 'All hosts' }} eyebrow={titleCase(host.account_type)} title={<>{host.display_name} <StatusPill status={status === 'verified' ? 'verified' : status} /></>} subtitle={`${profile.name} · ${profile.email}`}>
        {status === 'pending' && <Button onClick={startReview}>Start review</Button>}
        {status !== 'verified' && <Button variant="success" onClick={() => change('verified')}>Approve host</Button>}
        {status !== 'rejected' && status !== 'verified' && <Button variant="danger" onClick={() => setDialog('rejected')}>Reject</Button>}
        {status === 'verified' && <Button variant="danger" onClick={() => setDialog('suspended')}>Suspend</Button>}
        <Button to={`/users/${profile.id}`}>See as a person</Button>
      </PageHeader>
      {problem && <Notice tone="danger">{problem}</Notice>}
      <Tabs tabs={TABS.map((t) => (t.key === 'reports' && reports.length ? { ...t, badge: reports.length } : t))} value={tab} onChange={(k) => setParams(k === 'overview' ? {} : { tab: k })} />

      {tab === 'overview' && (
        <>
          <StatGrid>
            <StatTile label="Listings" value={properties.length} sub={`${properties.filter((p) => p.approval_status === 'approved').length} live`} />
            <StatTile label="Events" value={events.length} />
            <StatTile label="Bookings received" value={bookings} />
            <StatTile label="Owed now" value={money('GHS', m.due)} tone={m.due ? 'warn' : undefined} sub={`${money('GHS', m.awaiting)} waiting`} to="/payouts" />
            <StatTile label="Paid out" value={money('GHS', m.paid)} tone="good" sub={m.on_hold ? `${money('GHS', m.on_hold)} on hold` : undefined} />
          </StatGrid>
          <Split>
            <Card title="About"><Facts rows={[['Name', profile.name], ['Email', profile.email], ['Phone', host.phone || profile.phone], ['Where', [host.city, host.state, host.country].filter(Boolean).join(', ')], ['Business', host.business_name], ['Applied', formatDate(host.created_at)], ['Verified', host.verified_at && formatDate(host.verified_at)]]} /></Card>
            <Card title="Payout accounts">
              {methods.length === 0 ? <span style={{ color: 'var(--color-text-muted)' }}>No payout account yet — they cannot be paid.</span> : methods.map((x) => <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span>{titleCase(x.provider || x.kind)} · {x.account_number}<br /><small style={{ color: 'var(--color-text-muted)' }}>{x.account_name}</small></span>{x.is_default && <Pill tone="good">Default</Pill>}</div>)}
            </Card>
          </Split>
        </>
      )}

      {tab === 'review' && <HostReview hostProfileId={host.id} />}

      {tab === 'listings' && (
        <Stack>
          <Card title="Listings" flush>
            <DataTable rows={properties} rowTo={(p) => `/listings/${p.id}`} empty="No listings." columns={[
              { key: 'n', label: 'Listing', render: (p) => <CellMain title={p.name} sub={`${titleCase(p.sub_type)} · ${p.city}`} /> },
              { key: 'p', label: 'Price', render: (p) => `${money(p.currency, p.price)} / ${p.pricing_period}` },
              { key: 's', label: 'Status', render: (p) => <><StatusPill status={p.approval_status} />{p.is_paused && <> <StatusPill status="paused" /></>}</> },
            ]} />
          </Card>
          <Card title="Events" flush>
            <DataTable rows={events} rowTo={(e) => `/events/${e.id}`} empty="No events." columns={[
              { key: 't', label: 'Event', render: (e) => <CellMain title={e.title} sub={e.city} /> }, { key: 'w', label: 'When', render: (e) => formatDate(e.starts_at) },
              { key: 's', label: 'Status', render: (e) => <><StatusPill status={e.status} />{e.sales_paused && <> <StatusPill status="paused" /></>}</> },
            ]} />
          </Card>
        </Stack>
      )}

      {tab === 'reports' && (
        <Card title="Reports about this host's listings, events and stays" flush>
          <DataTable rows={reports} rowTo={(r) => `/reports/${r.id}`} empty="Nothing has been reported about this host." columns={[
            { key: 'c', label: 'Reason', render: (r) => titleCase(r.category) }, { key: 't', label: 'About', render: (r) => titleCase(r.target_type) },
            { key: 'w', label: 'When', render: (r) => formatDate(r.created_at) }, { key: 's', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]} />
        </Card>
      )}

      {dialog && <FieldDialog title={dialog === 'rejected' ? 'Reject this host?' : 'Suspend this host?'} danger submitLabel={dialog === 'rejected' ? 'Reject' : 'Suspend'} onClose={() => setDialog(null)} intro="The host sees this reason."
        fields={[{ name: 'reason', label: 'Reason', type: 'textarea', required: true }]} onSubmit={(v) => change(dialog, v.reason)} />}
      <p style={{ margin: 0 }}><Link to="/hosts">← All hosts</Link></p>
    </Page>
  );
}
