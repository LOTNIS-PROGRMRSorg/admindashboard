export const BUCKETS = [
  { key: '', label: 'All' }, { key: 'due', label: 'Due' }, { key: 'awaiting_release', label: 'Waiting' },
  { key: 'on_hold', label: 'On hold' }, { key: 'processing', label: 'Being sent' }, { key: 'paid', label: 'Paid' },
];

/** Where a payout goes, in one readable line. */
export const destinationLine = (d) => {
  if (!d) return '— no payout details —';
  return d.method === 'bank' ? `${d.bank_name || 'Bank'} · ${d.account_number} · ${d.account_name || ''}` : `${d.provider || 'Mobile money'} · ${d.account_number || d.number || ''} · ${d.account_name || ''}`;
};
