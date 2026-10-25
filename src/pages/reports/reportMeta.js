import { titleCase } from '../../lib/format';

export const TARGETS = [
  { key: '', label: 'Everything' }, { key: 'property', label: 'Listings' }, { key: 'event', label: 'Events' },
  { key: 'booking', label: 'Stays booked' }, { key: 'ticket_order', label: 'Tickets bought' }, { key: 'host', label: 'Hosts' },
];
export const TARGET_LABEL = { property: 'Listing', event: 'Event', booking: 'Stay booked', ticket_order: 'Tickets bought', host: 'Host', other: 'Other' };
export const categoryLabel = titleCase;

/** The thing a report is about, as a link target. */
export const subjectOf = (r) => {
  if (r.property) return { label: r.property.name, to: `/listings/${r.property.id}` };
  if (r.event) return { label: r.event.title, to: `/events/${r.event.id}` };
  if (r.host_id) return { label: r.host_name || 'Host', to: `/hosts/${r.host_id}` };
  return { label: '—', to: null };
};
