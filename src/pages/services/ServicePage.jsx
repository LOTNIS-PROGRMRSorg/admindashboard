import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CellMain,
  DataTable,
  ErrorState,
  Facts,
  LoadingState,
  Page,
  PageHeader,
  Split,
  Stack,
  StatusPill,
  Tabs,
} from '../../components/ui';
import { ConfirmDialog, FieldDialog } from '../../components/modals';
import EngagementPanel from '../../components/stats/EngagementPanel';
import { formatDate, formatDateTime, money, titleCase } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import { UNIT } from './serviceMeta';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'visits', label: 'Visits' },
  { key: 'reports', label: 'Reports' },
];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** One service on its own page: what is offered, by whom, how it performs — and approve, reject or suspend it. */
export default function ServicePage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview';
  const { data: d, error, loading, reload } = useApi(`/admin/services/${id}`);
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
        <PageHeader back={{ to: '/services', label: 'All services' }} title="Service" />
        <ErrorState>{error}</ErrorState>
      </Page>
    );
  const { service: s, category, provider, availability, requests, reports, engagement } = d;
  const act = async (action, reason) => {
    await send(`/admin/services/${id}/${action}`, 'POST', { reason });
    setDialog(null);
    reload();
  };
  const hours = DAY.map((n, i) => [
    n,
    availability
      .filter((a) => a.weekday === i)
      .map((a) => `${a.start_time.slice(0, 5)}–${a.end_time.slice(0, 5)}`)
      .join(', ') || 'Closed',
  ]);

  return (
    <Page>
      <PageHeader
        back={{ to: '/services', label: 'All services' }}
        eyebrow={category?.name}
        title={
          <>
            {s.title} <StatusPill status={s.status} />
            {s.is_paused && <StatusPill status="paused" />}
          </>
        }
        subtitle={s.summary}
      >
        {['pending_review', 'rejected', 'suspended'].includes(s.status) && (
          <Button variant="success" onClick={() => setDialog(s.status === 'suspended' ? 'unsuspend' : 'approve')}>
            {s.status === 'suspended' ? 'Restore' : 'Approve & publish'}
          </Button>
        )}
        {['pending_review'].includes(s.status) && (
          <Button variant="danger" onClick={() => setDialog('reject')}>
            Reject
          </Button>
        )}
        {s.status === 'published' && (
          <Button variant="danger" onClick={() => setDialog('suspend')}>
            Suspend
          </Button>
        )}
      </PageHeader>
      <Tabs
        tabs={TABS.map((t) => (t.key === 'reports' && reports.length ? { ...t, badge: reports.length } : t))}
        value={tab}
        onChange={(k) => setParams(k === 'overview' ? {} : { tab: k })}
      />

      {tab === 'overview' && (
        <Split>
          <Stack>
            {s.photos?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {s.photos.map((u) => (
                  <img
                    key={u}
                    src={u}
                    alt=""
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ))}
              </div>
            )}
            <Card title="About">
              <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{s.description || '—'}</p>
            </Card>
          </Stack>
          <Stack>
            <Card title="Details">
              <Facts
                rows={[
                  ['Rate', `${money(s.currency, s.rate)} / ${UNIT[s.pricing_unit]}`],
                  ['Bookable length', `${s.min_units}–${s.max_units}`],
                  ['Accepts lower offers', s.allow_negotiation ? 'Yes (down to the minimum %)' : 'No'],
                  ['Where', [s.city, s.region].filter(Boolean).join(', ')],
                  ['Covers', `${s.service_radius_km} km`],
                  ['Travels to customer', s.travels_to_customer ? 'Yes' : 'No'],
                  ['Own place', s.works_at_own_place ? 'Yes' : null],
                  ['Rating', s.rating ? `${s.rating} (${s.review_count})` : null],
                  ['Jobs done', s.jobs_completed],
                  ['Submitted', formatDateTime(s.submitted_at)],
                  ['Rejected / suspended because', s.rejection_reason],
                  ['Paused by provider', s.is_paused && (s.pause_reason || 'Yes')],
                ]}
              />
            </Card>
            <Card title="Provider" action={provider ? { label: 'Open host', to: `/hosts/${s.host_id}` } : undefined}>
              <Facts
                rows={[
                  ['Name', provider?.name],
                  ['Status', provider && <StatusPill key="v" status={provider.verified ? 'verified' : 'pending'} />],
                  ['On Lotnis since', provider && formatDate(provider.since)],
                ]}
              />
            </Card>
            <Card title="Working hours">
              <Facts rows={hours} />
            </Card>
          </Stack>
        </Split>
      )}
      {tab === 'jobs' && (
        <Card flush>
          <DataTable
            rows={requests}
            rowTo={(r) => `/service-jobs/${r.id}`}
            empty="No requests yet."
            columns={[
              { key: 'w', label: 'When', render: (r) => formatDateTime(r.starts_at) },
              {
                key: 'a',
                label: 'Price',
                render: (r) => <strong>{money(r.currency, r.agreed_total ?? r.current_offer)}</strong>,
              },
              { key: 's', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              { key: 'c', label: 'Asked', render: (r) => formatDate(r.created_at) },
            ]}
          />
        </Card>
      )}
      {tab === 'visits' && <EngagementPanel engagement={engagement} />}
      {tab === 'reports' && (
        <Card flush>
          <DataTable
            rows={reports}
            rowTo={(r) => `/reports/${r.id}`}
            empty="Nobody has reported this service."
            columns={[
              {
                key: 'c',
                label: 'Reason',
                render: (r) => <CellMain title={titleCase(r.category)} sub={r.description?.slice(0, 80)} />,
              },
              {
                key: 'a',
                label: 'Seen by',
                render: (r) => (r.audience === 'host_and_admin' ? 'Provider + admins' : 'Admins only'),
              },
              { key: 's', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </Card>
      )}

      {(dialog === 'approve' || dialog === 'unsuspend') && (
        <ConfirmDialog
          title={dialog === 'approve' ? 'Publish this service?' : 'Restore this service?'}
          confirmLabel="Yes"
          onClose={() => setDialog(null)}
          onConfirm={() => act(dialog)}
        >
          It goes live and the provider is told.
        </ConfirmDialog>
      )}
      {(dialog === 'reject' || dialog === 'suspend') && (
        <FieldDialog
          title={dialog === 'reject' ? 'Reject this service' : 'Suspend this service'}
          danger
          submitLabel={dialog === 'reject' ? 'Reject' : 'Suspend'}
          intro="The provider sees this reason."
          onClose={() => setDialog(null)}
          fields={[{ name: 'reason', label: 'Reason', type: 'textarea', required: true }]}
          onSubmit={(v) => act(dialog, v.reason)}
        />
      )}
      <p style={{ margin: 0 }}>
        <Link to="/services">← All services</Link>
      </p>
    </Page>
  );
}
