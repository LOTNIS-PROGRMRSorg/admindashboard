import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  StatusPill,
} from '../../components/ui';
import { formatDateTime, money } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import { destinationLine } from './payoutShared';

const Line = ({ label, value, strong }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      fontWeight: strong ? 700 : 500,
      borderTop: strong ? '1px solid var(--color-border)' : 0,
    }}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

/** One payout to one host: where to send it, what it covers, and the buttons to confirm or fail it. */
export default function PayoutBatchPage() {
  const { id } = useParams();
  const { data: d, error, loading, reload } = useApi(`/admin/payouts/batches/${id}`);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
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
        <PageHeader back={{ to: '/payouts?tab=batches', label: 'All payouts' }} title="Payout" />
        <ErrorState>{error}</ErrorState>
      </Page>
    );

  const { batch: b, items, adjustments } = d;
  const c = b.currency;
  const act = async (action, body, ok, msg) => {
    if (!ok) {
      setProblem(msg);
      return;
    }
    setBusy(action);
    setProblem('');
    try {
      await send(`/admin/payouts/batches/${id}/${action}`, 'POST', body);
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
        back={{ to: '/payouts?tab=batches', label: 'All payouts' }}
        eyebrow="Payout"
        title={
          <>
            {money(c, b.amount)} <StatusPill status={b.status} />
          </>
        }
        subtitle={`Created ${formatDateTime(b.created_at)}`}
      />
      <Grid>
        <Card title="Send the money to">
          <p style={{ margin: 0, fontWeight: 600 }}>{destinationLine(b.destination)}</p>
          <Facts
            rows={[
              ['Reference', b.reference],
              ['Paid', b.paid_at && formatDateTime(b.paid_at)],
              ['Note', b.note],
              ['Failed because', b.failure_reason],
            ]}
          />
        </Card>
        <Card title="The sum">
          <Line label="Earnings" value={money(c, b.items_total)} />
          {Number(b.adjustments_total) !== 0 && (
            <Line label="Refund adjustments" value={money(c, b.adjustments_total)} />
          )}
          <Line label="Amount to send" value={money(c, b.amount)} strong />
        </Card>
      </Grid>
      <Card title="What this covers">
        {items.map((i) => (
          <Line
            key={i.id}
            label={`${i.service_label} · ${i.title}${i.detail ? ` (${i.detail})` : ''}`}
            value={money(c, i.amount)}
          />
        ))}
        {adjustments.map((a) => (
          <Line key={a.id} label={`Adjustment · ${a.reason}`} value={money(c, a.amount)} />
        ))}
      </Card>
      {b.status === 'processing' && (
        <Card title="After you have sent it">
          <Grid>
            <Field label="Transfer / MoMo reference">
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </Field>
            <Field label="Note">
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </Grid>
          <Field label="If it failed, why?">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. account name mismatch"
            />
          </Field>
          {problem && <Notice tone="danger">{problem}</Notice>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              variant="success"
              disabled={!!busy}
              onClick={() => act('paid', { reference, note }, reference.trim(), 'Enter the payment reference.')}
            >
              {busy === 'paid' ? 'Saving…' : 'Mark as paid'}
            </Button>
            <Button
              variant="danger"
              disabled={!!busy}
              onClick={() => act('failed', { reason }, reason.trim(), 'Say what went wrong.')}
            >
              Mark as failed (release the items)
            </Button>
          </div>
        </Card>
      )}
    </Page>
  );
}
