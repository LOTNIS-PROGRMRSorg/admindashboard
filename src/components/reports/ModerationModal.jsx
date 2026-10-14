import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './ModerationModal.module.css';
import { CategoryBadge, ReportStatusBadge, PriorityBadge } from './Badges';
import ModerationTimeline from './ModerationTimeline';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

export default function ModerationModal({ report, timelineEvents, onClose, onAction }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  if (!report) return null;

  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.modal} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="report-detail-title" tabIndex={-1}>
        <header className={styles.header}>
          <div><h2 className={styles.title} id="report-detail-title">Report details</h2><p className={styles.subtitle}>Sample record · {report.id}</p></div>
          <button type="button" className={styles.closeBtn} ref={closeButtonRef} onClick={onClose} aria-label="Close report details"><X size={19} /></button>
        </header>

        <div className={styles.body}>
          <div className={styles.badges}><CategoryBadge category={report.category} /><PriorityBadge priority={report.priority} /><ReportStatusBadge status={report.status} /></div>
          <dl className={styles.grid}>
            <div className={styles.field}><dt className={styles.label}>Reporter</dt><dd className={styles.value}>{report.reporterName}</dd></div>
            <div className={styles.field}><dt className={styles.label}>Reported entity</dt><dd className={styles.value}>{report.reportedEntity}</dd></div>
            <div className={styles.field}><dt className={styles.label}>Date submitted (UTC)</dt><dd className={styles.value}>{formatDate(report.submittedDate)}</dd></div>
            <div className={styles.field}><dt className={styles.label}>Assigned moderator</dt><dd className={styles.value}>{report.assignedModerator || 'Not specified'}</dd></div>
          </dl>

          <section className={styles.section}><h3 className={styles.label}>Reason for report</h3><div className={styles.textBox}>{report.reportReason || 'No reason is recorded in this sample.'}</div></section>
          <section className={styles.section}><h3 className={styles.label}>Moderator notes</h3><div className={styles.textBox}>{report.notes || 'No notes are recorded in this sample.'}</div></section>
          <section className={styles.section}>
            <h3 className={styles.label}>Sample moderation timeline</h3>
            <ModerationTimeline events={timelineEvents} />
          </section>
          <p className={styles.prototypeNote}>Status actions update this local sample record only. User contact, investigation, and enforcement are unavailable here.</p>
        </div>

        <footer className={styles.footer}>
          {report.status === 'Resolved' || report.status === 'Closed' ? (
            <button type="button" className={`${styles.button} ${styles.btnPrimary}`} onClick={() => onAction('reopen', report.id)}>Reopen report</button>
          ) : (
            <>
              <button type="button" className={`${styles.button} ${styles.btnSecondary}`} onClick={() => onAction('dismiss', report.id)}>Close report</button>
              <button type="button" className={`${styles.button} ${styles.btnPrimary}`} onClick={() => onAction('resolve', report.id)}>Mark resolved</button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
