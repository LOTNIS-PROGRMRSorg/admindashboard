import { useNavigate } from 'react-router-dom';
import { EmptyState } from './States';
import styles from './ui.module.css';

/**
 * columns: [{ key, label, render?(row), align? }]. Pass `rowTo(row)` to make each row open a page —
 * detail views are pages, not drawers, so they can be linked, bookmarked and shared.
 */
export default function DataTable({ columns, rows, rowTo, empty = 'Nothing here yet.', page, limit, total, onPage }) {
  const navigate = useNavigate();
  const pages = limit && total ? Math.max(1, Math.ceil(total / limit)) : 1;
  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>{columns.map((c) => <th key={c.key} className={c.align === 'right' ? styles.right : ''}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i} className={rowTo ? styles.rowLink : ''} onClick={rowTo ? () => navigate(rowTo(row)) : undefined}>
                {columns.map((c) => <td key={c.key} className={c.align === 'right' ? styles.right : ''}>{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <EmptyState>{empty}</EmptyState>}
      </div>
      {onPage && pages > 1 && (
        <div className={styles.pager}>
          <span>Page {page} of {pages} · {total} total</span>
          <span className={styles.toolbar}>
            <button className={styles.btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
            <button className={styles.btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
          </span>
        </div>
      )}
    </>
  );
}
