import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { list, create } from '../api/client';

const emptyForm = { first_name: '', last_name: '', gender: 'M', date_of_birth: '', class_program_id: '', guardian_name: '', guardian_phone: '' };

export default function StudentsPage() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data } = await list('students');
    setStudents(data);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const { data } = await create('students', { ...form, enrollment_status: 'enrolled' });
    setStudents((prev) => [data, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t('students.title')}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-card bg-ink text-sand text-sm font-medium px-4 py-2.5 hover:bg-ink/90"
        >
          <Plus size={16} /> {t('students.add_new')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-card p-5 grid sm:grid-cols-2 gap-4">
          <input required placeholder={t('students.name') + ' (first)'} value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input required placeholder={t('students.name') + ' (last)'} value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input type="date" value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input placeholder="Class / Program ID" value={form.class_program_id}
            onChange={(e) => setForm({ ...form, class_program_id: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input placeholder={t('students.guardian')} value={form.guardian_name}
            onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
          <input placeholder="Guardian phone" value={form.guardian_phone}
            onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
            className="rounded-card border border-line px-3.5 py-2.5 text-sm" />
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

      <div className="bg-white border border-line rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink text-sand text-xs uppercase tracking-wide">
            <tr>
              <th className="text-start px-4 py-3 font-medium">{t('students.matricule')}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.name')}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.class')}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.status')}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.guardian')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-6 text-slate" colSpan={5}>{t('common.loading')}</td></tr>}
            {!loading && students.length === 0 && (
              <tr><td className="px-4 py-6 text-slate" colSpan={5}>{t('common.no_results')}</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs">{s.matricule || '—'}</td>
                <td className="px-4 py-3">
                  {s.first_name} {s.last_name}
                  {s._pendingSync && <span className="ms-2 text-[10px] font-semibold text-gold align-middle">● pending sync</span>}
                </td>
                <td className="px-4 py-3">{s.class_program_id || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal/10 text-teal">{s.enrollment_status || 'enrolled'}</span>
                </td>
                <td className="px-4 py-3 text-slate">{s.guardian_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
