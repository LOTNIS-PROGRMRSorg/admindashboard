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
const realFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!url.startsWith(API)) return realFetch(input, init);
  const path = url.slice(API.length).split('?')[0];
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
