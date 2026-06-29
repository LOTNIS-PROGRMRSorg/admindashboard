import { Download, RefreshCw } from 'lucide-react';
import styles from './AnalyticsHeader.module.css';

export default function AnalyticsHeader({ dateRange, setDateRange, onExport, onRefresh, isLoading }) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Platform Analytics</h1>
        <p className={styles.subtitle}>Monitor booking trends, revenue growth, and user activity.</p>
      </div>

      <div className={styles.controlsArea}>
        <select 
          className={styles.select}
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          disabled={isLoading}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="180">Last 6 Months</option>
          <option value="365">Last 12 Months</option>
        </select>

        <button className={`${styles.btn} ${styles.btnExport}`} onClick={onExport} disabled={isLoading}>
          <Download size={16} />
          Export
        </button>

        <button className={`${styles.btn} ${styles.btnRefresh}`} onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
          Refresh
        </button>
      </div>
    </div>
  );
}
