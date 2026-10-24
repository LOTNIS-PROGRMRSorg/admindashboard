import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { formatDateTime, money } from '../../lib/format';
import styles from '../../pages/Refunds.module.css';
import local from './MoveOutDrawer.module.css';

export const STATUS_LABEL = {
  notice_given: 'Notice given', host_responded: 'Host responded', moved_out: 'Moved out',
  in_dispute: 'In dispute', settled: 'Settled', withdrawn: 'Withdrawn',
};
const EVENT_COPY = {
  notice_given: 'gave notice to leave early', withdrawn: 'withdrew the notice', host_responded: 'responded to the notice',
  moved_out: 'confirmed the move-out', checkout_started: 'started the checkout', deduction_proposed: 'listed a deposit deduction',
  deduction_accepted: 'accepted a deduction', deduction_disputed: 'disputed a deduction', deduction_ruled: 'ruled on a deduction',
  flags_changed: 'updated the case', settled: 'settled the case',
};

export function StatusBadge({ status }) {
  const tone = { notice_given: 'pending', host_responded: 'processing', moved_out: 'processing', in_dispute: 'failed', settled: 'processed', withdrawn: 'processed' }[status];
  return <span className={`${styles.badge} ${styles[tone] || ''}`}>{STATUS_LABEL[status] || status}</span>;
}

function Row({ label, value, total }) {
  return <div className={`${styles.row} ${total ? styles.rowTotal : ''}`}><span>{label}</span><span>{value}</span></div>;
}

function Deduction({ d, currency, exitOpen, onRuled }) {
  const [status, setStatus] = useState('upheld');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(null);
  const rule = async () => {
    setBusy(true); setError('');
    try {
      await apiFetch(`/admin/exits/deductions/${d.id}/rule`, { method: 'POST', body: JSON.stringify({ status, final_amount: status === 'reduced' ? Number(amount) : undefined, note }) });
      onRuled();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <div className={`${local.ded} ${d.status === 'disputed' ? local.dedDisputed : ''}`}>
      <div className={local.dedHead}><span>{d.reason}</span><span>{money(currency, d.amount)}{d.final_amount != null && Number(d.final_amount) !== Number(d.amount) ? ` → ${money(currency, d.final_amount)}` : ''}</span></div>
      <span className={`${styles.badge} ${d.status === 'disputed' ? styles.failed : d.status === 'proposed' ? styles.pending : styles.processed}`} style={{ justifySelf: 'start' }}>{d.status}</span>
      {d.evidence_urls?.length > 0 && <div className={local.photos}>{d.evidence_urls.map((u) => <img key={u} src={u} alt="Evidence" onClick={() => setZoom(u)} />)}</div>}
      {d.guest_comment && <p className={local.quote}>Guest: “{d.guest_comment}”</p>}
      {d.admin_note && <p className={local.quote}>Ruling: {d.admin_note}</p>}
      {exitOpen && ['disputed', 'proposed', 'accepted'].includes(d.status) && (
        <div className={local.ruling}>
          <label className={styles.label}>Ruling
            <select className={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="upheld">Uphold the full deduction</option><option value="reduced">Reduce it</option><option value="waived">Waive it</option>
            </select></label>
          {status === 'reduced' && <label className={styles.label}>New amount<input className={styles.input} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>}
          <label className={`${styles.label} ${local.wide}`}>Reason (shown to guest and host)<input className={styles.input} value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <div className={local.wide}><button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy || !note.trim()} onClick={rule}>{busy ? 'Saving…' : 'Record ruling'}</button></div>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
      {zoom && <div className={styles.overlay} style={{ zIndex: 400, alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoom(null)}><img src={zoom} alt="Evidence" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }} /></div>}
    </div>
  );
}

export default function MoveOutDrawer({ exitId, onClose, onChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [overrideOn, setOverrideOn] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [faultNote, setFaultNote] = useState('');

  const load = useCallback(() => apiFetch(`/admin/exits/${exitId}`).then((b) => setDetail(b.data)).catch((e) => setError(e.message)), [exitId]);
  useEffect(() => { load(); }, [load]);
  if (!detail) return <div className={styles.overlay} onClick={onClose}><aside className={styles.drawer}><div className={styles.drawerBody}>{error || 'Loading…'}</div></aside></div>;

  const { exit, booking, guest, host, events, deductions, estimate } = detail;
  const c = booking.currency_snapshot;
  const open = !['settled', 'withdrawn'].includes(exit.status);
  const disputed = deductions.filter((d) => d.status === 'disputed').length;
  const act = async (key, work) => { setBusy(key); setError(''); try { await work(); await load(); onChanged(); } catch (err) { setError(err.message); } finally { setBusy(''); } };

  const settle = () => act('settle', () => apiFetch(`/admin/exits/${exitId}/settle`, {
    method: 'POST', body: JSON.stringify({ note: note || undefined, override_amount: overrideOn ? Number(overrideAmount) : undefined, override_reason: overrideOn ? overrideReason : undefined }),
  }));
  const flags = (body) => act('flags', () => apiFetch(`/admin/exits/${exitId}/flags`, { method: 'PATCH', body: JSON.stringify({ ...body, note: faultNote || undefined }) }));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()} aria-label="Move-out case">
        <div className={styles.drawerHeader}><h2 className={styles.drawerTitle}>{booking.property?.name} · {exit.kind === 'early_departure' ? 'Early departure' : 'Checkout'}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close"><X size={20} /></button></div>

        <div className={styles.drawerBody}>
          <div className={styles.section}>
            <h4>Case</h4>
            <Row label="Status" value={<StatusBadge status={exit.status} />} />
            <Row label="Guest" value={`${guest?.name ?? '—'}${guest?.phone ? ` · ${guest.phone}` : ''}`} />
            <Row label="Host" value={`${host?.name ?? '—'}${host?.phone ? ` · ${host.phone}` : ''}`} />
            <Row label="Booked" value={`${booking.start_date} → ${booking.end_date}`} />
            <Row label="Leaving" value={exit.actual_checkout ?? exit.planned_checkout} />
            <Row label="Notice given" value={formatDateTime(exit.notice_given_at)} />
            {exit.reason && <p className={styles.note}>Guest's reason: “{exit.reason}”</p>}
            {exit.host_response && <p className={styles.note}>Host replied: “{exit.host_response}”{exit.relet_from ? ` — re-let from ${exit.relet_from}` : ''}</p>}
          </div>

          {estimate && open && (
            <div className={styles.section}>
              <h4>Settlement if closed now</h4>
              <Row label="Nights stayed" value={estimate.nights_stayed} />
              <Row label="Notice nights charged" value={estimate.notice_nights_charged} />
              {estimate.relet_credit_nights > 0 && <Row label="Re-let credit" value={`− ${estimate.relet_credit_nights}`} />}
              <Row label={`Unused rent (${estimate.nights_refunded} of ${estimate.nights_total} nights)`} value={money(c, estimate.rent_refund)} />
              {estimate.fee_refund > 0 && <Row label="Service fee refunded" value={money(c, estimate.fee_refund)} />}
              <Row label={`Deposit returned (held ${money(c, estimate.deposit_held)}, deductions ${money(c, estimate.deductions_total)})`} value={money(c, estimate.deposit_returned)} />
              <Row label="Refund to guest" value={money(c, estimate.total_refund)} total />
              <Row label="Host keeps" value={money(c, estimate.host_receives)} />
              <Row label="Lotnis keeps" value={money(c, estimate.platform_keeps)} />
            </div>
          )}
          {exit.status === 'settled' && (
            <div className={styles.section}><h4>Settled</h4>
              <Row label="Unused rent" value={money(c, exit.rent_refund)} /><Row label="Deposit returned" value={money(c, exit.deposit_returned)} />
              <Row label="Refund queued" value={money(c, exit.total_refund)} total />
              {exit.admin_override_reason && <p className={styles.note}>Override: {exit.admin_override_reason}</p>}</div>
          )}

          {deductions.length > 0 && <div className={styles.section}><h4>Deposit deductions {disputed > 0 && `· ${disputed} disputed`}</h4>
            {deductions.map((d) => <Deduction key={d.id} d={d} currency={c} exitOpen={open} onRuled={() => { load(); onChanged(); }} />)}</div>}

          {open && (
            <div className={styles.section}>
              <h4>Who was at fault?</h4>
              <label className={local.check}><input type="checkbox" checked={exit.host_at_fault} disabled={!!busy} onChange={(e) => flags({ host_at_fault: e.target.checked })} /> Host / space at fault — no notice charge</label>
              <label className={local.check}><input type="checkbox" checked={exit.refund_service_fee} disabled={!!busy || !exit.host_at_fault} onChange={(e) => flags({ refund_service_fee: e.target.checked })} /> Also refund the Lotnis service fee</label>
              <label className={styles.label} style={{ marginTop: 8 }}>Reason for the change (recorded)<input className={styles.input} value={faultNote} onChange={(e) => setFaultNote(e.target.value)} /></label>
            </div>
          )}

          <div className={styles.section}>
            <h4>Timeline</h4>
            <ol className={local.timeline}>{events.map((e) => (
              <li key={e.id} className={local[e.actor_role]}>
                <b>{e.actor_name || e.actor_role}</b> <span className={local.role}>{e.actor_role}</span> {EVENT_COPY[e.event] ?? e.event}
                {e.note && <p>“{e.note}”</p>}<small>{formatDateTime(e.created_at)}</small>
              </li>))}</ol>
          </div>

          {open && (
            <div className={styles.section}>
              <h4>Decide</h4>
              {['notice_given', 'host_responded'].includes(exit.status) && (
                <button className={styles.btn} disabled={!!busy} onClick={() => act('out', () => apiFetch(`/admin/exits/${exitId}/move-out`, { method: 'POST', body: JSON.stringify({}) }))}>Record move-out on the planned date</button>
              )}
              <label className={local.check} style={{ marginTop: 8 }}><input type="checkbox" checked={overrideOn} onChange={(e) => setOverrideOn(e.target.checked)} /> Override the calculated refund</label>
              {overrideOn && <div className={local.ruling}>
                <label className={styles.label}>Refund amount ({c})<input className={styles.input} type="number" min="0" step="0.01" value={overrideAmount} onChange={(e) => setOverrideAmount(e.target.value)} /></label>
                <label className={styles.label}>Reason (required, recorded)<input className={styles.input} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} /></label>
              </div>}
              <label className={styles.label} style={{ marginTop: 8 }}>Note to include<input className={styles.input} value={note} onChange={(e) => setNote(e.target.value)} /></label>
              {disputed > 0 && <p className={styles.error}>Rule on the {disputed} disputed deduction(s) before settling.</p>}
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {open && (
          <div className={styles.drawerFooter}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={!!busy || disputed > 0 || (overrideOn && (!overrideAmount || !overrideReason.trim()))} onClick={settle}>
              {busy === 'settle' ? 'Settling…' : 'Settle & queue refund'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
