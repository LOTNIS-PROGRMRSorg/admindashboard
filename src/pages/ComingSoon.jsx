import { Check } from 'lucide-react';
import { Page, PageHeader } from '../components/ui';

// Placeholder for business lines that are not built yet. They are deliberately
// wired into the same shared pieces (notifications, refunds queue, bookings
// list service filter) so launching one means adding its module, not
// reworking the dashboard.
export default function ComingSoon({ title, description }) {
  return (
    <Page>
      <PageHeader eyebrow="Coming soon" title={title} subtitle={description} />
      <div
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-8)',
          maxWidth: 640,
        }}
      >
        <strong style={{ color: 'var(--color-text-base)' }}>Not launched yet — here is what will plug in:</strong>
        <ul
          style={{
            listStyle: 'none',
            margin: 'var(--spacing-4) 0 0',
            padding: 0,
            display: 'grid',
            gap: 'var(--spacing-3)',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
          }}
        >
          {[
            'Listings and applications reviewed by the same host verification flow',
            'Orders / bookings in the shared Bookings list, filtered by service',
            'Cancellations and refunds in the shared Refunds queue',
            'Alerts in this notification bell, grouped under their own tab',
          ].map((line) => (
            <li key={line} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Check size={16} style={{ color: 'var(--color-success)', flex: 'none', marginTop: 2 }} /> {line}
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
