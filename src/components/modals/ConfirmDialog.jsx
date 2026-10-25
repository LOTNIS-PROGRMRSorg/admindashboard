import { useState } from 'react';
import Modal from './Modal';
import { Button, Notice } from '../ui';
import styles from '../ui/ui.module.css';

export default function ConfirmDialog({ title, children, confirmLabel = 'Confirm', danger, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const go = async () => { setBusy(true); setError(''); try { await onConfirm(); } catch (e) { setError(e.message || 'Something went wrong'); setBusy(false); } };
  return (
    <Modal title={title} onClose={onClose}>
      <div className={styles.muted}>{children}</div>
      {error && <Notice tone="danger">{error}</Notice>}
      <div className={styles.rowEnd}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} disabled={busy} onClick={go}>{busy ? 'Working…' : confirmLabel}</Button>
      </div>
    </Modal>
  );
}
