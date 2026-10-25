import { useState } from 'react';
import Modal from './Modal';
import { Button, Notice } from '../ui';
import { Field, Input, Select, Textarea } from '../ui/Field';
import styles from '../ui/ui.module.css';

/**
 * A form in a modal. fields: [{ name, label, type: text|number|textarea|select|checkbox, options?, required?, hint? }].
 * `onSubmit(values)` may throw — the message shows inside the dialog.
 */
export default function FieldDialog({
  title,
  intro,
  fields = [],
  initial = {},
  submitLabel = 'Save',
  danger,
  onSubmit,
  onClose,
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? (f.type === 'checkbox' ? false : '')])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && (values[f.name] === '' || values[f.name] == null));
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form className={styles.stack} onSubmit={submit}>
        {intro && <p className={styles.muted}>{intro}</p>}
        {fields.map((f) =>
          f.type === 'checkbox' ? (
            <label key={f.name} className={styles.check}>
              <input type="checkbox" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />{' '}
              {f.label}
            </label>
          ) : (
            <Field key={f.name} label={f.label} hint={f.hint}>
              {f.type === 'textarea' ? (
                <Textarea rows={f.rows ?? 3} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === 'select' ? (
                <Select options={f.options} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              ) : (
                <Input
                  type={f.type || 'text'}
                  step={f.step}
                  min={f.min}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </Field>
          ),
        )}
        {error && <Notice tone="danger">{error}</Notice>}
        <div className={styles.rowEnd}>
          <Button onClick={onClose}>Cancel</Button>
          <button className={`${styles.btn} ${danger ? styles.btnDanger : styles.btnPrimary}`} disabled={busy}>
            {busy ? 'Working…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
