import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import styles from './PolicyManager.module.css';

const blankTier = () => ({ days: '', refund: '' });

function describe(tiers) {
  const valid = tiers
    .filter((t) => t.days !== '' && t.refund !== '' && !Number.isNaN(Number(t.days)) && !Number.isNaN(Number(t.refund)))
    .map((t) => ({ days: Number(t.days), refund: Number(t.refund) }))
    .sort((a, b) => b.days - a.days);
  return valid.map((t, i) => {
    const what =
      t.refund >= 100
        ? 'full refund of the stay'
        : t.refund <= 0
          ? 'no refund of the stay'
          : `${t.refund}% of the stay refunded`;
    return t.days <= 0
      ? `Less than ${valid[i - 1]?.days ?? 1} day(s) before check-in: ${what}`
      : `${t.days}+ days before check-in: ${what}`;
  });
}

// One card edits an existing policy, or (policy === null) creates a new one.
function PolicyCard({ policy, onSaved, onCancel }) {
  const isNew = !policy;
  const [name, setName] = useState(policy?.name || '');
  const [description, setDescription] = useState(policy?.description || '');
  const [tiers, setTiers] = useState(() =>
    policy?.tiers?.length
      ? [...policy.tiers]
          .sort((a, b) => b.days_before_start - a.days_before_start)
          .map((t) => ({ days: String(t.days_before_start), refund: String(Number(t.refund_percentage)) }))
      : [blankTier()],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const setTier = (index, field, value) =>
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  const cleanTiers = () =>
    tiers
      .filter((t) => t.days !== '' && t.refund !== '')
      .map((t) => ({ days_before_start: Number(t.days), refund_percentage: Number(t.refund) }));

  const run = async (work) => {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await work();
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      if (!name.trim()) throw new Error('Give the policy a name.');
      const body = cleanTiers();
      if (!body.length) throw new Error('Add at least one refund tier.');
      if (isNew) {
        await apiFetch('/admin/config/cancellation-policies', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, tiers: body }),
        });
      } else {
        await apiFetch(`/admin/config/cancellation-policies/${policy.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
        await apiFetch(`/admin/config/cancellation-policies/${policy.id}/tiers`, {
          method: 'PUT',
          body: JSON.stringify({ tiers: body }),
        });
      }
    });

  const toggleActive = () =>
    run(() =>
      apiFetch(`/admin/config/cancellation-policies/${policy.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !policy.active }),
      }),
    );

  const lines = describe(tiers);

  return (
    <div className={`${styles.policy} ${!isNew && !policy.active ? styles.inactive : ''}`}>
      <div className={styles.head}>
        <div>
          <strong>{isNew ? 'New refund policy' : policy.name}</strong>{' '}
          {!isNew && <span className={styles.code}>{policy.code}</span>}
        </div>
        {!isNew && (
          <span className={`${styles.badge} ${policy.active ? '' : styles.badgeOff}`}>
            {policy.active ? 'Available to hosts' : 'Hidden from hosts'}
          </span>
        )}
      </div>

      <div className={styles.fields}>
        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Moderate"
          />
        </label>
        <label className={styles.label}>
          Short description (shown to hosts and guests)
          <input
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Full refund up to 5 days before"
          />
        </label>
      </div>

      <div className={styles.tiersTitle}>Refund tiers</div>
      {tiers.map((tier, index) => (
        <div className={styles.tierRow} key={index}>
          <label className={styles.label}>
            Cancelled at least (days before check-in)
            <input
              className={styles.input}
              type="number"
              min="0"
              step="1"
              value={tier.days}
              onChange={(e) => setTier(index, 'days', e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Share of the stay refunded (%)
            <input
              className={styles.input}
              type="number"
              min="0"
              max="100"
              step="1"
              value={tier.refund}
              onChange={(e) => setTier(index, 'refund', e.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.btn}
            disabled={tiers.length === 1}
            onClick={() => setTiers((prev) => prev.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className={styles.link} onClick={() => setTiers((prev) => [...prev, blankTier()])}>
        + Add tier
      </button>

      {lines.length > 0 && (
        <div className={styles.preview}>
          <strong>What guests will see</strong>
          <ul>
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div>
            The Lotnis service fee is never refunded on guest cancellations; any security deposit is returned in full.
            If the host cancels, the guest gets everything back.
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.primary}`} disabled={busy} onClick={save}>
          {busy ? 'Saving…' : isNew ? 'Create policy' : 'Save changes'}
        </button>
        {!isNew && (
          <button type="button" className={styles.btn} disabled={busy} onClick={toggleActive}>
            {policy.active ? 'Hide from hosts' : 'Make available'}
          </button>
        )}
        {isNew && (
          <button type="button" className={styles.btn} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {saved && !error && <div className={styles.ok}>Saved.</div>}
    </div>
  );
}

export default function PolicyManager() {
  const [policies, setPolicies] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    apiFetch('/admin/config/cancellation-policies')
      .then((body) => {
        setPolicies(body.data || []);
        setError('');
      })
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <p className={styles.intro}>
        Hosts pick one of these for each listing, and refunds are calculated from it automatically. Edits only affect
        bookings made afterwards — a guest keeps the terms they agreed to when they booked. Policies in use can be
        hidden but not deleted.
      </p>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.grid}>
        {policies.map((policy) => (
          <PolicyCard key={`${policy.id}-${policy.updated_at}`} policy={policy} onSaved={load} />
        ))}
        {creating ? (
          <PolicyCard
            policy={null}
            onSaved={() => {
              setCreating(false);
              load();
            }}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <div>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => setCreating(true)}>
              + New refund policy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
