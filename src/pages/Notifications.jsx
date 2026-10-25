import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationItem from '../components/notifications/NotificationItem';
import {
  fetchNotifications, markAllRead, markRead, notificationPath,
} from '../lib/notifications';
import { Page, PageHeader, Notice } from '../components/ui';
import styles from './Notifications.module.css';

const PAGE = 30;
const AREAS = [
  { key: 'all', label: 'All' },
  { key: 'host', label: 'Host applications' },
  { key: 'booking', label: 'Bookings' },
  { key: 'exit', label: 'Move-outs' },
  { key: 'refund', label: 'Refunds' },
  // Reserved: these light up automatically once those services start sending
  // notifications with an "events.*", "food.*" or "services.*" type.
  { key: 'events', label: 'Events', soon: true },
  { key: 'food', label: 'Food', soon: true },
  { key: 'services', label: 'Services', soon: true },
];

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [area, setArea] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = useCallback((before) => {
    setLoading(true);
    return fetchNotifications({ limit: PAGE, ...(before ? { before } : {}) })
      .then((rows) => {
        setItems((current) => (before ? [...current, ...rows] : rows));
        setDone(rows.length < PAGE);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => items.filter((n) => {
    if (unreadOnly && n.read_at) return false;
    return area === 'all' || String(n.type).startsWith(`${area}.`);
  }), [items, area, unreadOnly]);

  const open = async (notification) => {
    if (!notification.read_at) {
      await markRead([notification.id]).catch(() => {});
      setItems((current) => current.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)));
    }
    navigate(notificationPath(notification));
  };

  const readAll = async () => {
    await markAllRead().catch(() => {});
    setItems((current) => current.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
  };

  return (
    <Page>
      <PageHeader eyebrow="Inbox" title="Notifications" subtitle="Host verification requests, bookings, refunds, reports and payouts that need your attention." />
      {error && <Notice tone="danger">{error}</Notice>}

      <div className={styles.tabs}>
        {AREAS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${area === tab.key ? styles.tabActive : ''}`}
            onClick={() => setArea(tab.key)}
            title={tab.soon ? 'Coming soon' : undefined}
          >
            {tab.label}{tab.soon ? ' · soon' : ''}
          </button>
        ))}
        <span className={styles.spacer} />
        <label style={{ fontSize: '0.8125rem', display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} /> Unread only
        </label>
        <button className={styles.tab} onClick={readAll}>Mark all read</button>
      </div>

      <div className={styles.card}>
        {loading && !items.length ? <div className={styles.empty}>Loading…</div>
          : visible.length ? visible.map((n) => <NotificationItem key={n.id} notification={n} onClick={open} />)
          : <div className={styles.empty}>Nothing here yet.</div>}
        {!done && items.length > 0 && (
          <button className={styles.more} disabled={loading} onClick={() => load(items[items.length - 1].created_at)}>
            {loading ? 'Loading…' : 'Load older'}
          </button>
        )}
      </div>
    </Page>
  );
}
