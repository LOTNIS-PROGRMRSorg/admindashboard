import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import { formatDateTime, money } from '../lib/format';
import users from './Users.module.css';
import styles from './Refunds.module.css';

// One payout system for every Lotnis service. Hosts are paid after the service is delivered:
//   stays   → 24–48h after check-in (guests can report a problem until then)
//   tickets → 48h after the event ends        votes → 48h after voting closes
// Pay a host by gathering everything that is due into one batch, send the money, record the reference.

const TABS = [['ready', 'Ready to pay'], ['batches', 'Payouts'], ['items', 'All payments'], ['issues', 'Stay problems']];
const BUCKETS = ['', 'awaiting_release', 'due', 'on_hold', 'processing', 'paid'];
const BUCKET = { '': 'All', awaiting_release: 'Waiting', due: 'Due', on_hold: 'On hold', processing: 'Being sent', paid: 'Paid' };
const PAGE = 20;

const Row = ({ label, value, total }) => <div className={`${styles.row} ${total ? styles.rowTotal : ''}`}><span>{label}</span><span>{value}</span></div>;
const Badge = ({ tone, children }) => <span className={`${styles.badge} ${styles[tone] || ''}`}>{children}</span>;
const dest = (d) => !d ? '— no payout details —' : d.method === 'bank' ? `${d.bank_name || 'Bank'} · ${d.account_number} · ${d.account_name || ''}` : `${d.provider || 'Mobile money'} · ${d.number}${d.account_name ? ` · ${d.account_name}` : ''}`;

export default function Payouts() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'ready';
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  useEffect(() => { apiFetch('/admin/payouts/overview').then((b) => { setOverview(b.data); setError(''); }).catch((e) => setError(e.message)); }, [tick]);
  const t = overview?.totals; const c = overview?.currency || 'GHS';
  return (
    <div className={users.page}>
      <div className={users.header}>
        <h1 className={users.title}>Payouts</h1>
        <p className={users.subtitle}>Hosts are paid after the service is delivered. Stays: {overview?.stay_report_window_hours ?? 48}h after check-in. Event tickets and votes: {overview?.event_payout_hold_hours ?? 48}h after the event ends / voting closes. Refunds and problem reports are netted off automatically.</p>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}><div className={styles.statLabel}>Waiting for release</div><div className={styles.statValue}>{money(c, t?.awaiting_release)}</div><div className={styles.statSub}>not yet due</div></div>
        <div className={`${styles.stat} ${t?.due ? styles.warn : ''}`}><div className={styles.statLabel}>Due now</div><div className={styles.statValue}>{money(c, t?.due)}</div><div className={styles.statSub}>ready to send</div></div>
        <div className={`${styles.stat} ${t?.on_hold ? styles.warn : ''}`}><div className={styles.statLabel}>On hold</div><div className={styles.statValue}>{money(c, t?.on_hold)}</div><div className={styles.statSub}>{overview?.open_issue_reports ?? 0} open problem report(s)</div></div>
        <div className={styles.stat}><div className={styles.statLabel}>Being sent</div><div className={styles.statValue}>{money(c, t?.processing)}</div><div className={styles.statSub}>awaiting your reference</div></div>
        <div className={styles.stat}><div className={styles.statLabel}>Paid out</div><div className={styles.statValue}>{money(c, t?.paid)}</div><div className={styles.statSub}>to date</div></div>
      </div>
      {overview?.by_service?.length > 0 && <div className={styles.filters}>{overview.by_service.map((s) => <span key={s.service} className={styles.service}>{s.label}: {money(c, s.due)} due · {money(c, s.paid)} paid</span>)}</div>}
      <div className={styles.services} role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={`${styles.service} ${tab === k ? styles.serviceActive : ''}`} onClick={() => setParams(k === 'ready' ? {} : { tab: k })}>{l}</button>)}</div>
      {tab === 'ready' && <Ready tick={tick} onChanged={refresh} />}
      {tab === 'batches' && <Batches tick={tick} onChanged={refresh} />}
      {tab === 'items' && <Items tick={tick} onChanged={refresh} />}
      {tab === 'issues' && <Issues tick={tick} onChanged={refresh} />}
    </div>
  );
}

function Ready({ tick, onChanged }) {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(''); const [open, setOpen] = useState(null);
  useEffect(() => { apiFetch('/admin/payouts/due').then((b) => { setData(b.data); setError(''); }).catch((e) => setError(e.message)); }, [tick]);
  const create = async (h) => {
    setBusy(h.host_id); setError('');
    try { const b = await apiFetch('/admin/payouts/batches', { method: 'POST', body: JSON.stringify({ host_id: h.host_id, currency: h.currency }) }); setOpen(b.data.id); onChanged(); }
    catch (e) { setError(e.message); } finally { setBusy(''); }
  };
  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      {data?.blocked_items > 0 && <p className={styles.note}>{data.blocked_items} payment(s) are held back automatically because their event is paused or has refund requests waiting.</p>}
      <div className={styles.tableWrap}>
        {!data ? <div className={styles.empty}>Loading…</div> : data.hosts_due.length ? (
          <table className={styles.table}>
            <thead><tr>{['Host', 'What', 'Earned', 'Adjustments', 'To send', 'Oldest due', 'Send to', ''].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr></thead>
            <tbody>{data.hosts_due.map((h) => (
              <tr key={h.host_id + h.currency} className={styles.tr} style={{ cursor: 'default' }}>
                <td className={styles.td}><strong>{h.host_name}</strong><span className={styles.sub}>{h.host_email}{h.verified ? '' : ' · not verified'}</span></td>
                <td className={styles.td}>{h.service_breakdown.map((s) => <span key={s.service} className={styles.sub}>{s.label}: {money(h.currency, s.amount)}</span>)}<span className={styles.sub}>{h.items} item(s)</span></td>
                <td className={styles.td}>{money(h.currency, h.amount)}</td>
                <td className={`${styles.td} ${h.adjustments < 0 ? styles.negative : ''}`}>{h.adjustments ? money(h.currency, h.adjustments) : '—'}</td>
                <td className={`${styles.td} ${styles.amount}`}>{money(h.currency, h.net)}</td>
                <td className={styles.td}>{formatDateTime(h.oldest_release)}</td>
                <td className={styles.td}>{h.destination ? dest(h.destination) : <span className={styles.negative}>No payout details</span>}</td>
                <td className={styles.td}><button className={`${styles.btn} ${styles.btnPrimary}`} disabled={!h.destination || busy === h.host_id} onClick={() => create(h)}>{busy === h.host_id ? 'Preparing…' : 'Prepare payout'}</button></td>
              </tr>))}</tbody>
          </table>) : <div className={styles.empty}>Nothing is due right now. 🎉</div>}
      </div>
      {open && <BatchDrawer id={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); onChanged(); }} />}
    </>
  );
}

function Batches({ tick, onChanged }) {
  const [status, setStatus] = useState(''); const [page, setPage] = useState(1); const [data, setData] = useState(null); const [open, setOpen] = useState(null); const [error, setError] = useState('');
  useEffect(() => { const q = new URLSearchParams({ page, limit: PAGE }); if (status) q.set('status', status); apiFetch(`/admin/payouts/batches?${q}`).then((b) => { setData(b.data); setError(''); }).catch((e) => setError(e.message)); }, [status, page, tick]);
  useEffect(() => setPage(1), [status]);
  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.filters}>{['', 'processing', 'paid', 'failed'].map((s) => <button key={s} className={`${styles.service} ${status === s ? styles.serviceActive : ''}`} onClick={() => setStatus(s)}>{s ? s[0].toUpperCase() + s.slice(1) : 'All'}</button>)}</div>
      <div className={styles.tableWrap}>
        {!data ? <div className={styles.empty}>Loading…</div> : data.data.length ? <table className={styles.table}>
          <thead><tr>{['Host', 'Amount', 'Sent to', 'Status', 'Reference', 'Created', 'Paid'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr></thead>
          <tbody>{data.data.map((b) => <tr key={b.id} className={styles.tr} onClick={() => setOpen(b.id)}>
            <td className={styles.td}><strong>{b.host_name || '—'}</strong></td><td className={`${styles.td} ${styles.amount}`}>{money(b.currency, b.amount)}</td>
            <td className={styles.td}>{dest(b.destination)}</td><td className={styles.td}><Badge tone={b.status === 'paid' ? 'processed' : b.status === 'failed' ? 'failed' : 'processing'}>{b.status}</Badge></td>
            <td className={styles.td}>{b.reference || '—'}</td><td className={styles.td}>{formatDateTime(b.created_at)}</td><td className={styles.td}>{formatDateTime(b.paid_at)}</td></tr>)}</tbody>
        </table> : <div className={styles.empty}>No payouts yet.</div>}
      </div>
      {data && <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(data.total / PAGE))} totalItems={data.total} itemsPerPage={PAGE} onPageChange={setPage} />}
      {open && <BatchDrawer id={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); onChanged(); }} />}
    </>
  );
}

function BatchDrawer({ id, onClose, onChanged }) {
  const [d, setD] = useState(null); const [reference, setReference] = useState(''); const [note, setNote] = useState(''); const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  useEffect(() => { apiFetch(`/admin/payouts/batches/${id}`).then((b) => setD(b.data)).catch((e) => setError(e.message)); }, [id]);
  const act = async (action, body, ok, msg) => {
    if (!ok) { setError(msg); return; }
    setBusy(action); setError('');
    try { await apiFetch(`/admin/payouts/batches/${id}/${action}`, { method: 'POST', body: JSON.stringify(body) }); onChanged(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  };
  const b = d?.batch; const c = b?.currency;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()} aria-label="Payout">
        <div className={styles.drawerHeader}><h2 className={styles.drawerTitle}>Payout · {b ? money(c, b.amount) : '…'}</h2><button className={styles.close} onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className={styles.drawerBody}>
          {!d ? <div className={styles.empty}>{error || 'Loading…'}</div> : <>
            <div className={styles.section}>
              <h4>Send the money to</h4>
              <p className={styles.note} style={{ fontWeight: 600, color: 'var(--color-text-base)' }}>{dest(b.destination)}</p>
              <Row label="Status" value={<Badge tone={b.status === 'paid' ? 'processed' : b.status === 'failed' ? 'failed' : 'processing'}>{b.status}</Badge>} />
              <Row label="Earnings" value={money(c, b.items_total)} />
              {Number(b.adjustments_total) !== 0 && <Row label="Refund adjustments" value={money(c, b.adjustments_total)} />}
              <Row label="Amount to send" value={money(c, b.amount)} total />
              {b.reference && <Row label="Reference" value={b.reference} />}{b.paid_at && <Row label="Paid" value={formatDateTime(b.paid_at)} />}
              {b.failure_reason && <p className={styles.note}>Failed: {b.failure_reason}</p>}
            </div>
            <div className={styles.section}>
              <h4>What this covers</h4>
              {d.items.map((i) => <Row key={i.id} label={`${i.service_label} · ${i.title}${i.detail ? ` (${i.detail})` : ''}`} value={money(c, i.amount)} />)}
              {d.adjustments.map((a) => <Row key={a.id} label={`Adjustment · ${a.reason}`} value={money(c, a.amount)} />)}
            </div>
            {b.status === 'processing' && <div className={styles.section}>
              <h4>After you've sent it</h4>
              <div className={styles.form}>
                <label className={styles.label}>Transfer / MoMo reference<input className={styles.input} value={reference} onChange={(e) => setReference(e.target.value)} /></label>
                <label className={styles.label}>Note <input className={styles.input} value={note} onChange={(e) => setNote(e.target.value)} /></label>
                <label className={styles.label}>If it failed, why?<input className={styles.input} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. account name mismatch" /></label>
              </div>
            </div>}
            {error && <div className={styles.error}>{error}</div>}
          </>}
        </div>
        {b?.status === 'processing' && <div className={styles.drawerFooter}>
          <button className={`${styles.btn} ${styles.btnSuccess}`} disabled={!!busy} onClick={() => act('paid', { reference, note }, reference.trim(), 'Enter the payment reference.')}>{busy === 'paid' ? 'Saving…' : 'Mark as paid'}</button>
          <button className={`${styles.btn} ${styles.btnDanger}`} disabled={!!busy} onClick={() => act('failed', { reason }, reason.trim(), 'Say what went wrong.')}>Mark as failed (release items)</button>
        </div>}
      </aside>
    </div>
  );
}

function Items({ tick, onChanged }) {
  const [bucket, setBucket] = useState(''); const [page, setPage] = useState(1); const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { const q = new URLSearchParams({ page, limit: PAGE }); if (bucket) q.set('bucket', bucket); apiFetch(`/admin/payouts/items?${q}`).then((b) => { setData(b.data); setError(''); }).catch((e) => setError(e.message)); }, [bucket, page, tick]);
  useEffect(() => setPage(1), [bucket]);
  const hold = async (i) => { const reason = window.prompt('Why hold this payment? The host will see it.'); if (!reason) return; try { await apiFetch(`/admin/payouts/items/${i.id}/hold`, { method: 'POST', body: JSON.stringify({ reason }) }); onChanged(); } catch (e) { setError(e.message); } };
  const release = async (i) => { try { await apiFetch(`/admin/payouts/items/${i.id}/release`, { method: 'POST' }); onChanged(); } catch (e) { setError(e.message); } };
  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.filters}>{BUCKETS.map((s) => <button key={s} className={`${styles.service} ${bucket === s ? styles.serviceActive : ''}`} onClick={() => setBucket(s)}>{BUCKET[s]}</button>)}</div>
      <div className={styles.tableWrap}>
        {!data ? <div className={styles.empty}>Loading…</div> : data.data.length ? <table className={styles.table}>
          <thead><tr>{['What', 'Host', 'Service', 'Host gets', 'Lotnis fee', 'Status', 'Releases', ''].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr></thead>
          <tbody>{data.data.map((i) => <tr key={i.id} className={styles.tr} style={{ cursor: 'default' }}>
            <td className={styles.td}><strong>{i.title}</strong><span className={styles.sub}>{i.detail}</span></td><td className={styles.td}>{i.host_name || '—'}</td><td className={styles.td}>{i.service_label}</td>
            <td className={`${styles.td} ${styles.amount}`}>{money(i.currency, i.amount)}</td><td className={styles.td}>{money(i.currency, i.commission)}</td>
            <td className={styles.td}><Badge tone={i.bucket === 'paid' ? 'processed' : i.bucket === 'on_hold' ? 'failed' : i.bucket === 'due' ? 'pending' : 'processing'}>{BUCKET[i.bucket] || i.status}</Badge>{i.hold_reason && <span className={styles.sub}>{i.hold_reason}</span>}</td>
            <td className={styles.td}>{i.bucket === 'paid' ? formatDateTime(i.paid_at) : formatDateTime(i.release_at)}</td>
            <td className={styles.td}>{i.bucket === 'on_hold' ? <button className={styles.btn} onClick={() => release(i)}>Release</button> : ['awaiting_release', 'due'].includes(i.bucket) ? <button className={styles.btn} onClick={() => hold(i)}>Hold</button> : null}</td></tr>)}</tbody>
        </table> : <div className={styles.empty}>Nothing here.</div>}
      </div>
      {data && <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(data.total / PAGE))} totalItems={data.total} itemsPerPage={PAGE} onPageChange={setPage} />}
    </>
  );
}

function Issues({ tick, onChanged }) {
  const [status, setStatus] = useState('open'); const [rows, setRows] = useState(null); const [open, setOpen] = useState(null); const [error, setError] = useState('');
  useEffect(() => { apiFetch(`/admin/payouts/issues${status !== 'all' ? `?status=${status}` : ''}`).then((b) => { setRows(b.data); setError(''); }).catch((e) => setError(e.message)); }, [status, tick]);
  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.note}>Guests can report a problem from check-in until the host is paid. A report pauses the host's payout until you decide. If the window has closed, guests are told to take it up with the host — Lotnis support still helps.</p>
      <div className={styles.filters}>{['open', 'resolved', 'dismissed', 'all'].map((s) => <button key={s} className={`${styles.service} ${status === s ? styles.serviceActive : ''}`} onClick={() => setStatus(s)} style={{ textTransform: 'capitalize' }}>{s}</button>)}</div>
      <div className={styles.tableWrap}>
        {!rows ? <div className={styles.empty}>Loading…</div> : rows.length ? <table className={styles.table}>
          <thead><tr>{['Stay', 'Guest', 'Problem', 'Status', 'Reported'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className={styles.tr} onClick={() => setOpen(r)}>
            <td className={styles.td}><strong>{r.booking?.property?.name || 'Stay'}</strong><span className={styles.sub}>{r.booking ? `${r.booking.start_date} → ${r.booking.end_date} · ${money(r.booking.currency_snapshot, r.booking.final_amount)}` : ''}</span></td>
            <td className={styles.td}>{[r.reporter?.first_name, r.reporter?.last_name].filter(Boolean).join(' ') || r.reporter?.email}<span className={styles.sub}>{r.reporter?.phone}</span></td>
            <td className={styles.td}><strong style={{ textTransform: 'capitalize' }}>{r.category}</strong><span className={styles.sub}>{r.description.slice(0, 90)}{r.description.length > 90 ? '…' : ''}</span></td>
            <td className={styles.td}><Badge tone={r.status === 'open' ? 'pending' : 'processed'}>{r.status}</Badge></td><td className={styles.td}>{formatDateTime(r.created_at)}</td></tr>)}</tbody>
        </table> : <div className={styles.empty}>No reports.</div>}
      </div>
      {open && <IssueDrawer report={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); onChanged(); }} />}
    </>
  );
}

function IssueDrawer({ report: r, onClose, onChanged }) {
  const [outcome, setOutcome] = useState('resolved'); const [note, setNote] = useState(r.admin_note || ''); const [deduct, setDeduct] = useState('0'); const [release, setRelease] = useState(true);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const c = r.booking?.currency_snapshot;
  const go = async () => {
    if (!note.trim()) { setError('Record what you decided.'); return; }
    setBusy(true); setError('');
    try { await apiFetch(`/admin/payouts/issues/${r.id}/resolve`, { method: 'POST', body: JSON.stringify({ outcome, note, deduct: Number(deduct) || 0, release_hold: release }) }); onChanged(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()} aria-label="Problem report">
        <div className={styles.drawerHeader}><h2 className={styles.drawerTitle}>{r.booking?.property?.name || 'Stay'} · {r.category}</h2><button className={styles.close} onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className={styles.drawerBody}>
          <div className={styles.section}><h4>Report</h4><p className={styles.note}>{r.description}</p>
            {(r.evidence_urls || []).map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" className={styles.sub}>Evidence ↗</a>)}
            <Row label="Guest" value={[r.reporter?.first_name, r.reporter?.last_name].filter(Boolean).join(' ') || r.reporter?.email} /><Row label="Stay paid" value={money(c, r.booking?.final_amount)} /><Row label="Reported" value={formatDateTime(r.created_at)} /></div>
          {r.status === 'open' ? <div className={styles.section}><h4>Your decision</h4><div className={styles.form}>
            <label className={styles.label}>Outcome<select className={styles.input} value={outcome} onChange={(e) => setOutcome(e.target.value)}><option value="resolved">Valid — resolved</option><option value="dismissed">Not valid — dismissed</option></select></label>
            <label className={styles.label}>Keep back from the host ({c}) to compensate the guest<input className={styles.input} type="number" min="0" step="0.01" value={deduct} onChange={(e) => setDeduct(e.target.value)} /></label>
            <label className={styles.label}>Note (the guest sees this)<textarea className={styles.input} rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></label>
            <label className={styles.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={release} onChange={(e) => setRelease(e.target.checked)} /> Release the host's payout hold</label>
            {error && <div className={styles.error}>{error}</div>}</div></div>
            : <div className={styles.section}><h4>Decision</h4><Row label="Outcome" value={r.status} /><p className={styles.note}>{r.admin_note}</p></div>}
        </div>
        {r.status === 'open' && <div className={styles.drawerFooter}><button className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={go}>{busy ? 'Saving…' : 'Save decision'}</button></div>}
      </aside>
    </div>
  );
}
