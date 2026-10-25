import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { fetchNotifications, fetchUnreadCount, markAllRead, markRead, notificationPath } from '../../lib/notifications';
import NotificationItem from './NotificationItem';
import navbar from '../layout/Navbar.module.css';
import styles from './NotificationBell.module.css';

const POLL_MS = 30_000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const refreshCount = useCallback(() => {
    fetchUnreadCount()
      .then(setCount)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    fetchNotifications({ limit: 8 })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
    const onClickAway = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, [open]);

  const openNotification = async (notification) => {
    setOpen(false);
    if (!notification.read_at) {
      await markRead([notification.id]).catch(() => {});
      refreshCount();
    }
    navigate(notificationPath(notification));
  };

  const readAll = async () => {
    await markAllRead().catch(() => {});
    setItems((current) => current.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setCount(0);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={navbar.iconBtn}
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />
        {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Notifications">
          <div className={styles.panelHeader}>
            <span>Notifications</span>
            <button className={styles.linkBtn} onClick={readAll} disabled={!count}>
              Mark all read
            </button>
          </div>
          <div className={styles.list}>
            {loading && !items.length ? (
              <div className={styles.empty}>Loading…</div>
            ) : items.length ? (
              items.map((n) => <NotificationItem key={n.id} notification={n} onClick={openNotification} />)
            ) : (
              <div className={styles.empty}>You're all caught up.</div>
            )}
          </div>
          <Link className={styles.footer} to="/notifications" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
