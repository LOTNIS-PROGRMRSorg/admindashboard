export function money(currency, amount) {
  const value = Number(amount || 0);
  return `${currency || 'GHS'} ${value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso) {
  return iso ? new Date(iso).toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}
