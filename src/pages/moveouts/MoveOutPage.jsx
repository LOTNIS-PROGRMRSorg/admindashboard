import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, ErrorState, Facts, Field, Grid, Input, LoadingState, Notice, Page, PageHeader, Pill, Select, Split, Stack, StatusPill, Timeline } from '../../components/ui';
import { formatDateTime, money } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';

const EVENT_COPY = {
  notice_given: 'gave notice to leave early', withdrawn: 'withdrew the notice', host_responded: 'responded to the notice', moved_out: 'confirmed the move-out',
  checkout_started: 'started the checkout', deduction_proposed: 'listed a deposit deduction', deduction_accepted: 'accepted a deduction', deduction_disputed: 'disputed a deduction',
  deduction_ruled: 'ruled on a deduction', flags_changed: 'updated the case', settled: 'settled the case',
};

const Line = ({ label, value, strong }) => <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: strong ? 700 : 500, borderTop: strong ? '1px solid var(--color-border)' : 0 }}><span>{label}</span><span>{value}</span></div>;

function Deduction({ d, currency, exitOpen, onRuled }) {
  const [status, setStatus] = useState('upheld');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rule = async () => {
    setBusy(true); setError('');
    try { await send(`/admin/exits/deductions/${d.id}/rule`, 'POST', { status, final_amount: status === 'reduced' ? Number(amount) : undefined, note }); onRuled(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-3)', display: 'grid', gap: 8, background: d.status === 'disputed' ? 'var(--color-danger-bg)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 600 }}><span>{d.reason}</span><span>{money(currency, d.amount)}{d.final_amount != null && Number(d.final_amount) !== Number(d.amount) ? ` → ${money(currency, d.final_amount)}` : ''}</span></div>
      <div><StatusPill status={d.status === 'proposed' ? 'pending' : d.status === 'disputed' ? 'failed' : 'done'} label={d.status} /></div>
      {d.evidence_urls?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{d.evidence_urls.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="Evidence" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} /></a>)}</div>}
      {d.guest_comment && <em style={{ color: 'var(--color-text-muted)' }}>Guest: “{d.guest_comment}”</em>}
      {d.admin_note && <em style={{ color: 'var(--color-text-muted)' }}>Ruling: {d.admin_note}</em>}
      {exitOpen && ['disputed', 'proposed', 'accepted'].includes(d.status) && (
        <Grid>
          <Field label="Ruling"><Select value={status} onChange={(e) => setStatus(e.target.value)} options={[['upheld', 'Uphold the full deduction'], ['reduced', 'Reduce it'], ['waived', 'Waive it']]} /></Field>
          {status === 'reduced' && <Field label="New amount"><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>}
          <Field label="Reason (shown to guest and host)"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <div><Button variant="primary" disabled={busy || !note.trim()} onClick={rule}>{busy ? 'Saving…' : 'Record ruling'}</Button></div>
        </Grid>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
    </div>
  );
}

/** One early-departure / checkout case on its own page, with the same timeline the guest and host see. */
export default function MoveOutPage() {
  const { id } = useParams();
  const { data: detail, error, loading, reload } = useApi(`/admin/exits/${id}`);
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');
  const [note, setNote] = useState('');
  const [overrideOn, setOverrideOn] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [faultNote, setFaultNote] = useState('');

  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><PageHeader back={{ to: '/move-outs', label: 'All move-outs' }} title="Move-out" /><ErrorState>{error}</ErrorState></Page>;
  const { exit, booking, guest, host, events, deductions, estimate } = detail;
  const c = booking.currency_snapshot;
  const open = !['settled', 'withdrawn'].includes(exit.status);
  const disputed = deductions.filter((d) => d.status === 'disputed').length;
  const act = async (key, work) => { setBusy(key); setProblem(''); try { await work(); reload(); } catch (e) { setProblem(e.message); } finally { setBusy(''); } };
  const flags = (body) => act('flags', () => send(`/admin/exits/${id}/flags`, 'PATCH', { ...body, note: faultNote || undefined }));
  const settle = () => act('settle', () => send(`/admin/exits/${id}/settle`, 'POST', { note: note || undefined, override_amount: overrideOn ? Number(overrideAmount) : undefined, override_reason: overrideOn ? overrideReason : undefined }));

  return (
    <Page>
      <PageHeader back={{ to: '/move-outs', label: 'All move-outs' }} eyebrow={exit.kind === 'early_departure' ? 'Early departure' : 'Checkout'} title={<>{booking.property?.name} <StatusPill status={exit.status} /></>} subtitle={`${booking.start_date} → ${booking.end_date}`}>
        <Button to={`/bookings/${booking.id}`}>Open booking</Button>
      </PageHeader>
      <Split>
        <Stack>
          <Card title="Case">
            <Facts rows={[
              ['Guest', guest && `${guest.name}${guest.phone ? ` · ${guest.phone}` : ''}`], ['Host', host && `${host.name}${host.phone ? ` · ${host.phone}` : ''}`],
              ['Leaving', exit.actual_checkout ?? exit.planned_checkout], ['Notice given', formatDateTime(exit.notice_given_at)],
              ["Guest's reason", exit.reason && `“${exit.reason}”`], ['Host replied', exit.host_response && `“${exit.host_response}”${exit.relet_from ? ` — re-let from ${exit.relet_from}` : ''}`],
            ]} />
          </Card>
          {estimate && open && (
            <Card title="Settlement if closed now">
              <Line label="Nights stayed" value={estimate.nights_stayed} /><Line label="Notice nights charged" value={estimate.notice_nights_charged} />
              {estimate.relet_credit_nights > 0 && <Line label="Re-let credit" value={`− ${estimate.relet_credit_nights}`} />}
              <Line label={`Unused rent (${estimate.nights_refunded} of ${estimate.nights_total} nights)`} value={money(c, estimate.rent_refund)} />
              {estimate.fee_refund > 0 && <Line label="Service fee refunded" value={money(c, estimate.fee_refund)} />}
              <Line label={`Deposit returned (held ${money(c, estimate.deposit_held)}, deductions ${money(c, estimate.deductions_total)})`} value={money(c, estimate.deposit_returned)} />
              <Line strong label="Refund to guest" value={money(c, estimate.total_refund)} />
              <Line label="Host keeps" value={money(c, estimate.host_receives)} /><Line label="Lotnis keeps" value={money(c, estimate.platform_keeps)} />
            </Card>
          )}
          {exit.status === 'settled' && (
            <Card title="Settled"><Line label="Unused rent" value={money(c, exit.rent_refund)} /><Line label="Deposit returned" value={money(c, exit.deposit_returned)} /><Line strong label="Refund queued" value={money(c, exit.total_refund)} />
              {exit.admin_override_reason && <Notice tone="info">Override: {exit.admin_override_reason}</Notice>}
              <Link to="/refunds">See it in Refunds</Link></Card>
          )}
          {deductions.length > 0 && <Card title={`Deposit deductions${disputed ? ` · ${disputed} disputed` : ''}`}><Stack>{deductions.map((d) => <Deduction key={d.id} d={d} currency={c} exitOpen={open} onRuled={reload} />)}</Stack></Card>}
          <Card title="Timeline"><Timeline items={events.map((e) => ({ at: e.created_at, text: <><b>{e.actor_name || e.actor_role}</b> <Pill>{e.actor_role}</Pill> {EVENT_COPY[e.event] ?? e.event}{e.note && <i> — “{e.note}”</i>}</> }))} /></Card>
        </Stack>
        <Stack>
          {open && (
            <Card title="Who was at fault?">
              <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={exit.host_at_fault} disabled={!!busy} onChange={(e) => flags({ host_at_fault: e.target.checked })} /> Host / space at fault — no notice charge</label>
              <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={exit.refund_service_fee} disabled={!!busy || !exit.host_at_fault} onChange={(e) => flags({ refund_service_fee: e.target.checked })} /> Also refund the Lotnis service fee</label>
              <Field label="Reason for the change (recorded)"><Input value={faultNote} onChange={(e) => setFaultNote(e.target.value)} /></Field>
            </Card>
          )}
          {open && (
            <Card title="Decide">
              {['notice_given', 'host_responded'].includes(exit.status) && <Button disabled={!!busy} onClick={() => act('out', () => send(`/admin/exits/${id}/move-out`, 'POST', {}))}>Record move-out on the planned date</Button>}
              <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={overrideOn} onChange={(e) => setOverrideOn(e.target.checked)} /> Override the calculated refund</label>
              {overrideOn && <Grid><Field label={`Refund amount (${c})`}><Input type="number" min="0" step="0.01" value={overrideAmount} onChange={(e) => setOverrideAmount(e.target.value)} /></Field><Field label="Reason (required, recorded)"><Input value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} /></Field></Grid>}
              <Field label="Note to include"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
              {disputed > 0 && <Notice tone="warn">Rule on the {disputed} disputed deduction(s) before settling.</Notice>}
              {problem && <Notice tone="danger">{problem}</Notice>}
              <Button variant="primary" disabled={!!busy || disputed > 0 || (overrideOn && (!overrideAmount || !overrideReason.trim()))} onClick={settle}>{busy === 'settle' ? 'Settling…' : 'Settle & queue refund'}</Button>
            </Card>
          )}
        </Stack>
      </Split>
    </Page>
  );
}
