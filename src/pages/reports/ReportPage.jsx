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
  Split,
  Stack,
  StatusPill,
  Textarea,
} from '../../components/ui';
import { formatDateTime, money, personName } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import { AudiencePill, SeverityPill } from './ReportBadges';
import { categoryLabel, subjectOf, TARGET_LABEL } from './reportMeta';

/** One report on its own page: what was said, who said it, what it's about, and the decision. */
export default function ReportPage() {
  const { id } = useParams();
  const { data: r, error, loading, reload } = useApi(`/admin/reports/${id}`);
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [note, setNote] = useState(null);
  const [deduct, setDeduct] = useState('');
  const [busy, setBusy] = useState(false);
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
        <PageHeader back={{ to: '/reports', label: 'All reports' }} title="Report" />
        <ErrorState>{error}</ErrorState>
      </Page>
    );

  const subject = subjectOf(r);
  const closed = ['resolved', 'dismissed'].includes(r.status);
  const save = async (nextStatus) => {
    setBusy(true);
    setProblem('');
    try {
      await send(`/admin/reports/${r.id}`, 'PATCH', {
        status: nextStatus || status || undefined,
        severity: severity || undefined,
        admin_note: note ?? undefined,
        deduct: Number(deduct) > 0 ? Number(deduct) : undefined,
      });
      setStatus('');
      setSeverity('');
      setNote(null);
      setDeduct('');
      reload();
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <PageHeader
        back={{ to: '/reports', label: 'All reports' }}
        eyebrow={`${TARGET_LABEL[r.target_type] ?? r.target_type} report`}
        title={
          <>
            {categoryLabel(r.category)} <StatusPill status={r.status} /> <SeverityPill severity={r.severity} />
          </>
        }
        subtitle={`Reported ${formatDateTime(r.created_at)}`}
      >
        <AudiencePill audience={r.audience} />
      </PageHeader>

      <Split>
        <Stack>
          <Card title="What was reported">
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{r.description}</p>
            {r.evidence_urls?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.evidence_urls.map((u) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer">
                    <img
                      src={u}
                      alt="Evidence"
                      style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                  </a>
                ))}
              </div>
            )}
          </Card>

          {r.host_response && (
            <Card title="The host's reply">
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{r.host_response}</p>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                {formatDateTime(r.host_responded_at)}
              </span>
            </Card>
          )}

          <Card title={closed ? 'Decision' : 'Decide'}>
            <Stack>
              {r.admin_note && closed && <p style={{ margin: 0 }}>{r.admin_note}</p>}
              {!closed && (
                <>
                  <Field label="What you decided" hint="the reporter is told this when you close the report">
                    <Textarea rows={3} value={note ?? r.admin_note ?? ''} onChange={(e) => setNote(e.target.value)} />
                  </Field>
                  <Grid>
                    <Field label="Severity">
                      <Select
                        value={severity || r.severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        options={[
                          ['low', 'Low'],
                          ['normal', 'Normal'],
                          ['high', 'High'],
                          ['urgent', 'Urgent'],
                        ]}
                      />
                    </Field>
                    {r.booking_id && (
                      <Field
                        label={`Keep back from the host's payout (${r.booking?.currency_snapshot ?? 'GHS'})`}
                        hint="optional — to compensate the guest"
                      >
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={deduct}
                          onChange={(e) => setDeduct(e.target.value)}
                        />
                      </Field>
                    )}
                  </Grid>
                  {problem && <Notice tone="danger">{problem}</Notice>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.status === 'open' && (
                      <Button disabled={busy} onClick={() => save('in_review')}>
                        Start review
                      </Button>
                    )}
                    <Button variant="success" disabled={busy} onClick={() => save('resolved')}>
                      Resolve
                    </Button>
                    <Button variant="danger" disabled={busy} onClick={() => save('dismissed')}>
                      Dismiss
                    </Button>
                    <Button variant="ghost" disabled={busy} onClick={() => save()}>
                      Save without closing
                    </Button>
                  </div>
                </>
              )}
              {closed && (
                <Button
                  onClick={() =>
                    send(`/admin/reports/${r.id}`, 'PATCH', { status: 'in_review' })
                      .then(reload)
                      .catch((e) => setProblem(e.message))
                  }
                >
                  Reopen
                </Button>
              )}
              {closed && problem && <Notice tone="danger">{problem}</Notice>}
            </Stack>
          </Card>
        </Stack>

        <Stack>
          <Card title="About">
            <Facts
              rows={[
                [
                  TARGET_LABEL[r.target_type] ?? 'Subject',
                  subject.to ? <Link to={subject.to}>{subject.label}</Link> : subject.label,
                ],
                ['Host', r.host_id && <Link to={`/hosts/${r.host_id}`}>{r.host_name || 'Open host'}</Link>],
                [
                  'Booking',
                  r.booking && (
                    <Link to={`/bookings/${r.booking.id}`}>
                      {r.booking.start_date} → {r.booking.end_date} ·{' '}
                      {money(r.booking.currency_snapshot, r.booking.final_amount)}
                    </Link>
                  ),
                ],
                [
                  'Ticket order',
                  r.order && (
                    <Link to={`/events/${r.event_id}`}>
                      {r.order.kind} · {money(r.order.currency, r.order.total)}
                    </Link>
                  ),
                ],
              ]}
            />
          </Card>
          <Card title="Reporter">
            <Facts
              rows={[
                [
                  'Name',
                  r.reporter ? <Link to={`/users/${r.reporter.id}`}>{personName(r.reporter)}</Link> : r.reporter_name,
                ],
                ['Email', r.reporter_email || r.reporter?.email],
                ['Phone', r.reporter?.phone],
                [
                  'Bought / booked here',
                  r.audience === 'host_and_admin'
                    ? 'Yes — the host can see this report'
                    : 'No — only admins can see this report',
                ],
              ]}
            />
          </Card>
          {r.related_reports?.length > 0 && (
            <Card title="Other reports on the same thing">
              {r.related_reports.map((x) => (
                <Link
                  key={x.id}
                  to={`/reports/${x.id}`}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
                >
                  <span>{categoryLabel(x.category)}</span>
                  <StatusPill status={x.status} />
                </Link>
              ))}
            </Card>
          )}
        </Stack>
      </Split>
    </Page>
  );
}
