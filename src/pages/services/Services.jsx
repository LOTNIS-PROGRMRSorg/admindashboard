import { Wrench } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CellMain,
  Chips,
  DataTable,
  ErrorState,
  Input,
  LoadingState,
  Page,
  PageHeader,
  StatGrid,
  StatTile,
  StatusPill,
} from '../../components/ui';
import { formatDate, money } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { SERVICE_STATUS, UNIT } from './serviceMeta';

const LIMIT = 20;

/** Every service providers offer: approve new ones, suspend bad ones, open one for its jobs and visits. */
export default function Services() {
  const [params, setParams] = useSearchParams();
  const status = params.has('status') ? params.get('status') : 'pending_review';
  const query = params.get('query') || '';
  const page = Number(params.get('page') || 1);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v !== undefined && v !== null ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };
  const summary = useApi('/admin/services/summary');
  const list = useApi(
    `/admin/services?${new URLSearchParams({ ...(status && { status }), ...(query && { query }), page, limit: LIMIT })}`,
  );
  const s = summary.data;
  return (
    <Page>
      <PageHeader
        eyebrow="Services"
        title="Services"
        subtitle="Skills people offer on Lotnis. A new provider's first service is approved here; after that their services publish themselves."
      />
      {summary.error && <ErrorState>{summary.error}</ErrorState>}
      <StatGrid>
        <StatTile
          label="To review"
          value={s?.pending_review ?? '—'}
          icon={Wrench}
          tone={s?.pending_review ? 'warn' : undefined}
          to="?status=pending_review"
        />
        <StatTile label="Live services" value={s?.live ?? '—'} tone="good" to="?status=published" />
        <StatTile
          label="Disputes"
          value={s?.disputes ?? '—'}
          tone={s?.disputes ? 'danger' : undefined}
          to="/service-jobs?status=disputed"
        />
        <StatTile
          label="Customer money held"
          value={money('GHS', s?.held_amount)}
          sub={`${s?.open_jobs ?? 0} job(s) paid and waiting`}
          to="/service-jobs?status=paid"
        />
        <StatTile
          label="Refunds to send"
          value={s?.refunds_open ?? '—'}
          tone={s?.refunds_open ? 'warn' : undefined}
          to="/refunds?service=service"
        />
      </StatGrid>
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={SERVICE_STATUS} value={status} onChange={(v) => set({ status: v })} />
          <Input
            placeholder="Search title or city"
            defaultValue={query}
            onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() || undefined })}
            style={{ maxWidth: 320 }}
          />
        </div>
        {list.loading ? (
          <LoadingState />
        ) : list.error ? (
          <ErrorState>{list.error}</ErrorState>
        ) : (
          <DataTable
            rows={list.data?.data ?? []}
            total={list.data?.total}
            page={page}
            limit={LIMIT}
            onPage={(p) => set({ page: String(p) })}
            rowTo={(r) => `/services/${r.id}`}
            empty={status === 'pending_review' ? 'No services are waiting for review.' : 'No services match.'}
            columns={[
              {
                key: 't',
                label: 'Service',
                render: (r) => <CellMain title={r.title} sub={`${r.category?.name ?? ''} · ${r.city ?? ''}`} />,
              },
              { key: 'p', label: 'Provider', render: (r) => r.provider?.name ?? '—' },
              { key: 'rate', label: 'Rate', render: (r) => `${money(r.currency, r.rate)} / ${UNIT[r.pricing_unit]}` },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <>
                    <StatusPill status={r.status} />
                    {r.is_paused && (
                      <>
                        {' '}
                        <StatusPill status="paused" />
                      </>
                    )}
                  </>
                ),
              },
              { key: 'jobs', label: 'Jobs done', render: (r) => r.jobs_completed },
              { key: 'sub', label: 'Submitted', render: (r) => formatDate(r.submitted_at || r.created_at) },
            ]}
          />
        )}
      </Card>
    </Page>
  );
}
