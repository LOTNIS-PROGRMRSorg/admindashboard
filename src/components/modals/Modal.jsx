import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '../ui/ui.module.css';

/** The one dialog frame in the dashboard: backdrop, title, close button, Esc / click-outside to close. */
export default function Modal({ title, onClose, wide, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`${styles.modal} ${wide ? styles.modalWide : ''}`}>
        <div className={styles.modalHead}><h2>{title}</h2><button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}
