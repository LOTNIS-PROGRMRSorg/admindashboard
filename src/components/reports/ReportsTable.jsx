import React from 'react';
import styles from './ReportsTable.module.css';
import { CategoryBadge, ReportStatusBadge, PriorityBadge } from './Badges';

export default function ReportsTable({ data, onViewDetails }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Reporter / Entity</th>
            <th>Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((report) => (
              <tr key={report.id} className={styles.row}>
                <td className={styles.idCell}>{report.id}</td>
                <td><CategoryBadge category={report.category} /></td>
                <td>
                  <div className={styles.entityCell}>
                    <span className={styles.reporterName}>{report.reporterName}</span>
                    <span className={styles.reportedEntity}>vs. {report.reportedEntity}</span>
                  </div>
                </td>
                <td className={styles.dateCell}>
                  {new Date(report.submittedDate).toLocaleDateString()}
                </td>
                <td><PriorityBadge priority={report.priority} /></td>
                <td><ReportStatusBadge status={report.status} /></td>
                <td>
                  <button 
                    className={styles.viewButton}
                    onClick={() => onViewDetails(report)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className={styles.emptyState}>
                <p>No reports found matching the current filters.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
