import { FileWarning } from 'lucide-react';
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
  Select,
  StatGrid,
  StatTile,
  StatusPill,
  Toolbar,
} from '../../components/ui';
import { formatDate } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { AudiencePill, SeverityPill } from './ReportBadges';
import { categoryLabel, subjectOf, TARGET_LABEL, TARGETS } from './reportMeta';

const STATUS = [
  { key: '', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_review', label: 'In review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'dismissed', label: 'Dismissed' },
];
const LIMIT = 20;

/** Every report — fake listings, stays that went wrong, ticket problems, hosts — in one place. */
export default function Reports() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '',
    target = params.get('target') || '',
    severity = params.get('severity') || '',
    audience = params.get('audience') || '',
    query = params.get('query') || '',
    page = Number(params.get('page') || 1);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };
  const summary = useApi('/admin/reports/summary');
  const list = useApi(
    `/admin/reports?${new URLSearchParams({ ...(status && { status }), ...(target && { target }), ...(severity && { severity }), ...(audience && { audience }), ...(query && { query }), page, limit: LIMIT })}`,
  );
  const s = summary.data;

  return (
    <Page>
      <PageHeader
        eyebrow="Trust & safety"
        title="Reports"
        subtitle="Anything people flag: listings and events that look fake, stays that weren't as described, ticket problems and hosts. Reports from the general public are seen by admins only. If the person actually booked or bought, the host sees it too and can reply."
      />
      {summary.error && <ErrorState>{summary.error}</ErrorState>}
      {s && (
        <StatGrid>
          <StatTile
            label="Open"
            value={s.open}
            icon={FileWarning}
            tone={s.open ? 'warn' : undefined}
            to="?status=open"
          />
          <StatTile label="In review" value={s.in_review} to="?status=in_review" />
          <StatTile label="Urgent" value={s.urgent} tone={s.urgent ? 'danger' : undefined} to="?severity=urgent" />
          <StatTile
            label="All time"
            value={s.total}
            sub={
              Object.entries(s.by_target)
                .map(([k, v]) => `${TARGET_LABEL[k] ?? k} ${v}`)
                .join(' · ') || undefined
            }
          />
        </StatGrid>
      )}
      <Card flush>
        <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <Chips options={STATUS} value={status} onChange={(v) => set({ status: v })} />
          <Toolbar>
            <Select
              value={target}
              onChange={(e) => set({ target: e.target.value })}
              options={TARGETS.map((t) => [t.key, t.label])}
            />
            <Select
              value={severity}
              onChange={(e) => set({ severity: e.target.value })}
              options={[
                ['', 'Any severity'],
                ['urgent', 'Urgent'],
                ['high', 'High'],
                ['normal', 'Normal'],
                ['low', 'Low'],
              ]}
            />
            <Select
              value={audience}
              onChange={(e) => set({ audience: e.target.value })}
              options={[
                ['', 'Anyone can see'],
                ['admin', 'Admins only'],
                ['host_and_admin', 'Host + admins'],
              ]}
            />
            <Input
              placeholder="Search what was said or the reporter's email"
              defaultValue={query}
              onKeyDown={(e) => e.key === 'Enter' && set({ query: e.target.value.trim() })}
              style={{ minWidth: 280 }}
            />
          </Toolbar>
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
            rowTo={(r) => `/reports/${r.id}`}
            empty="No reports match."
            columns={[
              {
                key: 'what',
                label: 'About',
                render: (r) => (
                  <CellMain
                    title={subjectOf(r).label}
                    sub={`${TARGET_LABEL[r.target_type] ?? r.target_type} · ${categoryLabel(r.category)}`}
                  />
                ),
              },
              {
                key: 'who',
                label: 'Reported by',
                render: (r) => (
                  <CellMain
                    title={r.reporter_name || r.reporter_email || 'Anonymous'}
                    sub={r.reporter_email && r.reporter_name ? r.reporter_email : null}
                  />
                ),
              },
              { key: 'sev', label: 'Severity', render: (r) => <SeverityPill severity={r.severity} /> },
              { key: 'aud', label: 'Seen by', render: (r) => <AudiencePill audience={r.audience} /> },
              { key: 'when', label: 'Reported', render: (r) => formatDate(r.created_at) },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        )}
      </Card>
    </Page>
  );
}
