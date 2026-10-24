import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import { formatDateTime, money } from '../lib/format';
import users from './Users.module.css';
import styles from './Refunds.module.css';

// Admin view of the Events line: review/approve events, see every number for any event,
// and work the refund queue (approve → send the money → record the reference).

const EVENT_STATUSES = ['pending_review', 'published', 'all', 'draft', 'rejected', 'suspended', 'cancelled'];
const LABEL = { pending_review: 'In review', published: 'On sale', all: 'All', draft: 'Draft', rejected: 'Rejected', suspended: 'Suspended', cancelled: 'Cancelled' };
const PAGE_SIZE = 15;

const Row = ({ label, value, total }) => (
  <div className={`${styles.row} ${total ? styles.rowTotal : ''}`}><span>{label}</span><span>{value}</span></div>
);
const Badge = ({ tone, children }) => <span className={`${styles.badge} ${styles[tone] || ''}`}>{children}</span>;
const tone = (s) => ({ published: 'processed', pending_review: 'pending', approved: 'processing', processed: 'processed', pending: 'pending', rejected: 'failed', failed: 'failed', cancelled: 'failed', suspended: 'failed', draft: '' }[s] || '');

export default function Events() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'refunds' ? 'refunds' : 'events';
  return (
    <div className={users.page}>
      <div className={users.header}>
        <h1 className={users.title}>Events</h1>
        <p className={users.subtitle}>New hosts' first events are approved here; trusted hosts publish automatically. Every sale, scan, vote and refund across all events is visible below.</p>
      </div>
      <div className={styles.services} role="tablist">
        <button role="tab" aria-selected={tab === 'events'} className={`${styles.service} ${tab === 'events' ? styles.serviceActive : ''}`} onClick={() => setParams({})}>Events</button>
        <button role="tab" aria-selected={tab === 'refunds'} className={`${styles.service} ${tab === 'refunds' ? styles.serviceActive : ''}`} onClick={() => setParams({ tab: 'refunds' })}>Event refunds</button>
      </div>
      {tab === 'events' ? <EventList /> : <EventRefunds />}
    </div>
  );
}

function EventList() {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('pending_review');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: PAGE_SIZE });
    if (status !== 'all') q.set('status', status);
    if (query.trim()) q.set('query', query.trim());
    Promise.all([apiFetch(`/admin/events?${q}`), apiFetch('/admin/events/summary')])
      .then(([list, s]) => { setRows(list.data?.data || []); setTotal(list.data?.total || 0); setSummary(s.data); setError(''); })
      .catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [status, page, query]);
  useEffect(() => { const t = setTimeout(load, query ? 250 : 0); return () => clearTimeout(t); }, [load, query]);
  useEffect(() => setPage(1), [status, query]);

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${summary?.pending_review ? styles.warn : ''}`}><div className={styles.statLabel}>Waiting for review</div><div className={styles.statValue}>{summary?.pending_review ?? '—'}</div><div className={styles.statSub}>{summary?.live ?? 0} on sale now</div></div>
        <div className={styles.stat}><div className={styles.statLabel}>Tickets sold</div><div className={styles.statValue}>{summary?.tickets_sold?.toLocaleString() ?? '—'}</div><div className={styles.statSub}>{summary?.events_total ?? 0} events</div></div>
        <div className={styles.stat}><div className={styles.statLabel}>Ticket sales</div><div className={styles.statValue}>{money('GHS', summary?.ticket_gross)}</div><div className={styles.statSub}>votes {money('GHS', summary?.vote_gross)}</div></div>
        <div className={styles.stat}><div className={styles.statLabel}>Lotnis commission</div><div className={styles.statValue}>{money('GHS', summary?.commission)}</div><div className={styles.statSub}>{money('GHS', summary?.refunded)} refunded</div></div>
        <div className={`${styles.stat} ${summary?.refund_requests_pending ? styles.warn : ''}`}><div className={styles.statLabel}>Refund requests</div><div className={styles.statValue}>{summary?.refund_requests_pending ?? '—'}</div><div className={styles.statSub}>waiting</div></div>
      </div>
      <div className={styles.filters}>
        {EVENT_STATUSES.map((s) => <button key={s} className={`${styles.service} ${status === s ? styles.serviceActive : ''}`} onClick={() => setStatus(s)}>{LABEL[s]}{summary?.by_status?.[s] ? ` (${summary.by_status[s]})` : ''}</button>)}
        <input className={styles.input} placeholder="Search title, city, venue" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginLeft: 'auto', minWidth: 240 }} />
      </div>
      <div className={styles.tableWrap}>
        {loading && !rows.length ? <div className={styles.empty}>Loading…</div> : rows.length ? (
          <table className={styles.table}>
            <thead><tr>{['Event', 'Host', 'When', 'Status', 'Sold / scanned', 'Sales', 'Commission', 'Refund requests'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((e) => (
              <tr key={e.id} className={styles.tr} onClick={() => setSelected(e)}>
                <td className={styles.td}><strong>{e.title}</strong><span className={styles.sub}>{e.venue_name}, {e.city}</span></td>
                <td className={styles.td}>{e.host_name || '—'}</td>
                <td className={styles.td}>{formatDateTime(e.starts_at)}</td>
                <td className={styles.td}><Badge tone={tone(e.status)}>{LABEL[e.status] || e.status}</Badge></td>
                <td className={styles.td}>{e.stats.tickets_sold} / {e.stats.tickets_scanned}</td>
                <td className={`${styles.td} ${styles.amount}`}>{money(e.currency, e.stats.gross)}</td>
                <td className={styles.td}>{money(e.currency, e.stats.commission)}</td>
                <td className={styles.td}>{e.stats.refund_requests_pending || '—'}</td>
              </tr>))}</tbody>
          </table>) : <div className={styles.empty}>{status === 'pending_review' ? 'No events are waiting for review.' : 'No events match.'}</div>}
      </div>
      <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} totalItems={total} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
      {selected && <EventDrawer key={selected.id} event={selected} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); load(); }} />}
    </>
  );
}

function EventDrawer({ event, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    apiFetch(`/admin/events/${event.id}`).then((b) => setData(b.data)).catch((e) => setError(e.message));
    apiFetch(`/admin/events/${event.id}/orders?limit=10`).then((b) => setOrders(b.data?.data || [])).catch(() => {});
  }, [event.id]);
  const act = async (action, needsReason) => {
    if (needsReason && !reason.trim()) { setError('Add a reason — the host will see it.'); return; }
    if (action === 'cancel' && !window.confirm('Cancel this event and refund every buyer in full? This cannot be undone.')) return;
    setBusy(action); setError('');
    try { await apiFetch(`/admin/events/${event.id}/${action}`, { method: 'POST', body: JSON.stringify({ reason: reason.trim() || undefined }) }); onChanged(); }
    catch (e) { setError(e.message); } finally { setBusy(''); }
  };
  const ev = data?.event || event; const s = data?.stats; const c = ev.currency; const p = data?.payout;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()} aria-label="Event details">
        <div className={styles.drawerHeader}><h2 className={styles.drawerTitle}>{ev.title}</h2><button className={styles.close} onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className={styles.drawerBody}>
          <div className={styles.section}>
            <h4>Event</h4>
            <Row label="Status" value={<Badge tone={tone(ev.status)}>{LABEL[ev.status] || ev.status}</Badge>} />
            <Row label="Host" value={data?.host ? `${data.host.name}${data.host.verified ? ' ✓' : ''}` : event.host_name || '—'} />
            <Row label="When" value={`${formatDateTime(ev.starts_at)} → ${formatDateTime(ev.ends_at)}`} />
            <Row label="Where" value={`${ev.venue_name}, ${ev.city}`} />
            <Row label="Category" value={ev.category} />
            <Row label="Lotnis fee" value={ev.fee_mode === 'on_top' ? 'Added on top for buyers' : 'Included in the price'} />
            <Row label="Refund policy" value={ev.refund_policy === 'none' ? 'No refunds' : (ev.refund_tiers || []).map((t) => `${t.days_before}d+ → ${t.percent}%`).join(', ')} />
            <Row label="If postponed" value={{ carry_over: 'Tickets carry over', carry_over_or_refund: `Carry over, refund within ${ev.postponement_refund_days}d`, refund_all: 'Refund everyone' }[ev.postponement_policy]} />
            {ev.voting_enabled && <Row label="Voting" value={`${formatDateTime(ev.voting_opens_at)} → ${formatDateTime(ev.voting_closes_at)}`} />}
            {ev.rejection_reason && <p className={styles.note}>{ev.status === 'suspended' ? 'Paused' : 'Rejected'}: {ev.rejection_reason}</p>}
            {ev.cancellation_reason && <p className={styles.note}>Cancelled: {ev.cancellation_reason}</p>}
          </div>
          <div className={styles.section}><h4>About</h4><p className={styles.note} style={{ whiteSpace: 'pre-line' }}>{ev.description}</p></div>
          {s && <>
            <div className={styles.section}>
              <h4>Sales</h4>
              <Row label="Tickets sold" value={`${s.tickets_sold} (${s.tickets_scanned} scanned, ${s.tickets_refunded} refunded)`} />
              <Row label="Ticket sales" value={money(c, s.ticket_gross)} />
              <Row label="Votes" value={`${s.votes_total.toLocaleString()} · ${money(c, s.vote_gross)}`} />
              <Row label="Lotnis commission" value={money(c, s.ticket_commission + s.vote_commission)} />
              <Row label="Host receives" value={money(c, s.ticket_host_net + s.vote_host_net)} total />
              <Row label="Refunded" value={money(c, s.refunded_amount)} />
              <Row label="Reviews" value={s.review_count ? `${s.review_average} ★ (${s.review_count})` : '—'} />
            </div>
            <div className={styles.section}>
              <h4>By ticket</h4>
              {s.by_ticket_type.map((t) => <Row key={t.id} label={`${t.name} · ${money(c, t.price)}`} value={`${t.sold}${t.quantity != null ? ` / ${t.quantity}` : ''} sold · ${t.scanned} in`} />)}
              {s.by_gate.map((g) => <Row key={g.id} label={`Gate: ${g.name}`} value={`${g.admitted} in · ${g.rejected} rejected`} />)}
            </div>
            {p && <div className={styles.section}>
              <h4>Payout</h4>
              <Row label="Waiting for release" value={money(c, p.awaiting_release)} /><Row label="Ready to send" value={money(c, p.due)} /><Row label="On hold" value={money(c, p.on_hold)} /><Row label="Paid" value={money(c, p.paid)} />
            </div>}
          </>}
          {orders.length > 0 && <div className={styles.section}><h4>Latest orders</h4>{orders.map((o) => <Row key={o.id} label={`${o.buyer_email} · ${o.kind}`} value={`${money(o.currency, o.subtotal + o.service_fee)} · ${o.status.replace('_', ' ')}`} />)}</div>}
          <div className={styles.section}>
            <h4>Decision</h4>
            <label className={styles.label}>Reason (required to reject, suspend or cancel)<textarea className={styles.input} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
            {error && <div className={styles.error}>{error}</div>}
          </div>
        </div>
        <div className={styles.drawerFooter}>
          {ev.status === 'pending_review' && <><button className={`${styles.btn} ${styles.btnSuccess}`} disabled={!!busy} onClick={() => act('approve')}>{busy === 'approve' ? 'Approving…' : 'Approve & publish'}</button><button className={`${styles.btn} ${styles.btnDanger}`} disabled={!!busy} onClick={() => act('reject', true)}>Reject</button></>}
          {ev.status === 'published' && <button className={`${styles.btn} ${styles.btnDanger}`} disabled={!!busy} onClick={() => act('suspend', true)}>Pause sales</button>}
          {ev.status === 'suspended' && <button className={`${styles.btn} ${styles.btnSuccess}`} disabled={!!busy} onClick={() => act('unsuspend')}>Resume sales</button>}
          {['published', 'suspended'].includes(ev.status) && <button className={`${styles.btn} ${styles.btnDanger}`} disabled={!!busy} onClick={() => act('cancel', true)}>Cancel & refund all</button>}
        </div>
      </aside>
    </div>
  );
}

// ── Event refunds ─────────────────────────────────────────────────────────────

const REFUND_STATUSES = ['pending', 'approved', 'processed', 'rejected', 'all'];
const METHODS = ['Paystack refund', 'Mobile money', 'Bank transfer', 'Other'];
const TRIGGER = { buyer_request: 'Buyer request', event_cancelled: 'Event cancelled', event_postponed: 'Postponed (refund all)', voting_cancelled: 'Voting cancelled', admin: 'Admin / system' };

function EventRefunds() {
  const [status, setStatus] = useState('pending');
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    const q = new URLSearchParams({ page, limit: PAGE_SIZE }); if (status !== 'all') q.set('status', status);
    Promise.all([apiFetch(`/admin/events/refunds?${q}`), apiFetch('/admin/events/refunds/summary')])
      .then(([l, s]) => { setRows(l.data?.data || []); setTotal(l.data?.total || 0); setSummary(s.data); setError(''); }).catch((e) => setError(e.message));
  }, [status, page]);
  useEffect(load, [load]);
  useEffect(() => setPage(1), [status]);
  const c = summary?.currency || 'GHS';
  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${summary?.pending.count ? styles.warn : ''}`}><div className={styles.statLabel}>To decide</div><div className={styles.statValue}>{summary?.pending.count ?? '—'}</div><div className={styles.statSub}>{money(c, summary?.pending.amount)}</div></div>
        <div className={`${styles.stat} ${summary?.approved.count ? styles.warn : ''}`}><div className={styles.statLabel}>Approved — money to send</div><div className={styles.statValue}>{summary?.approved.count ?? '—'}</div><div className={styles.statSub}>{money(c, summary?.approved.amount)}</div></div>
        <div className={styles.stat}><div className={styles.statLabel}>Refunded to date</div><div className={styles.statValue}>{money(c, summary?.processed.amount)}</div><div className={styles.statSub}>{summary?.processed.count ?? 0} refund(s) · {money(c, summary?.outstanding_amount)} still owed</div></div>
      </div>
      <div className={styles.filters}>{REFUND_STATUSES.map((s) => <button key={s} className={`${styles.service} ${status === s ? styles.serviceActive : ''}`} onClick={() => setStatus(s)} style={{ textTransform: 'capitalize' }}>{s}</button>)}</div>
      <div className={styles.tableWrap}>
        {rows.length ? <table className={styles.table}>
          <thead><tr>{['Event', 'Buyer', 'Why', 'Refund', 'Tickets', 'Status', 'Requested'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id} className={styles.tr} onClick={() => setSelected(r)}>
              <td className={styles.td}><strong>{r.event?.title}</strong><span className={styles.sub}>{r.event && formatDateTime(r.event.starts_at)}</span></td>
              <td className={styles.td}>{r.requester_email || r.order?.buyer_email}</td>
              <td className={styles.td}>{TRIGGER[r.trigger] || r.trigger}<span className={styles.sub}>{Number(r.refund_percent)}%{r.reason ? ` · “${r.reason}”` : ''}</span></td>
              <td className={`${styles.td} ${styles.amount}`}>{money(r.currency, r.amount)}</td>
              <td className={styles.td}>{r.ticket_ids?.length || (r.order?.kind === 'vote' ? 'votes' : '—')}</td>
              <td className={styles.td}><Badge tone={tone(r.status)}>{r.status}</Badge></td>
              <td className={styles.td}>{formatDateTime(r.created_at)}</td>
            </tr>))}</tbody>
        </table> : <div className={styles.empty}>{status === 'pending' ? 'No refund requests are waiting.' : 'Nothing here.'}</div>}
      </div>
      <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} totalItems={total} itemsPerPage={PAGE_SIZE} onPageChange={setPage} />
      {selected && <RefundDrawer key={selected.id} request={selected} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); load(); }} />}
    </>
  );
}

function RefundDrawer({ request: r, onClose, onChanged }) {
  const [note, setNote] = useState(r.admin_note || '');
  const [method, setMethod] = useState(r.refund_method || METHODS[0]);
  const [reference, setReference] = useState(r.refund_reference || '');
  const [busy, setBusy] = useState(''); const [error, setError] = useState('');
  const call = async (action, body, needs) => {
    if (needs && !needs.ok) { setError(needs.msg); return; }
    setBusy(action); setError('');
    try { await apiFetch(`/admin/events/refunds/${r.id}/${action}`, { method: 'POST', body: JSON.stringify(body) }); onChanged(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  };
  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()} aria-label="Refund request">
        <div className={styles.drawerHeader}><h2 className={styles.drawerTitle}>Refund · {money(r.currency, r.amount)}</h2><button className={styles.close} onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className={styles.drawerBody}>
          <div className={styles.section}>
            <h4>Request</h4>
            <Row label="Status" value={<Badge tone={tone(r.status)}>{r.status}</Badge>} />
            <Row label="Event" value={r.event?.title} />
            <Row label="Buyer" value={r.requester_email || r.order?.buyer_email} />
            <Row label="Reason" value={TRIGGER[r.trigger] || r.trigger} />
            <Row label="Refund" value={`${Number(r.refund_percent)}% of what was paid for ${r.ticket_ids?.length || 'the'} ticket(s)`} />
            <Row label="Amount" value={money(r.currency, r.amount)} total />
            {r.reason && <p className={styles.note}>Buyer says: “{r.reason}”</p>}
            <p className={styles.note}>The payment-processing fee ({money(r.currency, r.order?.processing_fee)}) is not refundable. The host's payout is reduced by their share automatically when you approve.</p>
          </div>
          {r.status === 'pending' && <div className={styles.section}><h4>Decision</h4><label className={styles.label}>Note to the buyer (required to decline)<textarea className={styles.input} rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></label></div>}
          {['approved', 'failed'].includes(r.status) && <div className={styles.section}>
            <h4>Record the refund you sent</h4>
            <div className={styles.form}>
              <label className={styles.label}>Method<select className={styles.input} value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></label>
              <label className={styles.label}>Payment reference<input className={styles.input} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Paystack refund ID or MoMo transaction ID" /></label>
            </div>
            <p className={styles.note}>The tickets are already cancelled — they scan as REFUNDED.</p>
          </div>}
          {r.status === 'processed' && <div className={styles.section}><h4>Sent</h4><Row label="Method" value={r.refund_method || '—'} /><Row label="Reference" value={r.refund_reference} /><Row label="When" value={formatDateTime(r.processed_at)} /></div>}
          {error && <div className={styles.error}>{error}</div>}
        </div>
        <div className={styles.drawerFooter}>
          {r.status === 'pending' && <><button className={`${styles.btn} ${styles.btnSuccess}`} disabled={!!busy} onClick={() => call('approve', { note })}>{busy === 'approve' ? 'Approving…' : 'Approve (cancels the tickets)'}</button>
            <button className={`${styles.btn} ${styles.btnDanger}`} disabled={!!busy} onClick={() => call('reject', { note }, { ok: !!note.trim(), msg: 'Tell the buyer why it was declined.' })}>Decline</button></>}
          {['approved', 'failed'].includes(r.status) && <button className={`${styles.btn} ${styles.btnSuccess}`} disabled={!!busy} onClick={() => call('processed', { method, reference }, { ok: !!reference.trim(), msg: 'Enter the payment reference.' })}>{busy === 'processed' ? 'Saving…' : 'Mark as refunded'}</button>}
        </div>
      </aside>
    </div>
  );
}
