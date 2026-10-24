import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import shared from '../users/UserDrawer.module.css';
import styles from './HostDrawer.module.css';

const REQUIREMENT_LABELS = {
  identity: 'Identity (government ID + selfie)',
  phone: 'Phone verification',
  ownership: 'Proof of address / ownership',
  business: 'Business registration',
  tax: 'Tax identification',
  payout: 'Payout details',
};

// Maps a requirement to the document field(s) an admin needs to look at
// while reviewing it, so the relevant upload is easy to find.
const REQUIREMENT_DOCS = {
  identity: ['gov_id_front_image_url', 'gov_id_back_image_url', 'selfie_image_url'],
  ownership: ['proof_image_url'],
  business: ['biz_certificate_image_url'],
};

function DocCard({ label, url }) {
  return (
    <div className={styles.docCard}>
      <span className={styles.docLabel}>{label}</span>
      {url ? (
        <a className={styles.docLink} href={url} target="_blank" rel="noreferrer">
          <img className={styles.docThumb} src={url} alt={label} />
        </a>
      ) : (
        <span className={styles.docMissing}>Not uploaded</span>
      )}
    </div>
  );
}

function RequirementRow({ requirement, review, reasons, onSaved }) {
  const [status, setStatus] = useState(review?.status || 'pending');
  const [reasonId, setReasonId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (nextStatus) => {
    setSaving(true);
    setError('');
    try {
      const updated = await apiFetch(`/admin/hosts/${review.host_profile_id}/requirements/${requirement}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          rejection_reason_id: reasonId || undefined,
          note: note || undefined,
        }),
      });
      setStatus(updated.data.status);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const requirementReasons = reasons.filter((r) => r.requirement === requirement);

  return (
    <div className={styles.reqRow}>
      <div className={styles.reqHeader}>
        <span className={styles.reqName}>{REQUIREMENT_LABELS[requirement] || requirement}</span>
        <span className={styles.reqName}>{status.replace(/_/g, ' ')}</span>
      </div>
      {review?.note && <p className={styles.reqNote}>Note: {review.note}</p>}
      {review?.rejection_reason?.reason && <p className={styles.reqNote}>Reason: {review.rejection_reason.reason}</p>}
      <div className={styles.reqActions}>
        <select className={styles.select} value={reasonId} onChange={(e) => setReasonId(e.target.value)}>
          <option value="">Rejection reason (optional)</option>
          {requirementReasons.map((r) => (
            <option key={r.id} value={r.id}>{r.reason}</option>
          ))}
        </select>
        <input
          className={styles.textInput}
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className={`${styles.smallBtn} ${styles.btnApprove}`} disabled={saving} onClick={() => submit('approved')}>
          Approve
        </button>
        <button className={`${styles.smallBtn} ${styles.btnReject}`} disabled={saving} onClick={() => submit('rejected')}>
          Reject
        </button>
      </div>
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
}

export default function HostDrawer({ host, isOpen, onClose, onChanged }) {
  const [reviews, setReviews] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!host) return;
    Promise.all([
      apiFetch(`/admin/hosts/${host.id}/requirements`),
      apiFetch('/admin/hosts/rejection-reasons'),
    ])
      .then(([reviewList, reasonList]) => {
        setReviews(reviewList?.data || []);
        setReasons(reasonList?.data || []);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, [host]);

  if (!host) return null;

  const changeStatus = async (status) => {
    let reason;
    if (status === 'rejected' || status === 'suspended') {
      reason = window.prompt(`Reason for marking this host as ${status}:`) || '';
      if (!reason) return;
    }
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/admin/hosts/${host.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason: reason || undefined }),
      });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startReview = async () => {
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/admin/hosts/${host.id}/start-review`, { method: 'POST' });
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const flagged = reviews.filter((r) => r.status === 'rejected' || r.status === 'changes_required');
  const queued = host.submitted_at && !host.review_started_at
    && ['pending', 'under_review'].includes(host.verification_status) && flagged.length === 0;
  const inReview = host.review_started_at && host.verification_status === 'under_review' && flagged.length === 0;
  const waitingSince = host.submitted_at ? new Date(host.submitted_at).toLocaleString() : null;
  const nudgedAt = host.last_admin_nudge_at ? new Date(host.last_admin_nudge_at).toLocaleString() : null;

  const reviewsByRequirement = Object.fromEntries(reviews.map((r) => [r.requirement, r]));
  const requirementList = Object.keys(REQUIREMENT_LABELS);

  return (
    <div className={`${shared.overlay} ${isOpen ? shared.open : ''}`} onClick={onClose}>
      <div className={`${shared.drawer} ${styles.drawerWide}`} onClick={(e) => e.stopPropagation()}>
        <div className={shared.header}>
          <h2 className={shared.title}>Host application</h2>
          <button className={shared.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={shared.content}>
          <div className={shared.profileHeader}>
            <div className={shared.avatarLg}>{(host.display_name || '?').charAt(0).toUpperCase()}</div>
            <h3 className={shared.name}>{host.display_name}</h3>
            <span className={shared.username}>{host.legal_first_name} {host.legal_last_name}</span>
          </div>

          {(queued || inReview || flagged.length > 0) && (
            <div className={styles.reviewBanner}>
              <strong>
                {flagged.length > 0 ? 'Waiting on the host to fix flagged items'
                  : inReview ? 'Review in progress — the host sees "being verified"'
                  : 'In the review queue'}
              </strong>
              <span>
                {waitingSince && `Submitted ${waitingSince}. `}
                {nudgedAt && `Host reminded the team on ${nudgedAt}. `}
                {flagged.length > 0 && `Flagged: ${flagged.map((r) => r.requirement).join(', ')}.`}
              </span>
              {queued && (
                <button className={styles.statusBtn} disabled={busy} onClick={startReview}>Start review</button>
              )}
            </div>
          )}

          <div className={shared.section}>
            <h4 className={shared.sectionTitle}>Applicant</h4>
            <div className={shared.infoRow}><span className={shared.infoLabel}>Account type</span><span className={shared.infoValue}>{host.account_type}</span></div>
            <div className={shared.infoRow}><span className={shared.infoLabel}>Date of birth</span><span className={shared.infoValue}>{host.date_of_birth || '—'}</span></div>
            <div className={shared.infoRow}><span className={shared.infoLabel}>Nationality</span><span className={shared.infoValue}>{host.nationality || '—'}</span></div>
            <div className={shared.infoRow}><span className={shared.infoLabel}>Address</span><span className={shared.infoValue}>{[host.street_address, host.city, host.state, host.country].filter(Boolean).join(', ')}</span></div>
          </div>

          {host.account_type === 'business' && (
            <div className={shared.section}>
              <h4 className={shared.sectionTitle}>Business</h4>
              <div className={shared.infoRow}><span className={shared.infoLabel}>Business name</span><span className={shared.infoValue}>{host.business_name || '—'}</span></div>
              <div className={shared.infoRow}><span className={shared.infoLabel}>Tax ID</span><span className={shared.infoValue}>{host.business_tax_id || '—'}</span></div>
              <div className={shared.infoRow}><span className={shared.infoLabel}>Registration #</span><span className={shared.infoValue}>{host.biz_registration_number || '—'}</span></div>
              <div className={shared.infoRow}><span className={shared.infoLabel}>Business phone</span><span className={shared.infoValue}>{host.business_phone || '—'}</span></div>
              <div className={shared.infoRow}><span className={shared.infoLabel}>Business email</span><span className={shared.infoValue}>{host.business_email || '—'}</span></div>
            </div>
          )}

          <div className={shared.section}>
            <h4 className={shared.sectionTitle}>Payout</h4>
            <div className={shared.infoRow}><span className={shared.infoLabel}>Method</span><span className={shared.infoValue}>{host.payout_method || '—'}</span></div>
            {host.payout_method === 'bank' ? (
              <>
                <div className={shared.infoRow}><span className={shared.infoLabel}>Bank</span><span className={shared.infoValue}>{host.bank_name || '—'}</span></div>
                <div className={shared.infoRow}><span className={shared.infoLabel}>Account name</span><span className={shared.infoValue}>{host.bank_account_name || '—'}</span></div>
                <div className={shared.infoRow}><span className={shared.infoLabel}>Account #</span><span className={shared.infoValue}>{host.bank_account_number || '—'}</span></div>
              </>
            ) : host.payout_method === 'mobile_money' ? (
              <>
                <div className={shared.infoRow}><span className={shared.infoLabel}>Provider</span><span className={shared.infoValue}>{host.momo_provider || '—'}</span></div>
                <div className={shared.infoRow}><span className={shared.infoLabel}>Number</span><span className={shared.infoValue}>{host.momo_number || '—'}</span></div>
              </>
            ) : null}
          </div>

          <div className={shared.section}>
            <h4 className={shared.sectionTitle}>Documents</h4>
            <div className={styles.docGrid}>
              <DocCard label="Government ID (front)" url={host.gov_id_front_image_url} />
              <DocCard label="Government ID (back)" url={host.gov_id_back_image_url} />
              <DocCard label="Selfie" url={host.selfie_image_url} />
              <DocCard label="Proof of address" url={host.proof_image_url} />
              {host.account_type === 'business' && (
                <DocCard label="Business certificate" url={host.biz_certificate_image_url} />
              )}
            </div>
          </div>

          <div className={shared.section}>
            <h4 className={shared.sectionTitle}>Requirement review</h4>
            {requirementList
              .filter((req) => req !== 'business' || host.account_type === 'business')
              .filter((req) => req !== 'tax' || host.account_type === 'business')
              .map((req) => (
                <RequirementRow
                  key={req}
                  requirement={req}
                  review={reviewsByRequirement[req] ? { ...reviewsByRequirement[req], host_profile_id: host.id } : { host_profile_id: host.id, status: 'pending' }}
                  reasons={reasons}
                  onSaved={load}
                />
              ))}
          </div>

          {error && <div className={styles.errorText}>{error}</div>}
        </div>

        <div className={shared.footer} style={{ flexDirection: 'column', gap: 12 }}>
          <div className={styles.statusActions}>
            <button className={styles.statusBtn} disabled={busy} onClick={() => changeStatus('verified')}>Approve host</button>
            <button className={`${styles.statusBtn} ${styles.statusBtnDanger}`} disabled={busy} onClick={() => changeStatus('rejected')}>Reject</button>
            <button className={`${styles.statusBtn} ${styles.statusBtnDanger}`} disabled={busy} onClick={() => changeStatus('suspended')}>Suspend</button>
          </div>
        </div>
      </div>
    </div>
  );
}
