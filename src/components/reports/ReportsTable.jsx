import { Eye, SearchX } from 'lucide-react';
import styles from './ReportsTable.module.css';
import { CategoryBadge, ReportStatusBadge, PriorityBadge } from './Badges';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

export default function ReportsTable({ data, onViewDetails, hasActiveFilters, onClearFilters }) {
  if (!data.length) {
    return (
      <div className={styles.emptyState}>
        <SearchX size={32} className={styles.emptyIcon} />
        <h3>{hasActiveFilters ? 'No reports match these filters' : 'No reports in the sample data'}</h3>
        <p>{hasActiveFilters ? 'Try a different search or clear the selected filters.' : 'Report records will appear here when sample data is added.'}</p>
        {hasActiveFilters && <button type="button" className={styles.clearButton} onClick={onClearFilters}>Clear filters</button>}
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead><tr>
          <th scope="col">Report</th><th scope="col">Category</th><th scope="col">Reporter / entity</th>
          <th scope="col">Submitted</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Details</th>
        </tr></thead>
        <tbody>
          {data.map((report) => (
            <tr key={report.id} className={styles.row}>
              <td className={styles.idCell}>{report.id}</td>
              <td><CategoryBadge category={report.category} /></td>
              <td><div className={styles.entityCell}><span className={styles.reporterName}>{report.reporterName}</span><span className={styles.reportedEntity}>About: {report.reportedEntity}</span></div></td>
              <td className={styles.dateCell}>{formatDate(report.submittedDate)}</td>
              <td><PriorityBadge priority={report.priority} /></td>
              <td><ReportStatusBadge status={report.status} /></td>
              <td><button type="button" className={styles.viewButton} onClick={() => onViewDetails(report)} aria-label={`View report ${report.id}`}><Eye size={15} /> View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
