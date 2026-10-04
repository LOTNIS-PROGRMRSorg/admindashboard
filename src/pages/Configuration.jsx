import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import ToggleSwitch from '../components/settings/ToggleSwitch';
import FormInput from '../components/settings/FormInput';
import styles from './Page.module.css';

// Admin "Configuration" page — property types, rental units, fee configuration
// and cancellation policies for the Space Rental business logic. Backed by
// /api/admin/config/* (see backend/src/modules/admin/config).

function PropertyTypesCard() {
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('residential');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = () => apiFetch('/admin/config/property-types').then((body) => setTypes(body.data || [])).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const toggleActive = async (type) => {
    setBusyId(type.id);
    try {
      await apiFetch(`/admin/config/property-types/${type.id}`, { method: 'PATCH', body: JSON.stringify({ active: !type.active }) });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const createType = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    setCreating(true); setCreateError('');
    try {
      const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await apiFetch('/admin/config/property-types', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), slug, category: newCategory, sort_order: types.length + 1 }),
      });
      setNewName('');
      load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2>Property types</h2>
      <p className={styles.content}>Types guests can choose when browsing, and hosts when listing. Deactivating hides a type from new listings without affecting existing ones.</p>
      {error && <p style={{ color: 'var(--color-danger, #d33)' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
            <th style={{ padding: '8px 0' }}>Name</th>
            <th>Category</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '8px 0' }}>{type.name}</td>
              <td>{type.category || '—'}</td>
              <td>
                <ToggleSwitch checked={!!type.active} onChange={() => toggleActive(type)} disabled={busyId === type.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={createType} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <FormInput label="New property type name" value={newName} onChange={setNewName} placeholder="e.g. Villa" />
        <div className={styles.content} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem' }}>Category</label>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <option value="residential">Residential</option>
            <option value="hospitality">Hospitality</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <button className="button" type="submit" disabled={creating || !newName.trim()} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary, #173b37)', color: '#fff', cursor: 'pointer' }}>
          {creating ? 'Adding…' : 'Add property type'}
        </button>
      </form>
      {createError && <p style={{ color: 'var(--color-danger, #d33)' }}>{createError}</p>}
    </div>
  );
}

function FeeConfigurationCard() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [guestFee, setGuestFee] = useState('');
  const [hostFee, setHostFee] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    apiFetch('/admin/config/fees/current').then((body) => {
      setCurrent(body.data);
      setGuestFee(body.data ? String(body.data.guest_service_fee_percent) : '');
      setHostFee(body.data ? String(body.data.host_commission_percent) : '');
    }).catch((err) => setError(err.message));
    apiFetch('/admin/config/fees').then((body) => setHistory(body.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      await apiFetch('/admin/config/fees', {
        method: 'POST',
        body: JSON.stringify({
          guest_service_fee_percent: Number(guestFee),
          host_commission_percent: Number(hostFee),
        }),
      });
      setMessage('New fee configuration saved and is now active.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2>Fee configuration</h2>
      <p className={styles.content}>The guest service fee is added on top of the stay price. The host commission is deducted from the host&apos;s payout. Saving creates a new versioned configuration effective immediately — past bookings keep the fee that applied when they were made.</p>
      {current && (
        <p style={{ marginTop: '0.5rem' }}>
          Currently active: <strong>{current.guest_service_fee_percent}%</strong> guest service fee, <strong>{current.host_commission_percent}%</strong> host commission.
        </p>
      )}
      <form onSubmit={save} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '1rem' }}>
        <FormInput label="Guest service fee (%)" type="number" value={guestFee} onChange={setGuestFee} />
        <FormInput label="Host commission (%)" type="number" value={hostFee} onChange={setHostFee} />
        <button className="button" type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary, #173b37)', color: '#fff', cursor: 'pointer' }}>
          {saving ? 'Saving…' : 'Save new version'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'var(--color-danger, #d33)' }}>{error}</p>}
      {history.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '8px 0' }}>Effective from</th>
              <th>Guest fee</th>
              <th>Host commission</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 0' }}>{new Date(row.effective_from).toLocaleString()}</td>
                <td>{row.guest_service_fee_percent}%</td>
                <td>{row.host_commission_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CancellationPoliciesCard() {
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTiers, setNewTiers] = useState([{ daysBefore: '', refund: '' }]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = () => apiFetch('/admin/config/cancellation-policies').then((body) => setPolicies(body.data || [])).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const updateTier = (index, field, value) => {
    setNewTiers((prev) => prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)));
  };
  const addTierRow = () => setNewTiers((prev) => [...prev, { daysBefore: '', refund: '' }]);
  const removeTierRow = (index) => setNewTiers((prev) => prev.filter((_, i) => i !== index));

  const createPolicy = async (event) => {
    event.preventDefault();
    const tiers = newTiers
      .filter((t) => t.daysBefore !== '' && t.refund !== '')
      .map((t) => ({ days_before_start: Number(t.daysBefore), refund_percentage: Number(t.refund) }));
    if (!newName.trim() || !newCode.trim() || tiers.length === 0) {
      setCreateError('Name, code, and at least one tier are required.');
      return;
    }
    setCreating(true); setCreateError('');
    try {
      await apiFetch('/admin/config/cancellation-policies', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), code: newCode.trim(), description: newDescription.trim() || undefined, tiers }),
      });
      setNewName(''); setNewCode(''); setNewDescription(''); setNewTiers([{ daysBefore: '', refund: '' }]);
      load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2>Cancellation policies</h2>
      <p className={styles.content}>Tiered refund rules applied when a guest cancels, based on how far ahead of check-in they cancel.</p>
      {error && <p style={{ color: 'var(--color-danger, #d33)' }}>{error}</p>}
      {policies.map((policy) => (
        <div key={policy.id} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <strong>{policy.name}</strong> <span style={{ color: 'var(--color-text-muted)' }}>({policy.code})</span>
          <p className={styles.content}>{policy.description}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '4px 0' }}>Cancel at least (days before check-in)</th>
                <th>Refund %</th>
              </tr>
            </thead>
            <tbody>
              {(policy.tiers || []).sort((a, b) => b.days_before_start - a.days_before_start).map((tier) => (
                <tr key={tier.id}>
                  <td style={{ padding: '4px 0' }}>{tier.days_before_start}d</td>
                  <td>{tier.refund_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <form onSubmit={createPolicy} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Add a new policy</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <FormInput label="Name" value={newName} onChange={setNewName} placeholder="e.g. Flexible" />
          <FormInput label="Code" value={newCode} onChange={setNewCode} placeholder="e.g. flexible" />
          <FormInput label="Description" value={newDescription} onChange={setNewDescription} placeholder="Shown to guests" />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Refund tiers</label>
          {newTiers.map((tier, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
              <FormInput label="Days before check-in" type="number" value={tier.daysBefore} onChange={(v) => updateTier(index, 'daysBefore', v)} />
              <FormInput label="Refund %" type="number" value={tier.refund} onChange={(v) => updateTier(index, 'refund', v)} />
              {newTiers.length > 1 && (
                <button type="button" onClick={() => removeTierRow(index)} style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addTierRow} style={{ marginTop: '0.5rem', padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer' }}>
            + Add tier
          </button>
        </div>
        <button className="button" type="submit" disabled={creating} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary, #173b37)', color: '#fff', cursor: 'pointer' }}>
          {creating ? 'Adding…' : 'Add policy'}
        </button>
        {createError && <p style={{ color: 'var(--color-danger, #d33)' }}>{createError}</p>}
      </form>
    </div>
  );
}

export default function Configuration() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuration</h1>
      </div>
      <PropertyTypesCard />
      <FeeConfigurationCard />
      <CancellationPoliciesCard />
    </div>
  );
}
