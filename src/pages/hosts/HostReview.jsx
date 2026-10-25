import { useState } from 'react';
import { Button, Card, ErrorState, Grid, Input, LoadingState, Notice, Select, Stack } from '../../components/ui';
import { send, useApi } from '../../lib/useApi';

const REQUIREMENT_LABELS = {
  identity: 'Identity (government ID + selfie)',
  phone: 'Phone verification',
  ownership: 'Proof of address / ownership',
  business: 'Business registration',
  tax: 'Tax identification',
  payout: 'Payout details',
};

const DocCard = ({ label, url }) => (
  <div style={{ display: 'grid', gap: 4, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
    <span>{label}</span>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={label}
          style={{
            width: '100%',
            height: 110,
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        />
      </a>
    ) : (
      <span>Not uploaded</span>
    )}
  </div>
);

function RequirementRow({ requirement, review, reasons, hostProfileId, onSaved }) {
  const [reasonId, setReasonId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (status) => {
    setSaving(true);
    setError('');
    try {
      await send(`/admin/hosts/${hostProfileId}/requirements/${requirement}`, 'PATCH', {
        status,
        rejection_reason_id: reasonId || undefined,
        note: note || undefined,
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const options = [
    ['', 'Rejection reason (optional)'],
    ...reasons.filter((r) => r.requirement === requirement).map((r) => [r.id, r.reason]),
  ];
  return (
    <div
      style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-3)', display: 'grid', gap: 8 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
        <span>{REQUIREMENT_LABELS[requirement] || requirement}</span>
        <span style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
          {(review?.status || 'pending').replace(/_/g, ' ')}
        </span>
      </div>
      {review?.note && <small style={{ color: 'var(--color-text-muted)' }}>Note: {review.note}</small>}
      {review?.rejection_reason?.reason && (
        <small style={{ color: 'var(--color-text-muted)' }}>Reason: {review.rejection_reason.reason}</small>
      )}
      <Grid>
        <Select value={reasonId} onChange={(e) => setReasonId(e.target.value)} options={options} />
        <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </Grid>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="success" size="sm" disabled={saving} onClick={() => submit('approved')}>
          Approve
        </Button>
        <Button variant="danger" size="sm" disabled={saving} onClick={() => submit('rejected')}>
          Reject
        </Button>
      </div>
      {error && <Notice tone="danger">{error}</Notice>}
    </div>
  );
}

/** Review a host's application: the documents, then each requirement approved or sent back. */
export default function HostReview({ hostProfileId }) {
  const full = useApi(`/admin/hosts/${hostProfileId}`);
  const reviews = useApi(`/admin/hosts/${hostProfileId}/requirements`);
  const reasons = useApi('/admin/hosts/rejection-reasons');
  const byReq = Object.fromEntries((reviews.data ?? []).map((r) => [r.requirement, r]));
  if (full.loading) return <LoadingState />;
  if (full.error) return <ErrorState>{full.error}</ErrorState>;
  const host = full.data;
  const business = host.account_type === 'business';
  return (
    <Stack>
      <Card title="Documents">
        <Grid cols={3}>
          <DocCard label="Government ID (front)" url={host.gov_id_front_image_url} />
          <DocCard label="Government ID (back)" url={host.gov_id_back_image_url} />
          <DocCard label="Selfie" url={host.selfie_image_url} />
          <DocCard label="Proof of address" url={host.proof_image_url} />
          {business && <DocCard label="Business certificate" url={host.biz_certificate_image_url} />}
        </Grid>
      </Card>
      <Card title="Requirement review">
        {Object.keys(REQUIREMENT_LABELS)
          .filter((r) => business || !['business', 'tax'].includes(r))
          .map((req) => (
            <RequirementRow
              key={req}
              requirement={req}
              review={byReq[req]}
              reasons={reasons.data ?? []}
              hostProfileId={hostProfileId}
              onSaved={reviews.reload}
            />
          ))}
      </Card>
    </Stack>
  );
}
