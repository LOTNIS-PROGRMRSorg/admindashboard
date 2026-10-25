import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, DataTable, ErrorState, Facts, LoadingState, Notice, Page, PageHeader, Split, Stack, StatusPill } from '../../components/ui';
import { FieldDialog } from '../../components/modals';
import { formatDate, formatDateTime, money, personName } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import { apiFetch } from '../../lib/api';

/** One booking on its own page: guest, host, stay, the money, payouts, refund, move-out and reports. */
export default function BookingPage() {
  const { id } = useParams();
  const { data: d, error, loading, reload } = useApi(`/admin/bookings/${id}`);
  const [cancelling, setCancelling] = useState(null);
  const [problem, setProblem] = useState('');
  if (loading) return <Page><LoadingState /></Page>;
  if (error) return <Page><PageHeader back={{ to: '/bookings', label: 'All bookings' }} title="Booking" /><ErrorState>{error}</ErrorState></Page>;

  const { booking: b, renter, host, payouts, refund, exit, reports, transaction } = d;
  const c = b.currency_snapshot;
  const cancellable = ['pending', 'confirmed'].includes(b.status);
  const startCancel = async () => {
    setProblem('');
    try { setCancelling(await apiFetch(`/admin/bookings/${id}/cancellation-preview`)); } catch (e) { setProblem(e.message); }
  };

  return (
    <Page>
      <PageHeader back={{ to: '/bookings', label: 'All bookings' }} eyebrow="Booking" title={<>{b.property?.name ?? 'Stay'} <StatusPill status={b.status} /></>} subtitle={`${formatDate(b.start_date)} → ${formatDate(b.end_date)} · ${money(c, b.final_amount)}`}>
        {cancellable && <Button variant="danger" onClick={startCancel}>Cancel booking</Button>}
      </PageHeader>
      {problem && <Notice tone="danger">{problem}</Notice>}
      <Split>
        <Stack>
          <Card title="The stay">
            <Facts rows={[
              ['Property', b.property && <Link to={`/listings/${b.property.id}`}>{b.property.name}</Link>], ['Room', b.room?.room_label], ['Where', b.property?.city],
              ['Check-in', formatDate(b.start_date)], ['Check-out', formatDate(b.end_date)], ['Stage', b.reservation_stage?.replace(/_/g, ' ')],
              ['Cancellation reason', b.cancellation_reason], ['Created', formatDateTime(b.created_at)],
            ]} />
          </Card>
          <Card title="The money">
            <Facts rows={[
              ['Guest paid', money(c, b.final_amount)], ['Lotnis fee', b.platform_fee != null && money(c, b.platform_fee)], ['Security deposit', Number(b.security_deposit) > 0 && money(c, b.security_deposit)],
              ['Payment', transaction && `${transaction.status} via ${transaction.provider ?? '—'}${transaction.provider_reference ? ` · ${transaction.provider_reference}` : ''}`],
            ]} />
          </Card>
          <Card title={`Host payouts${payouts.length > 1 ? ` — paid monthly (${payouts.length} instalments)` : ''}`} flush>
            <DataTable rows={payouts} empty="No payout has been scheduled yet." columns={[
              { key: 'n', label: '#', render: (p) => (p.installments > 1 ? `${p.installment_no} / ${p.installments}` : '1') },
              { key: 'amount', label: 'Amount', render: (p) => <strong>{money(p.currency, p.amount)}</strong> },
              { key: 'release', label: 'Releases', render: (p) => formatDateTime(p.release_at) },
              { key: 'status', label: 'Status', render: (p) => <><StatusPill status={p.on_hold ? 'on_hold' : p.status} />{p.hold_reason && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.hold_reason}</div>}</> },
            ]} />
          </Card>
          {refund && (
            <Card title="Refund" action={{ label: 'Open refund', to: `/refunds/accommodation/${refund.id}` }}>
              <Facts rows={[['Amount', money(refund.currency, refund.refund_amount)], ['Status', <StatusPill key="s" status={refund.status} />], ['Cancelled by', `${refund.cancelled_by_role}, ${refund.days_before_start}d before`], ['Reference', refund.refund_reference]]} />
            </Card>
          )}
          {exit && <Card title="Early departure" action={{ label: 'Open move-out', to: `/move-outs/${exit.id}` }}><Facts rows={[['Status', <StatusPill key="s" status={exit.status} />], ['Planned check-out', formatDate(exit.planned_checkout)], ['Total refund', exit.total_refund != null && money(c, exit.total_refund)]]} /></Card>}
        </Stack>
        <Stack>
          <Card title="Guest"><Facts rows={[['Name', renter && <Link to={`/users/${renter.id}`}>{personName(renter)}</Link>], ['Email', renter?.email], ['Phone', renter?.phone]]} /></Card>
          <Card title="Host"><Facts rows={[['Name', host && <Link to={`/hosts/${host.user_id}`}>{host.display_name}</Link>], ['Status', host && <StatusPill key="v" status={host.verification_status === 'verified' ? 'verified' : host.verification_status} />], ['City', host?.city]]} /></Card>
          <Card title={`Reports (${reports.length})`}>
            {reports.length === 0 ? <span style={{ color: 'var(--color-text-muted)' }}>Nobody has reported a problem.</span> : reports.map((r) => <Link key={r.id} to={`/reports/${r.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span>{r.category.replace(/_/g, ' ')}</span><StatusPill status={r.status} /></Link>)}
          </Card>
        </Stack>
      </Split>
      {cancelling && (
        <FieldDialog title="Cancel this booking?" danger submitLabel="Cancel booking" onClose={() => setCancelling(null)}
          intro={cancelling.is_paid ? `The guest has paid and will be refunded ${money(cancelling.currency, cancelling.tenant_refund)} in full, including the service fee, because Lotnis is cancelling.` : 'The guest has not paid, so nothing will be refunded.'}
          fields={[{ name: 'reason', label: 'Reason', hint: 'sent to the guest and host', type: 'textarea', required: true }]}
          onSubmit={async (v) => { await send(`/admin/bookings/${id}/cancel`, 'POST', { reason: String(v.reason).trim() }); setCancelling(null); reload(); }} />
      )}
    </Page>
  );
}
