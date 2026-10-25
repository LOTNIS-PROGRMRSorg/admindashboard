// Shared helpers for the admin notification bell and the full notifications page.
import { apiFetch } from './api';

// Notification `type` is namespaced ("host.nudge", "refund.requested"), so the
// dashboard can deep-link into the right screen — and Events / Food / Services
// notifications can use their own prefix later without touching this file's callers.
const AREA_PATHS = {
  host: '/hosts',
  booking: '/bookings',
  refund: '/refunds',
  exit: '/move-outs',
  event: '/events',
  report: '/reports',
  payout: '/payouts',
};

// Notifications open the thing they are about, not just its list.
export function notificationPath(notification) {
  const area = String(notification.type || '').split('.')[0];
  const d = notification.data || {};
  if (area === 'exit' && d.exit_id) return `/move-outs/${d.exit_id}`;
  if (area === 'report' && d.report_id) return `/reports/${d.report_id}`;
  if (area === 'event' && d.event_id) return `/events/${d.event_id}`;
  if (area === 'booking' && d.booking_id) return `/bookings/${d.booking_id}`;
  if (area === 'host' && d.host_user_id) return `/hosts/${d.host_user_id}`;
  if (area === 'refund' && d.refund_id) return `/refunds/${d.service === 'event' ? 'event' : 'accommodation'}/${d.refund_id}`;
  return AREA_PATHS[area] || '/notifications';
}

export function notificationTone(type) {
  if (/nudge|action_required|failed|expired|cancelled|dispute/.test(type)) return 'warning';
  if (/verified|processed|confirmed|paid/.test(type)) return 'success';
  return 'info';
}

export function timeAgo(iso) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

export const fetchNotifications = (params = {}) => {
  const query = new URLSearchParams({ audience: 'admin', ...params }).toString();
  return apiFetch(`/notifications?${query}`).then((body) => body?.data || []);
};

export const fetchUnreadCount = () =>
  apiFetch('/notifications/unread-count?audience=admin').then((body) => body?.data?.count || 0);

export const markRead = (ids) =>
  apiFetch('/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) });

export const markAllRead = () =>
  apiFetch('/notifications/read-all', { method: 'POST', body: JSON.stringify({ audience: 'admin' }) });
