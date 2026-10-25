import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import ToggleSwitch from '../components/settings/ToggleSwitch';
import FormInput from '../components/settings/FormInput';
import PolicyManager from '../components/config/PolicyManager';
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
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
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
        <button className="button" type="submit" disabled={creating || !newName.trim()} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', cursor: 'pointer' }}>
          {creating ? 'Adding…' : 'Add property type'}
        </button>
      </form>
      {createError && <p style={{ color: 'var(--color-danger)' }}>{createError}</p>}
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
        <button className="button" type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', cursor: 'pointer' }}>
          {saving ? 'Saving…' : 'Save new version'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
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


// Rates for events and payouts. Changing one affects FUTURE sales only: every order keeps the rate it was sold at.
function PlatformRatesCard() {
  const [rows, setRows] = useState([]);
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = () => apiFetch('/admin/config/settings').then((body) => {
    setRows(body.data || []);
    setValues(Object.fromEntries((body.data || []).map((r) => [r.key, String(r.value)])));
  }).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const save = async (row) => {
    setBusy(row.key); setError(''); setMessage('');
    try {
      await apiFetch(`/admin/config/settings/${row.key}`, { method: 'PATCH', body: JSON.stringify({ value: Number(values[row.key]) }) });
      setMessage(`${row.label} updated — applies to new sales from now on.`);
      load();
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  return (
    <div className={styles.card}>
      <h2>Events &amp; payouts</h2>
      <p className={styles.content}>Lotnis's cut of every ticket and vote, the payment-processing fee passed on to buyers, and how long money is held before hosts are paid. Past orders keep the rate they were sold at.</p>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {message && <p style={{ color: 'var(--color-success)' }}>{message}</p>}
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 560 }}>
        {rows.map((row) => (
          <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '1fr 110px auto', gap: '0.75rem', alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 4, fontSize: '0.875rem', fontWeight: 600 }}>
              {row.label}
              <small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>{row.description}</small>
            </label>
            <input type="number" min={row.min} max={row.max} step="0.01" value={values[row.key] ?? ''} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })}
              style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 8, font: 'inherit' }} />
            <button type="button" disabled={busy === row.key || Number(values[row.key]) === row.value}
              onClick={() => save(row)}
              style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: 'var(--color-text-inverse)', cursor: 'pointer', opacity: busy === row.key || Number(values[row.key]) === row.value ? 0.5 : 1 }}>
              {busy === row.key ? 'Saving…' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CancellationPoliciesCard() {
  return (
    <div className={styles.card}>
      <h2>Refund policies</h2>
      <PolicyManager />
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
      <PlatformRatesCard />
      <CancellationPoliciesCard />
    </div>
  );
}
