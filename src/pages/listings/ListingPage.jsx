import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, CellMain, DataTable, ErrorState, Facts, LoadingState, Page, PageHeader, Split, Stack, StatusPill, Tabs } from '../../components/ui';
import { ConfirmDialog, FieldDialog } from '../../components/modals';
import EngagementPanel from '../../components/stats/EngagementPanel';
import { formatDate, formatDateTime, money, titleCase } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';

const TABS = [{ key: 'overview', label: 'Overview' }, { key: 'bookings', label: 'Bookings' }, { key: 'visits', label: 'Visits' }, { key: 'reports', label: 'Reports' }];

/** One listing on its own page: how it looks, who hosts it, how it performs, what's been reported — and approve / reject. */
export default function ListingPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview';
  const detail = useApi(`/admin/properties/${id}`);
  const insights = useApi(`/admin/properties/${id}/insights`);
  const [decision, setDecision] = useState(null);
  const p = detail.data;
  if (detail.loading) return <Page><LoadingState /></Page>;
  if (detail.error) return <Page><PageHeader back={{ to: '/listings', label: 'All listings' }} title="Listing" /><ErrorState>{detail.error}</ErrorState></Page>;

  const ins = insights.data;
  const images = [...(p.property_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const decide = async (status, note) => { await send(`/admin/properties/${id}/approval`, 'PATCH', { status, note }); setDecision(null); detail.reload(); insights.reload(); };
  const reports = ins?.reports ?? [];

  return (
    <Page>
      <PageHeader back={{ to: '/listings', label: 'All listings' }} eyebrow={`${titleCase(p.sub_type || p.category)} · ${[p.city, p.country].filter(Boolean).join(', ')}`}
        title={<>{p.name} <StatusPill status={p.approval_status} />{p.is_paused && <StatusPill status="paused" />}</>} subtitle={p.tagline}>
        {p.approval_status !== 'approved' && <Button variant="success" onClick={() => setDecision('approved')}>Approve</Button>}
        {p.approval_status !== 'rejected' && <Button variant="danger" onClick={() => setDecision('rejected')}>Reject</Button>}
        <Button href={`${import.meta.env.VITE_SITE_URL || 'https://lotnis.com'}/stays/${p.id}`} target="_blank" rel="noreferrer">View public page</Button>
      </PageHeader>
      <Tabs tabs={TABS.map((t) => (t.key === 'reports' && reports.length ? { ...t, badge: reports.length } : t))} value={tab} onChange={(k) => setParams(k === 'overview' ? {} : { tab: k })} />

      {tab === 'overview' && (
        <Split>
          <Stack>
            {images.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>{images.slice(0, 8).map((i) => <img key={i.id} src={i.public_url} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />)}</div>}
            <Card title="About"><p style={{ margin: 0, whiteSpace: 'pre-line' }}>{p.description || '—'}</p></Card>
            {p.rooms?.length > 0 && <Card title="Rooms" flush><DataTable rows={p.rooms.filter((r) => !r.deleted_at)} columns={[{ key: 'l', label: 'Room', render: (r) => r.room_label }, { key: 'p', label: 'Price', render: (r) => `${money(r.currency, r.price_per_period)} / ${r.pricing_period}` }, { key: 'a', label: 'Available', render: (r) => (r.is_available ? 'Yes' : 'No') }]} /></Card>}
          </Stack>
          <Stack>
            <Card title="Details">
              <Facts rows={[
                ['Price', p.price != null && `${money(p.currency, p.price)} / ${p.pricing_period}`], ['Security deposit', Number(p.security_deposit) > 0 && money(p.currency, p.security_deposit)],
                ['Bedrooms', p.bedrooms], ['Bathrooms', p.bathrooms], ['Max guests', p.max_guests], ['Cancellation policy', p.cancellation_policy && titleCase(p.cancellation_policy)],
                ['Address', p.formatted_address], ['Listed', formatDate(p.submitted_at || p.created_at)], ['Paused by host', p.is_paused && (p.pause_reason || 'Yes')], ['Admin note', p.approval_note],
              ]} />
            </Card>
            <Card title="Host" action={ins?.host ? { label: 'Open host', to: `/hosts/${ins.host.user_id}` } : undefined}>
              {ins?.host ? <Facts rows={[['Name', ins.host.display_name], ['Status', <StatusPill key="s" status={ins.host.verification_status === 'verified' ? 'verified' : ins.host.verification_status} />], ['City', ins.host.city], ['On Lotnis since', formatDate(ins.host.created_at)]]} /> : <span style={{ color: 'var(--color-text-muted)' }}>Loading…</span>}
            </Card>
          </Stack>
        </Split>
      )}

      {tab === 'bookings' && (
        <Card flush>
          <DataTable rows={ins?.bookings ?? []} rowTo={(b) => `/bookings/${b.id}`} empty="No bookings yet." columns={[
            { key: 'dates', label: 'Stay', render: (b) => `${formatDate(b.start_date)} → ${formatDate(b.end_date)}` },
            { key: 'amount', label: 'Total', render: (b) => <strong>{money(b.currency_snapshot, b.final_amount)}</strong> },
            { key: 'status', label: 'Status', render: (b) => <StatusPill status={b.status} /> },
            { key: 'created', label: 'Booked', render: (b) => formatDateTime(b.created_at) },
          ]} />
        </Card>
      )}

      {tab === 'visits' && <EngagementPanel engagement={ins?.engagement} />}

      {tab === 'reports' && (
        <Card flush>
          <DataTable rows={reports} rowTo={(r) => `/reports/${r.id}`} empty="Nobody has reported this listing." columns={[
            { key: 'cat', label: 'Reason', render: (r) => <CellMain title={titleCase(r.category)} sub={r.description?.slice(0, 80)} /> },
            { key: 'aud', label: 'Seen by', render: (r) => (r.audience === 'host_and_admin' ? 'Host + admins' : 'Admins only') },
            { key: 'when', label: 'Reported', render: (r) => formatDateTime(r.created_at) },
            { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]} />
        </Card>
      )}

      {decision === 'approved' && <ConfirmDialog title="Approve this listing?" confirmLabel="Approve & publish" onClose={() => setDecision(null)} onConfirm={() => decide('approved')}>It goes live straight away and the host is told.</ConfirmDialog>}
      {decision === 'rejected' && <FieldDialog title="Reject this listing" danger submitLabel="Reject" onClose={() => setDecision(null)} intro="The host sees this reason." fields={[{ name: 'note', label: 'Reason', type: 'textarea', required: true }]} onSubmit={(v) => decide('rejected', v.note)} />}
      <p style={{ margin: 0 }}><Link to="/listings">← All listings</Link></p>
    </Page>
  );
}
