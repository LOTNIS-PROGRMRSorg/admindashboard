import { AlertTriangle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, note, confirmText = 'Delete', isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={24} />
        </div>
        <h3 className={styles.title} id="confirm-modal-title">{title}</h3>
        <p className={styles.message}>{message}</p>
        {note && <p className={styles.note}>{note}</p>}
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button"
            className={`${styles.btn} ${isDanger ? styles.btnConfirm : styles.btnApprove}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
