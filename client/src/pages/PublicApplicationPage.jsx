import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2 } from 'lucide-react';

const emptyForm = {
  institution_id: '', applicant_name: '', date_of_birth: '', gender: 'M',
  desired_program: '', guardian_contact: '', previous_school: '',
};

export default function PublicApplicationPage() {
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/institutions/public').then((res) => setInstitutions(res.data.data || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/admissions/public', form);
      setSubmitted(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong — please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="bg-sand rounded-card shadow-2xl p-8 max-w-sm w-full text-center">
          <CheckCircle2 className="mx-auto text-teal mb-3" size={40} />
          <h1 className="font-display text-xl font-semibold mb-2">Application received</h1>
          <p className="text-sm text-slate mb-4">
            Your application has been submitted and is now <strong>pending review</strong>. Keep this reference number for your records:
          </p>
          <p className="font-mono text-sm bg-white rounded-card border border-line px-3 py-2 inline-block">{submitted.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10 flex items-center justify-center">
      <div className="bg-sand rounded-card shadow-2xl p-8 max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-clay to-gold flex items-center justify-center font-display font-bold text-ink text-sm">CQ</div>
          <span className="font-display font-semibold tracking-tight text-lg">CampusIQ Africa</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-1">Apply now</h1>
        <p className="text-sm text-slate mb-6">Submit your application — no account needed.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select required value={form.institution_id} onChange={(e) => setForm({ ...form, institution_id: e.target.value })}
            className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm">
            <option value="">Select institution</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>{i.name} — {i.region_city}, {i.country}</option>
            ))}
          </select>
          <input required placeholder="Full name" value={form.applicant_name}
            onChange={(e) => setForm({ ...form, applicant_name: e.target.value })}
            className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              className="rounded-card border border-line bg-white px-3.5 py-2.5 text-sm" />
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="rounded-card border border-line bg-white px-3.5 py-2.5 text-sm">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <input required placeholder="Desired program / class" value={form.desired_program}
            onChange={(e) => setForm({ ...form, desired_program: e.target.value })}
            className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm" />
          <input placeholder="Parent / guardian contact" value={form.guardian_contact}
            onChange={(e) => setForm({ ...form, guardian_contact: e.target.value })}
            className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm" />
          <input placeholder="Previous school (optional)" value={form.previous_school}
            onChange={(e) => setForm({ ...form, previous_school: e.target.value })}
            className="w-full rounded-card border border-line bg-white px-3.5 py-2.5 text-sm" />
          {error && <p className="text-sm text-clay">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-card bg-ink text-sand font-medium text-sm py-2.5 hover:bg-ink/90 disabled:opacity-60">
            {loading ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </div>
    </div>
  );
}
