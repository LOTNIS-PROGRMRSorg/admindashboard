import { Download, RefreshCw } from 'lucide-react';
import styles from './AnalyticsHeader.module.css';

export default function AnalyticsHeader({ dateRange, setDateRange, onExport, onRefresh, exportCount }) {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.titleArea}>
        <p className={styles.eyebrow}>PERFORMANCE OVERVIEW</p>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>Explore booking activity and property performance in the sample records.</p>
      </div>

      <div className={styles.controlsArea}>
        <label className={styles.visuallyHidden} htmlFor="analytics-date-range">Select analytics date range</label>
        <select id="analytics-date-range" className={styles.select} value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="6m">Last 6 months</option>
          <option value="12m">Last 12 months</option>
        </select>
        <button type="button" className={`${styles.btn} ${styles.btnExport}`} onClick={onExport} disabled={!exportCount}>
          <Download size={16} /> Export CSV <span className={styles.count}>({exportCount})</span>
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnRefresh}`} onClick={onRefresh} title="Recalculate metrics from the local sample records">
          <RefreshCw size={16} /> Recalculate
        </button>
      </div>
    </header>
  );
}
