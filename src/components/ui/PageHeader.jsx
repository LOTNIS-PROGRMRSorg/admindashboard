import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './ui.module.css';

/** Title row for every page. `back` makes a "← Back to …" link above it (for pages that open from a list). */
export default function PageHeader({ eyebrow, title, subtitle, back, children }) {
  return (
    <>
      {back && <Link to={back.to} className={styles.back}><ArrowLeft size={14} /> {back.label}</Link>}
      <div className={styles.pageHeader}>
        <div>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.pageTitle}>{title}</h1>
          {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
        </div>
        {children && <div className={styles.headerActions}>{children}</div>}
      </div>
    </>
  );
}
