import { useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { formatDateTime, money } from '../../lib/format';
import styles from '../../pages/Refunds.module.css';

const METHODS = ['Paystack refund', 'Mobile money', 'Bank transfer', 'Other'];
const ROLE_LABEL = { guest: 'The guest', host: 'The host', admin: 'An admin' };

export function RefundStatusBadge({ status }) {
  return <span className={`${styles.badge} ${styles[status] || ''}`}>{status}</span>;
}

function Row({ label, value, negative, total }) {
  return (
    <div className={`${styles.row} ${total ? styles.rowTotal : ''}`}>
      <span>{label}</span>
      <span className={negative ? styles.negative : undefined}>{value}</span>
    </div>
  );
}

export default function RefundDrawer({ refund, onClose, onChanged }) {
  const [method, setMethod] = useState(refund.refund_method || METHODS[0]);
  const [reference, setReference] = useState(refund.refund_reference || '');
  const [note, setNote] = useState(refund.admin_note || '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const c = refund.currency;
  const settled = refund.status === 'processed';
  const retainedProperty = Number(refund.property_amount) - Number(refund.refund_property_amount);

  const act = async (status) => {
    setError('');
    if (status === 'processed' && !reference.trim()) { setError('Enter the payment reference of the refund you sent.'); return; }
    if (status === 'failed' && !note.trim()) { setError('Add a note explaining why the refund failed.'); return; }
    setBusy(status);
    try {
      await apiFetch(`/admin/refunds/${refund.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, method, reference: reference.trim() || undefined, note: note.trim() || undefined }),
      });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()} aria-label="Refund details">
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Refund · {money(c, refund.refund_amount)}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.section}>
            <h4>Booking</h4>
            <Row label="Status" value={<RefundStatusBadge status={refund.status} />} />
            <Row label="Property" value={refund.property_name || '—'} />
            <Row label="Stay" value={refund.booking ? `${refund.booking.start_date} → ${refund.booking.end_date}` : '—'} />
            <Row label="Guest" value={refund.guest_name || '—'} />
            <Row label="Host" value={refund.host_name || '—'} />
            <Row label="Original payment ref" value={refund.payment_reference || '—'} />
          </div>

          <div className={styles.section}>
            <h4>Why this amount</h4>
            <p className={styles.note}>
              {ROLE_LABEL[refund.cancelled_by_role] || 'Someone'} cancelled {refund.days_before_start} day(s) before check-in
              {refund.cancelled_by_role === 'guest'
                ? <> under the host's <strong>{refund.policy_code}</strong> policy → <strong>{Number(refund.refund_percentage)}%</strong> of the stay is refunded. The Lotnis service fee is kept and the security deposit is returned in full.</>
                : <> — the guest is not at fault, so <strong>everything paid, including the service fee</strong>, is refunded.</>}
              {refund.booking?.cancellation_reason && <> Reason given: “{refund.booking.cancellation_reason}”.</>}
            </p>
          </div>

          <div className={styles.section}>
            <h4>Money breakdown</h4>
            <Row label="Guest paid" value={money(c, refund.total_paid)} />
            <Row label={`Stay (${money(c, refund.property_amount)}) × ${Number(refund.refund_percentage)}%`} value={money(c, refund.refund_property_amount)} />
            <Row label="Lotnis service fee" value={Number(refund.refund_fee_amount) > 0 ? money(c, refund.refund_fee_amount) : `${money(c, 0)} (kept)`} />
            <Row label="Security deposit returned" value={money(c, refund.refund_deposit_amount)} />
            <Row label="Refund to guest" value={money(c, refund.refund_amount)} total />
            <Row label={`Host keeps (stay not refunded: ${money(c, retainedProperty)} less commission)`} value={money(c, refund.host_receives)} />
            <Row label="Lotnis keeps" value={money(c, refund.platform_keeps)} />
          </div>

          {settled ? (
            <div className={styles.section}>
              <h4>Refund sent</h4>
              <Row label="Method" value={refund.refund_method || '—'} />
              <Row label="Reference" value={refund.refund_reference || '—'} />
              <Row label="Processed" value={formatDateTime(refund.processed_at)} />
              {refund.admin_note && <p className={styles.note}>{refund.admin_note}</p>}
            </div>
          ) : (
            <div className={styles.section}>
              <h4>Record the refund</h4>
              <div className={styles.form}>
                <label className={styles.label}>Method
                  <select className={styles.input} value={method} onChange={(e) => setMethod(e.target.value)}>
                    {METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label className={styles.label}>Payment reference
                  <input className={styles.input} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. Paystack refund ID or MoMo transaction ID" />
                </label>
                <label className={styles.label}>Note (shown only to admins)
                  <textarea className={styles.input} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </label>
                {error && <div className={styles.error}>{error}</div>}
              </div>
            </div>
          )}
        </div>

        {!settled && (
          <div className={styles.drawerFooter}>
            {refund.status === 'pending' && (
              <button className={styles.btn} disabled={!!busy} onClick={() => act('processing')}>
                {busy === 'processing' ? 'Saving…' : 'Mark as processing'}
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnSuccess}`} disabled={!!busy} onClick={() => act('processed')}>
              {busy === 'processed' ? 'Saving…' : 'Mark as refunded'}
            </button>
            <button className={`${styles.btn} ${styles.btnDanger}`} disabled={!!busy} onClick={() => act('failed')}>
              {busy === 'failed' ? 'Saving…' : 'Mark as failed'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
