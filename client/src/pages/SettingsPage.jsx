import React, { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import axios from 'axios';
import { useInstitution } from '../context/InstitutionContext';
import { useAuth } from '../context/AuthContext';
import { INSTITUTION_TYPES, getTypeConfig } from '../config/institutionTypes';

function authHeaders() {
  const token = localStorage.getItem('campusiq_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SettingsPage() {
  const { active, refresh } = useInstitution();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const canEdit = user?.role === 'SuperAdmin' || user?.role === 'InstitutionAdmin';

  useEffect(() => {
    if (active) setForm({ ...active });
  }, [active?.id]);

  if (!form) return <p className="text-sm text-slate">Loading…</p>;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await axios.put(`/api/institutions/${form.id}`, form, { headers: authHeaders() });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const preview = getTypeConfig(form.type);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Institution settings</h1>
        <p className="text-xs text-slate">Profile, branding, and academic configuration for this institution.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate mb-1.5">Institution name</label>
          <input
            disabled={!canEdit}
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">Type</label>
            <select
              disabled={!canEdit}
              value={form.type || ''}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
            >
              {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-[11px] text-slate mt-1.5">Drives terminology, grading scale, and fee/assessment presets app-wide.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">Academic year</label>
            <input
              disabled={!canEdit}
              value={form.academic_year || ''}
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
              className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">Currency</label>
            <input
              disabled={!canEdit}
              value={form.currency || ''}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">Languages (comma-separated)</label>
            <input
              disabled={!canEdit}
              value={form.languages || ''}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">Contact email</label>
            <input
              disabled={!canEdit}
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate mb-1.5">Contact phone</label>
            <input
              disabled={!canEdit}
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm disabled:opacity-60"
            />
          </div>
        </div>

        {canEdit && (
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-card bg-clay text-white text-sm font-medium px-5 py-2.5 hover:bg-clay/90 disabled:opacity-60">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </button>
        )}
      </form>

      <div className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card p-5">
        <p className="font-display font-semibold mb-3">Preview — what this type configures</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate mb-1">Terminology</p>
            <p>{preview.classTerm} · {preview.staffTerm} · {preview.gradeTerm}</p>
          </div>
          <div>
            <p className="text-xs text-slate mb-1">Grading scale</p>
            <p>{preview.scoreScale.max === 4 ? '4.0 GPA scale' : '/20 scale'}, pass mark {preview.scoreScale.format(preview.scoreScale.passMark)}</p>
          </div>
          <div>
            <p className="text-xs text-slate mb-1">Fee types</p>
            <p className="text-slate">{preview.feeTypes.join(', ')}</p>
          </div>
          <div>
            <p className="text-xs text-slate mb-1">Assessment types</p>
            <p className="text-slate">{preview.assessmentTypes.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
