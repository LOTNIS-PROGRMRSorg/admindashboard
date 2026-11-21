import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  ErrorState,
  Facts,
  LoadingState,
  Notice,
  Page,
  PageHeader,
  Split,
  Stack,
  StatusPill,
  Timeline,
} from '../../components/ui';
import { FieldDialog } from '../../components/modals';
import { formatDateTime, money } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import { UNIT } from './serviceMeta';

/** One job, with everything both people said and paid — and, if it is disputed, the buttons to rule on it. */
export default function ServiceJobPage() {
  const { id } = useParams();
  const { data: j, error, loading, reload } = useApi(`/admin/services/requests/${id}`);
  const [dialog, setDialog] = useState(null);
  if (loading)
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  if (error)
    return (
      <Page>
        <PageHeader back={{ to: '/service-jobs', label: 'All jobs' }} title="Job" />
        <ErrorState>{error}</ErrorState>
      </Page>
    );
  const c = j.currency;
  const disputed = j.status === 'disputed';
  const rule = (outcome) => async (v) => {
    await send(`/admin/services/requests/${id}/resolve`, 'POST', {
      outcome,
      note: v.note,
      refund_amount: v.refund ? Number(v.refund) : undefined,
    });
    setDialog(null);
    reload();
  };
  const agreed = j.agreed_total ?? j.current_offer;

  return (
    <Page>
      <PageHeader
        back={{ to: '/service-jobs', label: 'All jobs' }}
        eyebrow="Service job"
        title={
          <>
            {j.service.title} <StatusPill status={j.status} />
          </>
        }
        subtitle={`${formatDateTime(j.starts_at)} · ${j.units} × ${UNIT[j.service.pricing_unit]}`}
      >
        <Button to={`/services/${j.service.id}`}>Open service</Button>
      </PageHeader>
      {disputed && (
        <Notice tone="danger">
          The customer says: “{j.dispute_reason}”. {money(c, agreed)} is held by Lotnis. Decide below — both people are
          told.
        </Notice>
      )}
      <Split>
        <Stack>
          <Card title="The job">
            <Facts
              rows={[
                ['Provider', j.provider && <Link to={`/hosts/${j.admin.host_id}`}>{j.provider.name}</Link>],
                [
                  'Customer',
                  <Link key="c" to={`/users/${j.admin.customer_id}`}>
                    {j.customer.name}
                  </Link>,
                ],
                ['When', `${formatDateTime(j.starts_at)} → ${formatDateTime(j.ends_at)}`],
                ['Where', j.location_text],
                ['Notes', j.notes],
                ['Cancelled', j.cancel_reason && `${j.cancelled_by}: ${j.cancel_reason}`],
                ['Decision', j.resolution],
              ]}
            />
          </Card>
          <Card title="Price & money">
            <Facts
              rows={[
                ["Provider's price", money(c, j.list_total)],
                [
                  'Agreed',
                  j.agreed_total != null ? money(c, j.agreed_total) : `${money(c, j.current_offer)} (not agreed)`,
                ],
                ['Customer paid', j.money && money(c, j.money.total_charge)],
                ['Processing fee (not refundable)', j.money && money(c, j.money.processing_fee)],
                [
                  'Lotnis commission',
                  j.money?.commission != null && `${money(c, j.money.commission)} (${j.money.commission_percent}%)`,
                ],
                ['Provider earns', j.money?.you_earn != null && money(c, j.money.you_earn)],
                ['Payment reference', j.admin.payment_reference],
              ]}
            />
          </Card>
          <Card title="Price talks">
            <Timeline
              items={j.offers.map((o) => ({
                at: o.created_at,
                text: `${o.by_role === 'host' ? 'Provider' : 'Customer'} offered ${money(c, o.amount)}${o.message ? ` — “${o.message}”` : ''}`,
              }))}
            />
          </Card>
          {j.review && (
            <Card title="Review">
              <p style={{ margin: 0 }}>
                {'★'.repeat(j.review.rating)} {j.review.comment}
              </p>
            </Card>
          )}
        </Stack>
        <Stack>
          {disputed && (
            <Card title="Rule on the dispute">
              <Stack>
                <Button variant="success" onClick={() => setDialog('release')}>
                  Release the money to the provider
                </Button>
                <Button variant="danger" onClick={() => setDialog('refund')}>
                  Refund the customer in full
                </Button>
                <Button onClick={() => setDialog('split')}>Split — refund part</Button>
              </Stack>
            </Card>
          )}
          {j.refunds.length > 0 && (
            <Card title="Refunds">
              {j.refunds.map((r) => (
                <Link
                  key={r.id}
                  to={`/refunds/service/${r.id}`}
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>{money(c, r.amount)}</span>
                  <StatusPill status={r.status === 'processed' ? 'done' : r.status} />
                </Link>
              ))}
            </Card>
          )}
        </Stack>
      </Split>
      {dialog === 'release' && (
        <FieldDialog
          title="Release to the provider?"
          submitLabel="Release"
          intro="The provider's payout becomes due."
          onClose={() => setDialog(null)}
          fields={[{ name: 'note', label: 'What you decided (both see this)', type: 'textarea', required: true }]}
          onSubmit={rule('release')}
        />
      )}
      {dialog === 'refund' && (
        <FieldDialog
          title="Refund the customer?"
          danger
          submitLabel="Refund in full"
          intro={`${money(c, agreed)} goes back to the customer (not the processing fee). The provider's payout is cancelled.`}
          onClose={() => setDialog(null)}
          fields={[{ name: 'note', label: 'What you decided (both see this)', type: 'textarea', required: true }]}
          onSubmit={rule('refund')}
        />
      )}
      {dialog === 'split' && (
        <FieldDialog
          title="Split the money"
          submitLabel="Apply"
          intro={`Choose how much of the ${money(c, agreed)} goes back to the customer. The provider keeps their share of the rest.`}
          onClose={() => setDialog(null)}
          fields={[
            { name: 'refund', label: `Refund amount (${c})`, type: 'number', step: '0.01', min: 0.01, required: true },
            { name: 'note', label: 'What you decided (both see this)', type: 'textarea', required: true },
          ]}
          onSubmit={rule('split')}
        />
      )}
    </Page>
  );
}
