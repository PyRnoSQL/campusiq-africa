import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, CreditCard, Camera } from 'lucide-react';
import { list, create } from '../api/client';
import { useInstitution } from '../context/InstitutionContext';
import { fileToThumbnail } from '../utils/imageUtils';
import StudentIdCardModal from '../components/StudentIdCardModal';

const emptyForm = { first_name: '', last_name: '', gender: 'M', date_of_birth: '', class_program_id: '', guardian_name: '', guardian_phone: '', photo_url: '' };

export default function StudentsPage() {
  const { t } = useTranslation();
  const { typeConfig } = useInstitution();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [cardStudent, setCardStudent] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data } = await list('students');
    setStudents(data);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await fileToThumbnail(file);
      setForm((f) => ({ ...f, photo_url: dataUrl }));
    } finally {
      setPhotoBusy(false);
    }
  }

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
        <div>
          <h1 className="font-display text-2xl font-semibold">{t('students.title')}</h1>
          <p className="text-xs text-slate">{typeConfig.label} · ID prefix {typeConfig.studentIdPrefix}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-card bg-ink text-sand text-sm font-medium px-4 py-2.5 hover:bg-ink/90"
        >
          <Plus size={16} /> {t('students.add_new')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card p-5 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-sand dark:bg-ink-surface border border-line dark:border-ink-border overflow-hidden flex items-center justify-center shrink-0">
              {form.photo_url ? <img src={form.photo_url} alt="" className="h-full w-full object-cover" /> : <Camera size={20} className="text-slate" />}
            </div>
            <label className="text-xs font-medium text-clay cursor-pointer hover:underline">
              {photoBusy ? t('common.loading') : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
          <input required placeholder={t('students.name') + ' (first)'} value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input required placeholder={t('students.name') + ' (last)'} value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input type="date" value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input placeholder={`${typeConfig.classTerm} ID`} value={form.class_program_id}
            onChange={(e) => setForm({ ...form, class_program_id: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input placeholder={t('students.guardian')} value={form.guardian_name}
            onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
          <input placeholder="Guardian phone" value={form.guardian_phone}
            onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
            className="rounded-card border border-line dark:border-ink-border bg-white dark:bg-ink-surface text-ink dark:text-sand px-3.5 py-2.5 text-sm" />
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

      <div className="bg-white dark:bg-ink-surface border border-line dark:border-ink-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink text-sand text-xs uppercase tracking-wide">
            <tr>
              <th className="text-start px-4 py-3 font-medium"></th>
              <th className="text-start px-4 py-3 font-medium">{t('students.matricule')}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.name')}</th>
              <th className="text-start px-4 py-3 font-medium">{typeConfig.classTerm}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.status')}</th>
              <th className="text-start px-4 py-3 font-medium">{t('students.guardian')}</th>
              <th className="text-start px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-4 py-6 text-slate" colSpan={7}>{t('common.loading')}</td></tr>}
            {!loading && students.length === 0 && (
              <tr><td className="px-4 py-6 text-slate" colSpan={7}>{t('common.no_results')}</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="border-t border-line dark:border-ink-border">
                <td className="px-4 py-2.5">
                  <div className="h-8 w-8 rounded-full bg-sand dark:bg-ink-surface border border-line dark:border-ink-border overflow-hidden flex items-center justify-center text-[10px] font-semibold text-slate">
                    {s.photo_url ? <img src={s.photo_url} alt="" className="h-full w-full object-cover" /> : `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`}
                  </div>
                </td>
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
                <td className="px-4 py-3">
                  <button onClick={() => setCardStudent(s)} className="flex items-center gap-1.5 text-xs font-medium text-clay hover:underline">
                    <CreditCard size={14} /> ID card
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cardStudent && <StudentIdCardModal student={cardStudent} onClose={() => setCardStudent(null)} />}
    </div>
  );
}
