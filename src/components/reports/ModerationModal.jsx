import styles from './ModerationModal.module.css';
import { CategoryBadge, ReportStatusBadge, PriorityBadge } from './Badges';
import ModerationTimeline from './ModerationTimeline';

export default function ModerationModal({ report, timelineEvents, onClose, onAction }) {
  if (!report) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Report Details</h2>
            <p className={styles.subtitle}>ID: {report.id}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <div className={styles.badges}>
              <CategoryBadge category={report.category} />
              <PriorityBadge priority={report.priority} />
              <ReportStatusBadge status={report.status} />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>Reporter</span>
              <p className={styles.value}>{report.reporterName}</p>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Reported Entity</span>
              <p className={styles.value}>{report.reportedEntity}</p>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Date Submitted</span>
              <p className={styles.value}>{new Date(report.submittedDate).toLocaleString()}</p>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Assigned To</span>
              <p className={styles.value}>{report.assignedModerator}</p>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Reason for Report</span>
            <div className={styles.textBox}>{report.reportReason}</div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Moderator Notes</span>
            <div className={styles.textBox}>{report.notes || 'No notes added yet.'}</div>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Moderation Activity Timeline</span>
            <ModerationTimeline events={timelineEvents} />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <button 
              className={`${styles.button} ${styles.btnDanger}`}
              onClick={() => onAction('suspend', report.id)}
            >
              Suspend User/Listing
            </button>
            <div className={styles.rightActions}>
              <button 
                className={`${styles.button} ${styles.btnSecondary}`}
                onClick={() => onAction('dismiss', report.id)}
              >
                Dismiss
              </button>
              <button 
                className={`${styles.button} ${styles.btnPrimary}`}
                onClick={() => onAction('resolve', report.id)}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
