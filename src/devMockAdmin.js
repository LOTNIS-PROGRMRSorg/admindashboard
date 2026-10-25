// Dev-only fixtures for the whole-platform admin pages (dashboard, refunds, reports, detail pages).
const iso = (d) => new Date(Date.now() + d * 86400000).toISOString();
const day = (d) => iso(d).slice(0, 10);
const ok = (data) => new Response(JSON.stringify({ success: true, data }), { headers: { 'content-type': 'application/json' } });

const overview = {
  totals: { users: 1284, verified_hosts: 47, live_listings: 112, live_events: 9, bookings_6m: 318, tickets_sold: 4120, votes_cast: 88400 },
  money: { currency: 'GHS', commission_this_month: 18420.5, commission_trend: 12.4, paid_this_month: 262300, stays_this_month: 171900, events_this_month: 90400, payouts_due: 41200, payouts_held: 3600, refunded_total: 12850 },
  chart: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((name, i) => ({ name, stays: 80000 + i * 18000, events: 20000 + i * 14000, commission: 7000 + i * 2300 })),
  queue: { listing_approvals: 4, host_applications: 3, event_reviews: 1, move_outs: 2, refunds_to_decide: 3, refunds_to_send: 2, payouts_due_count: 6, reports_open: 5, reports_urgent: 1 },
  activity: [
    { id: 'a1', kind: 'ticket', text: 'ama@example.com bought tickets to Ghana Music Awards Night', amount: 450, currency: 'GHS', at: iso(-0.02), to: '/events/ev2' },
    { id: 'a2', kind: 'booking', text: 'Kofi Mensah booked Osu Courtyard Apartment', amount: 3162, currency: 'GHS', at: iso(-0.1), to: '/bookings/b1' },
    { id: 'a3', kind: 'report', text: 'New high report — fake listing', amount: null, currency: null, at: iso(-0.3), to: '/reports/rp1' },
    { id: 'a4', kind: 'vote', text: 'yaw@example.com bought votes for Ghana Music Awards Night', amount: 50, currency: 'GHS', at: iso(-0.5), to: '/events/ev2' },
  ],
};

const refundRows = [
  { id: 'r1', service: 'accommodation', stage: 'pending', status: 'pending', amount: 3162, currency: 'GHS', title: 'Osu Courtyard Apartment', customer: 'Kofi Mensah', counterparty: 'Ama Owusu', reason: 'Guest cancelled', created_at: iso(-1) },
  { id: 'r2', service: 'event', stage: 'pending', status: 'pending', amount: 150, currency: 'GHS', title: 'Ghana Music Awards Night', customer: 'esi@example.com', counterparty: null, reason: 'Buyer request', created_at: iso(-2) },
  { id: 'r3', service: 'event', stage: 'sending', status: 'approved', amount: 450, currency: 'GHS', title: 'Accra Rooftop Sessions', customer: 'yaw@example.com', counterparty: null, reason: 'Event cancelled', created_at: iso(-3) },
  { id: 'r4', service: 'accommodation', stage: 'done', status: 'processed', amount: 1200, currency: 'GHS', title: 'Palm Grove Villa', customer: 'Abena T.', counterparty: 'Yaw Darko', reason: 'Host cancelled', created_at: iso(-9), reference: 'RF-221' },
];
const refundSummary = { currency: 'GHS', stages: { pending: { count: 3, amount: 4120 }, sending: { count: 2, amount: 1350 }, done: { count: 14, amount: 12850 }, failed: { count: 1, amount: 300 }, declined: { count: 2, amount: 180 } }, services: { accommodation: { count: 12, outstanding: 4500 }, event: { count: 8, outstanding: 1270 } }, outstanding_amount: 5770 };
const stayRefund = { id: 'r1', status: 'pending', currency: 'GHS', refund_amount: 3162, total_paid: 3662, property_amount: 3000, refund_property_amount: 3000, refund_fee_amount: 62, refund_deposit_amount: 100, refund_percentage: 100, policy_code: 'standard', days_before_start: 9, cancelled_by_role: 'host', host_receives: 0, platform_keeps: 0, property_name: 'Osu Courtyard Apartment', guest_name: 'Kofi Mensah', host_name: 'Ama Owusu', booking_id: 'b1', booking: { start_date: day(5), end_date: day(36), cancellation_reason: 'Pipe burst in the building' } };

const report = (id, over = {}) => ({
  id, target_type: 'property', category: 'fake_listing', description: 'These photos are taken from another website — I searched and found them on a hotel in Dubai. The address does not exist either.', status: 'open', severity: 'high', audience: 'admin', created_at: iso(-1),
  reporter_name: 'Esi Boateng', reporter_email: 'esi@example.com', reporter_id: 'u3', reporter: { id: 'u3', first_name: 'Esi', last_name: 'Boateng', email: 'esi@example.com', phone: '024 111 2222' },
  host_id: 'h1', host_name: 'Ama Owusu', property: { id: 'p1', name: 'Osu Courtyard Apartment', city: 'Accra' }, event: null, booking: null, order: null, host_response: null, evidence_urls: [], related_reports: [], ...over,
});
const reportRows = [report('rp1'), report('rp2', { target_type: 'booking', category: 'not_as_described', audience: 'host_and_admin', status: 'in_review', severity: 'urgent', description: 'No hot water for two days and the host is not answering.', booking_id: 'b1', booking: { id: 'b1', start_date: day(-3), end_date: day(28), final_amount: 3662, currency_snapshot: 'GHS' }, host_response: 'We fixed the heater on Tuesday and offered a partial refund.', host_responded_at: iso(-0.5) }), report('rp3', { target_type: 'event', category: 'fake_event', property: null, event: { id: 'ev2', title: 'Ghana Music Awards Night' }, status: 'resolved', severity: 'high' })];

const taxonomy = { listing: { id: 'p1', name: 'Osu Courtyard Apartment', approval_status: 'approved', price: 1050, currency: 'GHS', pricing_period: 'month', sub_type: 'apartment', city: 'Accra', country: 'Ghana', description: 'A bright courtyard apartment in the heart of Osu.', property_images: [], rooms: [], owner_name: 'Ama Owusu' } };
const series = { days: Array.from({ length: 30 }, (_, i) => ({ day: day(i - 29), views: 8 + ((i * 7) % 13), visitors: 6 + (i % 7), clicks: 2 + (i % 4) })), totals: { views: 420, visitors: 290, clicks: 96 }, by_action: { view: 420, click_book: 70 } };

export function handleAdmin(path) {
  if (path === '/admin/dashboard/overview') return ok(overview);
  if (path === '/admin/refunds/all') return ok({ data: refundRows, total: refundRows.length, page: 1, limit: 20 });
  if (path === '/admin/refunds/all/summary') return ok(refundSummary);
  if (path === '/admin/refunds/r1') return ok(stayRefund);
  if (path === '/admin/reports/summary') return ok({ open: 5, in_review: 2, urgent: 1, total: 31, by_target: { property: 3, booking: 2, event: 1 } });
  if (path === '/admin/reports') return ok({ data: reportRows, total: reportRows.length, page: 1, limit: 20 });
  if (/^\/admin\/reports\/[^/]+$/.test(path)) return ok(reportRows.find((r) => path.endsWith(r.id)) ?? reportRows[0]);
  if (/^\/admin\/events\/[^/]+\/insights$/.test(path)) return ok({ engagement: { ...series, conversions: { checkouts_started: 64, ticket_orders_paid: 41, vote_orders_paid: 120 } }, reports: [{ id: 'rp3', category: 'fake_event', status: 'resolved', audience: 'admin', created_at: iso(-4), description: 'Looks like a scam.' }] });
  if (/^\/admin\/properties\/[^/]+\/insights$/.test(path)) return ok({ listing: { id: 'p1', name: 'Osu Courtyard Apartment', owner_id: 'h1' }, host: { user_id: 'h1', display_name: 'Ama Owusu', verification_status: 'verified', city: 'Accra', created_at: iso(-400) }, engagement: series, bookings: [{ id: 'b1', status: 'confirmed', final_amount: 3162, currency_snapshot: 'GHS', start_date: day(-3), end_date: day(28), created_at: iso(-6) }], reports: [{ id: 'rp1', category: 'fake_listing', status: 'open', audience: 'admin', created_at: iso(-1), description: 'Photos stolen.' }] });
  if (path === '/admin/properties/stats') return ok({ approved: 112, pending: 3, under_review: 1, rejected: 5 });
  if (path.startsWith('/admin/properties/') && path !== '/admin/properties/stats') return new Response(JSON.stringify(taxonomy.listing), { headers: { 'content-type': 'application/json' } });
  if (path === '/admin/hosts/h1/overview') return ok({ profile: { id: 'h1', name: 'Ama Owusu', email: 'ama@example.com', phone: '024 000 0002' }, host: { id: 'hp1', user_id: 'h1', display_name: 'Ama Owusu', verification_status: 'verified', account_type: 'individual', city: 'Accra', created_at: iso(-400), verified_at: iso(-380) },
    properties: [{ id: 'p1', name: 'Osu Courtyard Apartment', city: 'Accra', sub_type: 'apartment', approval_status: 'approved', price: 1050, currency: 'GHS', pricing_period: 'month', is_paused: false }], events: [{ id: 'ev2', title: 'Ghana Music Awards Night', status: 'published', starts_at: iso(30), city: 'Accra', sales_paused: false }],
    bookings_received: 18, money: { awaiting: 12000, due: 3007, on_hold: 360, processing: 0, paid: 41000 }, reports_about: [{ id: 'rp1', target_type: 'property', category: 'fake_listing', status: 'open', severity: 'high', created_at: iso(-1) }], payout_methods: [{ id: 'm1', kind: 'momo', provider: 'MTN', account_number: '••••••3456', account_name: 'Ama Owusu', is_default: true }] });
  if (path === '/admin/users/u3') return ok({ profile: { id: 'u3', name: 'Esi Boateng', email: 'esi@example.com', phone: '024 111 2222', created_at: iso(-120), email_verified: true }, host: null, admin_role: null, bookings: [{ id: 'b1', start_date: day(-3), end_date: day(28), status: 'confirmed', final_amount: 3162, currency_snapshot: 'GHS', property: { id: 'p1', name: 'Osu Courtyard Apartment' } }], orders: [{ id: 'o1', kind: 'ticket', status: 'paid', total: 450, currency: 'GHS', event: { id: 'ev2', title: 'Ghana Music Awards Night' } }], reports_filed: [{ id: 'rp1', target_type: 'property', category: 'fake_listing', status: 'open', created_at: iso(-1) }], refunds: [{ id: 'r1', refund_amount: 3162, currency: 'GHS', status: 'pending' }] });
  if (path === '/admin/bookings/b1') return ok({ booking: { id: 'b1', status: 'confirmed', start_date: day(-3), end_date: day(28), currency_snapshot: 'GHS', final_amount: 3662, platform_fee: 160, guest_service_fee: 62, landlord_payout: 3000, security_deposit: 100, created_at: iso(-6), property: { id: 'p1', name: 'Osu Courtyard Apartment', city: 'Accra', owner_id: 'h1' }, room: null, reservation_stage: 'secured' },
    renter: { id: 'u3', name: 'Esi Boateng', email: 'esi@example.com', phone: '024 111 2222' }, host: { user_id: 'h1', display_name: 'Ama Owusu', verification_status: 'verified', city: 'Accra' },
    payouts: [1, 2, 3].map((n) => ({ id: `po${n}`, amount: 1000, currency: 'GHS', status: 'pending', release_at: iso(n * 30), on_hold: n === 1, hold_reason: n === 1 ? 'Report open' : null, installment_no: n, installments: 3 })), refund: null, exit: null, reports: [{ id: 'rp2', category: 'not_as_described', status: 'in_review', severity: 'urgent', created_at: iso(-1) }], transaction: { status: 'paid', provider: 'paystack', provider_reference: 'T123' } });
  if (path === '/admin/bookings' ) return ok({ data: [{ id: 'b1', status: 'confirmed', start_date: day(-3), end_date: day(28), currency_snapshot: 'GHS', final_amount: 3662, renter: { first_name: 'Esi', last_name: 'Boateng', email: 'esi@example.com' }, property: { name: 'Osu Courtyard Apartment' }, owner_name: 'Ama Owusu' }], total: 1 });
  return undefined;
}
