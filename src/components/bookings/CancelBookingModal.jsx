import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { money } from '../../lib/format';
import styles from '../users/ConfirmModal.module.css';

// Admin cancellations are always fully refunded (the guest is not at fault)
// and need a recorded reason. The preview comes from the same database
// function the real cancellation runs, so the numbers shown are the numbers applied.
export default function CancelBookingModal({ booking, onClose, onCancelled }) {
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!booking) return;
    setPreview(null); setReason(''); setError('');
    apiFetch(`/admin/bookings/${booking.id}/cancellation-preview`)
      .then(setPreview)
      .catch((err) => setError(err.message));
  }, [booking]);

  if (!booking) return null;

  const confirm = async () => {
    if (!reason.trim()) { setError('A reason is required.'); return; }
    setBusy(true); setError('');
    try {
      const result = await apiFetch(`/admin/bookings/${booking.id}/cancel`, {
        method: 'POST', body: JSON.stringify({ reason: reason.trim() }),
      });
      onCancelled(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${styles.open}`} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}><AlertTriangle size={24} /></div>
        <h3 className={styles.title}>Cancel this booking?</h3>
        <p className={styles.message}>
          {booking.propertyName} · {booking.guestName}<br />
          {booking.checkInDate} → {booking.checkOutDate}
        </p>
        <p className={styles.message}>
          {!preview ? 'Calculating refund…'
            : preview.is_paid
              ? <>The guest has paid and will be refunded <strong>{money(preview.currency, preview.tenant_refund)}</strong> in full (including the service fee), because Lotnis is cancelling. The host's payout for this booking is cancelled.</>
              : 'The guest has not paid, so nothing will be refunded.'}
        </p>
        <textarea
          rows={3}
          placeholder="Reason for cancelling (sent to the guest and host)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', font: 'inherit', background: 'var(--color-bg-surface)', color: 'var(--color-text-base)' }}
        />
        {error && <p className={styles.message} style={{ color: 'var(--color-danger)' }}>{error}</p>}
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>Keep booking</button>
          <button className={`${styles.btn} ${styles.btnConfirm}`} onClick={confirm} disabled={busy || !preview}>
            {busy ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
