// One place that says what colour and wording every status gets, so "paid", "pending" and "failed"
// look the same on every page. Tones map to the pill colours in components/ui/ui.module.css.
const STATUS = {
  // generic
  open: ['Open', 'warn'], in_review: ['In review', 'info'], resolved: ['Resolved', 'good'], dismissed: ['Dismissed', 'neutral'],
  low: ['Low', 'neutral'], normal: ['Normal', 'info'], high: ['High', 'warn'], urgent: ['Urgent', 'danger'],
  // listings & events
  pending: ['Pending', 'warn'], under_review: ['Under review', 'info'], approved: ['Approved', 'good'], rejected: ['Rejected', 'danger'],
  draft: ['Draft', 'neutral'], pending_review: ['In review', 'warn'], published: ['On sale', 'good'], cancelled: ['Cancelled', 'danger'], suspended: ['Suspended', 'danger'],
  live: ['Live', 'good'], paused: ['Paused', 'warn'],
  // bookings
  confirmed: ['Confirmed', 'good'], active: ['Staying', 'good'], completed: ['Completed', 'neutral'], no_show: ['No-show', 'danger'], awaiting_host_acceptance: ['Awaiting host', 'warn'],
  // money
  paid: ['Paid', 'good'], processing: ['Being sent', 'info'], processed: ['Sent', 'good'], failed: ['Failed', 'danger'], declined: ['Declined', 'danger'],
  partially_refunded: ['Part refunded', 'warn'], refunded: ['Refunded', 'danger'], due: ['Ready', 'warn'], awaiting_release: ['Waiting', 'neutral'], on_hold: ['On hold', 'danger'],
  sending: ['Being sent', 'info'], done: ['Done', 'good'],
  // people
  verified: ['Verified', 'good'], suspended_user: ['Suspended', 'danger'], banned: ['Banned', 'danger'],
  // move-outs
  notice_given: ['Notice given', 'warn'], host_responded: ['Host responded', 'info'], moved_out: ['Moved out', 'info'], in_dispute: ['In dispute', 'danger'], settled: ['Settled', 'good'], withdrawn: ['Withdrawn', 'neutral'],
};

export const statusMeta = (status) => {
  const hit = STATUS[status ?? ''];
  return hit ? { label: hit[0], tone: hit[1] } : { label: String(status ?? '—').replace(/_/g, ' '), tone: 'neutral' };
};
