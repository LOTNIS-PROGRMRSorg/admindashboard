import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, CellMain, DataTable, ErrorState, Facts, Field, LoadingState, Notice, Page, PageHeader, Split, Stack, StatGrid, StatTile, StatusPill, Tabs, Textarea } from '../../components/ui';
import { ConfirmDialog } from '../../components/modals';
import EngagementPanel from '../../components/stats/EngagementPanel';
import { formatDateTime, money } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';

const POSTPONE = { carry_over: 'Tickets carry over', carry_over_or_refund: 'Carry over, or refund within the window', refund_all: 'Refund everyone' };
const TABS = [{ key: 'overview', label: 'Overview' }, { key: 'orders', label: 'Orders' }, { key: 'visits', label: 'Visits' }, { key: 'reports', label: 'Reports' }];

/** One event on its own page — what it is, how it's selling, who looked, who complained, and the decision. */
export default function EventPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview';
  const { data, error, loading, reload } = useApi(`/admin/events/${id}`);
  const insights = useApi(`/admin/events/${id}/insights`);
  const orders = useApi(`/admin/events/${id}/orders?limit=25`);
  const [reason, setReason] = useState('');
  const [problem, setProblem] = useState('');
  const [confirm, setConfirm] = useState(null);

  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><PageHeader back={{ to: '/events', label: 'All events' }} title="Event" /><ErrorState>{error}</ErrorState></Page>;
  const { event: ev, stats: s, payout: p, host } = data; const c = ev.currency;
  const reports = insights.data?.reports ?? [];

  const act = async (action, needsReason) => {
    if (needsReason && !reason.trim()) { setProblem('Add a reason — the host will see it.'); return; }
    setProblem('');
    try { await send(`/admin/events/${id}/${action}`, 'POST', { reason: reason.trim() || undefined }); setReason(''); reload(); } catch (e) { setProblem(e.message); }
  };

  return (
    <Page>
      <PageHeader back={{ to: '/events', label: 'All events' }} eyebrow={ev.category} title={<>{ev.title} <StatusPill status={ev.status} />{ev.sales_paused && <StatusPill status="paused" />}</>}
        subtitle={`${formatDateTime(ev.starts_at)} · ${ev.venue_name}, ${ev.city}`}>
        {ev.slug && <Button href={`${import.meta.env.VITE_SITE_URL || 'https://lotnis.com'}/events/${ev.slug}`} target="_blank" rel="noreferrer">View public page</Button>}
      </PageHeader>
      <Tabs tabs={TABS.map((t) => (t.key === 'reports' && reports.length ? { ...t, badge: reports.length } : t))} value={tab} onChange={(k) => setParams(k === 'overview' ? {} : { tab: k })} />

      {tab === 'overview' && (
        <>
          <StatGrid>
            <StatTile label="Tickets sold" value={s.tickets_sold} sub={`${s.tickets_scanned} scanned · ${s.tickets_refunded} refunded`} />
            <StatTile label="Ticket sales" value={money(c, s.ticket_gross)} />
            <StatTile label="Votes" value={s.votes_total.toLocaleString()} sub={money(c, s.vote_gross)} />
            <StatTile label="Lotnis commission" value={money(c, s.ticket_commission + s.vote_commission)} tone="good" />
            <StatTile label="Host receives" value={money(c, s.ticket_host_net + s.vote_host_net)} />
          </StatGrid>
          <Split>
            <Stack>
              <Card title="About"><p style={{ margin: 0, whiteSpace: 'pre-line' }}>{ev.description}</p></Card>
              <Card title="By ticket type">
                <Facts rows={[...s.by_ticket_type.map((t) => [`${t.name} · ${money(c, t.price)}`, `${t.sold}${t.quantity != null ? ` / ${t.quantity}` : ''} sold · ${t.scanned} in`]), ...s.by_gate.map((g) => [`Gate: ${g.name}`, `${g.admitted} in · ${g.rejected} rejected`])]} />
              </Card>
            </Stack>
            <Stack>
              <Card title="Details">
                <Facts rows={[
                  ['Host', host && <Link to={`/hosts/${ev.host_id}`}>{host.name}{host.verified ? ' ✓' : ''}</Link>],
                  ['Ends', formatDateTime(ev.ends_at)], ['Lotnis fee', ev.fee_mode === 'on_top' ? 'Added on top for buyers' : 'Included in the price'],
                  ['Refund policy', ev.refund_policy === 'none' ? 'No refunds' : (ev.refund_tiers || []).map((t) => `${t.days_before}d+ → ${t.percent}%`).join(', ')],
                  ['If postponed', POSTPONE[ev.postponement_policy]], ['Voting', ev.voting_enabled && `${formatDateTime(ev.voting_opens_at)} → ${formatDateTime(ev.voting_closes_at)}`],
                  ['Reviews', s.review_count ? `${s.review_average} ★ (${s.review_count})` : null], ['Refunded', Number(s.refunded_amount) ? money(c, s.refunded_amount) : null],
                  ['Rejection / pause', ev.rejection_reason], ['Cancelled because', ev.cancellation_reason], ['Sales paused by host', ev.sales_paused && (ev.sales_pause_reason || 'Yes')],
                ]} />
              </Card>
              {p && <Card title="Host payout"><Facts rows={[['Waiting for release', money(c, p.awaiting_release)], ['Ready to send', money(c, p.due)], ['On hold', money(c, p.on_hold)], ['Paid', money(c, p.paid)]]} /><Link to="/payouts">Open payouts</Link></Card>}
              <Card title="Decision">
                <Stack>
                  <Field label="Reason" hint="required to reject, suspend or cancel"><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
                  {problem && <Notice tone="danger">{problem}</Notice>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {ev.status === 'pending_review' && <><Button variant="success" onClick={() => act('approve')}>Approve & publish</Button><Button variant="danger" onClick={() => act('reject', true)}>Reject</Button></>}
                    {ev.status === 'published' && <Button variant="danger" onClick={() => act('suspend', true)}>Pause sales</Button>}
                    {ev.status === 'suspended' && <Button variant="success" onClick={() => act('unsuspend')}>Resume sales</Button>}
                    {['published', 'suspended'].includes(ev.status) && <Button variant="danger" onClick={() => (reason.trim() ? setConfirm(true) : setProblem('Add a reason — the host will see it.'))}>Cancel & refund all</Button>}
                  </div>
                </Stack>
              </Card>
            </Stack>
          </Split>
        </>
      )}

      {tab === 'orders' && (
        <Card flush>
          <DataTable rows={orders.data?.data ?? []} empty="No orders yet." columns={[
            { key: 'buyer', label: 'Buyer', render: (o) => <CellMain title={o.buyer_name || o.buyer_email} sub={o.buyer_name ? o.buyer_email : null} /> },
            { key: 'kind', label: 'For', render: (o) => (o.kind === 'vote' ? 'Votes' : 'Tickets') },
            { key: 'total', label: 'Paid', render: (o) => <strong>{money(o.currency, o.total)}</strong> },
            { key: 'status', label: 'Status', render: (o) => <StatusPill status={o.status} /> },
            { key: 'when', label: 'When', render: (o) => formatDateTime(o.created_at) },
          ]} />
        </Card>
      )}

      {tab === 'visits' && <EngagementPanel engagement={insights.data?.engagement} steps={insights.data ? [{ label: 'Started checkout', value: insights.data.engagement.conversions?.checkouts_started ?? 0 }, { label: 'Paid for tickets', value: insights.data.engagement.conversions?.ticket_orders_paid ?? 0 }] : null} />}

      {tab === 'reports' && (
        <Card flush>
          <DataTable rows={reports} rowTo={(r) => `/reports/${r.id}`} empty="Nobody has reported this event." columns={[
            { key: 'cat', label: 'Reason', render: (r) => <CellMain title={r.category.replace(/_/g, ' ')} sub={r.description?.slice(0, 80)} /> },
            { key: 'aud', label: 'Seen by', render: (r) => (r.audience === 'host_and_admin' ? 'Host + admins' : 'Admins only') },
            { key: 'when', label: 'Reported', render: (r) => formatDateTime(r.created_at) },
            { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
          ]} />
        </Card>
      )}

      {confirm && <ConfirmDialog title="Cancel this event?" danger confirmLabel="Cancel & refund everyone" onClose={() => setConfirm(null)} onConfirm={async () => { await send(`/admin/events/${id}/cancel`, 'POST', { reason: reason.trim() }); setConfirm(null); setReason(''); reload(); }}>
        Every buyer is refunded in full and the host's payout for this event is cancelled. This cannot be undone.
      </ConfirmDialog>}
    </Page>
  );
}
