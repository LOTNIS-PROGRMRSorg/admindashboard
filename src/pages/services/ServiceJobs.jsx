import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CellMain,
  Chips,
  DataTable,
  ErrorState,
  LoadingState,
  Page,
  PageHeader,
  StatusPill,
} from '../../components/ui';
import { formatDateTime, money } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { JOB_STATUS } from './serviceMeta';

const LIMIT = 20;

/** Every service job. Disputes first: the customer's money is held until you rule. */
export default function ServiceJobs() {
  const [params, setParams] = useSearchParams();
  const status = params.has('status') ? params.get('status') : 'disputed';
  const page = Number(params.get('page') || 1);
  const list = useApi(
    `/admin/services/requests?${new URLSearchParams({ ...(status && { status }), page, limit: LIMIT })}`,
  );
  const set = (patch) => {
    const n = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v !== undefined && v !== null ? n.set(k, v) : n.delete(k)));
    setParams(n, { replace: true });
  };
  return (
    <Page>
      <PageHeader
        eyebrow="Services"
        title="Service jobs"
        subtitle="Customers pay Lotnis; the provider is paid after the customer confirms. When a customer says something was wrong, the money stays with Lotnis until an admin decides."
      />
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)' }}>
          <Chips options={JOB_STATUS} value={status} onChange={(v) => set({ status: v, page: undefined })} />
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
            rowTo={(r) => `/service-jobs/${r.id}`}
            empty="No jobs here."
            columns={[
              {
                key: 'j',
                label: 'Job',
                render: (r) => <CellMain title={r.service?.title} sub={formatDateTime(r.starts_at)} />,
              },
              { key: 'c', label: 'Customer', render: (r) => r.customer_name || '—' },
              { key: 'h', label: 'Provider', render: (r) => r.host_name || '—' },
              {
                key: 'a',
                label: 'Price',
                render: (r) => <strong>{money(r.currency, r.agreed_total ?? r.current_offer)}</strong>,
              },
              { key: 's', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              { key: 'd', label: 'Problem', render: (r) => (r.dispute_reason ? r.dispute_reason.slice(0, 60) : '—') },
            ]}
          />
        )}
      </Card>
    </Page>
  );
}
