// Dev-only (?mock): fake an admin session and the endpoints the Move-outs screens use,
// so they can be previewed without real data. Never loaded in production builds.
const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
localStorage.setItem('lotnis_admin_access_token', 'dev');
const iso = (d) => new Date(Date.now() + d * 86400000).toISOString();
const day = (d) => iso(d).slice(0, 10);
const booking = { id: 'b1', start_date: day(-10), end_date: day(21), currency_snapshot: 'GHS', security_deposit: 500, final_amount: 3662, property: { name: 'Osu Courtyard Apartment' } };
const mkExit = (id, status, extra = {}) => ({ id, booking_id: 'b1', kind: 'early_departure', status, planned_checkout: day(2), actual_checkout: ['moved_out', 'in_dispute'].includes(status) ? day(2) : null, notice_given_at: iso(-1), reason: 'Relocating for work to Takoradi.', host_response: 'Noted — please return the keys on the day.', relet_from: day(5), host_at_fault: false, refund_service_fee: false, created_at: iso(-1), booking, guest_name: 'Kofi Mensah', host_name: 'Ama Owusu', ...extra });
const detail = { exit: mkExit('x1', 'in_dispute'), booking, guest: { name: 'Kofi Mensah', phone: '024 000 0001' }, host: { name: 'Ama Owusu', phone: '024 000 0002' },
  events: [
    { id: 'e1', actor_role: 'guest', actor_name: 'Kofi Mensah', event: 'notice_given', note: 'Relocating for work to Takoradi.', created_at: iso(-1) },
    { id: 'e2', actor_role: 'host', actor_name: 'Ama Owusu', event: 'host_responded', note: 'Noted — please return the keys on the day.', created_at: iso(-1) },
    { id: 'e3', actor_role: 'host', actor_name: 'Ama Owusu', event: 'deduction_proposed', note: 'Cracked bathroom mirror', created_at: iso(0) },
    { id: 'e4', actor_role: 'guest', actor_name: 'Kofi Mensah', event: 'deduction_disputed', note: 'The mirror was already cracked when I arrived.', created_at: iso(0) },
  ],
  deductions: [
    { id: 'd1', amount: 150, reason: 'Cracked bathroom mirror', evidence_urls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200'], status: 'disputed', guest_comment: 'The mirror was already cracked when I arrived.' },
    { id: 'd2', amount: 100, reason: 'Deep clean of the kitchen', evidence_urls: [], status: 'proposed' },
  ],
  estimate: { currency: 'GHS', nights_total: 31, nights_stayed: 12, notice_nights_charged: 4, relet_credit_nights: 1, nights_refunded: 16, rent_refund: 1600, fee_refund: 0, deposit_held: 500, deductions_total: 150, deposit_returned: 350, total_refund: 1950, host_receives: 1450, platform_keeps: 112 } };
const ok = (data) => new Response(JSON.stringify({ success: true, data }), { headers: { 'content-type': 'application/json' } });

// ── Events + payouts fixtures ────────────────────────────────────────────────
const stats = { tickets_sold: 412, tickets_scanned: 268, tickets_refunded: 6, ticket_gross: 71850, ticket_commission: 5029.5, ticket_host_net: 66820.5, refunded_amount: 780, votes_total: 44720, vote_gross: 31450, vote_commission: 2201.5, vote_host_net: 29248.5, review_count: 38, review_average: 4.6,
  by_ticket_type: [{ id: 't1', name: 'Regular', price: 150, quantity: null, sold: 301, scanned: 198 }, { id: 't2', name: 'VIP', price: 450, quantity: 120, sold: 108, scanned: 70 }], by_gate: [{ id: 'g1', name: 'Gate 1', admitted: 171, rejected: 9 }] };
const mkEvent = (id, title, status, extra = {}) => ({ id, title, status, host_name: 'Pulse Live Events', venue_name: 'Skybar, Osu', city: 'Accra', category: 'Concert & music', starts_at: iso(12), ends_at: iso(12.2), currency: 'GHS', fee_mode: 'included', refund_policy: 'tiers', refund_tiers: [{ days_before: 7, percent: 100 }, { days_before: 2, percent: 50 }], postponement_policy: 'carry_over_or_refund', postponement_refund_days: 7, voting_enabled: false, description: 'An unforgettable night of live music on the rooftop.', stats: { tickets_sold: 412, tickets_scanned: 0, gross: 71850, commission: 5029.5, refunded: 780, votes_total: 0, refund_requests_pending: 1 }, ...extra });
const events = [mkEvent('ev1', 'Accra Rooftop Sessions Vol. 4', 'pending_review', { stats: { tickets_sold: 0, tickets_scanned: 0, gross: 0, commission: 0, refunded: 0, votes_total: 0, refund_requests_pending: 0 } }), mkEvent('ev2', 'Ghana Music Awards Night', 'published', { voting_enabled: true })];
const refunds = [{ id: 'r1', status: 'pending', amount: 150, currency: 'GHS', refund_percent: 100, trigger: 'buyer_request', reason: 'Cannot make it', requester_email: 'ama@example.com', ticket_ids: ['k1'], created_at: iso(-1), event: { title: 'Ghana Music Awards Night', starts_at: iso(12) }, order: { buyer_email: 'ama@example.com', processing_fee: 2.9, kind: 'ticket' } }, { id: 'r2', status: 'approved', amount: 75, currency: 'GHS', refund_percent: 50, trigger: 'buyer_request', requester_email: 'kofi@example.com', ticket_ids: ['k2'], created_at: iso(-2), event: { title: 'Ghana Music Awards Night' }, order: { buyer_email: 'kofi@example.com', processing_fee: 2.9, kind: 'ticket' } }];
const dest = { method: 'mobile_money', provider: 'MTN MoMo', number: '0244 123 456', account_name: 'Ama Owusu' };
const payoutItems = [{ id: 'p1', title: 'Ghana Music Awards Night', detail: 'Tickets', service_label: 'Event tickets', host_name: 'Pulse Live Events', amount: 66820.5, commission: 5029.5, currency: 'GHS', bucket: 'awaiting_release', status: 'pending', release_at: iso(32) }, { id: 'p2', title: 'Osu Courtyard Apartment', detail: '2026-10-01 → 2026-11-01', service_label: 'Stays', host_name: 'Ama Owusu', amount: 3007, commission: 93, currency: 'GHS', bucket: 'due', status: 'pending', release_at: iso(-1) }, { id: 'p3', title: 'Palm Grove Villa', detail: 'Stay', service_label: 'Stays', host_name: 'Kojo Asare', amount: 360, commission: 40, currency: 'GHS', bucket: 'on_hold', status: 'pending', on_hold: true, hold_reason: 'Guest reported a problem', release_at: iso(1) }];
function adminExtra(path) {
  if (path === '/admin/events/summary') return ok({ events_total: 6, live: 3, by_status: { pending_review: 1, published: 3, draft: 1, cancelled: 1 }, pending_review: 1, tickets_sold: 412, ticket_gross: 71850, vote_gross: 31450, commission: 7231, refunded: 780, refund_requests_pending: 1 });
  if (path === '/admin/events/refunds/summary') return ok({ currency: 'GHS', pending: { count: 1, amount: 150 }, approved: { count: 1, amount: 75 }, processed: { count: 4, amount: 910 }, rejected: { count: 0, amount: 0 }, outstanding_amount: 225 });
  if (path === '/admin/events/refunds') return ok({ data: refunds, total: 2, page: 1, limit: 15 });
  if (/^\/admin\/events\/[^/]+\/orders$/.test(path)) return ok({ data: [{ id: 'o1', kind: 'ticket', status: 'paid', buyer_email: 'ama@example.com', subtotal: 750, service_fee: 0, currency: 'GHS' }], total: 1 });
  if (/^\/admin\/events\/[^/]+$/.test(path)) return ok({ event: events[1], stats, host: { name: 'Pulse Live Events', verified: true }, payout: { awaiting_release: 96069, due: 0, on_hold: 0, paid: 0 } });
  if (path === '/admin/events') return ok({ data: events, total: 2, page: 1, limit: 15 });
  if (path === '/admin/payouts/overview') return ok({ currency: 'GHS', totals: { awaiting_release: 98234.5, due: 3007, on_hold: 360, processing: 1200, paid: 12400 }, by_service: [{ service: 'accommodation', label: 'Stays', due: 3007, paid: 12400 }, { service: 'event_ticket', label: 'Event tickets', due: 0, paid: 0 }], open_issue_reports: 1, stay_report_window_hours: 48, event_payout_hold_hours: 48 });
  if (path === '/admin/payouts/due') return ok({ total_due: 3007, blocked_items: 1, hosts_due: [{ host_id: 'h1', host_name: 'Ama Owusu', host_email: 'ama@example.com', verified: true, currency: 'GHS', items: 2, amount: 3053.5, adjustments: -46.5, net: 3007, oldest_release: iso(-1), service_breakdown: [{ service: 'accommodation', label: 'Stays', amount: 3053.5 }], destination: dest }, { host_id: 'h2', host_name: 'Kojo Asare', host_email: 'kojo@example.com', verified: true, currency: 'GHS', items: 1, amount: 450, adjustments: 0, net: 450, oldest_release: iso(-2), service_breakdown: [{ service: 'event_ticket', label: 'Event tickets', amount: 450 }], destination: null }] });
  if (path === '/admin/payouts/items') return ok({ data: payoutItems, total: 3, page: 1, limit: 20 });
  if (path === '/admin/payouts/batches') return ok({ data: [{ id: 'b1', host_name: 'Ama Owusu', amount: 1200, currency: 'GHS', status: 'processing', destination: dest, created_at: iso(-0.1) }], total: 1 });
  if (path === '/admin/payouts/issues') return ok([{ id: 'i1', category: 'cleanliness', description: 'The apartment was not cleaned before arrival and the AC does not work at all.', status: 'open', created_at: iso(-0.3), booking: { start_date: day(-1), end_date: day(30), final_amount: 3662, currency_snapshot: 'GHS', property: { name: 'Palm Grove Villa' } }, reporter: { first_name: 'Kofi', last_name: 'Mensah', email: 'kofi@example.com', phone: '024 000 0001' } }]);
  if (path === '/admin/config/settings') return ok([{ key: 'event_ticket_commission_percent', label: 'Ticket commission (%)', value: 7, min: 0, max: 50, description: 'Lotnis commission on each ticket' }, { key: 'event_vote_commission_percent', label: 'Vote commission (%)', value: 7, min: 0, max: 50, description: 'Lotnis commission on each vote' }, { key: 'processing_fee_percent', label: 'Processing fee passed to buyers (%)', value: 1.95, min: 0, max: 10, description: 'Added to the buyer total' }, { key: 'event_payout_hold_hours', label: 'Event payout hold (hours)', value: 48, min: 0, max: 720, description: 'After the event ends' }, { key: 'stay_report_window_hours', label: 'Stay problem-report window (hours)', value: 48, min: 24, max: 168, description: 'After check-in' }]);
  return undefined;
}
import { handleAdmin } from './devMockAdmin';
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!url.startsWith(API)) return realFetch(input, init);
  const path = url.slice(API.length).split('?')[0];
  const platform = handleAdmin(path); if (platform) return platform;
  const extra = adminExtra(path); if (extra) return extra;
  if (path === '/admin/exits') return ok([mkExit('x1', 'in_dispute', { has_dispute: true }), mkExit('x2', 'notice_given', { guest_name: 'Esi Boateng', host_name: 'Yaw Darko' }), mkExit('x3', 'moved_out', { guest_name: 'Nana Agyei' })]);
  if (path.startsWith('/admin/exits/')) return ok(detail);
  if (path === '/notifications/unread-count') return ok({ count: 4 });
  if (path === '/notifications') return ok([
    { id: 'n1', type: 'exit.dispute', title: 'Deposit deduction disputed — needs a ruling', body: 'Osu Courtyard Apartment: GHS 150.00 — "The mirror was already cracked."', read_at: null, created_at: iso(0) },
    { id: 'n2', type: 'host.nudge', title: 'Host is waiting on verification', body: 'Ama Owusu is still waiting for their application to be verified.', read_at: null, created_at: iso(-0.2) },
    { id: 'n3', type: 'refund.requested', title: 'Refund awaiting processing', body: 'GHS 600.00 to refund for Palm Grove Villa.', read_at: iso(-1), created_at: iso(-1) },
  ]);
  return realFetch(input, init);
};
