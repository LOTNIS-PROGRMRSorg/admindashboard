import { Pill } from '../../components/ui';
import { statusMeta } from '../../lib/status';

/** Reports from the public reach admins only; reports from someone who booked or bought also reach the host. */
export const AudiencePill = ({ audience }) => (audience === 'host_and_admin' ? <Pill tone="violet">Host + admins</Pill> : <Pill tone="neutral">Admins only</Pill>);
export const SeverityPill = ({ severity }) => { const m = statusMeta(severity); return <Pill tone={m.tone}>{m.label}</Pill>; };
