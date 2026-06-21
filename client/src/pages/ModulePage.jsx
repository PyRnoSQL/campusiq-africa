import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { list, create } from '../api/client';

/**
 * Config-driven module page: { resource, titleKey, fields: [{key,label,type}] }
 * Used for Staff, Classes, Attendance, Grades, Finance, Admissions, Documents, Announcements
 * so each module gets a real working list + offline-aware add form without duplicating code.
 */
export default function ModulePage({ resource, titleKey, fields }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, '']));
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    setLoading(true);
    const { data } = await list(resource);
    setRows(data);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [resource]);

  async function handleSubmit(e) {
    e.preventDefault();
    const { data } = await create(resource, form);
    setRows((prev) => [data, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t(titleKey)}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-card bg-ink text-sand text-sm font-medium px-4 py-2.5 hover:bg-ink/90"
        >
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card p-5 grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <input
              key={f.key}
              type={f.type || 'text'}
              placeholder={f.label}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm"
            />
          ))}
          <div className="sm:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-slate px-4 py-2.5">
              {t('common.cancel')}
            </button>
            <button type="submit" className="rounded-card bg-clay text-white text-sm font-medium px-5 py-2.5 hover:bg-clay/90">
              {t('common.save')}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-ink text-sand text-xs uppercase tracking-wide">
            <tr>
              {fields.map((f) => (
                <th key={f.key} className="text-start px-4 py-3 font-medium whitespace-nowrap">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-6 text-slate" colSpan={fields.length}>{t('common.loading')}</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td className="px-4 py-6 text-slate" colSpan={fields.length}>{t('common.no_results')}</td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line dark:border-ink-border">
                {fields.map((f) => (
                  <td key={f.key} className="px-4 py-3 whitespace-nowrap">
                    {row[f.key] || '—'}
                    {f === fields[0] && row._pendingSync && <span className="ms-2 text-[10px] font-semibold text-gold align-middle">● pending sync</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
