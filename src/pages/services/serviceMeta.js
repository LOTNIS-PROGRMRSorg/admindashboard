export const UNIT = { per_30min: '30 min', per_hour: 'hour', per_day: 'day', per_job: 'job' };
export const SERVICE_STATUS = [
  { key: 'pending_review', label: 'To review' },
  { key: 'published', label: 'Live' },
  { key: '', label: 'All' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'draft', label: 'Draft' },
];
export const JOB_STATUS = [
  { key: 'disputed', label: 'Disputes' },
  { key: 'paid', label: 'Paid — held' },
  { key: 'awaiting_confirmation', label: 'Waiting for customer' },
  { key: '', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'cancelled', label: 'Cancelled' },
];
