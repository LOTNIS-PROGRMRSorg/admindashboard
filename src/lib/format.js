export function money(currency, amount) {
  const value = Number(amount || 0);
  return `${currency || 'GHS'} ${value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso) {
  return iso ? new Date(iso).toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-GH', { dateStyle: 'medium' }) : '—';
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-GH');
}

export const personName = (p) => [p?.first_name, p?.last_name].filter(Boolean).join(' ') || p?.name || p?.email || '—';
export const titleCase = (s) => String(s ?? '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
