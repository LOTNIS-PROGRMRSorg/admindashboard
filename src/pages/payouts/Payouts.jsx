import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Banknote, Clock, PauseCircle, Send, Wallet } from 'lucide-react';
import { Button, Card, CellMain, Chips, DataTable, ErrorState, LoadingState, Notice, Page, PageHeader, StatGrid, StatTile, StatusPill, Tabs } from '../../components/ui';
import { FieldDialog } from '../../components/modals';
import { formatDateTime, money } from '../../lib/format';
import { send, useApi } from '../../lib/useApi';
import { BUCKETS, destinationLine } from './payoutShared';

const TABS = [{ key: 'ready', label: 'Ready to pay' }, { key: 'batches', label: 'Payouts' }, { key: 'items', label: 'All payments' }];
const LIMIT = 20;

/** One payout system for every Lotnis service — stays, tickets and votes — with money out to hosts. */
export default function Payouts() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : params.get('bucket') ? 'items' : 'ready';
  const overview = useApi('/admin/payouts/overview');
  const o = overview.data; const t = o?.totals; const c = o?.currency || 'GHS';
  const [tick, setTick] = useState(0);
  const refresh = () => { setTick((n) => n + 1); overview.reload(); };

  return (
    <Page>
      <PageHeader eyebrow="Money out" title="Payouts"
        subtitle={`Hosts are paid after the service is delivered. Stays: ${o?.stay_report_window_hours ?? 48}h after check-in (a guest report pauses it). Tickets and votes: ${o?.event_payout_hold_hours ?? 48}h after the event ends or voting closes. Long stays are paid monthly. Refunds are netted off automatically.`} />
      {overview.error && <ErrorState>{overview.error}</ErrorState>}
      <StatGrid>
        <StatTile label="Waiting for release" value={money(c, t?.awaiting_release)} sub="Service not delivered yet" icon={Clock} to="?bucket=awaiting_release" />
        <StatTile label="Due now" value={money(c, t?.due)} sub="Ready to send" icon={Wallet} tone={t?.due ? 'warn' : undefined} to="?tab=ready" />
        <StatTile label="On hold" value={money(c, t?.on_hold)} sub={`${o?.open_issue_reports ?? 0} open report(s)`} icon={PauseCircle} tone={t?.on_hold ? 'danger' : undefined} to="?bucket=on_hold" />
        <StatTile label="Being sent" value={money(c, t?.processing)} sub="Waiting for your reference" icon={Send} to="?bucket=processing" />
        <StatTile label="Paid out" value={money(c, t?.paid)} sub="To date" icon={Banknote} tone="good" to="?bucket=paid" />
      </StatGrid>
      {o?.by_service?.length > 0 && <Notice tone="info">{o.by_service.map((s) => `${s.label}: ${money(c, s.due)} due · ${money(c, s.paid)} paid`).join('   |   ')}</Notice>}
      <Tabs tabs={TABS} value={tab} onChange={(k) => setParams(k === 'ready' ? {} : { tab: k })} />
      {tab === 'ready' && <Ready tick={tick} onChanged={refresh} />}
      {tab === 'batches' && <Batches tick={tick} />}
      {tab === 'items' && <Items tick={tick} onChanged={refresh} bucket={params.get('bucket') || ''} onBucket={(b) => setParams(b ? { tab: 'items', bucket: b } : { tab: 'items' })} />}
    </Page>
  );
}

function Ready({ tick, onChanged }) {
  const { data, error, loading } = useApi(`/admin/payouts/due?t=${tick}`);
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');
  const navigate = useNavigate();
  const prepare = async (h) => {
    setBusy(h.host_id); setProblem('');
    try { const batch = await send('/admin/payouts/batches', 'POST', { host_id: h.host_id, currency: h.currency }); onChanged(); navigate(`/payouts/batches/${batch.id}`); }
    catch (e) { setProblem(e.message); } finally { setBusy(''); }
  };
  if (loading) return <LoadingState />;
  if (error) return <ErrorState>{error}</ErrorState>;
  return (
    <Card flush>
      {data.blocked_items > 0 && <div style={{ padding: 'var(--spacing-4)' }}><Notice tone="warn">{data.blocked_items} payment(s) are held back automatically because their event is paused or has refund requests waiting.</Notice></div>}
      {problem && <div style={{ padding: 'var(--spacing-4)' }}><Notice tone="danger">{problem}</Notice></div>}
      <DataTable rows={data.hosts_due} empty="Nothing is due right now."
        columns={[
          { key: 'host', label: 'Host', render: (h) => <CellMain title={h.host_name} sub={`${h.host_email ?? ''}${h.verified ? '' : ' · not verified'}`} /> },
          { key: 'what', label: 'What', render: (h) => <CellMain title={h.service_breakdown.map((s) => `${s.label} ${money(h.currency, s.amount)}`).join(' · ')} sub={`${h.items} item(s)`} /> },
          { key: 'adj', label: 'Adjustments', render: (h) => (h.adjustments ? <span style={{ color: 'var(--color-danger)' }}>{money(h.currency, h.adjustments)}</span> : '—') },
          { key: 'net', label: 'To send', render: (h) => <strong>{money(h.currency, h.net)}</strong> },
          { key: 'oldest', label: 'Oldest due', render: (h) => formatDateTime(h.oldest_release) },
          { key: 'dest', label: 'Send to', render: (h) => (h.destination ? destinationLine(h.destination) : <span style={{ color: 'var(--color-danger)' }}>No payout details</span>) },
          { key: 'go', label: '', render: (h) => <Button variant="primary" size="sm" disabled={!h.destination || busy === h.host_id} onClick={() => prepare(h)}>{busy === h.host_id ? 'Preparing…' : 'Prepare payout'}</Button> },
        ]} />
    </Card>
  );
}

function Batches({ tick }) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, loading, total } = useApi(`/admin/payouts/batches?${new URLSearchParams({ page, limit: LIMIT, ...(status && { status }) })}&t=${tick}`);
  return (
    <Card flush>
      <div style={{ padding: 'var(--spacing-4)' }}>
        <Chips value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ key: '', label: 'All' }, { key: 'processing', label: 'Being sent' }, { key: 'paid', label: 'Paid' }, { key: 'failed', label: 'Failed' }]} />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
        <DataTable rows={data?.data ?? data ?? []} total={total ?? data?.total} page={page} limit={LIMIT} onPage={setPage} rowTo={(b) => `/payouts/batches/${b.id}`} empty="No payouts yet."
          columns={[
            { key: 'host', label: 'Host', render: (b) => <CellMain title={b.host_name || '—'} sub={destinationLine(b.destination)} /> },
            { key: 'amount', label: 'Amount', render: (b) => <strong>{money(b.currency, b.amount)}</strong> },
            { key: 'status', label: 'Status', render: (b) => <StatusPill status={b.status} /> },
            { key: 'reference', label: 'Reference', render: (b) => b.reference || '—' },
            { key: 'created', label: 'Created', render: (b) => formatDateTime(b.created_at) },
            { key: 'paid', label: 'Paid', render: (b) => formatDateTime(b.paid_at) },
          ]} />
      )}
    </Card>
  );
}

function Items({ tick, onChanged, bucket, onBucket }) {
  const [page, setPage] = useState(1);
  const [holding, setHolding] = useState(null);
  const [problem, setProblem] = useState('');
  const { data, error, loading, total } = useApi(`/admin/payouts/items?${new URLSearchParams({ page, limit: LIMIT, ...(bucket && { bucket }) })}&t=${tick}`);
  const release = async (i) => { try { await send(`/admin/payouts/items/${i.id}/release`, 'POST'); onChanged(); } catch (e) { setProblem(e.message); } };
  return (
    <Card flush>
      <div style={{ padding: 'var(--spacing-4)' }}><Chips options={BUCKETS} value={bucket} onChange={(b) => { onBucket(b); setPage(1); }} /></div>
      {problem && <div style={{ padding: '0 var(--spacing-4) var(--spacing-4)' }}><Notice tone="danger">{problem}</Notice></div>}
      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : (
        <DataTable rows={data?.data ?? data ?? []} total={total ?? data?.total} page={page} limit={LIMIT} onPage={setPage} empty="Nothing here."
          columns={[
            { key: 'what', label: 'What', render: (i) => <CellMain title={i.title} sub={i.detail} /> },
            { key: 'host', label: 'Host', render: (i) => i.host_name || '—' },
            { key: 'service', label: 'Service', render: (i) => i.service_label },
            { key: 'amount', label: 'Host gets', render: (i) => <strong>{money(i.currency, i.amount)}</strong> },
            { key: 'fee', label: 'Lotnis fee', render: (i) => money(i.currency, i.commission) },
            { key: 'status', label: 'Status', render: (i) => <><StatusPill status={i.bucket} />{i.hold_reason && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{i.hold_reason}</div>}</> },
            { key: 'release', label: 'Releases', render: (i) => formatDateTime(i.bucket === 'paid' ? i.paid_at : i.release_at) },
            { key: 'act', label: '', render: (i) => (i.bucket === 'on_hold' ? <Button size="sm" onClick={() => release(i)}>Release</Button> : ['awaiting_release', 'due'].includes(i.bucket) ? <Button size="sm" onClick={() => setHolding(i)}>Hold</Button> : null) },
          ]} />
      )}
      {holding && <FieldDialog title="Hold this payment" intro="The host will see the reason." submitLabel="Hold" danger onClose={() => setHolding(null)}
        fields={[{ name: 'reason', label: 'Reason', type: 'textarea', required: true }]}
        onSubmit={async (v) => { await send(`/admin/payouts/items/${holding.id}/hold`, 'POST', { reason: v.reason }); setHolding(null); onChanged(); }} />}
    </Card>
  );
}
