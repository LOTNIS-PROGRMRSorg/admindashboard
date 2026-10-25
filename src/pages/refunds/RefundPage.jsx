import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, ErrorState, Facts, Field, Grid, Input, LoadingState, Notice, Page, PageHeader, Select, Stack, StatusPill, Textarea } from '../../components/ui';
import { formatDateTime, money } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';

const METHODS = ['Paystack refund', 'Mobile money', 'Bank transfer', 'Other'];
const STAY_STAGE = { pending: 'pending', processing: 'sending', processed: 'done', failed: 'failed' };
const EVENT_STAGE = { pending: 'pending', approved: 'sending', processed: 'done', failed: 'failed', rejected: 'declined' };
const TRIGGER = { buyer_request: 'The buyer asked for it', event_cancelled: 'The event was cancelled', event_postponed: 'The event was postponed (refund all)', voting_cancelled: 'Voting was cancelled', admin: 'Lotnis issued it' };
const ROLE = { guest: 'The guest', host: 'The host', admin: 'An admin', system: 'Lotnis' };

const Line = ({ label, value, strong, negative }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: strong ? 700 : 500, borderTop: strong ? '1px solid var(--color-border)' : 0, color: negative ? 'var(--color-danger)' : undefined }}><span>{label}</span><span>{value}</span></div>
);

/** One refund on its own page — the sums, the reason, and the buttons to decide or record it. Works for stays and events. */
export default function RefundPage() {
  const { service, id } = useParams();
  const isEvent = service === 'event';
  const { data: r, error, loading, reload } = useApi(isEvent ? `/admin/events/refunds/${id}` : `/admin/refunds/${id}`);
  const navigate = useNavigate();
  const [method, setMethod] = useState(METHODS[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');

  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><PageHeader back={{ to: '/refunds', label: 'All refunds' }} title="Refund" /><ErrorState>{error}</ErrorState></Page>;

  const c = r.currency;
  const stage = (isEvent ? EVENT_STAGE : STAY_STAGE)[r.status] ?? 'pending';
  const done = stage === 'done' || stage === 'declined';

  const act = async (label, run, check) => {
    if (check) { setProblem(check); return; }
    setBusy(label); setProblem('');
    try { await run(); reload(); } catch (e) { setProblem(e.message); } finally { setBusy(''); }
  };
  const stayPatch = (status) => () => send(`/admin/refunds/${r.id}`, 'PATCH', { status, method, reference: reference.trim() || undefined, note: note.trim() || undefined });
  const eventPost = (action, body) => () => send(`/admin/events/refunds/${r.id}/${action}`, 'POST', body);

  return (
    <Page>
      <PageHeader back={{ to: '/refunds', label: 'All refunds' }} eyebrow={isEvent ? 'Event ticket refund' : 'Stay refund'} title={<>{money(c, isEvent ? r.amount : r.refund_amount)} <StatusPill status={stage} /></>}
        subtitle={isEvent ? `${r.event?.title ?? 'Event'} · ${r.requester_email || r.order?.buyer_email || ''}` : `${r.property_name ?? 'Stay'} · ${r.guest_name ?? ''}`} />

      <Grid>
        {isEvent ? (
          <>
            <Card title="The request">
              <Facts rows={[
                ['Event', r.event && <Link to={`/events/${r.event.id}`}>{r.event.title}</Link>], ['Buyer', r.requester_email || r.order?.buyer_email],
                ['Why', TRIGGER[r.trigger] || r.trigger], ['Tickets', r.ticket_ids?.length ? `${r.ticket_ids.length}` : 'Whole order'], ['Buyer says', r.reason && `“${r.reason}”`],
                ['Requested', formatDateTime(r.created_at)], ['Decided', r.decided_at && formatDateTime(r.decided_at)], ['Note', r.admin_note],
              ]} />
            </Card>
            <Card title="The money">
              <Line label="Paid for the order" value={money(c, r.order?.total)} />
              <Line label={`Refund (${Number(r.refund_percent)}% of the tickets)`} value={money(c, r.amount)} strong />
              <Line label="Payment-processing fee (never refunded)" value={money(c, r.order?.processing_fee)} />
              <p className="muted" style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>The host's payout is reduced by their share automatically when you approve.</p>
              {r.tickets?.length > 0 && <Facts rows={r.tickets.map((t) => [t.ticket_type?.name ?? 'Ticket', `${t.code} · ${money(c, t.price)}`])} />}
            </Card>
          </>
        ) : (
          <>
            <Card title="The booking">
              <Facts rows={[
                ['Property', r.property_name], ['Stay', r.booking && `${r.booking.start_date} → ${r.booking.end_date}`], ['Guest', r.guest_name], ['Host', r.host_name],
                ['Original payment', r.payment_reference], ['Booking', r.booking_id && <Link to={`/bookings/${r.booking_id}`}>Open booking</Link>],
              ]} />
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                {ROLE[r.cancelled_by_role] || 'Someone'} cancelled {r.days_before_start} day(s) before check-in
                {r.cancelled_by_role === 'guest' ? <> under the <b>{r.policy_code}</b> policy → <b>{Number(r.refund_percentage)}%</b> of the stay is refunded; the Lotnis fee is kept.</> : <> — the guest is not at fault, so <b>everything paid, including the service fee</b>, is refunded.</>}
                {r.booking?.cancellation_reason && <> Reason: “{r.booking.cancellation_reason}”.</>}
              </p>
            </Card>
            <Card title="The money">
              <Line label="Guest paid" value={money(c, r.total_paid)} />
              <Line label={`Stay (${money(c, r.property_amount)}) × ${Number(r.refund_percentage)}%`} value={money(c, r.refund_property_amount)} />
              <Line label="Lotnis service fee" value={Number(r.refund_fee_amount) > 0 ? money(c, r.refund_fee_amount) : 'kept'} />
              <Line label="Security deposit returned" value={money(c, r.refund_deposit_amount)} />
              <Line label="Refund to guest" value={money(c, r.refund_amount)} strong />
              <Line label="Host keeps" value={money(c, r.host_receives)} />
              <Line label="Lotnis keeps" value={money(c, r.platform_keeps)} />
            </Card>
          </>
        )}
      </Grid>

      {stage === 'done' && (
        <Card title="Refund sent"><Facts rows={[['Method', r.refund_method], ['Reference', r.refund_reference], ['Sent', formatDateTime(r.processed_at)], ['Note', r.admin_note]]} /></Card>
      )}

      {!done && (
        <Card title={isEvent && r.status === 'pending' ? 'Decide' : 'Record the refund'}>
          <Stack>
            {isEvent && r.status === 'pending' ? (
              <>
                <Field label="Note to the buyer" hint="required to decline"><Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button variant="success" disabled={!!busy} onClick={() => act('approve', eventPost('approve', { note }))}>{busy === 'approve' ? 'Approving…' : 'Approve (cancels the tickets)'}</Button>
                  <Button variant="danger" disabled={!!busy} onClick={() => act('reject', eventPost('reject', { note }), !note.trim() && 'Tell the buyer why it was declined.')}>Decline</Button>
                </div>
              </>
            ) : (
              <>
                <Grid>
                  <Field label="Method"><Select options={METHODS.map((m) => [m, m])} value={method} onChange={(e) => setMethod(e.target.value)} /></Field>
                  <Field label="Payment reference"><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Paystack refund ID or MoMo transaction ID" /></Field>
                </Grid>
                {!isEvent && <Field label="Note (only admins see it)"><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!isEvent && r.status === 'pending' && <Button disabled={!!busy} onClick={() => act('processing', stayPatch('processing'))}>Mark as being sent</Button>}
                  <Button variant="success" disabled={!!busy} onClick={() => act('processed', isEvent ? eventPost('processed', { method, reference }) : stayPatch('processed'), !reference.trim() && 'Enter the payment reference of the refund you sent.')}>{busy === 'processed' ? 'Saving…' : 'Mark as sent'}</Button>
                  {!isEvent && <Button variant="danger" disabled={!!busy} onClick={() => act('failed', stayPatch('failed'), !note.trim() && 'Add a note explaining why the refund failed.')}>Mark as failed</Button>}
                </div>
              </>
            )}
            {problem && <Notice tone="danger">{problem}</Notice>}
          </Stack>
        </Card>
      )}
      {r.status === 'rejected' && <Notice tone="info">Declined{r.admin_note ? `: ${r.admin_note}` : '.'}</Notice>}
      <Button variant="ghost" onClick={() => navigate('/refunds')}>← Back to refunds</Button>
    </Page>
  );
}
