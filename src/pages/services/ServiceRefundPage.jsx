import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  ErrorState,
  Facts,
  Field,
  Grid,
  Input,
  LoadingState,
  Notice,
  Page,
  PageHeader,
  Select,
  Stack,
  StatusPill,
  Textarea,
} from '../../components/ui';
import { formatDateTime, money, personName } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';

const METHODS = ['Paystack refund', 'Mobile money', 'Bank transfer', 'Other'];
const STAGE = { pending: 'pending', processing: 'sending', processed: 'done', failed: 'failed' };
const WHY = {
  customer_cancelled: 'The customer cancelled the job',
  provider_cancelled: 'The provider cancelled the job',
  dispute_reason: 'Dispute ruled for the customer',
  dispute_refund: 'A dispute was ruled for the customer',
  admin: 'Lotnis issued it',
};

/** A service refund on its own page: why, how much, and the buttons to record that you sent it. */
export default function ServiceRefundPage() {
  const { id } = useParams();
  const { data: r, error, loading, reload } = useApi(`/admin/services/refunds/${id}`);
  const [method, setMethod] = useState(METHODS[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');
  if (loading)
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  if (error)
    return (
      <Page>
        <PageHeader back={{ to: '/refunds', label: 'All refunds' }} title="Refund" />
        <ErrorState>{error}</ErrorState>
      </Page>
    );
  const req = r.request;
  const done = r.status === 'processed';
  const act = async (status, check) => {
    if (check) return setProblem(check);
    setBusy(status);
    setProblem('');
    try {
      await send(`/admin/services/refunds/${id}`, 'PATCH', {
        status,
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      });
      reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy('');
    }
  };
  return (
    <Page>
      <PageHeader
        back={{ to: '/refunds', label: 'All refunds' }}
        eyebrow="Service refund"
        title={
          <>
            {money(r.currency, r.amount)} <StatusPill status={STAGE[r.status]} />
          </>
        }
        subtitle={`${req?.service?.title ?? 'Service job'} · ${personName(req?.customer)}`}
      />
      <Grid>
        <Card title="Why">
          <Facts
            rows={[
              ['Reason', WHY[r.trigger] ?? r.trigger],
              ['Details', r.reason],
              [
                'Job',
                req && (
                  <Link key="j" to={`/service-jobs/${r.request_id}`}>
                    Open the job
                  </Link>
                ),
              ],
              ['Customer', personName(req?.customer)],
              ['Customer email', req?.customer?.email],
              ['Provider', personName(req?.host)],
              ['Asked', formatDateTime(r.created_at)],
            ]}
          />
        </Card>
        <Card title="The money">
          <Facts
            rows={[
              ['Agreed price', req && money(r.currency, req.agreed_total)],
              ['Paid by the customer', req && money(r.currency, req.total_charge)],
              ['Refund', money(r.currency, r.amount)],
              ['Not refundable', req && `${money(r.currency, req.processing_fee)} payment-processing fee`],
              ['Original payment', req?.payment_reference],
            ]}
          />
        </Card>
      </Grid>
      {done && (
        <Card title="Refund sent">
          <Facts
            rows={[
              ['Method', r.refund_method],
              ['Reference', r.refund_reference],
              ['Sent', formatDateTime(r.processed_at)],
              ['Note', r.admin_note],
            ]}
          />
        </Card>
      )}
      {!done && (
        <Card title="Record the refund">
          <Stack>
            <Grid>
              <Field label="Method">
                <Select
                  options={METHODS.map((m) => [m, m])}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </Field>
              <Field label="Payment reference">
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Paystack refund ID or MoMo transaction ID"
                />
              </Field>
            </Grid>
            <Field label="Note (only admins see it)">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {r.status === 'pending' && (
                <Button disabled={!!busy} onClick={() => act('processing')}>
                  Mark as being sent
                </Button>
              )}
              <Button
                variant="success"
                disabled={!!busy}
                onClick={() =>
                  act('processed', !reference.trim() && 'Enter the payment reference of the refund you sent.')
                }
              >
                {busy === 'processed' ? 'Saving…' : 'Mark as sent'}
              </Button>
              <Button
                variant="danger"
                disabled={!!busy}
                onClick={() => act('failed', !note.trim() && 'Add a note explaining why the refund failed.')}
              >
                Mark as failed
              </Button>
            </div>
            {problem && <Notice tone="danger">{problem}</Notice>}
          </Stack>
        </Card>
      )}
    </Page>
  );
}
