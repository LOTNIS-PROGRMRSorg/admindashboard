import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MoveOutDrawer, { StatusBadge } from '../components/moveouts/MoveOutDrawer';
import { apiFetch } from '../lib/api';
import { formatDateTime } from '../lib/format';
import users from './Users.module.css';
import styles from './Refunds.module.css';

const FILTERS = [['open', 'Open'], ['in_dispute', 'In dispute'], ['moved_out', 'Moved out'], ['notice_given', 'Notice given'], ['settled', 'Settled'], ['all', 'All']];

export default function MoveOuts() {
  const [filter, setFilter] = useState('open');
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  // Deep link from a notification: /move-outs?open=<case id>
  useEffect(() => { const id = params.get('open'); if (id) setSelected(id); }, [params]);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/admin/exits${filter === 'all' ? '' : `?status=${filter}`}`)
      .then((b) => { setCases(b.data || []); setError(''); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [filter]);
  useEffect(load, [load]);

  const disputes = cases.filter((c) => c.has_dispute).length;
  return (
    <div className={users.page}>
      <div className={users.header}>
        <h1 className={users.title}>Move-outs</h1>
        <p className={users.subtitle}>Early-departure notices and end-of-stay deposit checks. Guest, host and Lotnis all see the same timeline; you rule on disputes and settle the refund.</p>
        {error && <p className={users.subtitle} style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>
      <div className={styles.filters}>
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`${styles.service} ${filter === key ? styles.serviceActive : ''}`} onClick={() => setFilter(key)}>{label}{key === 'in_dispute' && disputes ? ` (${disputes})` : ''}</button>
        ))}
      </div>
      <div className={styles.tableWrap}>
        {loading && !cases.length ? <div className={styles.empty}>Loading…</div> : cases.length ? (
          <table className={styles.table}>
            <thead><tr>
              <th className={styles.th}>Stay</th><th className={styles.th}>Guest</th><th className={styles.th}>Host</th>
              <th className={styles.th}>Leaving</th><th className={styles.th}>Status</th><th className={styles.th}>Opened</th>
            </tr></thead>
            <tbody>{cases.map((c) => (
              <tr key={c.id} className={styles.tr} onClick={() => setSelected(c.id)}>
                <td className={styles.td}><strong>{c.booking.property?.name}</strong><span className={styles.sub}>{c.kind === 'early_departure' ? 'Early departure' : 'Checkout'} · booked to {c.booking.end_date}</span></td>
                <td className={styles.td}>{c.guest_name || '—'}</td>
                <td className={styles.td}>{c.host_name || '—'}</td>
                <td className={styles.td}>{c.actual_checkout ?? c.planned_checkout}</td>
                <td className={styles.td}><StatusBadge status={c.status} />{c.has_dispute && <span className={`${styles.badge} ${styles.failed}`} style={{ marginLeft: 6 }}>dispute</span>}</td>
                <td className={styles.td}>{formatDateTime(c.created_at)}</td>
              </tr>))}</tbody>
          </table>
        ) : <div className={styles.empty}>No move-outs here.</div>}
      </div>
      {selected && <MoveOutDrawer key={selected} exitId={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
}
