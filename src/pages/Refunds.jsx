import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import RefundDrawer, { RefundStatusBadge } from '../components/refunds/RefundDrawer';
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import { formatDateTime, money } from '../lib/format';
import users from './Users.module.css';
import styles from './Refunds.module.css';

// Refunds are one shared queue for every Lotnis business line. Only space
// rental produces refunds today; the other tabs are reserved and disabled
// until those modules start writing refund rows tagged with their `service`.
const SERVICES = [
  { key: 'space_rental', label: 'Space rental' },
  { key: 'events', label: 'Events', href: '/events?tab=refunds' },
  { key: 'food', label: 'Food', soon: true },
  { key: 'services', label: 'Services', soon: true },
];
const STATUSES = ['all', 'pending', 'processing', 'failed', 'processed'];
const PAGE_SIZE = 15;

export default function Refunds() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const status = params.get('status') || 'pending';
  const [summary, setSummary] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams({ service: 'space_rental', page, limit: PAGE_SIZE });
    if (status !== 'all') query.set('status', status);
    Promise.all([apiFetch(`/admin/refunds?${query}`), apiFetch('/admin/refunds/summary')])
      .then(([list, stats]) => { setRefunds(list.data || []); setTotal(list.total || 0); setSummary(stats.data); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(load, [load]);

  // Arriving from a booking ("Process refund") opens that booking's refund directly.
  useEffect(() => {
    const bookingId = location.state?.bookingId;
    if (!bookingId) return;
    const match = refunds.find((r) => r.booking_id === bookingId);
    if (match) setSelected(match);
  }, [refunds, location.state]);
  useEffect(() => setPage(1), [status]);

  const currency = summary?.currency || 'GHS';

  return (
    <div className={users.page}>
      <div className={users.header}>
        <h1 className={users.title}>Refunds</h1>
        <p className={users.subtitle}>
          Cancellations of paid bookings land here with the refund already calculated from the host's policy.
          Send the money, then record the reference so the guest and host are told.
        </p>
        {error && <p className={users.subtitle} style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>

      <div className={styles.services} role="tablist" aria-label="Service">
        {SERVICES.map((s) => s.href ? (
          <Link key={s.key} to={s.href} className={styles.service}>{s.label}</Link>
        ) : (
          <button
            key={s.key}
            role="tab"
            aria-selected={s.key === 'space_rental'}
            disabled={s.soon}
            className={`${styles.service} ${s.key === 'space_rental' ? styles.serviceActive : ''}`}
            title={s.soon ? 'Coming soon' : undefined}
          >
            {s.label}{s.soon ? ' · soon' : ''}
          </button>
        ))}
      </div>

      <div className={styles.stats}>
        <div className={`${styles.stat} ${summary?.pending.count ? styles.warn : ''}`}>
          <div className={styles.statLabel}>Awaiting refund</div>
          <div className={styles.statValue}>{summary?.pending.count ?? '—'}</div>
          <div className={styles.statSub}>{money(currency, summary?.pending.amount)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Processing</div>
          <div className={styles.statValue}>{summary?.processing.count ?? '—'}</div>
          <div className={styles.statSub}>{money(currency, summary?.processing.amount)}</div>
        </div>
        <div className={`${styles.stat} ${summary?.failed.count ? styles.warn : ''}`}>
          <div className={styles.statLabel}>Failed</div>
          <div className={styles.statValue}>{summary?.failed.count ?? '—'}</div>
          <div className={styles.statSub}>{money(currency, summary?.failed.amount)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Refunded to date</div>
          <div className={styles.statValue}>{money(currency, summary?.processed.amount)}</div>
          <div className={styles.statSub}>{summary?.processed.count ?? 0} refund(s) · {money(currency, summary?.outstanding_amount)} still owed</div>
        </div>
      </div>

      <div className={styles.filters}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`${styles.service} ${status === s ? styles.serviceActive : ''}`}
            onClick={() => setParams(s === 'pending' ? {} : { status: s })}
            style={{ textTransform: 'capitalize' }}
          >
            {s}{s !== 'all' && summary?.[s]?.count ? ` (${summary[s].count})` : ''}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {loading && !refunds.length ? <div className={styles.empty}>Loading…</div> : refunds.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Booking</th>
                <th className={styles.th}>Guest</th>
                <th className={styles.th}>Cancelled by</th>
                <th className={styles.th}>Policy</th>
                <th className={styles.th}>Refund</th>
                <th className={styles.th}>Host / Lotnis keep</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Requested</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.id} className={styles.tr} onClick={() => setSelected(r)}>
                  <td className={styles.td}>
                    <strong>{r.property_name || 'Booking'}</strong>
                    <span className={styles.sub}>{r.booking ? `${r.booking.start_date} → ${r.booking.end_date}` : ''}</span>
                  </td>
                  <td className={styles.td}>{r.guest_name || '—'}</td>
                  <td className={styles.td} style={{ textTransform: 'capitalize' }}>{r.cancelled_by_role}</td>
                  <td className={styles.td}>
                    <span style={{ textTransform: 'capitalize' }}>{r.policy_code}</span>
                    <span className={styles.sub}>{r.days_before_start}d before · {Number(r.refund_percentage)}%</span>
                  </td>
                  <td className={`${styles.td} ${styles.amount}`}>{money(r.currency, r.refund_amount)}</td>
                  <td className={styles.td}>
                    {money(r.currency, r.host_receives)}
                    <span className={styles.sub}>{money(r.currency, r.platform_keeps)}</span>
                  </td>
                  <td className={styles.td}><RefundStatusBadge status={r.status} /></td>
                  <td className={styles.td}>{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className={styles.empty}>{status === 'pending' ? 'No refunds are waiting. 🎉' : 'No refunds with this status.'}</div>}
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        totalItems={total}
        itemsPerPage={PAGE_SIZE}
        onPageChange={setPage}
      />

      {selected && (
        <RefundDrawer
          key={selected.id}
          refund={selected}
          onClose={() => setSelected(null)}
          onChanged={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}
